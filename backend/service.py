import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import ChatOpenAI
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_core.documents import Document

from langchain_core.prompts import ChatPromptTemplate

async def process_pdf(file_path: str, prompt_instruction: str, api_key: str):
    """
    Loads PDF, generates Knowledge Graph elements and simple extraction.
    """
    # 1. Load PDF
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    
    # Combine text for simple extraction (limit size for demo)
    full_text = "\n".join([d.page_content for d in docs])
    
    # Initialize LLM
    llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo", api_key=api_key)
    
    # 2. Knowledge Graph Extraction
    # Using LLMGraphTransformer to get nodes and edges
    llm_transformer = LLMGraphTransformer(llm=llm)
    
    # Converting to graph documents
    # We might want to limit pages for speed in this demo if the PDF is huge
    graph_documents = llm_transformer.convert_to_graph_documents(docs[:5]) # limit to first 5 pages for speed
    
    nodes = []
    edges = []
    
    for graph_doc in graph_documents:
        for node in graph_doc.nodes:
            nodes.append({
                "id": node.id,
                "type": node.type,
                "label": node.id # Use id as label for simple viz
            })
        for edge in graph_doc.relationships:
            edges.append({
                "source": edge.source.id,
                "target": edge.target.id,
                "label": edge.type
            })

    # Deduced unique nodes/edges could be handled here, but frontend can also handle duplicates or we filter:
    unique_nodes = {n['id']: n for n in nodes}.values()
    # Edges are directional, keep all or filter duplicates? Let's keep all for now.
    
    # 3. Simple Text Extraction / Q&A based on Prompt
    # We can ask the LLM to summarize or answer the specific user prompt
    
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant analyzing a document."),
        ("user", f"Context: {full_text[:10000]}... \n\nInstruction: {prompt_instruction} \n\nProvide the result in a clear, concise format.")
    ])
    
    chain = qa_prompt | llm
    extraction_result = chain.invoke({})
    
    return {
        "graph_data": {
            "nodes": list(unique_nodes),
            "links": edges
        },
        "extraction_text": extraction_result.content
    }
