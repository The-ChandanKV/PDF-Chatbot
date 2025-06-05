from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import fitz  # PyMuPDF
import os
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from pydantic import BaseModel
import json
from pathlib import Path
import uuid

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Create directories if they don't exist
UPLOAD_DIR = Path("uploads")
EMBEDDINGS_DIR = Path("embeddings")
UPLOAD_DIR.mkdir(exist_ok=True)
EMBEDDINGS_DIR.mkdir(exist_ok=True)

# Store PDF metadata and embeddings
pdf_metadata = {}
index = None
dimension = 384  # Dimension of the embeddings

class Question(BaseModel):
    text: str
    pdf_ids: List[str] = []  # Optional list of PDF IDs to search in

class PDFInfo(BaseModel):
    filename: str
    pages: int
    status: str

def extract_text_from_pdf(pdf_path: str) -> List[Dict]:
    """Extract text from PDF and return chunks with metadata."""
    doc = fitz.open(pdf_path)
    chunks = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        
        # Split text into chunks (you can adjust the chunk size)
        words = text.split()
        chunk_size = 100
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append({
                "text": chunk,
                "page": page_num + 1,
                "pdf_name": os.path.basename(pdf_path)
            })
    
    return chunks

def create_embeddings(chunks: List[Dict]) -> tuple:
    """Create embeddings for text chunks."""
    texts = [chunk["text"] for chunk in chunks]
    embeddings = model.encode(texts)
    return embeddings, chunks

@app.post("/upload")
async def upload_pdf(files: List[UploadFile] = File(...)):
    """Handle multiple PDF uploads."""
    uploaded_files = []
    
    for file in files:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(400, "Only PDF files are allowed")
        
        # Generate a unique ID for the file
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / file.filename
        
        try:
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Extract text and create embeddings
            chunks = extract_text_from_pdf(str(file_path))
            embeddings, chunks = create_embeddings(chunks)
            
            # Save embeddings and metadata
            pdf_name = file.filename
            embedding_path = EMBEDDINGS_DIR / f"{pdf_name}.npy"
            metadata_path = EMBEDDINGS_DIR / f"{pdf_name}_metadata.json"
            
            np.save(embedding_path, embeddings)
            with open(metadata_path, "w") as f:
                json.dump(chunks, f)
            
            pdf_metadata[pdf_name] = {
                "id": file_id,
                "pages": len(fitz.open(file_path)),
                "status": "ready"
            }
            
            uploaded_files.append({
                "filename": pdf_name,
                "id": file_id,
                "pages": pdf_metadata[pdf_name]["pages"],
                "status": "ready"
            })
        except Exception as e:
            # Clean up if there's an error
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(500, f"Error processing PDF: {str(e)}")
    
    return {
        "success": True,
        "files": uploaded_files
    }

@app.get("/pdfs")
async def list_pdfs():
    """List all uploaded PDFs with their metadata."""
    return {"pdfs": pdf_metadata}

@app.post("/chat")
async def chat(question: Question):
    """Process a question across all PDFs or specific PDFs if IDs are provided."""
    # Encode the question
    question_embedding = model.encode([question.text])[0]
    
    all_results = []
    
    # If specific PDFs are requested, only search those
    pdfs_to_search = []
    if question.pdf_ids:
        for pdf_name, metadata in pdf_metadata.items():
            if metadata["id"] in question.pdf_ids:
                pdfs_to_search.append(pdf_name)
    else:
        # Search all PDFs if no specific ones are requested
        pdfs_to_search = list(pdf_metadata.keys())
    
    if not pdfs_to_search:
        raise HTTPException(404, "No PDFs found to search in")
    
    # Search through each PDF
    for pdf_name in pdfs_to_search:
        embedding_path = EMBEDDINGS_DIR / f"{pdf_name}.npy"
        metadata_path = EMBEDDINGS_DIR / f"{pdf_name}_metadata.json"
        
        if not (embedding_path.exists() and metadata_path.exists()):
            continue
        
        embeddings = np.load(embedding_path)
        with open(metadata_path, "r") as f:
            chunks = json.load(f)
        
        # Calculate similarities
        similarities = np.dot(embeddings, question_embedding)
        top_k = 3
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        for idx in top_indices:
            all_results.append({
                "text": chunks[idx]["text"],
                "page": chunks[idx]["page"],
                "pdf_name": chunks[idx]["pdf_name"],
                "similarity": float(similarities[idx])
            })
    
    # Sort all results by similarity
    all_results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # Take top 5 most relevant results across all PDFs
    top_results = all_results[:5]
    
    # Generate a response based on the most relevant chunks
    response = "Based on the PDF content:\n\n"
    for result in top_results:
        response += f"From {result['pdf_name']} (Page {result['page']}): {result['text']}\n\n"
    
    return {
        "response": response,
        "sources": top_results
    }

@app.delete("/pdf/{filename}")
async def delete_pdf(filename: str):
    """Delete a PDF and its associated files."""
    pdf_path = UPLOAD_DIR / filename
    embedding_path = EMBEDDINGS_DIR / f"{filename}.npy"
    metadata_path = EMBEDDINGS_DIR / f"{filename}_metadata.json"
    
    if pdf_path.exists():
        pdf_path.unlink()
    if embedding_path.exists():
        embedding_path.unlink()
    if metadata_path.exists():
        metadata_path.unlink()
    
    if filename in pdf_metadata:
        del pdf_metadata[filename]
    
    return {"message": f"PDF {filename} deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 