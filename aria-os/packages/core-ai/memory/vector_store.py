import chromadb
from langchain_huggingface import HuggingFaceEmbeddings
import os

# Initialize local ChromaDB client (stores in disk)
db_path = os.path.join(os.path.dirname(__file__), "../../../apps/api/chroma_db")
client = chromadb.PersistentClient(path=db_path)

# Initialize 100% free offline embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Get or create the memory collection
collection = client.get_or_create_collection(name="aria_long_term_memory")

def add_memory(user_id: str, memory_text: str):
    """Embeds and saves a permanent memory to the local VectorDB."""
    vector = embeddings.embed_query(memory_text)
    # Using a hash of text as ID for simplicity
    doc_id = str(hash(memory_text))
    collection.add(
        ids=[doc_id],
        embeddings=[vector],
        documents=[memory_text],
        metadatas=[{"user_id": user_id}]
    )

def search_memory(user_id: str, query: str, n_results: int = 2):
    """Searches local VectorDB for relevant memories."""
    if collection.count() == 0:
        return []
        
    query_vector = embeddings.embed_query(query)
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=n_results,
        where={"user_id": user_id}
    )
    
    if results['documents'] and len(results['documents']) > 0:
        return results['documents'][0]
    return []
