from pydantic_ai import Agent, RunContext
from agents.pydantic_models import SyllabusGeneratorDeps, SyllabusGeneratorResult
from utils.setup import setup_gemini
from utils.agent_utils import load_prompt

setup_gemini()

syllabus_generator_agent = Agent(
    'google-gla:gemini-2.5-flash', #'google-gla:learnlm-2.0-flash-experimental', # 
    deps_type = SyllabusGeneratorDeps,
    result_type = SyllabusGeneratorResult,
    model_settings={"temperature": 0.0} 
)

@syllabus_generator_agent.system_prompt
def system_prompt(ctx: RunContext) -> str:
    prompt = load_prompt(
        "./backend/agents/prompt/syllabus_generator.txt",
        deps = {
            "learning_objective": ctx.deps.learning_obj,
        }
    )

    return prompt
