from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")

db = client["lms_database"]

coding_results_collection = db["coding_results"]


@router.post("/save-coding-result")
def save_coding_result(data: dict):

    coding_results_collection.insert_one(data)

    return {
        "message": "Coding Result Saved Successfully"
    }