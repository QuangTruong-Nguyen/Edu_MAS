from pydantic_ai import Agent, RunContext
from pydantic_ai.common_tools.duckduckgo import duckduckgo_search_tool
from pydantic_ai.common_tools.tavily import tavily_search_tool
from typer import prompt
from agents.pydantic_models import KnowledgeRetrievalDeps
from utils.setup import setup_gemini
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import time
import os
from dotenv import load_dotenv
from utils.agent_utils import load_prompt

load_dotenv()
setup_gemini()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

knowledge_retrieval_agent = Agent(
    'google-gla:gemini-2.5-flash',
    deps_type = KnowledgeRetrievalDeps,
    tools=[tavily_search_tool(TAVILY_API_KEY)],
    result_type = str,
    model_settings={"temperature": 0.0}
)


@knowledge_retrieval_agent.tool
def retrieval(ctx: RunContext, question: str) -> str:
    """Retrieve documents from vector store.
    
    This tool performs semantic search on a vector database to find relevant documents based on the input question.
    It uses the multilingual-e5-base model for embeddings and returns the top 2 most similar documents.
    
    Args:
        question (str): The query/question to search for in the vector store
        
    Returns:
        str: A concatenated string containing the content of the top 2 most relevant documents
    """
    print("---RETRIEVE---")
    
    embedings=HuggingFaceEmbeddings(model_name='intfloat/multilingual-e5-base')
    
    vector_store = Chroma(
        collection_name=  'chatbotDB',  #"example_collection2",
        embedding_function=embedings, 
        persist_directory="./VectorDB/",  
        #"./chroma_langchain_db"
    )
    
    print("______________Retrieval OK______________")
    try:
        # Retrieval
        documents = vector_store.similarity_search(
            question,
            k=2
        )
        result = "Result Retrieval: " + documents[0].page_content + documents[1].page_content
        print("retrieval result: ", result)
        time.sleep(5)
        return result  
    
    except Exception as e:
        print(f"Error retrieving documents: {e}")
        # return ToolOutput(result=f"Simulated retrieval result for question: {question}")


@knowledge_retrieval_agent.system_prompt
def system_prompt(ctx: RunContext) -> str:
    deps= {
         "description": ctx.deps.task.specific_requirements,
    }
    prompt_template = load_prompt("./backend/agents/old_prompt/knowledge_retrieval.txt", deps=deps)
    # prompt = prompt_template.format(
    #     description=ctx.deps.task.description
    # )
    return prompt_template