from fastapi import APIRouter, HTTPException
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")

db = client["lms_database"]

users_collection = db["users"]


@router.post("/signup")
def signup(user: dict):
    if not user.get("email"):
        raise HTTPException(status_code=400, detail="Email is required")
        
    existing_user = users_collection.find_one({"email": user["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered with this email")

    # Default to student role if not specified
    if "role" not in user:
        user["role"] = "student"
    
    users_collection.insert_one(user)

    return {"message": "User Registered Successfully"}


@router.post("/login")
def login(user: dict):
    print("Received:", user)

    existing_user = users_collection.find_one({
        "email": user["email"]
    })

    print("Found User:", existing_user)

    if existing_user and existing_user["password"] == user["password"]:
        return {
            "message": "Login Successful",
            "role": existing_user.get("role", "student"),
            "email": existing_user["email"]
        }

    return {"message": "Invalid Email or Password"}






@router.post("/save-level")
def save_level(data: dict):

    users_collection.update_one(
        {"email": data["email"]},
        {"$set": {"level": data["level"]}}
    )

    return {"message": "Level Saved Successfully"}