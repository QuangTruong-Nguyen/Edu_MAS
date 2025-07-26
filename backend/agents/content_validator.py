from pydantic_ai.models.groq import GroqModel
from pydantic_ai.providers.groq import GroqProvider
from pydantic_ai import Agent, RunContext
# from agents.pydantic_models import EvaluationInput, EvaluationOutput
from agents.pydantic_models import LectureNoteEvaluation, SlideEvaluation, QuizEvaluation, Presentation, QuizOutput

import os
from dotenv import load_dotenv
from utils.agent_utils import load_prompt
from utils.setup import setup_gemini
from typing import Union
setup_gemini()


# GROQ_API_KEY = os.getenv('GROQ_API_KEY')

# llm = GroqModel(
#     'llama-3.3-70b-versatile',
#     provider=GroqProvider(api_key=GROQ_API_KEY)
# )
EvaluationInput = Union[str, Presentation, QuizOutput]
EvaluationOutput = Union[LectureNoteEvaluation, SlideEvaluation, QuizEvaluation, Presentation, QuizOutput]


content_validator_agent = Agent(
    'google-gla:gemini-2.5-flash',
    deps_type=EvaluationInput,
    result_type=EvaluationOutput,
    model_settings={"temperature": 0.0}
)

# @content_validator_agent.system_prompt
# def system_prompt(context: RunContext):
#     prompt = load_prompt("./backend/agents/old_prompt/evaluation.txt")
#     prompt = prompt.format(
#         lecture_note=context.deps.lecture_note,
#         quiz=context.deps.quiz,
#         slide=context.deps.slide
#     )
#     return prompt


@content_validator_agent.system_prompt
def system_prompt(context: RunContext):
    # deps = context.deps
    # if isinstance(deps, str):  # Lecture note
    #     print("Lecture note evaluation")
    #     prompt = load_prompt("./backend/agents/prompt/content_validator_lecture.txt",content=deps)
    #     return prompt
    # elif isinstance(deps, Presentation):
    #     print("Slide evaluation")
    #     prompt = load_prompt("./backend/agents/prompt/content_validator_slide.txt",content=deps.model_dump())
    #     # Nếu muốn truyền cả object, có thể dùng .json() hoặc tuỳ template
    #     return prompt
    # elif isinstance(deps, QuizOutput):
    #     print("Quiz evaluation")
    #     prompt = load_prompt("./backend/agents/prompt/content_validator_quiz.txt",content=deps.model_dump()  )
    #     return prompt
    # else:
    #     raise ValueError("Unknown input type for system_prompt")
    prompt = load_prompt(
        "./backend/agents/prompt/content_validator.txt", 
        deps = {"task_description": context.deps.task.specific_requirements})

    return prompt


@content_validator_agent.tool
def get_lecture_note(ctx: RunContext):
    results = ctx.deps.results
    task_id = int(ctx.deps.task.task_id)

    # Get previous lecture note
    print(results)
    lecture_note = results.get("lecture_notes").get(str(task_id - 1))

    prompt = load_prompt(
        "./backend/agents/prompt/content_validator_lecture.txt", 
        deps = {
            "content": lecture_note
        }
    )

    return prompt


@content_validator_agent.tool
def get_slide(ctx: RunContext):
    results = ctx.deps.results
    task_id = int(ctx.deps.task.task_id)

    # Get previous lecture note
    slide = results.get("slides").get(str(task_id - 1))

    prompt = load_prompt(
        "./backend/agents/prompt/content_validator_slide.txt", 
        deps = {
            "content": slide
        }
    )

    return prompt


@content_validator_agent.tool
def get_quiz(ctx: RunContext):
    results = ctx.deps.results
    task_id = int(ctx.deps.task.task_id)

    # Get previous lecture note
    quiz = results.get("quizzes").get(str(task_id - 1))

    prompt = load_prompt(
        "./backend/agents/prompt/content_validator_quiz.txt", 
        deps = {
            "content": quiz
        }
    )

    return prompt
