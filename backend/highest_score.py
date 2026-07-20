from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

@router.get("/highest-score/{username}")
def highest_score(username: str):

    results = list(
        db["mcq_results"].find(
            {"username": username},
            {"_id": 0}
        )
    )

    if not results:
        return {"highest_score": 0}

    highest = max(item["score"] for item in results)

    return {"highest_score": highest}