from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

@router.get("/highest-score/{username}")
def highest_score(username: str, course_id: str = None):
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id

    results = list(
        db["mcq_results"].find(
            query,
            {"_id": 0}
        )
    )

    if not results:
        return {"highest_score": 0}

    highest = max(item.get("score", 0) for item in results)

    return {"highest_score": highest}