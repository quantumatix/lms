from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

mcq_results_collection = db["mcq_results"]

questions = [

{
    "id": 1,
    "question": "Which keyword is used to define a function?",
    "options": ["func", "function", "def", "define"],
    "answer": "def",
    "topic": "Functions"
}

]

@router.get("/mcq")
def get_questions():
    return questions

@router.post("/mcq-result")
def save_result(data: dict):

 mcq_results_collection.insert_one(data)

 return {
    "message": "MCQ Result Saved"
}