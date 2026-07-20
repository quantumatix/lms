from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
progress_collection = db["progress"]

# Save Progress
from datetime import datetime, timedelta

@router.post("/save-progress")
def save_progress(data: dict):

    username = data["username"]

    existing_user = progress_collection.find_one(
        {"username": username}
    )

    today = datetime.now().date()

    streak = 1

    if existing_user:

        last_activity = existing_user.get("last_activity")

        streak = existing_user.get("streak", 1)

        if last_activity:

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

    data["streak"] = streak
    data["last_activity"] = str(today)

    progress_collection.update_one(
        {"username": username},
        {"$set": data},
        upsert=True
    )

    return {
        "message": "Progress Saved Successfully",
        "streak": streak
    }

# Get Progress
@router.get("/progress/{username}")
def get_progress(username: str):
    user = progress_collection.find_one(
        {"username": username},
        {"_id": 0}
    )

    if user:
        return user

    return {"message": "No progress found"}