from dataclasses import dataclass
from pydantic_ai import Agent, RunContext

from typing import List, Literal, Dict, Any
from typing_extensions import TypedDict
from agents.pydantic_models import Task, RunTask, QuizOutput, Presentation
from fastapi import WebSocket

class State(TypedDict):
    user_query: str
    learning_obj: str
    todo_list: Dict[str, Any]
    data: str
    next_action: RunTask
    pre_state: Literal["syllabus_generator_agent", "knowledge_retrieval_agent", "lecture_note_agent", "slide_generator_agent", "quiz_creator_agent", "content_validator_agent","learning_objective" ,"end"]
    # next_step: Literal["syllabus_generator_agent", "knowledge_retrieval_agent", "lecture_note_agent", "slide_generator_agent", "quiz_creator_agent", "content_validator_agent", "end"]
    pre_state:Literal["syllabus_generator_agent", "knowledge_retrieval_agent", "lecture_note_agent", "slide_generator_agent", "quiz_creator_agent", "content_validator_agent", "end"]
    syllabus: Dict[str, str]
    results: Dict[str, Any]
   
    # lecture_notes: str
    # quizzes: QuizOutput
    # slides: Presentation


    websocket: WebSocket
    presentation_template_url: str
    presentation_folder_url: str
    presentation_urls: List[Dict[str, str]]
    session_id: str
    project_id: str
    user_id: str
    links_quiz: List[str]
    links_lecture: List[str]
    title: str
    