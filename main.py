import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi.responses import FileResponse

load_dotenv()

app = FastAPI()

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AuditRates(BaseModel):
    rates: dict

class AuditData(BaseModel):
    ratio: float
    status: str
    rates: dict

@app.post("/api/audit")
async def run_audit(data: AuditData):
    try:
        # The prompt as requested by the user
        prompt = f"""
You are a Senior AI Ethics Auditor at a global bank. 
I am providing you with the following audit results from a credit scoring model:

- Fairness Score (Impact Ratio): {data.ratio:.2f}
- Current Status: {data.status}
- Approval Rates by Group: {data.rates}

Task: 
1. Explain in simple terms if this bank is being 'fair' according to the 80% rule.
2. Identify the specific group (e.g., Single Females) being most disadvantaged.
3. Suggest one technical fix (like re-weighting) and one policy fix.

Keep the tone professional, urgent, and helpful.
"""
        
        # Initialize the model with system instruction
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction="You are a Senior AI Ethics Auditor at a global bank. Your tone is professional, urgent, and helpful."
        )
        
        response = model.generate_content(prompt)
        return {"report": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve static files from the React build
# In production, we serve the 'dist' directory
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if os.path.exists(os.path.join("dist", "index.html")):
        return FileResponse("dist/index.html")
    return {"error": "Frontend not built. Run 'npm run build' first."}

if __name__ == "__main__":
    import uvicorn
    # Port 8000 for internal communication, proxied by Vite on 3000
    uvicorn.run(app, host="0.0.0.0", port=8000)
