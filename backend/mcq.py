from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mcq_results_collection = db["mcq_results"]
mcqs_collection = db["mcqs"]

@router.get("/mcq")
def get_questions(course_id: str = None, lesson_id: str = None, topic: str = None):
    """
    Return MCQs from the database.
    Filters by course_id (required for multi-course), and optionally by lesson_id or topic.
    Falls back to the full collection if no course_id is supplied (backward compat).
    """
    query = {}
    if course_id:
        query["course_id"] = course_id
    if lesson_id:
        query["lesson_id"] = lesson_id
    if topic:
        query["topic"] = topic

    questions = list(mcqs_collection.find(query, {"_id": 0}))
    return questions


@router.post("/mcq-result")
def save_result(data: dict):
    mcq_results_collection.insert_one(data)
    return {"message": "MCQ Result Saved"}