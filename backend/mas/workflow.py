from mas.state import State
from agents.pydantic_models import LearningObjectiveDeps
from agents.pydantic_models import SyllabusGeneratorDeps, SyllabusGeneratorResult, KnowledgeRetrievalDeps
from agents.pydantic_models import CourseBuilderOrchestratorDeps, CourseBuilderOrchestratorResult
from agents.pydantic_models import LectureNoteDeps, Content, QuizInput, EvaluationInput

from agents.learning_objective import learning_objective_agent
from agents.course_builder_orchestrator import course_builder_orchestrator_agent
from agents.syllabus_generator import syllabus_generator_agent
from agents.knowledge_retrieval import knowledge_retrieval_agent
from agents.lecture_note import lecture_note_agent
from agents.quiz_creator import quiz_creator_agent
from agents.slide_generator import slide_generator_agent
from agents.content_validator import content_validator_agent

from presentation.drive_ops import create_folder, copy_presentation, move_file_to_folder, is_folder_exist
from presentation.google_slide_ops import delete_unnecessary_slide, copy_slide, move_slide, update_presentation_content

from typing import List, Literal, Dict
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command
import json
from datetime import datetime
from utils.setup import setup_gemini
from utils.stream import run_agent
from utils.Upfile import upload_markdown_to_s3, convert_to_markdown

import nest_asyncio
nest_asyncio.apply()
import uuid
import asyncio
from langgraph.checkpoint.memory import MemorySaver

def filter_serializable(state):
    state_copy = dict(state)
    
    # Always remove WebSocket connection (cannot be serialized and stored globally)
    state_copy.pop("websocket", None)
    
    # Remove any queues or other non-serializable objects
    state_copy.pop("queue", None)

    return state_copy

class WebSocketManager:
    """
    Singleton class to manage WebSocket connections globally
    """
    _instance = None
    _websocket = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WebSocketManager, cls).__new__(cls)
        return cls._instance
    
    def set_websocket(self, websocket):
        """Set the WebSocket connection"""
        self._websocket = websocket
    
    def get_websocket(self):
        """Get the WebSocket connection"""
        return self._websocket
    
    async def send_message(self, message):
        """Send message through WebSocket safely"""
        try:
            if self._websocket is not None:
                await self._websocket.send_json(message)
            else:
                print("Warning: Cannot send message - WebSocket is None")
        except Exception as e:
            print(f"Error sending WebSocket message: {e}")
    
    def is_connected(self):
        """Check if WebSocket is connected"""
        return self._websocket is not None


# Create global instance
websocket_manager = WebSocketManager()

async def learning_objective_agent_node(state: State):
    # Set websocket globally once at the beginning
    websocket = state.get("websocket")
    if websocket:
        websocket_manager.set_websocket(websocket)
    
    deps = LearningObjectiveDeps(
        session_id = state.get("session_id"),
        websocket = websocket,
        user_query = state.get("user_query"),
    )    

    result = await learning_objective_agent.run(
        "", deps=deps,
        model_settings={'temperature': 0.0}
    )

    print("LearningObjectiveAgent:", result.usage())
    output = result.output

    await websocket.send_json(
        {   
            "role": "agent",
            "content": output.final_response + f"\n\nLearning Objective: {output.learning_obj}",
            "timestamp": str(datetime.now())
        }
    )

    state["learning_obj"] = output.learning_obj
    state["next_step"] = "course_builder_orchestrator"

    
    print("LEARNING OBJECTIVE NODE")

    return Command(
        goto = "course_builder_orchestrator_agent",
        update = state  #state filter_serializable
    )


