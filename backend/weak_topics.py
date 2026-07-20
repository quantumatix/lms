from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mistakes_collection = db["mcq_mistakes"]

@router.get("/weak-topics/{username}")
def weak_topics(username: str):

    mistakes = list(
        mistakes_collection.find(
            {"username": username},
            {"_id": 0}
        )
    )

    topics = []

    for item in mistakes:

        question = item["question"].lower()

        if "loop" in question:
            topics.append("Loops")

        elif "function" in question:
            topics.append("Functions")

        elif "variable" in question:
            topics.append("Variables")

        else:
            topics.append("Python Basics")

    return {
        "weak_topics": list(set(topics))
    }