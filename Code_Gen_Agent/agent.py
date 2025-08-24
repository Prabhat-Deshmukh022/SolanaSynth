from agno.agent import Agent
# from agno.models.huggingface import HuggingFace
# from agno.models.groq import Groq
from agno.models.mistral import MistralChat
from agno.embedder.mistral import MistralEmbedder
from agno.knowledge.website import WebsiteKnowledgeBase
from agno.vectordb.lancedb import LanceDb, SearchType
from agno.storage.sqlite import SqliteStorage

import os
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY=os.getenv("MISTRAL_API_KEY")
os.environ["MISTRAL_API_KEY"]=MISTRAL_API_KEY

knowledge = WebsiteKnowledgeBase(
    urls=[
        "https://solana.com/docs",
        "https://solana-foundation.github.io/solana-web3.js/"
    ],
    vector_db=LanceDb(
        uri="/tmp/lancedb",
        table_name="solana_docs",
        embedder=MistralEmbedder(),
        search_type=SearchType.hybrid
    )
)

storage = SqliteStorage(table_name="agent_sessions", db_file="tmp/agent.db")

agent = Agent(
    model=MistralChat(
           api_key=MISTRAL_API_KEY
        ),
    name="Code_Generator",
    knowledge=knowledge,
    instructions="""
        You are an assistant that takes natural input and generates code to execute these on the Solana Blockchain.\n
        Follow the instructions below.\n\n
        Generate a TypeScript function named executeStrategy() using only these functions:\n
        - getTokenPrice(tokenAddress)\n
        - swapTokens(tokenAddress, amount, action)\n
        - getMarketCap(tokenAddress)\n
        - getTokenAge(tokenAddress)\n
        - getHolderDistribution(tokenAddress)\n
        - checkSocialPresence(tokenAddress)\n\n

        Example format:\n
        async function executeStrategy() {\n
        ...\n
        }\n
    """ 
)

# agent.knowledge.load(recreate=True, skip_existing=True)

agent.print_response("""Build a trading strategy for trading tokens on Solana's pump.fun platform. 
We will buy any tokens that have amassed a $10k+ market cap in less than a week. The token should have active social media accounts like Twitter and Instagram. Additionally, no more than 20% of the tokens should be held by the token creator or any single wallet.
""")