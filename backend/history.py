from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
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