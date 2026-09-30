"""
courses.py — Course Management Router
Handles CRUD for courses (student-facing + admin-facing).
"""

from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
courses_collection = db["courses"]


# ─────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────

class CourseCreate(BaseModel):
    name: str
    technology: str
    category: Optional[str] = "Programming"
    level: Optional[str] = "Beginner"
    description: Optional[str] = ""
    target_audience: Optional[str] = ""
    status: Optional[str] = "published"


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    technology: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    status: Optional[str] = None  # "published" | "draft" | "archived"


# ─────────────────────────────────────────────
# STUDENT-FACING: Published/Active courses
# ─────────────────────────────────────────────

@router.get("/courses")
def get_published_courses():
    """Return all active courses for student course selector (excluding archived)."""
    courses = list(courses_collection.find(
        {"status": {"$ne": "archived"}},
        {"_id": 0}
    ))
    return courses


@router.get("/courses/{course_id}")
def get_course(course_id: str):
    """Get a single course by id."""
    course = courses_collection.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# ─────────────────────────────────────────────
# ADMIN-FACING: All courses (including drafts/archived)
# ─────────────────────────────────────────────

@router.get("/admin/courses")
def get_all_courses():
    """Return all courses (any status) for admin panel."""
    courses = list(courses_collection.find({}, {"_id": 0}))
    return courses


@router.post("/admin/courses")
def create_course(course: CourseCreate):
    """Admin: Create a new course."""
    import re
    import uuid

    # Generate a URL-safe id from the name
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", course.name.lower()).strip("-")
    course_id = slug
    # Ensure uniqueness
    if courses_collection.find_one({"id": course_id}):
        course_id = f"{slug}-{uuid.uuid4().hex[:4]}"

    doc = {
        "id": course_id,
        "name": course.name,
        "technology": course.technology,
        "category": course.category or "Programming",
        "level": course.level or "Beginner",
        "description": course.description or "",
        "target_audience": course.target_audience or "",
        "status": course.status or "published",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    courses_collection.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Course created successfully", "course": doc}


@router.put("/admin/courses/{course_id}")
def update_course(course_id: str, updates: CourseUpdate):
    """Admin: Update a course (edit fields, publish, or archive)."""
    existing = courses_collection.find_one({"id": course_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.now().isoformat()
    courses_collection.update_one({"id": course_id}, {"$set": update_data})
    updated = courses_collection.find_one({"id": course_id}, {"_id": 0})
    return {"message": "Course updated", "course": updated}


@router.delete("/admin/courses/{course_id}")
def delete_course(course_id: str):
    """Admin: Delete a course (does not delete course content)."""
    if course_id == "python-core":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the default Python Core course."
        )
    result = courses_collection.delete_one({"id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted"}
