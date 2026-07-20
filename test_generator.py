import json
import requests
from pymongo import MongoClient

def run_test():
    client = MongoClient("mongodb://localhost:27017")
    db = client["lms_database"]
    
    print("--- 1. Available Lessons ---")
    lessons = list(db["lessons"].find({}, {"id": 1, "title": 1}))
    if not lessons:
        print("No lessons found in db!")
        return
    for l in lessons:
        print(f"ID: {l.get('id')}, Title: {l.get('title')}")
        
    target_lesson = lessons[0]
    lesson_id = target_lesson["id"]
    topic = target_lesson.get("title", "Python Intro")
    
    print(f"\n--- 2. Generating exercises for Lesson ID: {lesson_id}, Topic: '{topic}' ---")
    
    req_body = {
        "lesson_id": lesson_id,
        "topic": topic,
        "difficulty": "Beginner",
        "number_of_exercises": 3
    }
    
    response = requests.post("http://127.0.0.1:8000/admin/ai/generate-practice-exercises", json=req_body)
    print("Response Status Code:", response.status_code)
    try:
        res_data = response.json()
        print("Response JSON keys:", res_data.keys())
        print("Exercises count in response:", len(res_data.get("practice_exercises", [])))
    except Exception as e:
        print("Error parsing response:", e)
        print("Raw response:", response.text)
        return
        
    print("\n--- 3. Verifying MongoDB Collections ---")
    practice_exercises_docs = list(db["lesson_exercises"].find({"lesson_id": lesson_id}))
    print(f"Number of documents in 'lesson_exercises' for lesson_id {lesson_id}:", len(practice_exercises_docs))
    
    if practice_exercises_docs:
        doc = practice_exercises_docs[0]
        print("Sample Document keys:", list(doc.keys()))
        print("Checking for illegal keys ('options', 'choices', 'answer'):")
        illegal_keys = [k for k in ["options", "choices", "answer"] if k in doc]
        print("Illegal keys found:", illegal_keys)
        print("Metadata verification:")
        print("  - lesson_id:", doc.get("lesson_id"))
        print("  - topic:", doc.get("topic"))
        print("  - difficulty:", doc.get("difficulty"))
        print("  - type:", doc.get("type"))
        print("  - id (unique):", doc.get("id"))
        
    print("\n--- 4. Checking Lesson Document Updates ---")
    updated_lesson = db["lessons"].find_one({"id": lesson_id})
    if updated_lesson:
        stored_exercises = updated_lesson.get("practice_exercises", [])
        stored_questions = updated_lesson.get("practice_questions", [])
        print("Number of practice_exercises in lesson document:", len(stored_exercises))
        print("Number of practice_questions in lesson document:", len(stored_questions))
        if stored_exercises:
            print("First exercise keys in lesson document:", list(stored_exercises[0].keys()))
            illegal_keys_lesson = [k for k in ["options", "choices", "answer"] if k in stored_exercises[0]]
            print("Illegal keys in lesson stored exercise:", illegal_keys_lesson)
            
    print("\n--- 5. Checking Student GET exercises endpoint ---")
    get_res = requests.get(f"http://127.0.0.1:8000/lessons/{lesson_id}/exercises")
    print("GET exercises status code:", get_res.status_code)
    try:
        get_data = get_res.json()
        print("GET exercises count:", len(get_data))
        if get_data:
            print("First exercise keys from GET:", list(get_data[0].keys()))
    except Exception as e:
        print("Error parsing GET response:", e)

if __name__ == "__main__":
    run_test()
