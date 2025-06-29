import os
from pydantic_ai import Agent
import nest_asyncio

nest_asyncio.apply()
import asyncio

os.environ["GEMINI_API_KEY"] = "AIzaSyBrdIox1oOltdDbKX03ANBk2gjLO4EtGSE"
agent = Agent('google-gla:gemini-2.0-flash')

async def main():
    async with agent.run_stream('What is the AI?') as response:
        async for data in response.stream_text(delta=True):
            print(data)
        #> London

asyncio.run(main())