from fastapi import APIRouter
import os
from pymongo import MongoClient

print("CODING ANALYTICS LOADED")

router = APIRouter()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))

db = client["lms_database"]

coding_results_collection = db["coding_results"]


@router.get("/coding-analytics")
def get_coding_analytics(course_id: str = None, username: str = None):
    query = {}
    if course_id:
        query["course_id"] = course_id
    if username:
        query["username"] = username

    total_attempts = coding_results_collection.count_documents(query)

    correct_query = {
        **query,
        "$or": [{"result": "Correct"}, {"status": "Passed"}]
    }
    correct_answers = coding_results_collection.count_documents(correct_query)

    accuracy = 0

    if total_attempts > 0:
        accuracy = round(
            (correct_answers / total_attempts) * 100,
            2
        )

    return {
        "total_attempts": total_attempts,
        "correct_answers": correct_answers,
        "accuracy": accuracy
    }