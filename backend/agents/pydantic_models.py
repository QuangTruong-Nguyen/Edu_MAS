from dataclasses import dataclass
from typing import List, Literal, Dict, Any, Optional, Union,Annotated
from typing_extensions import TypedDict
from pydantic import BaseModel, Field, ConfigDict
from fastapi import WebSocket


# LearningObjective Models
class LearningObjectiveDeps(BaseModel):
    session_id: str
    user_query: str
    websocket: WebSocket

    model_config = ConfigDict(arbitrary_types_allowed=True)

class LearningObjectiveResult(BaseModel):
    learning_obj: str = Field(description = "Learning objective of the course")
    final_response: str = Field(description = "Final response to the user")


# CourseBuilderOrchestrator Models
class Task(BaseModel):
    task_id: str = Field(description="Task ID, id start from index 1")
    target_agent: Literal["syllabus_generator_agent", "knowledge_retrieval_agent", "lecture_note_agent", "slide_generator_agent", "quiz_creator_agent", "content_validator_agent", "end"]
    specific_requirements: str = Field(description="Specific requirements about task")
    # status: Literal["pending", "done"]

class TODOList(BaseModel):
    pending: List[Task] = Field(default=[], description="Tasks is pending")
    done: List[Task] = Field(default=[], description="Tasks is done")

class RunTask(BaseModel):
    task_id: str = Field(description="Task ID, id start from index 1")
    target_agent: Literal["syllabus_generator_agent", "knowledge_retrieval_agent", "lecture_note_agent", "slide_generator_agent", "quiz_creator_agent", "content_validator_agent", "end"]
    specific_requirements: str = Field(description="Specific requirements about task")


@dataclass
class CourseBuilderOrchestratorDeps:
    learning_obj: str
    syllabus: Dict[str, str]
    todo_list: TODOList

class CourseBuilderOrchestratorResult(BaseModel):
    workflow: str = Field(description = "Description about orchestrator's thinking, and describe about the next task with provided context")
    todo_list: TODOList = Field(description = "List of tasks")
    next_action: Task


# SyllabusGenerator Models
@dataclass
class SyllabusGeneratorDeps:
    learning_obj: str

class Module(BaseModel):
    title: str = Field(description="Module name. For example: 1.1 Introduction to AI")
    content: str = Field(description="Submodules for example: 1.1 Introduction to AI: \n - What is AI? ,... and its description.")

class SyllabusGeneratorResult(BaseModel):
    title: str = Field(description="Course title")
    overview: str = Field(description="Course description, target audience, prerequisite, course objectives,...")
    modules: List[Module] = Field(description="Course modules")


# KnowledgeRetrieval Models
@dataclass
class KnowledgeRetrievalDeps:
    task: Task
    

# Lecture Note Models
@dataclass
class LectureNoteDeps:
    task: Task
    data: str

# class LectureNoteResult(BaseModel):
#     title: str = Field(description="title of lecture note")
#     content: str = Field(description="Content of the lecture note")

# Presentation Models
class ImageData(BaseModel):
    image_url: str
    caption: str
    width: int
    height: int

@dataclass
class Content:
    title: str
    content: str
    images: List[ImageData]
    language: str

class BulletPoints(BaseModel):
    subject: str
    points: List[str]

class Description(BaseModel):
    text: str

class Slide(BaseModel):
    title: str = Field(description="title of slide")
    body_text: None | BulletPoints | Description = Field(description="If layout is TITLE_CONTENT or CONTENT_IMAGE, else None")
    reference: str | None = Field(description="Reference link of figures, cite, etc", default=None)
    layout: Literal["TITLE", "SECTION_HEADER", "TITLE_CONTENT", "CONTENT_IMAGE", "END"]
    image_urls: Optional[List[str]]
    page: int

class Presentation(BaseModel):
    title: str
    slides: List[Slide]
    


# Quiz Models
class Question(BaseModel):
    question: str = Field(description="Question of multichoice")
    option: List[str] = Field(description="List of multiple")
    answer: str = Field(description="Answer of question from option, not A/B/C/D")
    # explain: str = Field(description="Explain the correct answer")
    source: str = Field(description="Extract questions from database or web")

class QuizOutput(BaseModel):
    questions: List[Question]

class QuizInput(BaseModel):
    data: str


