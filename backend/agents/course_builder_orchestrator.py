from pydantic_ai import Agent, RunContext
from agents.pydantic_models import CourseBuilderOrchestratorDeps, CourseBuilderOrchestratorResult
from utils.setup import setup_gemini
from utils.agent_utils import load_prompt

setup_gemini()


course_builder_orchestrator_agent = Agent(
    'google-gla:gemini-2.5-flash', 
    deps_type = CourseBuilderOrchestratorDeps,
    result_type = CourseBuilderOrchestratorResult,
    model_settings={"temperature": 0.0}
)

@course_builder_orchestrator_agent.system_prompt
def system_prompt(ctx: RunContext) -> str:

    prompt = load_prompt(
        "./backend/agents/prompt/course_builder_orchestrator.txt",
        deps = {
            "learning_objective": ctx.deps.learning_obj,
            "todo_list_pending": ctx.deps.todo_list.get("pending"),
            "todo_list_done": ctx.deps.todo_list.get("done"),
            "syllabus": ctx.deps.syllabus
        }
    )
        
    return prompt

