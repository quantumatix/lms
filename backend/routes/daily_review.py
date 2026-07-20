from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mistakes_collection = db["mcq_mistakes"]

@router.get("/daily-review/{username}")
def daily_review(username: str):


 mistakes = list(
    mistakes_collection.find(
        {"username": username},
        {"_id": 0}
    ).limit(5)
)

 return mistakes

