from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mcq_results_collection = db["mcq_results"]

@router.post("/save-mcq-score")
def save_mcq_score(data: dict):
    if "course_id" not in data:
        data["course_id"] = "python-core"
    mcq_results_collection.insert_one(data)

    return {
        "message": "MCQ Score Saved Successfully"
    }

@router.get("/mcq-results/{username}")
def get_mcq_results(username: str, course_id: str = None):
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id
    results = list(
        mcq_results_collection.find(
            query,
            {"_id": 0}
        )
    )

    return results