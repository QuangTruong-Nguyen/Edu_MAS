from fastapi import FastAPI, Response, Request,WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json, uvicorn
from asyncio import sleep
from pydantic import BaseModel, Field, ConfigDict
import time
from fastapi import WebSocket
from fastapi.responses import HTMLResponse
import os
from pydantic_ai import Agent, RunContext
import nest_asyncio
import asyncio
import uuid

nest_asyncio.apply()

from typing import List, Literal, Dict
from langgraph.graph import StateGraph, START, END
import json
from datetime import datetime

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


os.environ["GEMINI_API_KEY"] = "AIzaSyBrdIox1oOltdDbKX03ANBk2gjLO4EtGSE"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = Agent('google-gla:gemini-2.0-flash')

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept() 

    # data = await websocket.receive_text()
    # user_query = json.loads(data)

    # agent = Agent(  
    #     'google-gla:gemini-1.5-flash',
    #     system_prompt='Be concise, reply user query',  
    # )

    # result = await agent.run(user_query)  

    # await websocket.send_json({
    #     "role": "agent",
    #     "content": result.data,                
    #     "timestamp": str(datetime.now())
    # })
    try:
        while True:
            data = await websocket.receive_text()
            user_query = json.loads(data)
            print(user_query)
            
            mongodb["chatbotdb"].update_one(
                    { "session_id": user_query['session_id'] },
                    {
                        "$push": { 
                            "messages": {
                                "content": user_query['content'],
                                "role": user_query['role'],
                                "timestamp": user_query['timestamp']
                            },
                        }
                    },
                    upsert=True
                )
            

            async def run_agent(query):
                # Create new UUID for message_id
                message_id = str(uuid.uuid4())

                # Store final message to save database
                message_content = ""

                async with agent.run_stream(query) as response:
                    async for data in response.stream_text(delta=True):
                        message_content += data

                        # Send response message back to chat
                        await websocket.send_json({
                            "messageId": message_id,
                            "role": "agent",
                            "content": data,
                            "timestamp": str(datetime.now())
                        })

                mongodb["chatbotdb"].update_one(
                    { "session_id": user_query['session_id'] },
                    {
                        "$push": { 
                            "messages": {
                                "content": message_content,
                                "role": 'agent',
                                "timestamp": str(datetime.now())                                
                            },                                
                        }
                    },
                    upsert=True
                )
                        
            result = asyncio.run(run_agent(user_query['content']))
            

            # # Dùng await nếu có hàm async
            # result = await agent.run(user_query['content'])
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print("Error:", e)
        await websocket.close()

# async def waypoints_generator():
#     with open("sample.txt", "r") as file:
#         content = file.read()
    
#         # Split the content into tokens
#         tokens = [{"data": token} for token in content.split()]

#     for token in tokens:
#         data = json.dumps(token)
#         yield f"event: streamToken\ndata: {data}\n\n"
#         await sleep(0.1)

# @app.get("/api/py/chat")
# async def root():
#     return StreamingResponse(waypoints_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)