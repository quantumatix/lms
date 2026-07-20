from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mistakes_collection = db["mcq_mistakes"]

@router.post("/save-mistake")
def save_mistake(data: dict):

    mistakes_collection.insert_one(data)

    return {
        "message": "Mistake Saved Successfully"
    }

@router.get("/mistakes/{username}")
def get_mistakes(username: str):

    mistakes = list(
        mistakes_collection.find(
            {"username": username},
            {"_id": 0}
        )
    )

    return mistakes