from datetime import datetime
from pydantic_ai import Agent, RunContext
from agents.pydantic_models import LearningObjectiveDeps, LearningObjectiveResult
import dotenv
import json
import os
from utils.setup import setup_gemini
from utils.agent_utils import load_prompt

## Data Base
from urllib.parse import quote_plus
from pymongo.mongo_client import MongoClient
# from langgraph.checkpoint.mongodb import MongoDBSaver
from pymongo.server_api import ServerApi

db_password = quote_plus("Truong2003@")

uri = f"mongodb+srv://quangtruongairline:{db_password}@chatbotdb.pzsqjdr.mongodb.net/?retryWrites=true&w=majority&appName=chatbotdb"

# Create a new client and connect to the server
client = MongoClient(uri,tls=True, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

mongodb = client.get_database('chatbotdb')

setup_gemini()

learning_objective_agent = Agent(
    'google-gla:gemini-2.5-flash', 
    deps_type=LearningObjectiveDeps,
    result_type = LearningObjectiveResult
)

@learning_objective_agent.system_prompt
def system_prompt(ctx: RunContext) -> str:
    prompt = load_prompt(
        "./backend/agents/prompt/learning_objective.txt", 
        deps = {
            "user_query": ctx.deps.user_query
        }
    )
    # prompt = prompt_template.format(
    #     user_query=ctx.deps.user_query,
    #     subject=ctx.deps.subject,
    #     level=ctx.deps.level,
    #     target_audience=ctx.deps.target_audience,
    #     entire_course=ctx.deps.entire_course,
    #     chapters=ctx.deps.chapters,
    # )
    
    return  prompt


@learning_objective_agent.tool
async def get_user_query(ctx: RunContext, question: str) -> str:
    websocket = ctx.deps.websocket

    await websocket.send_json(
        {
            "role": "agent",
            "content": question,
            "timestamp": str(datetime.now())
        }
    )

    mongodb["chatbotdb"].update_one(
                { "session_id": ctx.deps.session_id },
                {
                    "$push": { 
                        "messages": {
                            "content": question,
                            "role": "agent",                                
                            "timestamp": str(datetime.now())
                        },
                    }
                },
                
                upsert=True
            )

    data = await websocket.receive_text()
    answer = json.loads(data)

    mongodb["chatbotdb"].update_one(
                { "session_id": ctx.deps.session_id },
                {
                    "$push": { 
                        "messages": {
                            "content": answer["content"],
                            "role": "user",                                
                            "timestamp": str(datetime.now())
                        },
                    }
                },
                
                upsert=True
            )

    return f"User answer: {answer['content']}"

# if __name__ == "__main__":
#     deps = Objective(
#         user_query = "Can you help me create a learning material for Introduction to Artificial Intelligence course",
#         subject = "",
#         level = "",
#         target_audience = "",
#         entire_course = False,
#         chapters = []
#     )

#     result = clarify_agent.run_sync(
#         "", deps=deps, 
#         model_settings={'temperature': 0.0}
#     )

#     print(result)