from fastapi import APIRouter, HTTPException
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")

db = client["lms_database"]

users_collection = db["users"]


from datetime import datetime

@router.post("/signup")
def signup(user: dict):
    if not user.get("email"):
        raise HTTPException(status_code=400, detail="Email is required")
        
    existing_user = users_collection.find_one({"email": user["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered with this email")

    # Default to student role if not specified
    role = user.get("role", "student")
    user["role"] = role
    
    users_collection.insert_one(user)

    # Initialize default student progress if student
    if role == "student":
        db["user_progress"].update_one(
            {"username": user["email"]},
            {"$setOnInsert": {
                "username": user["email"],
                "xp": 0,
                "level": "Beginner",
                "progress": 0,
                "created_at": datetime.now().isoformat()
            }},
            upsert=True
        )
        db["progress"].update_one(
            {"username": user["email"]},
            {"$setOnInsert": {
                "username": user["email"],
                "xp": 0,
                "streak": 1,
                "completed_topics": [],
                "completed_lessons": [],
                "created_at": datetime.now().isoformat()
            }},
            upsert=True
        )

    return {
        "message": "User Registered Successfully",
        "role": role,
        "email": user["email"],
        "name": user.get("name", "")
    }


@router.post("/login")
def login(user: dict):
    print("Received:", user)

    existing_user = users_collection.find_one({
        "email": user["email"]
    })

    print("Found User:", existing_user)

    if existing_user and existing_user.get("password") == user.get("password"):
        role = existing_user.get("role", "student")
        return {
            "message": "Login Successful",
            "role": role,
            "email": existing_user["email"],
            "name": existing_user.get("name", existing_user["email"].split("@")[0])
        }

    return {"message": "Invalid Email or Password"}






@router.post("/save-level")
def save_level(data: dict):

    users_collection.update_one(
        {"email": data["email"]},
        {"$set": {"level": data["level"]}}
    )

    return {"message": "Level Saved Successfully"}