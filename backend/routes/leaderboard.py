from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

progress_collection = db["progress"]

@router.get("/leaderboard")
def get_leaderboard():


 students = list(
    progress_collection.find(
        {},
        {
            "_id": 0,
            "username": 1,
            "score": 1,
            "level": 1
        }
    ).sort("score", -1)
)

 return students

