from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

@router.get("/history/{username}")
def get_history(username: str):

    collection = db["mcq_results"]

    data = list(
        collection.find(
            {"username": username},
            {"_id": 0}
        )
    )

    return data