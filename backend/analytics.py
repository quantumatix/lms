from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

results_collection = db["mcq_results"]

@router.get("/analytics/{username}")
def get_analytics(username: str, course_id: str = None):
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id

    results = list(
        results_collection.find(
            query,
            {"_id": 0}
        )
    )

    total_tests = len(results)

    if total_tests == 0:
        return {
            "total_tests": 0,
            "average_score": 0
        }

    total_score = sum(r.get("score", 0) for r in results)

    average_score = total_score / total_tests

    return {
        "total_tests": total_tests,
        "average_score": round(average_score, 2)
    }