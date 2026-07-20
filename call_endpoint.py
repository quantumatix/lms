import requests

req_body = {
    "lesson_id": "intro",
    "topic": "Introduction to Python",
    "difficulty": "Beginner",
    "number_of_exercises": 3
}

response = requests.post("http://127.0.0.1:8000/admin/ai/generate-practice-exercises", json=req_body)
print("Status Code:", response.status_code)
try:
    print("Response JSON:", response.json())
except Exception as e:
    print("Failed to parse JSON:", e)
    print("Raw text:", response.text)
