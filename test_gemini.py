import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

backend_dir = Path(__file__).resolve().parent / "backend"
load_dotenv(backend_dir / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
print("API KEY:", API_KEY)
genai.configure(api_key=API_KEY)

for model_name in ["gemini-1.5-flash", "gemini-2.5-flash"]:
    print(f"Testing model: {model_name}")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Write a 1-word response: OK.")
        print(f"Success with {model_name}: {response.text.strip()}")
    except Exception as e:
        print(f"Error with {model_name}: {e}")
