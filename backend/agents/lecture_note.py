from pydantic_ai import Agent, RunContext
from agents.pydantic_models import LectureNoteDeps
from utils.agent_utils import load_prompt

lecture_note_agent = Agent(
    'google-gla:gemini-2.5-flash',
    deps_type = LectureNoteDeps,
    result_type = str,
    model_settings={"temperature": 0.0}  # Adjust temperature for more deterministic output
)


@lecture_note_agent.system_prompt
def system_prompt(ctx: RunContext) -> str:

    deps={
        "data": ctx.deps.data,
        "task": ctx.deps.task
    }
    prompt = load_prompt("./backend/agents/old_prompt/lecture_note.txt", deps=deps)

    return prompt
        