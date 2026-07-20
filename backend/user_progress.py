from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
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
def add_xp(username: str, xp: int):

    user = progress_collection.find_one(
        {"username": username}
    )

    if not user:
        return {"message": "User not found"}

    new_xp = user["xp"] + xp

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

    return {
        "xp": new_xp,
        "level": level,
        "progress": progress
    }