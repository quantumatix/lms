from fastapi import APIRouter
import os
from pymongo import MongoClient

router = APIRouter()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]

@router.get("/history/{username}")
def get_history(username: str, course_id: str = None):
    collection = db["mcq_results"]
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id

    data = list(
        collection.find(
            query,
            {"_id": 0}
        )
    )

    return data