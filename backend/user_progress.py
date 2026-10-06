from fastapi import APIRouter
import os
from pymongo import MongoClient

router = APIRouter()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]

progress_collection = db["user_progress"]


@router.get("/progress/{username}")
def get_progress(username: str):

    user = progress_collection.find_one(
        {"username": username},
        {"_id": 0}
    )

    if not user:

        user = {
            "username": username,
            "xp": 0,
            "level": "Beginner",
            "progress": 0
        }

        progress_collection.insert_one(user)

    return user 
@router.get("/add-xp/{username}/{xp}")
def add_xp(username: str, xp: int, course_id: str = "python-core"):

    user = progress_collection.find_one(
        {"username": username}
    )

    if not user:
        user = {"username": username, "xp": 0, "level": "Beginner", "progress": 0}
        progress_collection.insert_one(user)

    new_xp = user.get("xp", 0) + xp

    if new_xp >= 200:
        level = "Advanced"
    elif new_xp >= 100:
        level = "Intermediate"
    else:
        level = "Beginner"

    progress = min(new_xp, 100)

    progress_collection.update_one(
        {"username": username},
        {
            "$set": {
                "xp": new_xp,
                "level": level,
                "progress": progress
            }
        }
    )

    # Also update db["progress"] for this specific course
    db["progress"].update_one(
        {"username": username, "course_id": course_id},
        {
            "$inc": {"xp": xp},
            "$set": {"course_id": course_id, "level": level}
        },
        upsert=True
    )

    return {
        "xp": new_xp,
        "level": level,
        "progress": progress,
        "course_id": course_id
    }