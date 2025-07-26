from pydantic_ai import Agent, RunContext
from agents.pydantic_models import Content, Presentation
from pydantic_ai.models.groq import GroqModel
from pydantic_ai.providers.groq import GroqProvider

from utils.agent_utils import load_prompt


slide_generator_agent = Agent(
    'google-gla:gemini-2.5-flash', 
    deps_type=Content,
    result_type=Presentation,
    model_settings={"temperature": 0.0}
)

@slide_generator_agent.system_prompt
def system_prompt(ctx: RunContext) -> str:
    
    deps={
        "title": ctx.deps.title,
        "content": ctx.deps.content,
    }

    prompt = load_prompt("./backend/agents/old_prompt/slide_generator.txt", deps=deps)

    return prompt

