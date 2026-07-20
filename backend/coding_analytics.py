from fastapi import APIRouter
from pymongo import MongoClient

print("CODING ANALYTICS LOADED")

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")

db = client["lms_database"]

coding_results_collection = db["coding_results"]


@router.get("/coding-analytics")
def get_coding_analytics():

    total_attempts = coding_results_collection.count_documents({})

    correct_answers = coding_results_collection.count_documents(
        {"$or": [{"result": "Correct"}, {"status": "Passed"}]}
    )

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