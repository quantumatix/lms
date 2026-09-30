from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

progress_collection = db["progress"]

@router.get("/leaderboard")
def get_leaderboard(course_id: str = None):
    query = {}
    if course_id:
        query["course_id"] = course_id

    students = list(
        progress_collection.find(
            query,
            {
                "_id": 0,
                "username": 1,
                "score": 1,
                "xp": 1,
                "level": 1,
                "course_id": 1
            }
        ).sort([("xp", -1), ("score", -1)])
    )

    for s in students:
        if "score" not in s or s["score"] is None:
            s["score"] = s.get("xp", 0)

    return students