# # Evaluator Models
# class LectureNoteEvaluation(BaseModel):
#     completeness: int = Field(ge=1, le=5, description="The completeness of the lecture content")
#     logical_flow: int = Field(ge=1, le=5, description="The logical flow and structure of the lecture")
#     scientific_accuracy: int = Field(ge=1, le=5, description="The scientific accuracy of the lecture content")
#     clarity: int = Field(ge=1, le=5, description="The clarity and understandability of the lecture")
#     reference_quality: int = Field(ge=1, le=5, description="The quality and validity of cited references")
#     comment: Optional[str] = Field(description="General comments on the lecture note")

# class QuizEvaluation(BaseModel):
#     difficulty: int = Field(ge=1, le=5, description="The difficulty level of the quiz questions")
#     question_clarity: int = Field(ge=1, le=5, description="The clarity and comprehensibility of the questions")
#     answer_correctness: int = Field(ge=1, le=5, description="The correctness and appropriateness of the answers")
#     explanation_quality: int = Field(ge=1, le=5, description="The quality and clarity of the answer explanations")
#     topic_variety: int = Field(ge=1, le=5, description="The diversity of topics covered by the quiz")
#     comment: Optional[str] = Field(description="General comments on the quiz")

# class SlideEvaluation(BaseModel):
#     layout_quality: int = Field(ge=1, le=5)
#     aesthetic: int = Field(ge=1, le=5)
#     visual_support: int = Field(ge=1, le=5)
#     information_accuracy: int = Field(ge=1, le=5)
#     readability: int = Field(ge=1, le=5)
#     comment: Optional[str]


# class LectureNoteEvaluation(BaseModel):
#     clarity_and_structure: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']
#     completeness_and_depth: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']
#     accuracy_and_up_to_date: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']
#     suitability: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']

# class SlideEvaluation(BaseModel):
#     visual_quality: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']
#     consistency: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']
#     engagement: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']

# class QuizEvaluation(BaseModel):
#     question_quality: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']
#     answer_quality: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']
#     discrimination: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory']

# class EvaluationOutput(BaseModel):
#     lecture_note_eval: Optional['LectureNoteEvaluation']
#     quiz_eval: Optional['QuizEvaluation']
#     slide_eval: Optional['SlideEvaluation']

# class EvaluationInput(BaseModel):
#     lecture_note: Optional[str]
#     quiz: Optional[QuizOutput]
#     slide: Optional[Presentation]

class EvaluationInput(BaseModel):
    task: Task
    results: Any
    # material_type: Literal["lecture_note", "presentation", "quiz"]
    # dynamic_prompt: str


# content validator agent
class LectureNoteEvaluation(BaseModel):
    clarity_and_structure: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates how clear and logically organized the content is."
    )
    completeness_and_depth: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the completeness and depth of the concepts, including examples."
    )
    accuracy_and_up_to_date: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the accuracy and up-to-dateness of the information."
    )
    suitability: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the suitability of the content for the intended audience and learning objectives."
    )
    logical_consistency: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the logical consistency and reasoning in explanations and arguments."
    )


class SlideEvaluation(BaseModel):
    clarity_and_conciseness: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the clarity and conciseness of the slide content."
    )
    logical_and_coherent_organization: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates how logically and coherently the content is organized."
    )
    relevance_to_audience_and_objectives: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the relevance of the content to the intended audience and learning objectives."
    )
    accuracy_and_up_to_date_information: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the accuracy and up-to-dateness of the information presented."
    )
    practical_skills_development: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the degree to which the slides support the development of practical skills."
    )
    
    
class QuizEvaluation(BaseModel):
    question_quality_and_clarity: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the quality and clarity of the quiz questions."
    )
    answer_quality_and_discrimination: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the quality of the answers and the ability of the questions to discriminate between different levels of understanding."
    )
    content_coverage_and_balance: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates how well the quiz covers the breadth and balance of the content."
    )
    appropriate_difficulty_and_classification: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates whether the difficulty level is appropriate and the questions are classified effectively."
    )
    practical_application_and_real_world_connection: Literal['Satisfactory', 'Needs Improvement', 'Unsatisfactory'] = Field(
        ..., description="Evaluates the extent to which the quiz promotes practical application and real-world connections."
    )

EvaluationOutput = Union[LectureNoteEvaluation, SlideEvaluation, QuizEvaluation]