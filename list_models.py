import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

backend_dir = Path(__file__).resolve().parent / "backend"
load_dotenv(backend_dir / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

try:
    for m in genai.list_models():
        print(m.name, m.supported_generation_methods)
except Exception as e:
    print("Error listing models:", e)
