"""
ai_service.py — Generic AI content generation dispatcher.

All functions accept a `technology` parameter (e.g. "Python", "Java",
"JavaScript") that is passed through to the underlying AI prompts.

Old names (generate_python_*) are kept as backward-compatible aliases.
"""

import os
import services.gemini_service as gemini
import services.openai_service as openai_svc
from pymongo import MongoClient

_mongo_client = MongoClient("mongodb://localhost:27017")
_db = _mongo_client["lms_database"]


def get_provider() -> str:
    return os.getenv("AI_PROVIDER", "openai").lower()


def _resolve_technology(course_id: str) -> str:
    """
    Look up a course by id and return its technology field.
    Falls back to 'Python' if the course cannot be found (backward compat).
    """
    if not course_id:
        return "Python"
    course = _db["courses"].find_one({"id": course_id}, {"technology": 1})
    return course["technology"] if course else "Python"


# ─────────────────────────────────────────────
# CORE GENERATION FUNCTIONS  (technology-aware)
# ─────────────────────────────────────────────

def generate_lesson(technology: str, topic: str, difficulty: str = "Beginner"):
    if get_provider() == "gemini":
        return gemini.generate_lesson(technology, topic, difficulty)
    return openai_svc.generate_lesson(technology, topic, difficulty)


def generate_mcqs(technology: str, topic: str, count: int = 5, difficulty: str = "Beginner"):
    if get_provider() == "gemini":
        return gemini.generate_mcqs(technology, topic, count, difficulty)
    return openai_svc.generate_mcqs(technology, topic, count, difficulty)


def generate_challenge(technology: str, topic: str, difficulty: str = "Beginner"):
    if get_provider() == "gemini":
        return gemini.generate_challenge(technology, topic, difficulty)
    return openai_svc.generate_challenge(technology, topic, difficulty)


def generate_coding_challenges(technology: str, topic: str, difficulty: str = "Beginner", count: int = 3):
    if get_provider() == "gemini":
        return gemini.generate_coding_challenges(technology, topic, difficulty, count)
    return openai_svc.generate_coding_challenges(technology, topic, difficulty, count)


def generate_practice_exercises(technology: str, topic: str, difficulty: str = "Beginner", count: int = 5):
    if get_provider() == "gemini":
        return gemini.generate_practice_exercises(technology, topic, difficulty, count)
    return openai_svc.generate_practice_exercises(technology, topic, difficulty, count)


def generate_interview_questions(username: str, difficulty: str, number_of_questions: int, profile: dict, technology: str = "Python"):
    if get_provider() == "gemini":
        return gemini.generate_interview_questions(username, difficulty, number_of_questions, profile, technology)
    return openai_svc.generate_interview_questions(username, difficulty, number_of_questions, profile, technology)


def evaluate_interview_session(qa_list: list, technology: str = "Python"):
    if get_provider() == "gemini":
        return gemini.evaluate_interview_session(qa_list, technology)
    return openai_svc.evaluate_interview_session(qa_list, technology)


def generate_assignments(technology: str, topic: str, difficulty: str = "Beginner", count: int = 3):
    if get_provider() == "gemini":
        return gemini.generate_assignments(technology, topic, difficulty, count)
    return openai_svc.generate_assignments(technology, topic, difficulty, count)


def generate_projects(technology: str, topic: str, difficulty: str = "Beginner", count: int = 2):
    if get_provider() == "gemini":
        return gemini.generate_projects(technology, topic, difficulty, count)
    return openai_svc.generate_projects(technology, topic, difficulty, count)


def generate_revision_material(technology: str, topic: str, difficulty: str = "Beginner"):
    if get_provider() == "gemini":
        return gemini.generate_revision_material(technology, topic, difficulty)
    return openai_svc.generate_revision_material(technology, topic, difficulty)


def generate_interview_bank_questions(technology: str, category: str, count: int = 5):
    if get_provider() == "gemini":
        return gemini.generate_interview_bank_questions(technology, category, count)
    return openai_svc.generate_interview_bank_questions(technology, category, count)


# ─────────────────────────────────────────────
# BACKWARD-COMPATIBLE ALIASES  (deprecated)
# These keep existing callers working unchanged.
# ─────────────────────────────────────────────

def generate_python_lesson(topic: str, difficulty: str = "Beginner"):
    return generate_lesson("Python", topic, difficulty)

def generate_python_mcqs(topic: str, count: int = 5, difficulty: str = "Beginner"):
    return generate_mcqs("Python", topic, count, difficulty)

def generate_python_challenge(topic: str, difficulty: str = "Beginner"):
    return generate_challenge("Python", topic, difficulty)

def generate_python_coding_challenges(topic: str, difficulty: str = "Beginner", count: int = 3):
    return generate_coding_challenges("Python", topic, difficulty, count)

def generate_python_practice_exercises(topic: str, difficulty: str = "Beginner", count: int = 5):
    return generate_practice_exercises("Python", topic, difficulty, count)
