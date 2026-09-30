from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

@router.get("/score-history/{username}")
def get_score_history(username: str, course_id: str = None):
    query = {"username": username}
    if course_id:
        query["course_id"] = course_id

    results = list(
        db["mcq_results"].find(
            query,
            {"_id": 0}
        )
    )

    chart_data = []

    for index, result in enumerate(results, start=1):
        chart_data.append({
            "test": f"Test {index}",
            "score": result.get("score", 0)
        })

    return chart_data