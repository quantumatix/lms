from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")

db = client["lms_database"]

progress_collection = db["progress"]
coding_results_collection = db["coding_results"]


@router.get("/adaptive-recommendations/{username}")
def adaptive_recommendations(username: str):

    student = progress_collection.find_one({
        "username": username
    })

    if not student:
        return {
            "recommendations": ["Complete assessment first"]
        }

    level = student.get("level", "Beginner")

    total = coding_results_collection.count_documents({})
    correct = coding_results_collection.count_documents(
        {"result": "Correct"}
    )

    accuracy = 0

    if total > 0:
        accuracy = (correct / total) * 100

    recommendations = []

    if level == "Beginner":

        recommendations.extend([
            "Learn Variables",
            "Learn Data Types",
            "Practice Loops"
        ])

    elif level == "Intermediate":

        recommendations.extend([
            "Learn Functions",
            "Learn OOP",
            "Practice Problem Solving"
        ])

    else:

        recommendations.extend([
            "Build FastAPI Projects",
            "MongoDB Integration",
            "AI Projects"
        ])

    if accuracy < 70:

        recommendations.append(
            "Practice More Coding Questions"
        )

    return {
        "level": level,
        "coding_accuracy": accuracy,
        "recommendations": recommendations
    }