import os
import shutil
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load env vars
load_dotenv()

app = FastAPI(title="LangExtract API")

# CORS Setup - Allow all for development/demo, restrict for strict prod if needed
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "LangExtract Backend is running"}

@app.post("/extract")
async def extract_data(
    file: UploadFile = File(...),
    prompt: str = Form("Extract key information and relationships."),
    openai_api_key: Optional[str] = Form(None)
):
    """
    Uploads a PDF and extracts graph/text data based on the prompt.
    """
    # 1. Save file temporarily
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # 2. Process File (Imports here to avoid startup errors if dependencies missing)
    try:
        from service import process_pdf
        
        # Use provided key or env var
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
             raise HTTPException(status_code=400, detail="OpenAI API Key is required (either in env or form data).")

        result = await process_pdf(file_path, prompt, api_key)
        
        # Cleanup
        os.remove(file_path)
        
        return result

    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"ERROR in /extract: {error_detail}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)} | Traceback: {error_detail}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
