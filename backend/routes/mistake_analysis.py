from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mistakes_collection = db["mcq_mistakes"]

@router.post("/save-mistake")
def save_mistake(data: dict):
    if "course_id" not in data:
        data["course_id"] = "python-core"
    mistakes_collection.insert_one(data)

    return {
        "message": "Mistake Saved Successfully"
    }

@router.get("/mistakes/{username}")
def get_mistakes(username: str, course_id: str = None):
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id

    mistakes = list(
        mistakes_collection.find(
            query,
            {"_id": 0}
        )
    )

    return mistakes