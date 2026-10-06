"""
Migration: Add course_id to all existing content collections.
Run once: python migrate_add_course_id.py

Safe and idempotent — running twice does nothing extra.
"""
import os
from pymongo import MongoClient
from datetime import datetime

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]

PYTHON_COURSE_ID = "python-core"

PYTHON_COURSE_DOC = {
    "id": "python-core",
    "name": "Python Core",
    "technology": "Python",
    "category": "Programming",
    "level": "Beginner",
    "description": (
        "A complete Python programming course covering fundamentals, "
        "data structures, OOP, file handling, and interview preparation."
    ),
    "target_audience": "Beginners and intermediate learners",
    "status": "published",
    "created_at": datetime.now().isoformat(),
    "updated_at": datetime.now().isoformat(),
}

COLLECTIONS_TO_MIGRATE = [
    "lessons",
    "mcqs",
    "coding_challenges",
    "lesson_exercises",
    "interview_questions",
    "mock_interviews",
    "interview_results",
    "interview_answers",
    "mcq_results",
    "coding_results",
    "user_lessons_progress",
]


def ensure_python_course():
    courses = db["courses"]
    existing = courses.find_one({"id": PYTHON_COURSE_ID})
    if existing:
        print(f"[SKIP] Course '{PYTHON_COURSE_ID}' already exists in courses collection.")
        return
    courses.insert_one(PYTHON_COURSE_DOC)
    print(f"[OK]   Created course: {PYTHON_COURSE_DOC['name']}")


def stamp_collection(collection_name: str):
    coll = db[collection_name]
    # Only update documents that don't already have course_id
    result = coll.update_many(
        {"course_id": {"$exists": False}},
        {"$set": {"course_id": PYTHON_COURSE_ID}}
    )
    print(f"[OK]   {collection_name}: stamped {result.modified_count} documents.")


def main():
    print("=" * 55)
    print("PyLearn Multi-Course Migration")
    print("=" * 55)

    print("\n[1/2] Creating Python Core course document...")
    ensure_python_course()

    print("\n[2/2] Stamping existing content with course_id=python-core...")
    for coll_name in COLLECTIONS_TO_MIGRATE:
        try:
            stamp_collection(coll_name)
        except Exception as e:
            print(f"[WARN] {coll_name}: {e}")

    print("\n" + "=" * 55)
    print("Migration complete.")
    print("All existing content is now tagged with course_id='python-core'.")
    print("=" * 55)


if __name__ == "__main__":
    main()
