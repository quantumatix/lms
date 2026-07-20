from fastapi import APIRouter, HTTPException
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
exercises_collection = db["lesson_exercises"]

@router.get("/lessons/{lesson_id}/exercises")
def get_lesson_exercises(lesson_id: str):
    exercises = list(exercises_collection.find({"lesson_id": lesson_id}, {"_id": 0}))
    return exercises

@router.post("/save-exercise-mistake")
def save_exercise_mistake(data: dict):
    # Log mistakes for later review
    db["exercise_mistakes"].insert_one(data)
    return {"message": "Mistake logged"}