async def course_builder_orchestrator_agent_node(state: State):
    print("COURSE BUILDER ORCHESTRATOR NODE")
    deps = CourseBuilderOrchestratorDeps(
        learning_obj = state.get("learning_obj"),
        todo_list = state.get("todo_list"),
        syllabus = state.get("syllabus")
    )

    result = await course_builder_orchestrator_agent.run("", deps=deps)
    print("CourseBuilderOrchestratorAgent:", result.usage())

    output = result.output
    print("Sending workflow message via WebSocket...")

    message_id = str(uuid.uuid4())
    await websocket_manager.send_message({
        "messageId": message_id,
        "role": "agent",
        "content": output.workflow,
        "timestamp": str(datetime.now())
    })

    next_action = result.output.next_action
    state["next_action"] = next_action

    # Convert todo_list from list to dictionary, update state graph
    pending = {}
    done = {}

    # Update pending tasks
    for task in result.output.todo_list.pending:
        task_dict = {
            "task_id": str(task.task_id),
            "specific_requirements": task.specific_requirements
        }

        pending[str(task.task_id)] = task_dict

    # Update done tasks
    for task in result.output.todo_list.done:
        task_dict = {
            "task_id": str(task.task_id),
            "specific_requirements": task.specific_requirements
        }

        done[str(task.task_id)] = task_dict

    state["todo_list"] = {
        "pending": pending,
        "done": done
    }

    print("DONE COURSE BUILDER ORCHESTRATOR NODE")
    return Command(
        goto = next_action.target_agent,
        update = state #state
    )


async def syllabus_generator_agent_node(state: State):
    print("SYLLABUS GENERATOR NODE")
    deps = SyllabusGeneratorDeps(
        learning_obj = state.get("learning_obj"),
    )

    result = await syllabus_generator_agent.run("", deps=deps)
    print("SyllabusGeneratorAgent:", result.usage())
    
    syllabus = {
        "title": result.data.title,
        "overview": result.data.overview,
        "modules": [
            {
                "title": module.title,
                "content": module.content
            } 
            for module in result.data.modules]
    }

    state["syllabus"] = syllabus
    state["next_step"] = "course_builder_orchestrator"
    
    # Update TODO_list status
    task_id = state.get("next_action").task_id
    task_done = state.get("todo_list").get("pending").pop(task_id)
    state["todo_list"]["done"][task_id] = task_done

    print("DONE SYLLABUS GENERATOR NODE")
    return Command(
        goto = "course_builder_orchestrator_agent",
        update = state
    )


async def knowledge_retrieval_agent_node(state: State):
    print("KNOWLEDGE RETRIEVAL NODE")
    deps = KnowledgeRetrievalDeps(
        task = state["next_action"]        
    )

    result = asyncio.run(run_agent(knowledge_retrieval_agent, state, deps))
    # print("KnowledgeRetrievalAgent:", result.usage())

    state["results"]["data"] = result
    print("DONE KNOWLEDGE RETRIEVAL NODE")

    # Update TODO_list status
    task_id = state.get("next_action").task_id
    task_done = state.get("todo_list").get("pending").pop(task_id)
    state["todo_list"]["done"][task_id] = task_done

    state["pre_state"] = "knowledge_retrieval_agent"
    return Command(
        goto = "course_builder_orchestrator_agent",
        update = state
    )


async def lecture_note_agent_node(state: State):
    print("LECTURE NOTE GEN NODE")
    task = state["next_action"]

    deps = LectureNoteDeps(
        task = task,
        data = state.get("results").get("data")
    )

    # result = await lecture_note_gen_agent.run("", deps=deps)
    # print(result.data, "\n\n\n")

    # ws = state.get("websocket")
    # await ws.send_json({
    #     "role": "agent",
    #     "content": result.data,
    #     "timestamp": str(datetime.now())
    # })
    
    result = asyncio.run(run_agent(lecture_note_agent, state, deps))
    # print("LectureNoteAgent:", result.usage())
    
    state["results"]["lecture_notes"][task.task_id] = result
    
    # key = str(uuid.uuid4())
    
    # Get name of lecture note from curriculum
    idx = len(state.get("links_lecture"))
    name = state.get("syllabus").get("modules")[idx]

    link_up = f"{state.get('user_id')}/{state.get('project_id')}/{state.get('session_id')}/lecture_note/"

    
    link=upload_markdown_to_s3(result,'bookmcs',link_up+name['title']+"LECTURE.pdf")
    state["links_lecture"].append(link)
    
    print("LINK: ", link)

    # Update TODO_list status
    task_id = state.get("next_action").task_id
    task_done = state.get("todo_list").get("pending").pop(task_id)
    state["todo_list"]["done"][task_id] = task_done

    
    print("DONE LECTURE NOTE GEN NODE")
    return Command(
        goto = "course_builder_orchestrator_agent",
        update = state
    )


