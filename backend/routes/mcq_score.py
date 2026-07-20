from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mcq_results_collection = db["mcq_results"]

@router.post("/save-mcq-score")
def save_mcq_score(data: dict):
    mcq_results_collection.insert_one(data)

    return {
        "message": "MCQ Score Saved Successfully"
    }

@router.get("/mcq-results/{username}")
def get_mcq_results(username: str):
    results = list(
        mcq_results_collection.find(
            {"username": username},
            {"_id": 0}
        )
    )

    return results