from fastapi import APIRouter
import os
from pymongo import MongoClient

router = APIRouter()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]

mistakes_collection = db["mcq_mistakes"]

@router.get("/daily-review/{username}")
def daily_review(username: str, course_id: str = None):
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id

    mistakes = list(
        mistakes_collection.find(
            query,
            {"_id": 0}
        ).limit(5)
    )

    return mistakes