async def quiz_creator_agent_node(state: State):
    print("_____QUIZZ_________")
    dep = QuizInput(
        data = list(state.get("results").get("lecture_notes").values())[-1]
    )

    result = await quiz_creator_agent.run(" ", deps=dep)
    print("QuizCreatorAgent:", result.usage())

    task = state["next_action"]
    state["results"]["quizzes"][task.task_id] = result.data.dict()

    mk = convert_to_markdown(result.data)
    
    next_action = state["next_action"]
    key = str(uuid.uuid4())
    # if key not in state['modules_result']:
    #   state['modules_result'][key] = []
    # state['modules_result'][key].append({
    #     'quiz': result.output
    #       })
    idx = len(state.get("links_quiz"))
    name = state.get("syllabus").get("modules")[idx]['title']
    link_up = f"{state.get('user_id')}/{state.get('project_id')}/{state.get('session_id')}/quiz/"
    
    link=upload_markdown_to_s3(mk,'bookmcs',link_up+name+"QUIZ.pdf")
    
    state["links_quiz"].append(link)

    # Update TODO_list status
    task_id = state.get("next_action").task_id
    task_done = state.get("todo_list").get("pending").pop(task_id)
    state["todo_list"]["done"][task_id] = task_done

    return Command(
        goto = "course_builder_orchestrator_agent",
        update = state
    )


templates = {
    "template_1": "1F5r1P4M0NbiBnssPzz1dvV7J8VYPkKGVyL3AhiCeagQ", 
    "template_2": "1JQzsjIl8nz8x3ane5k5RnKNvYESfTJ-85IxJjd-_GZU",
    "template_3": "1EdOv2fn3vsO1o6mKgwAN6FeWjhnYTwAgaagP5EMDulQ",
    "template_4": "1vF_ZTXWUGyH5Qt5KIMrOw6szJmBcBSbO2Oli0yNapKQ",
    "template_5": "1nNr9z41x-6IWVua7wuzmKMq9b299T8r10eNQ21qrVEg",
}

SELECTED_TEMPLATE = ""

async def slide_generator_agent_node(state: State):
    print("_____SLIDE_________")
    dep = Content(
        title = state.get("next_action").specific_requirements,
        content = list(state.get("results").get("lecture_notes").values())[-1],
        images = [],
        language = "English"
    )

    result = await slide_generator_agent.run("", deps=dep)
    print("SlideGeneratorAgent:", result.usage())

    task = state["next_action"]
    state["results"]["slides"][task.task_id] = result.data.dict()


    # Send Websocket to choose template
    # print(f"________________________{state.get('next_action').agent}________________________")
    if state.get("next_action").target_agent == "slide_generator_agent" and state.get("presentation_template_url") == "":
        # ws = state.get("websocket")
        print("Sending template selection request to WebSocket...")
        await websocket_manager.send_message({
            "messageId": "",
            "role": "agent",
            "content": "",
            "timestamp": str(datetime.now()),
            "type": "template"
        })
        print("Waiting for template selection from WebSocket...")
        
        websocket = websocket_manager.get_websocket()
        if websocket:
            data = await websocket.receive_text()
            content = json.loads(data)
            template_id = content["template"]
            SELECTED_TEMPLATE = templates[template_id]

        state["presentation_template_url"] = SELECTED_TEMPLATE
        print(f"Selected template ID: {SELECTED_TEMPLATE}")

    # Work with Google Drive API to copy and edit slide content
    if not is_folder_exist("Presentation"):
        FOLDER_ID = create_folder("Presentation")
    else:
        FOLDER_ID = is_folder_exist("Presentation")

    presentation_name = result.data.slides[0].title
    SOURCE_PRESENTATION_ID = state.get("presentation_template_url")
    TARGET_PRESENTATION_ID = copy_presentation(SOURCE_PRESENTATION_ID, presentation_name)
    move_file_to_folder(TARGET_PRESENTATION_ID, FOLDER_ID)


    TARGET = [slide.layout for slide in result.data.slides]
    SOURCE_TEMPLATE = ["TITLE", "SECTION_HEADER", "TITLE_CONTENT", "CONTENT_IMAGE", "END"]

    CURR_TEMPLATE = delete_unnecessary_slide(TARGET_PRESENTATION_ID, TARGET, SOURCE_TEMPLATE)
    CURR_TEMPLATE = copy_slide(TARGET_PRESENTATION_ID, TARGET, CURR_TEMPLATE)
    CURR_TEMPLATE = move_slide(TARGET_PRESENTATION_ID, TARGET, CURR_TEMPLATE)
    assert CURR_TEMPLATE == TARGET

    update_presentation_content(TARGET_PRESENTATION_ID, slides=result.data.slides, template=TARGET)

    next_action = state["next_action"]

    state["presentation_urls"].append(
        {
            "name": presentation_name,
            "url": TARGET_PRESENTATION_ID
        }
    )
    
    # Update TODO_list status
    task_id = state.get("next_action").task_id
    task_done = state.get("todo_list").get("pending").pop(task_id)
    state["todo_list"]["done"][task_id] = task_done


    return Command(
        goto = "course_builder_orchestrator_agent",
        update = state
    )


