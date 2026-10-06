from fastapi import APIRouter
import os
from pymongo import MongoClient

router = APIRouter()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]
progress_collection = db["progress"]

from datetime import datetime, timedelta

# Save Progress
@router.post("/save-progress")
def save_progress(data: dict):
    username = data["username"]
    course_id = data.get("course_id", "python-core")
    data["course_id"] = course_id

    existing_user = progress_collection.find_one(
        {"username": username, "course_id": course_id}
    )
    if not existing_user and course_id == "python-core":
        existing_user = progress_collection.find_one({"username": username})

    today = datetime.now().date()
    streak = 1

    if existing_user:
        last_activity = existing_user.get("last_activity")
        streak = existing_user.get("streak", 1)

        if last_activity:
            try:
                last_date = datetime.strptime(
                    last_activity,
                    "%Y-%m-%d"
                ).date()

                if today == last_date:
                    pass
                elif today == last_date + timedelta(days=1):
                    streak += 1
                else:
                    streak = 1
            except Exception:
                streak = 1

    data["streak"] = streak
    data["last_activity"] = str(today)

    progress_collection.update_one(
        {"username": username, "course_id": course_id},
        {"$set": data},
        upsert=True
    )

    return {
        "message": "Progress Saved Successfully",
        "streak": streak
    }

# Get Progress
@router.get("/progress/{username}")
def get_progress(username: str, course_id: str = None):
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id

    user = progress_collection.find_one(query, {"_id": 0})

    # Backward compatibility: legacy record without course_id maps to python-core
    if not user and (not course_id or course_id == "python-core"):
        user = progress_collection.find_one(
            {"username": username, "course_id": {"$exists": False}},
            {"_id": 0}
        )
        if user:
            progress_collection.update_one(
                {"username": username, "course_id": {"$exists": False}},
                {"$set": {"course_id": "python-core"}}
            )
            user["course_id"] = "python-core"

    cid = course_id or (user.get("course_id") if user else "python-core") or "python-core"
    total_lessons = db["lessons"].count_documents({"course_id": cid})
    completed_lessons = db["user_lessons_progress"].count_documents(
        {"username": username, "course_id": cid, "status": "completed"}
    )
    prog_pct = round((completed_lessons / total_lessons) * 100, 2) if total_lessons > 0 else 0

    if not user:
        return {
            "username": username,
            "course_id": cid,
            "progress": prog_pct,
            "xp": 0,
            "streak": 0,
            "level": "Beginner",
            "completed_topics": []
        }

    # Recalculate dynamic progress percentage for this course
    user["progress"] = prog_pct
    user["course_id"] = cid
    return user