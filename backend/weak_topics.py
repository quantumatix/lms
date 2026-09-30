from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mistakes_collection = db["mcq_mistakes"]

@router.get("/weak-topics/{username}")
def weak_topics(username: str, course_id: str = None):
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id

    mistakes = list(
        mistakes_collection.find(
            query,
            {"_id": 0}
        )
    )

    topics = []
    course = db["courses"].find_one({"id": course_id}) if course_id else None
    tech = course.get("technology", "Core") if course else "Core"
    fallback_topic = f"{tech} Fundamentals"

    for item in mistakes:
        if item.get("topic"):
            topics.append(item["topic"])
            continue

        question = item.get("question", "").lower()

        if "loop" in question:
            topics.append("Loops")
        elif "function" in question or "method" in question:
            topics.append("Functions & Methods")
        elif "variable" in question or "datatype" in question or "type" in question:
            topics.append("Variables & Types")
        elif "class" in question or "object" in question or "oop" in question:
            topics.append("OOP Concepts")
        else:
            topics.append(fallback_topic)

    return {
        "weak_topics": list(set(topics)),
        "course_id": course_id or "python-core"
    }