async def content_validator_agent_node(state: State):
    print("_____EVALUATION_________")
    print(state.get('pre_state'))
    
    # if state.get('pre_state') == "slide_generator_agent":
    #     dep= state.get('results').get('slide')
    # elif state.get('pre_state') == "lecture_note_agent":
    #     dep = state.get('results').get('lecture_note')
    # elif state.get('pre_state') == "quiz_creator_agent":
    #     dep = state.get('results').get('quiz')

    
    deps = EvaluationInput(
        task = state.get("next_action"),
        results = state.get("results")
    )

    result = await content_validator_agent.run(" ", deps=deps)
    print("ContentValidatorAgent:", result.usage())
    
    content = f""""
    Validation results:
    {result.output.model_dump()}
    """

    websocket = websocket_manager.get_websocket()
    await websocket.send_json(
        {
            "role": "agent",
            "content": content,
            "timestamp": str(datetime.now())
        }
    )

    state['results']["evaluation"] = result.data.dict()

    next_action = state["next_action"]

    # Update TODO_list status
    task_id = state.get("next_action").task_id
    task_done = state.get("todo_list").get("pending").pop(task_id)
    state["todo_list"]["done"][task_id] = task_done
    
    state["pre_state"] = "content_validator_agent"
    return Command(
        goto = "course_builder_orchestrator_agent",
        update = state
    )

graph_builder = StateGraph(State)

graph_builder.add_node("learning_objective_agent", learning_objective_agent_node)
graph_builder.add_node("course_builder_orchestrator_agent", course_builder_orchestrator_agent_node)
graph_builder.add_node("syllabus_generator_agent", syllabus_generator_agent_node)
graph_builder.add_node("knowledge_retrieval_agent", knowledge_retrieval_agent_node)
graph_builder.add_node("lecture_note_agent", lecture_note_agent_node)
graph_builder.add_node("quiz_creator_agent", quiz_creator_agent_node)
graph_builder.add_node("slide_generator_agent", slide_generator_agent_node)
graph_builder.add_node("content_validator_agent", content_validator_agent_node)


graph_builder.add_edge(START, "learning_objective_agent")
graph_builder.add_edge("learning_objective_agent", "course_builder_orchestrator_agent")


# graph_builder.add_conditional_edges(
#     "course_builder_orchestrator_agent",
#     conditional_edges,
#     {  
#         "syllabus_generator_agent": "syllabus_generator_agent",
#         "knowledge_retrieval_agent": "knowledge_retrieval_agent",
#         "lecture_note_agent": "lecture_note_agent",
#         "slide_generator_agent": "slide_generator_agent",
#         "quiz_creator_agent": "quiz_creator_agent",
#         "content_validator_agent": "content_validator_agent",
#         "end": END
#     }
# )

# graph_builder.add_edge("syllabus_generator_agent", "course_builder_orchestrator_agent")
# graph_builder.add_edge("knowledge_retrieval_agent", "course_builder_orchestrator_agent")
# graph_builder.add_edge("lecture_note_agent", "course_builder_orchestrator_agent")
# graph_builder.add_edge("slide_generator_agent", "course_builder_orchestrator_agent")
# graph_builder.add_edge("quiz_creator_agent", "course_builder_orchestrator_agent")
# graph_builder.add_edge("content_validator_agent", "course_builder_orchestrator_agent")
# memory = MemorySaver()
graph = graph_builder.compile() #checkpointer = memory