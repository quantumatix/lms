from fastapi import APIRouter
import os
from pymongo import MongoClient

router = APIRouter()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]

results_collection = db["mcq_results"]

@router.post("/save-mcq-score")
def save_mcq_score(data: dict):

    results_collection.insert_one(data)

    return {"message": "MCQ Score Saved"}  