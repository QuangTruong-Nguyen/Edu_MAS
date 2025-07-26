from pydantic_ai.models.groq import GroqModel
from pydantic_ai.providers.groq import GroqProvider
from agents.pydantic_models import QuizInput, QuizOutput
from pydantic_ai import Agent, RunContext
from utils.agent_utils import load_prompt

import os

quiz_creator_agent = Agent(
    'google-gla:gemini-2.5-flash',
    deps_type = QuizInput,        
    result_type = QuizOutput,
    model_settings={"temperature": 0.0}
)

@quiz_creator_agent.system_prompt
def system_prompt(context: RunContext):
    deps={
        "data": context.deps.data,
    }
    prompt = load_prompt("./backend/agents/old_prompt/quiz_creator.txt", deps=deps)
    # prompt = prompt.format(
    #     data=context.deps.data,
    # )
    return prompt


 