 
from fastapi import APIRouter, HTTPException
import os
from pymongo import MongoClient
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from services.ai_service import (
    generate_lesson, generate_mcqs, generate_coding_challenges,
    generate_practice_exercises, generate_interview_bank_questions,
    generate_assignments, generate_projects, generate_revision_material,
    # backward-compatible aliases kept for any remaining callers
    generate_python_lesson, generate_python_mcqs,
    generate_python_coding_challenges, generate_python_practice_exercises,
)
from services.openai_lesson_generator import generate_complete_lesson



class LessonGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    course_id: str = "python-core"


class MCQGenerationRequest(BaseModel):
    topic: str
    count: int = 5
    difficulty: str = "Beginner"
    course_id: str = "python-core"


class AIMCQGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    number_of_questions: int = 5
    lesson_id: Optional[str] = None
    course_id: str = "python-core"


class AICodingChallengeGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    number_of_challenges: int = 3
    lesson_id: Optional[str] = None
    course_id: str = "python-core"


class AIPracticeExerciseGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    number_of_exercises: int = 5
    lesson_id: Optional[str] = None
    course_id: str = "python-core"


class AIInterviewQuestionsGenerationRequest(BaseModel):
    category: str = "Beginner"
    number_of_questions: int = 5
    course_id: str = "python-core"


class AIAssignmentGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    number_of_assignments: int = 3
    lesson_id: Optional[str] = None
    course_id: str = "python-core"


class AIProjectGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    number_of_projects: int = 2
    lesson_id: Optional[str] = None
    course_id: str = "python-core"


class AIRevisionMaterialRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    lesson_id: Optional[str] = None
    course_id: str = "python-core"


class ChallengeGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    course_id: str = "python-core"


router = APIRouter(prefix="/admin")

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]

# Collections
users_collection = db["users"]
lessons_collection = db["lessons"]
exercises_collection = db["lesson_exercises"]
practice_exercises_collection = db["lesson_exercises"]
mcqs_collection = db["mcqs"]
mcq_results_collection = db["mcq_results"]
coding_challenges_collection = db["coding_challenges"]
coding_results_collection = db["coding_results"]
progress_collection = db["progress"]
user_progress_collection = db["user_lessons_progress"]
interview_questions_collection = db["interview_questions"]
courses_collection = db["courses"]
assignments_collection = db["assignments"]
projects_collection = db["projects"]
revision_material_collection = db["revision_material"]
content_drafts_collection = db["content_drafts"]


def get_course_technology(course_id: str) -> str:
    """
    Resolve the technology string for a given course_id.
    Never silently falls back to Python if another course is provided.
    """
    if not course_id or course_id == "python-core":
        return "Python"
    course = courses_collection.find_one({"id": course_id}, {"technology": 1, "name": 1})
    if course:
        return course.get("technology") or course.get("name") or course_id
    return course_id



# ─────────────────────────────────────────────
# STATS
# ─────────────────────────────────────────────

@router.get("/stats")
def get_admin_stats():
    total_students = users_collection.count_documents({"role": "student"})
    total_lessons = lessons_collection.count_documents({})

    pipeline = [
        {"$project": {
            "mcq_count": {"$size": {"$ifNull": ["$mcq_quiz", []]}},
            "coding_count": {"$size": {"$ifNull": ["$coding_challenges", []]}}
        }},
        {"$group": {
            "_id": None,
            "total_mcqs": {"$sum": "$mcq_count"},
            "total_coding": {"$sum": "$coding_count"}
        }}
    ]
    lesson_stats = list(lessons_collection.aggregate(pipeline))
    stats_data = lesson_stats[0] if lesson_stats else {"total_mcqs": 0, "total_coding": 0}

    total_exercises = exercises_collection.count_documents({})

    all_progress = list(progress_collection.find({}, {"progress": 1}))
    avg_progress = (
        sum(p.get("progress", 0) for p in all_progress) / len(all_progress)
        if all_progress else 0
    )

    return {
        "students": total_students,
        "lessons": total_lessons,
        "mcqs": stats_data.get("total_mcqs", 0),
        "coding_challenges": stats_data.get("total_coding", 0),
        "exercises": total_exercises,
        "average_progress": round(avg_progress, 1)
    }

@router.get("/coding-practice/analytics")
def get_admin_coding_analytics():
    total_attempts = coding_results_collection.count_documents({})
    passed_attempts = coding_results_collection.count_documents({"status": "Passed"})
    failed_attempts = coding_results_collection.count_documents({"status": "Failed"})
    
    pass_rate = 0.0
    if total_attempts > 0:
        pass_rate = round((passed_attempts / total_attempts) * 100, 2)
        
    avg_execution_time = 0.0
    pipeline_time = [
        {"$group": {"_id": None, "avg_time": {"$avg": "$execution_time"}}}
    ]
    res_time = list(coding_results_collection.aggregate(pipeline_time))
    if res_time and res_time[0]["avg_time"] is not None:
        avg_execution_time = round(res_time[0]["avg_time"], 4)
        
    total_xp_earned = 0
    pipeline_xp = [
        {"$group": {"_id": None, "total_xp": {"$sum": "$xp_earned"}}}
    ]
    res_xp = list(coding_results_collection.aggregate(pipeline_xp))
    if res_xp and res_xp[0]["total_xp"] is not None:
        total_xp_earned = int(res_xp[0]["total_xp"])
        
    return {
        "total_attempts": total_attempts,
        "pass_rate": pass_rate,
        "failed_attempts": failed_attempts,
        "avg_execution_time": avg_execution_time,
        "xp_earned": total_xp_earned
    }



# ─────────────────────────────────────────────
# STUDENTS
# ─────────────────────────────────────────────

@router.get("/students")
def list_students():
    students = list(users_collection.find({"role": "student"}, {"_id": 0, "password": 0}))
    for student in students:
        prog = progress_collection.find_one({"username": student["email"]})
        student["progress"] = prog.get("progress", 0) if prog else 0
        student["xp"] = prog.get("xp", 0) if prog else 0
        completed = prog.get("completed_topics", []) if prog else []
        student["completed_lessons"] = len(completed)
        # Fetch latest MCQ result
        latest_mcq = mcq_results_collection.find_one(
            {"username": student["email"]},
            {"_id": 0, "score": 1, "total": 1},
            sort=[("_id", -1)]
        )
        student["last_quiz_score"] = latest_mcq if latest_mcq else None
    return students


@router.get("/submissions/{username}")
def get_student_submissions(username: str):
    mcq_results = list(mcq_results_collection.find({"username": username}, {"_id": 0}))
    coding_results = list(coding_results_collection.find({"username": username}, {"_id": 0}))
    return {
        "mcq": mcq_results,
        "coding": coding_results
    }


# ─────────────────────────────────────────────
# LESSON CRUD
# ─────────────────────────────────────────────

@router.get("/lessons")
def list_all_lessons(course_id: str = None):
    """Flat list of all lessons for admin panel — optionally filtered by course_id."""
    query = {}
    if course_id:
        query["course_id"] = course_id
    lessons = list(lessons_collection.find(query, {"_id": 0}))
    return lessons


@router.post("/lessons")
def add_lesson(lesson: dict):
    if lessons_collection.find_one({"id": lesson.get("id")}):
        raise HTTPException(status_code=400, detail="Lesson ID already exists")
    lesson["created_at"] = datetime.now().isoformat()
    lessons_collection.insert_one(lesson)
    return {"message": "Lesson created successfully"}


@router.put("/lessons/{lesson_id}")
def update_lesson(lesson_id: str, lesson: dict):
    if "_id" in lesson:
        del lesson["_id"]
        
    lesson["updated_at"] = datetime.now().isoformat()
    result = lessons_collection.update_one({"id": lesson_id}, {"$set": lesson})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    # Synchronize database collections (mcqs, coding_challenges, lesson_exercises)
    if "mcq_quiz" in lesson:
        mcqs_collection.delete_many({"lesson_id": lesson_id})
        formatted_mcqs = []
        for m in lesson["mcq_quiz"]:
            formatted_mcqs.append({
                "question": m.get("question") or "",
                "options": m.get("options") or [],
                "answer": m.get("answer") or "",
                "explanation": m.get("explanation") or "",
                "lesson_id": lesson_id,
                "topic": lesson.get("title") or "Python Programming",
                "difficulty": lesson.get("difficulty") or "Beginner",
                "created_at": datetime.now().isoformat()
            })
        if formatted_mcqs:
            mcqs_collection.insert_many(formatted_mcqs)
            
    if "coding_challenges" in lesson:
        coding_challenges_collection.delete_many({"lesson_id": lesson_id})
        formatted_ch = []
        import uuid
        for c in lesson["coding_challenges"]:
            formatted_ch.append({
                "id": c.get("id") or f"ch_{uuid.uuid4().hex[:8]}",
                "lesson_id": lesson_id,
                "topic": lesson.get("title") or "Python Programming",
                "difficulty": lesson.get("difficulty") or "Beginner",
                "title": c.get("title") or "Coding Challenge",
                "problem": c.get("problem") or c.get("problem_statement") or "",
                "starter_code": c.get("starter_code") or "",
                "expected_output": c.get("expected_output") or "",
                "sample_input": c.get("sample_input") or "",
                "sample_output": c.get("sample_output") or "",
                "hints": c.get("hints") or [],
                "solution": c.get("solution") or "",
                "explanation": c.get("explanation") or "",
                "created_at": datetime.now().isoformat()
            })
        if formatted_ch:
            coding_challenges_collection.insert_many(formatted_ch)
            
    if "practice_exercises" in lesson:
        exercises_collection.delete_many({"lesson_id": lesson_id})
        formatted_ex = []
        import uuid
        for ex in lesson["practice_exercises"]:
            formatted_ex.append({
                "id": ex.get("id") or f"ex_{uuid.uuid4().hex[:8]}",
                "lesson_id": lesson_id,
                "topic": lesson.get("title") or "Python Programming",
                "difficulty": lesson.get("difficulty") or "Beginner",
                "title": ex.get("title") or "Practice Exercise",
                "type": ex.get("type") or "Short Answer",
                "question": ex.get("question") or "",
                "code": ex.get("code") or "",
                "expected_answer": ex.get("expected_answer") or "",
                "hint": ex.get("hint") or "",
                "explanation": ex.get("explanation") or "",
                "created_at": datetime.now().isoformat()
            })
        if formatted_ex:
            exercises_collection.insert_many(formatted_ex)
            
    return {"message": "Lesson updated successfully"}


@router.post("/lessons/{lesson_id}/enhance")
def enhance_lesson(lesson_id: str):
    import uuid
    # Check if lesson exists
    existing_lesson = lessons_collection.find_one({"id": lesson_id})
    if not existing_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    topic = existing_lesson.get("title") or "Python Programming"
    difficulty = existing_lesson.get("difficulty") or "Beginner"
    
    # Generate content using OpenAI
    try:
        data = generate_complete_lesson(lesson_id, topic, difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate lesson content: {str(e)}")
        
    # Clear existing entities for this lesson_id across collections
    mcqs_collection.delete_many({"lesson_id": lesson_id})
    coding_challenges_collection.delete_many({"lesson_id": lesson_id})
    exercises_collection.delete_many({"lesson_id": lesson_id})
    
    # Format and save MCQs block
    formatted_mcqs = []
    for m in data.get("mcqs", []):
        formatted_mcqs.append({
            "question": str(m["question"]),
            "options": list(m["options"]),
            "answer": str(m["answer"]),
            "explanation": str(m["explanation"]),
            "lesson_id": lesson_id,
            "topic": topic,
            "difficulty": difficulty,
            "created_at": datetime.now().isoformat()
        })
    if formatted_mcqs:
        mcqs_collection.insert_many(formatted_mcqs)
        
    # Format and save Practice Questions
    formatted_exercises = []
    for i, q in enumerate(data.get("practice_questions", [])):
        formatted_exercises.append({
            "id": f"ex_{uuid.uuid4().hex[:8]}",
            "lesson_id": lesson_id,
            "topic": topic,
            "difficulty": difficulty,
            "title": f"Practice Question {i+1}",
            "type": "Short Answer",
            "question": str(q["question"]),
            "code": "",
            "expected_answer": str(q["solution"]),
            "hint": "",
            "explanation": "",
            "created_at": datetime.now().isoformat()
        })
    if formatted_exercises:
        exercises_collection.insert_many(formatted_exercises)
        
    # Format and save Coding Challenges
    formatted_challenges = []
    for c in data.get("coding_challenges", []):
        formatted_challenges.append({
            "id": f"ch_{uuid.uuid4().hex[:8]}",
            "lesson_id": lesson_id,
            "topic": topic,
            "difficulty": difficulty,
            "title": str(c["title"]),
            "problem": str(c["problem_statement"]),
            "starter_code": str(c["starter_code"]),
            "expected_output": str(c["expected_output"]),
            "sample_input": str(c.get("sample_input") or ""),
            "sample_output": str(c.get("sample_output") or ""),
            "hints": list(c.get("hints") or []),
            "solution": str(c["solution"]),
            "explanation": str(c["explanation"]),
            "created_at": datetime.now().isoformat()
        })
    if formatted_challenges:
        coding_challenges_collection.insert_many(formatted_challenges)
        
    # Compile updated parent lesson document
    updated_fields = {
        "title": data.get("title") or topic,
        "description": data.get("description") or "",
        "theory": data.get("theory") or "",
        "xp_reward": data.get("xp_reward") or 100,
        "difficulty": difficulty,
        "code_examples": data.get("code_examples") or [],
        "real_world_examples": data.get("real_world_examples") or [],
        "common_mistakes": data.get("common_mistakes") or [],
        "best_practices": data.get("best_practices") or [],
        "summary": data.get("summary") or "",
        "mcq_quiz": [
            {
                "question": m["question"],
                "options": m["options"],
                "answer": m["answer"],
                "explanation": m["explanation"]
            }
            for m in formatted_mcqs
        ],
        "practice_exercises": [
            {
                "id": ex["id"],
                "lesson_id": ex["lesson_id"],
                "topic": ex["topic"],
                "difficulty": ex["difficulty"],
                "title": ex["title"],
                "type": ex["type"],
                "question": ex["question"],
                "code": ex["code"],
                "expected_answer": ex["expected_answer"],
                "hint": ex["hint"],
                "explanation": ex["explanation"],
                "created_at": ex["created_at"]
            }
            for ex in formatted_exercises
        ],
        "practice_questions": [ex["question"] for ex in formatted_exercises],
        "coding_challenges": [
            {
                "id": ch["id"],
                "title": ch["title"],
                "problem": ch["problem"],
                "starter_code": ch["starter_code"],
                "expected_output": ch["expected_output"],
                "sample_input": ch["sample_input"],
                "sample_output": ch["sample_output"],
                "hints": ch["hints"],
                "solution": ch["solution"],
                "explanation": ch["explanation"]
            }
            for ch in formatted_challenges
        ],
        "updated_at": datetime.now().isoformat()
    }
    
    # Merge/Update the lesson in MongoDB
    lessons_collection.update_one({"id": lesson_id}, {"$set": updated_fields})
    
    # Fetch clean final lesson document for serialization
    final_doc = lessons_collection.find_one({"id": lesson_id}, {"_id": 0})
    return final_doc



@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: str):
    lessons_collection.delete_one({"id": lesson_id})
    exercises_collection.delete_many({"lesson_id": lesson_id})
    return {"message": "Lesson and associated exercises deleted"}


# ─────────────────────────────────────────────
# EXERCISE CRUD
# ─────────────────────────────────────────────

@router.get("/exercises")
def list_exercises(course_id: str = None, lesson_id: str = None):
    query = {}
    if course_id:
        query["course_id"] = course_id
    if lesson_id:
        query["lesson_id"] = lesson_id
    return list(exercises_collection.find(query, {"_id": 0}))



@router.post("/exercises")
def add_exercise(exercise: dict):
    exercise["created_at"] = datetime.now().isoformat()
    exercises_collection.insert_one(exercise)
    return {"message": "Exercise added"}


@router.put("/exercises/{exercise_id}")
def update_exercise(exercise_id: str, exercise: dict):
    """Update an existing exercise by its id field."""
    result = exercises_collection.update_one({"id": exercise_id}, {"$set": exercise})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return {"message": "Exercise updated"}


@router.delete("/exercises/{exercise_id}")
def delete_exercise_by_id(exercise_id: str):
    """Delete an exercise by its id field only."""
    result = exercises_collection.delete_one({"id": exercise_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return {"message": "Exercise deleted"}


# ─────────────────────────────────────────────
# BULK IMPORT
# ─────────────────────────────────────────────

@router.post("/bulk-import")
def bulk_import(data: dict):
    try:
        count = 0
        if "lessons" in data:
            lessons_collection.insert_many(data["lessons"])
            count += len(data["lessons"])
        if "exercises" in data:
            exercises_collection.insert_many(data["exercises"])
            count += len(data["exercises"])
        return {"message": f"Successfully imported {count} items"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─────────────────────────────────────────────
# ANALYTICS
# ─────────────────────────────────────────────

@router.get("/analytics/performance")
def get_performance_stats():
    """Quiz scores per lesson (joins lesson title)."""
    pipeline = [
        {"$group": {
            "_id": "$lesson_id",
            "avg_score": {"$avg": "$score"},
            "total_attempts": {"$sum": 1},
            "max_score": {"$max": "$score"}
        }},
        {"$sort": {"total_attempts": -1}},
        {"$limit": 10}
    ]
    quiz_stats = list(mcq_results_collection.aggregate(pipeline))

    # Join lesson titles
    for stat in quiz_stats:
        if stat["_id"]:
            lesson = lessons_collection.find_one({"id": stat["_id"]}, {"title": 1})
            stat["lesson_title"] = lesson["title"] if lesson else stat["_id"]
        else:
            stat["lesson_title"] = "General Assessment"
        stat["avg_score"] = round(stat.get("avg_score") or 0, 2)

    return quiz_stats


@router.get("/analytics/lesson-completion")
def get_lesson_completion():
    """Per-lesson completion count across all students."""
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {
            "_id": "$lesson_id",
            "completed": {"$sum": 1}
        }},
        {"$sort": {"completed": -1}},
        {"$limit": 10}
    ]
    raw = list(user_progress_collection.aggregate(pipeline))

    result = []
    for item in raw:
        lesson = lessons_collection.find_one({"id": item["_id"]}, {"title": 1, "category_title": 1})
        result.append({
            "name": lesson["title"] if lesson else item["_id"],
            "category": lesson.get("category_title", "") if lesson else "",
            "completed": item["completed"]
        })
    return result


@router.get("/analytics/student-performance")
def get_student_performance():
    """Per-student XP, progress, completed count — top 10 by XP."""
    students = list(users_collection.find({"role": "student"}, {"_id": 0, "email": 1, "name": 1}))
    result = []
    for student in students:
        prog = progress_collection.find_one({"username": student["email"]})
        xp = prog.get("xp", 0) if prog else 0
        progress = prog.get("progress", 0) if prog else 0
        completed = len(prog.get("completed_topics", [])) if prog else 0
        result.append({
            "name": student.get("name") or student["email"].split("@")[0],
            "email": student["email"],
            "xp": xp,
            "progress": progress,
            "completed_lessons": completed
        })

    result.sort(key=lambda x: x["xp"], reverse=True)
    return result[:10]


@router.get("/analytics/quiz-accuracy")
def get_quiz_accuracy():
    """Per-lesson quiz accuracy — avg score as percentage."""
    pipeline = [
        {"$group": {
            "_id": "$lesson_id",
            "avg_score": {"$avg": "$score"},
            "avg_total": {"$avg": "$total"},
            "attempts": {"$sum": 1}
        }},
        {"$sort": {"attempts": -1}},
        {"$limit": 8}
    ]
    raw = list(mcq_results_collection.aggregate(pipeline))

    result = []
    for item in raw:
        if item["_id"]:
            lesson = lessons_collection.find_one({"id": item["_id"]}, {"title": 1})
            name = lesson["title"] if lesson else item["_id"]
        else:
            name = "General Assessment"
            
        avg_score = item.get("avg_score") or 0
        avg_total = item.get("avg_total") or 1
        accuracy = round((avg_score / avg_total) * 100, 1) if avg_total > 0 else 0
        result.append({
            "name": name,
            "accuracy": accuracy,
            "attempts": item["attempts"]
        })
    return result

import traceback

def create_production_ready_lesson(lesson: dict, topic: str, difficulty: str, course_id: str = "python-core") -> dict:
    import re
    import uuid
    from datetime import datetime

    diff = difficulty.capitalize() if difficulty else "Beginner"

    # Generate clean URL slug for id
    topic_slug = re.sub(r'[^a-zA-Z0-9]', '_', topic.lower()).strip('_')
    if not topic_slug and lesson.get("title"):
        topic_slug = re.sub(r'[^a-zA-Z0-9]', '_', lesson.get("title", "").lower()).strip('_')

    lesson_id = f"gen_{topic_slug}"
    # Ensure uniqueness
    if lessons_collection.find_one({"id": lesson_id}):
        lesson_id = f"gen_{topic_slug}_{uuid.uuid4().hex[:4]}"

    # Resolve technology from course for description fallback
    technology = get_course_technology(course_id)

    clean_lesson = {
        "id": lesson_id,
        "course_id": course_id,
        "title": lesson.get("title") or topic,
        "description": lesson.get("description") or f"Learn the concepts of {topic} in {technology}.",
        "category_id": lesson.get("category_id") or "generated",
        "category_title": lesson.get("category_title") or "AI Generated Lessons",
        "theory": lesson.get("theory") or "",
        "code_examples": lesson.get("code_examples") or [],
        "common_mistakes": lesson.get("common_mistakes") or [],
        "real_world_use_cases": lesson.get("real_world_use_cases") or [],
        "difficulty": diff,
        "xp_reward": int(lesson.get("xp_reward")) if lesson.get("xp_reward") is not None else 50,
        "created_at": datetime.now().isoformat(),
        "generated_by": "AI"
    }

    # 1. Processing MCQs
    ai_mcqs = lesson.get("mcqs") or lesson.get("mcq_quiz") or []
    formatted_mcqs = []
    db_insert_mcqs = []
    for m in ai_mcqs:
        if not isinstance(m, dict):
            continue
        q_text = m.get("question") or m.get("text") or ""
        opts = m.get("options") or m.get("choices") or []
        ans = m.get("answer") or m.get("correct_answer") or m.get("correct") or ""
        expl = m.get("explanation") or m.get("rationale") or f"Correct answer is {ans}"

        if not isinstance(opts, list):
            opts = [opts] if opts else []
        if len(opts) < 4:
            opts = list(opts) + [""] * (4 - len(opts))
        opts = [str(o) for o in opts[:4]]

        mcq_item = {
            "question": str(q_text),
            "options": opts,
            "answer": str(ans),
            "explanation": str(expl)
        }
        formatted_mcqs.append(mcq_item)

        db_insert_mcqs.append({
            **mcq_item,
            "lesson_id": lesson_id,
            "course_id": course_id,
            "topic": clean_lesson["title"],
            "difficulty": diff,
            "created_at": datetime.now().isoformat()
        })

    clean_lesson["mcq_quiz"] = formatted_mcqs
    if db_insert_mcqs:
        mcqs_collection.insert_many(db_insert_mcqs)

    # 2. Processing Practice Exercises
    ai_exercises = lesson.get("practice_exercises") or []
    formatted_exercises = []
    db_insert_exercises = []
    question_strings = []
    for ex in ai_exercises:
        if not isinstance(ex, dict):
            continue
        title = ex.get("title") or "Practice Exercise"
        e_type = ex.get("type") or "Output Prediction"
        question = ex.get("question") or ""
        code_block = ex.get("code") or ex.get("code_block") or ""
        expected_answer = ex.get("expected_answer") or ex.get("answer") or ""
        hint = ex.get("hint") or ""
        explanation = ex.get("explanation") or f"Expected: {expected_answer}"

        ex_id = f"ex_{uuid.uuid4().hex[:8]}"

        ex_item = {
            "id": ex_id,
            "lesson_id": lesson_id,
            "course_id": course_id,
            "topic": clean_lesson["title"],
            "difficulty": diff,
            "title": str(title),
            "type": str(e_type),
            "question": str(question),
            "code": str(code_block),
            "expected_answer": str(expected_answer),
            "hint": str(hint),
            "explanation": str(explanation),
            "created_at": datetime.now().isoformat()
        }
        formatted_exercises.append(ex_item)
        db_insert_exercises.append(ex_item.copy())
        question_strings.append(str(question))

    clean_lesson["practice_exercises"] = formatted_exercises
    clean_lesson["practice_questions"] = question_strings
    if db_insert_exercises:
        exercises_collection.insert_many(db_insert_exercises)

    # 3. Processing Coding Challenges
    # Determine language/runtime from course technology
    lang_map = {
        "Python": ("python", "python3"),
        "JavaScript": ("javascript", "nodejs"),
        "Java": ("java", "java"),
        "C++": ("cpp", "cpp"),
        "SQL": ("sql", "sql"),
    }
    language, runtime = lang_map.get(technology, (technology.lower(), technology.lower()))

    ai_challenges = lesson.get("coding_challenges") or []
    formatted_challenges = []
    db_insert_challenges = []
    for c in ai_challenges:
        if not isinstance(c, dict):
            continue
        title = c.get("title") or "Coding Challenge"
        problem = c.get("problem") or c.get("task") or c.get("description") or ""
        starter_code = c.get("starter_code") or c.get("initial_code") or c.get("code") or ""
        expected_output = c.get("expected_output") or c.get("output") or ""
        sample_input = c.get("sample_input") or c.get("input") or ""
        sample_output = c.get("sample_output") or ""
        hints = c.get("hints") or []
        if not isinstance(hints, list):
            hints = [hints] if hints else []
        hints = [str(h) for h in hints]
        solution = c.get("solution") or ""
        explanation = c.get("explanation") or ""

        c_id = f"ch_{uuid.uuid4().hex[:8]}"

        challenge_item = {
            "id": c_id,
            "lesson_id": lesson_id,
            "course_id": course_id,
            "language": language,
            "runtime": runtime,
            "topic": clean_lesson["title"],
            "difficulty": diff,
            "title": str(title),
            "problem": str(problem),
            "starter_code": str(starter_code),
            "expected_output": str(expected_output),
            "sample_input": str(sample_input),
            "sample_output": str(sample_output),
            "hints": hints,
            "solution": str(solution),
            "explanation": str(explanation),
            "created_at": datetime.now().isoformat()
        }
        formatted_challenges.append(challenge_item)
        db_insert_challenges.append(challenge_item.copy())

    clean_lesson["coding_challenges"] = formatted_challenges
    if db_insert_challenges:
        coding_challenges_collection.insert_many(db_insert_challenges)

    # Insert main lesson document
    lessons_collection.insert_one(clean_lesson)

    if "_id" in clean_lesson:
        clean_lesson["_id"] = str(clean_lesson["_id"])

    return clean_lesson


@router.post("/generate-lesson")
def generate_lesson_endpoint(request: LessonGenerationRequest):
    try:
        technology = get_course_technology(request.course_id)
        lesson = generate_lesson(
            technology=technology,
            topic=request.topic,
            difficulty=request.difficulty
        )
        clean_lesson = create_production_ready_lesson(
            lesson=lesson,
            topic=request.topic,
            difficulty=request.difficulty,
            course_id=request.course_id
        )
        return {
            "message": "Lesson Generated Successfully",
            "lesson_title": clean_lesson.get("title", request.topic)
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/generate-lesson")
def ai_generate_lesson(request: LessonGenerationRequest):
    try:
        diff = request.difficulty.capitalize() if request.difficulty else "Beginner"
        technology = get_course_technology(request.course_id)

        lesson = generate_lesson(
            technology=technology,
            topic=request.topic,
            difficulty=diff
        )
        clean_lesson = create_production_ready_lesson(
            lesson=lesson,
            topic=request.topic,
            difficulty=diff,
            course_id=request.course_id
        )
        return clean_lesson
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/ai/generate-mcq")
def ai_generate_mcq(request: AIMCQGenerationRequest):
    try:
        diff = request.difficulty.capitalize() if request.difficulty else "Beginner"
        technology = get_course_technology(request.course_id)

        mcqs = generate_mcqs(
            technology=technology,
            topic=request.topic,
            count=request.number_of_questions,
            difficulty=diff
        )

        if not isinstance(mcqs, list):
            mcqs = [mcqs]

        formatted_mcqs = []
        for m in mcqs:
            q_text = m.get("question") or m.get("text") or ""
            opts = m.get("options") or m.get("choices") or []
            ans = m.get("answer") or m.get("correct_answer") or m.get("correct") or ""
            expl = m.get("explanation") or m.get("rationale") or ""

            if not isinstance(opts, list):
                opts = [opts] if opts else []
            if len(opts) < 4:
                opts = list(opts) + [""] * (4 - len(opts))
            opts = [str(o) for o in opts[:4]]

            formatted_mcq = {
                "question": str(q_text),
                "options": opts,
                "answer": str(ans),
                "explanation": str(expl),
                "lesson_id": request.lesson_id,
                "topic": request.topic,
                "difficulty": diff,
                "course_id": request.course_id,
                "created_at": datetime.now().isoformat()
            }
            formatted_mcqs.append(formatted_mcq)

        if not formatted_mcqs:
            raise HTTPException(status_code=500, detail="Failed to generate any valid MCQs")

        db_insert_list = [dict(m) for m in formatted_mcqs]
        mcqs_collection.insert_many(db_insert_list)

        if request.lesson_id:
            lessons_collection.update_one(
                {"id": request.lesson_id},
                {"$push": {
                    "mcq_quiz": {
                        "$each": [
                            {
                                "question": m["question"],
                                "options": m["options"],
                                "answer": m["answer"],
                                "explanation": m["explanation"]
                            }
                            for m in formatted_mcqs
                        ]
                    }
                }}
            )

        return {
            "message": "MCQs Generated Successfully",
            "total": len(formatted_mcqs),
            "mcqs": formatted_mcqs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/generate-coding-challenges")
def ai_generate_coding_challenges(request: AICodingChallengeGenerationRequest):
    try:
        req_topic = request.topic
        if req_topic == "string":
            req_topic = "Functions"

        req_lesson_id = request.lesson_id
        if req_lesson_id == "string":
            req_lesson_id = ""

        req_diff = request.difficulty
        if req_diff == "string":
            req_diff = "Beginner"

        diff = req_diff.capitalize() if req_diff else "Beginner"
        technology = get_course_technology(request.course_id)

        # Determine language/runtime from technology
        lang_map = {
            "Python": ("python", "python3"),
            "JavaScript": ("javascript", "nodejs"),
            "Java": ("java", "java"),
            "C++": ("cpp", "cpp"),
            "SQL": ("sql", "sql"),
        }
        language, runtime = lang_map.get(technology, (technology.lower(), technology.lower()))

        challenges = generate_coding_challenges(
            technology=technology,
            topic=req_topic,
            difficulty=diff,
            count=request.number_of_challenges
        )

        if not isinstance(challenges, list):
            challenges = [challenges]

        formatted_challenges = []
        import uuid
        for c in challenges:
            title = c.get("title") or c.get("name") or "Coding Challenge"
            problem = c.get("problem") or c.get("task") or c.get("description") or ""
            starter_code = c.get("starter_code") or c.get("initial_code") or c.get("code") or ""
            expected_output = c.get("expected_output") or c.get("output") or ""
            sample_input = c.get("sample_input") or c.get("input") or ""
            sample_output = c.get("sample_output") or ""
            hints = c.get("hints") or []
            if not isinstance(hints, list):
                hints = [hints] if hints else []
            hints = [str(h) for h in hints]
            solution = c.get("solution") or ""
            explanation = c.get("explanation") or ""

            c_id = f"ch_{uuid.uuid4().hex[:8]}"

            formatted_challenge = {
                "id": c_id,
                "lesson_id": req_lesson_id or "",
                "course_id": request.course_id,
                "topic": req_topic,
                "difficulty": diff,
                "language": language,
                "runtime": runtime,
                "title": str(title),
                "problem": str(problem),
                "starter_code": str(starter_code),
                "expected_output": str(expected_output),
                "sample_input": str(sample_input),
                "sample_output": str(sample_output),
                "hints": hints,
                "solution": str(solution),
                "explanation": str(explanation),
                "created_at": datetime.now().isoformat()
            }
            formatted_challenges.append(formatted_challenge)

        if not formatted_challenges:
            raise HTTPException(status_code=500, detail="Failed to generate any valid coding challenges")

        db_insert_list = [dict(c) for c in formatted_challenges]
        coding_challenges_collection.insert_many(db_insert_list)

        if req_lesson_id:
            db_push_list = [
                {
                    "id": c["id"],
                    "title": c["title"],
                    "problem": c["problem"],
                    "starter_code": c["starter_code"],
                    "expected_output": c["expected_output"],
                    "sample_input": c["sample_input"],
                    "sample_output": c["sample_output"],
                    "hints": c["hints"],
                    "solution": c["solution"],
                    "explanation": c["explanation"],
                    "language": c["language"],
                    "runtime": c["runtime"]
                }
                for c in formatted_challenges
            ]
            lessons_collection.update_one(
                {"id": req_lesson_id},
                {"$push": {"coding_challenges": {"$each": db_push_list}}}
            )

        return {
            "message": "Coding Challenges Generated Successfully",
            "total": len(formatted_challenges),
            "coding_challenges": formatted_challenges
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/generate-practice-exercises")
def ai_generate_practice_exercises(request: AIPracticeExerciseGenerationRequest):
    try:
        req_lesson_id = request.lesson_id
        if req_lesson_id == "string":
            req_lesson_id = ""

        req_topic = request.topic
        req_diff = request.difficulty

        # Lookup lesson in database to resolve actual topic and difficulty if placeholder or blank
        if req_lesson_id and req_lesson_id.strip():
            lesson_doc = lessons_collection.find_one({"id": req_lesson_id})
            if lesson_doc:
                if not req_topic or req_topic == "string":
                    req_topic = lesson_doc.get("title") or request.topic
                if not req_diff or req_diff == "string":
                    req_diff = lesson_doc.get("difficulty") or "Beginner"

        if not req_topic or req_topic == "string":
            req_topic = "Programming Fundamentals"

        if not req_diff or req_diff == "string":
            req_diff = "Beginner"

        diff = req_diff.capitalize() if req_diff else "Beginner"
        technology = get_course_technology(request.course_id)

        exercises = generate_practice_exercises(
            technology=technology,
            topic=req_topic,
            difficulty=diff,
            count=request.number_of_exercises
        )

        if not isinstance(exercises, list):
            exercises = [exercises]

        import uuid
        formatted_exercises = []
        for e in exercises:
            title = e.get("title") or e.get("name") or "Practice Exercise"
            e_type = e.get("type") or "Output Prediction"
            question = e.get("question") or ""
            code_block = e.get("code") or e.get("code_block") or ""
            expected_answer = e.get("expected_answer") or e.get("answer") or ""
            hint = e.get("hint") or ""
            explanation = e.get("explanation") or ""

            ex_id = f"ex_{uuid.uuid4().hex[:8]}"

            formatted_exercise = {
                "id": ex_id,
                "lesson_id": req_lesson_id or "",
                "course_id": request.course_id,
                "topic": req_topic,
                "difficulty": diff,
                "title": str(title),
                "type": str(e_type),
                "question": str(question),
                "code": str(code_block),
                "expected_answer": str(expected_answer),
                "hint": str(hint),
                "explanation": str(explanation),
                "created_at": datetime.now().isoformat()
            }
            formatted_exercises.append(formatted_exercise)

        if not formatted_exercises:
            raise HTTPException(status_code=500, detail="Failed to generate any valid practice exercises")

        if req_lesson_id and req_lesson_id.strip():
            exercises_collection.delete_many({"lesson_id": req_lesson_id})

        db_insert_list = [dict(ex) for ex in formatted_exercises]
        exercises_collection.insert_many(db_insert_list)

        if req_lesson_id:
            db_push_list = [
                {
                    "id": ex["id"],
                    "lesson_id": ex["lesson_id"],
                    "course_id": ex["course_id"],
                    "topic": ex["topic"],
                    "difficulty": ex["difficulty"],
                    "title": ex["title"],
                    "type": ex["type"],
                    "question": ex["question"],
                    "code": ex["code"],
                    "expected_answer": ex["expected_answer"],
                    "hint": ex["hint"],
                    "explanation": ex["explanation"],
                    "created_at": ex["created_at"]
                }
                for ex in formatted_exercises
            ]
            q_strings = [ex["question"] for ex in formatted_exercises]

            lessons_collection.update_one(
                {"id": req_lesson_id},
                {
                    "$set": {
                        "practice_exercises": db_push_list,
                        "practice_questions": q_strings
                    }
                }
            )

        return {
            "message": "Practice Exercises Generated Successfully",
            "total": len(formatted_exercises),
            "practice_exercises": formatted_exercises
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# ─────────────────────────────────────────────
# INTERVIEW QUESTIONS CRUD
# ─────────────────────────────────────────────

@router.get("/interview-questions")
def get_admin_interview_questions(course_id: str = None, category: str = None):
    """Get all interview questions for admin dashboard, optionally filtered by course_id."""
    query = {}
    if course_id:
        if course_id == "python-core":
            query["$or"] = [{"course_id": "python-core"}, {"course_id": {"$exists": False}}, {"course_id": None}]
        else:
            query["course_id"] = course_id
    if category:
        query["category"] = category
    return list(interview_questions_collection.find(query, {"_id": 0}))


@router.post("/interview-questions")
def add_admin_interview_question(question_data: dict):
    if interview_questions_collection.find_one({"id": question_data.get("id")}):
        raise HTTPException(status_code=400, detail="Question ID already exists")
    
    question_data["created_at"] = datetime.now().isoformat()
    interview_questions_collection.insert_one(question_data)
    return {"message": "Interview question added successfully"}

@router.put("/interview-questions/{question_id}")
def update_admin_interview_question(question_id: str, question_data: dict):
    result = interview_questions_collection.update_one(
        {"id": question_id}, 
        {"$set": question_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Interview question not found")
    return {"message": "Interview question updated successfully"}

@router.delete("/interview-questions/{question_id}")
def delete_admin_interview_question(question_id: str):
    result = interview_questions_collection.delete_one({"id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Interview question not found")
    return {"message": "Interview question deleted successfully"}


@router.post("/ai/generate-interview-questions")
def ai_generate_interview_questions(request: AIInterviewQuestionsGenerationRequest):
    try:
        import uuid
        technology = get_course_technology(request.course_id)
        category = request.category
        count = request.number_of_questions

        generated_list = generate_interview_bank_questions(
            technology=technology,
            category=category,
            count=count
        )

        if not isinstance(generated_list, list):
            generated_list = [generated_list]

        formatted_list = []
        for item in generated_list:
            q_text = item.get("question") or ""
            ideal = item.get("ideal_answer") or ""
            kws = item.get("keywords") or []
            pts = item.get("points") or []

            if not isinstance(kws, list):
                kws = [kws] if kws else []
            if not isinstance(pts, list):
                pts = [pts] if pts else []

            formatted = {
                "id": f"int_{uuid.uuid4().hex[:8]}",
                "category": category,
                "course_id": request.course_id,
                "question": str(q_text),
                "ideal_answer": str(ideal),
                "keywords": [str(k) for k in kws],
                "points": [str(p) for p in pts],
                "created_at": datetime.now().isoformat()
            }
            formatted_list.append(formatted)

        if not formatted_list:
            raise HTTPException(status_code=500, detail="Failed to generate any interview questions")

        interview_questions_collection.insert_many([dict(f) for f in formatted_list])

        return {
            "message": "Interview Questions Generated Successfully",
            "total": len(formatted_list),
            "questions": formatted_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# ASSIGNMENTS CRUD + AI GENERATION
# ─────────────────────────────────────────────

@router.get("/assignments")
def list_assignments(course_id: str = None):
    query = {}
    if course_id:
        query["course_id"] = course_id
    return list(assignments_collection.find(query, {"_id": 0}))


@router.post("/assignments")
def add_assignment(assignment: dict):
    assignment["created_at"] = datetime.now().isoformat()
    assignments_collection.insert_one(assignment)
    return {"message": "Assignment added"}


@router.put("/assignments/{assignment_id}")
def update_assignment(assignment_id: str, assignment: dict):
    result = assignments_collection.update_one({"id": assignment_id}, {"$set": assignment})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": "Assignment updated"}


@router.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: str):
    result = assignments_collection.delete_one({"id": assignment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": "Assignment deleted"}


@router.post("/ai/generate-assignments")
def ai_generate_assignments(request: AIAssignmentGenerationRequest):
    try:
        import uuid
        technology = get_course_technology(request.course_id)
        diff = request.difficulty.capitalize() if request.difficulty else "Beginner"

        assignments = generate_assignments(
            technology=technology,
            topic=request.topic,
            difficulty=diff,
            count=request.number_of_assignments
        )

        if not isinstance(assignments, list):
            assignments = [assignments]

        formatted = []
        for a in assignments:
            a_id = f"asgn_{uuid.uuid4().hex[:8]}"
            formatted.append({
                "id": a_id,
                "course_id": request.course_id,
                "lesson_id": request.lesson_id or "",
                "topic": request.topic,
                "difficulty": diff,
                "title": a.get("title") or "Assignment",
                "description": a.get("description") or "",
                "objectives": a.get("objectives") or [],
                "tasks": a.get("tasks") or [],
                "deliverables": a.get("deliverables") or [],
                "estimated_time": a.get("estimated_time") or "",
                "hints": a.get("hints") or [],
                "evaluation_criteria": a.get("evaluation_criteria") or [],
                "status": "draft",
                "created_at": datetime.now().isoformat()
            })

        if not formatted:
            raise HTTPException(status_code=500, detail="Failed to generate assignments")

        assignments_collection.insert_many([dict(a) for a in formatted])
        return {"message": "Assignments Generated", "total": len(formatted), "assignments": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# PROJECTS CRUD + AI GENERATION
# ─────────────────────────────────────────────

@router.get("/projects")
def list_projects(course_id: str = None):
    query = {}
    if course_id:
        query["course_id"] = course_id
    return list(projects_collection.find(query, {"_id": 0}))


@router.post("/projects")
def add_project(project: dict):
    project["created_at"] = datetime.now().isoformat()
    projects_collection.insert_one(project)
    return {"message": "Project added"}


@router.put("/projects/{project_id}")
def update_project(project_id: str, project: dict):
    result = projects_collection.update_one({"id": project_id}, {"$set": project})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project updated"}


@router.delete("/projects/{project_id}")
def delete_project(project_id: str):
    result = projects_collection.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}


@router.post("/ai/generate-projects")
def ai_generate_projects(request: AIProjectGenerationRequest):
    try:
        import uuid
        technology = get_course_technology(request.course_id)
        diff = request.difficulty.capitalize() if request.difficulty else "Beginner"

        projects_list = generate_projects(
            technology=technology,
            topic=request.topic,
            difficulty=diff,
            count=request.number_of_projects
        )

        if not isinstance(projects_list, list):
            projects_list = [projects_list]

        formatted = []
        for p in projects_list:
            p_id = f"proj_{uuid.uuid4().hex[:8]}"
            formatted.append({
                "id": p_id,
                "course_id": request.course_id,
                "lesson_id": request.lesson_id or "",
                "topic": request.topic,
                "difficulty": diff,
                "title": p.get("title") or "Project",
                "description": p.get("description") or "",
                "features": p.get("features") or [],
                "tech_stack": p.get("tech_stack") or [technology],
                "estimated_time": p.get("estimated_time") or "",
                "learning_outcomes": p.get("learning_outcomes") or [],
                "steps": p.get("steps") or [],
                "extension_ideas": p.get("extension_ideas") or [],
                "status": "draft",
                "created_at": datetime.now().isoformat()
            })

        if not formatted:
            raise HTTPException(status_code=500, detail="Failed to generate projects")

        projects_collection.insert_many([dict(p) for p in formatted])
        return {"message": "Projects Generated", "total": len(formatted), "projects": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# REVISION MATERIAL CRUD + AI GENERATION
# ─────────────────────────────────────────────

@router.get("/revision-material")
def list_revision_material(course_id: str = None):
    query = {}
    if course_id:
        query["course_id"] = course_id
    return list(revision_material_collection.find(query, {"_id": 0}))


@router.post("/ai/generate-revision-material")
def ai_generate_revision_material(request: AIRevisionMaterialRequest):
    try:
        import uuid
        technology = get_course_technology(request.course_id)
        diff = request.difficulty.capitalize() if request.difficulty else "Beginner"

        material = generate_revision_material(
            technology=technology,
            topic=request.topic,
            difficulty=diff
        )

        m_id = f"rev_{uuid.uuid4().hex[:8]}"
        doc = {
            "id": m_id,
            "course_id": request.course_id,
            "lesson_id": request.lesson_id or "",
            "topic": request.topic,
            "difficulty": diff,
            "title": material.get("title") or f"Revision: {request.topic}",
            "summary": material.get("summary") or "",
            "key_concepts": material.get("key_concepts") or [],
            "quick_reference": material.get("quick_reference") or [],
            "common_pitfalls": material.get("common_pitfalls") or [],
            "practice_questions": material.get("practice_questions") or [],
            "cheat_sheet": material.get("cheat_sheet") or "",
            "status": "draft",
            "created_at": datetime.now().isoformat()
        }
        revision_material_collection.insert_one(doc)
        doc.pop("_id", None)
        return {"message": "Revision Material Generated", "material": doc}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# DRAFT CONTENT APPROVAL SYSTEM
# ─────────────────────────────────────────────

@router.get("/drafts")
def list_drafts(course_id: str = None, content_type: str = None):
    """List all draft content. Optionally filter by course_id or content_type."""
    query = {"status": "draft"}
    if course_id:
        query["course_id"] = course_id
    if content_type:
        query["content_type"] = content_type
    return list(content_drafts_collection.find(query, {"_id": 0}))


@router.post("/drafts/{draft_id}/approve")
def approve_draft(draft_id: str):
    """Mark a draft as approved (not yet published to students)."""
    result = content_drafts_collection.update_one(
        {"id": draft_id},
        {"$set": {"status": "approved", "approved_at": datetime.now().isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {"message": "Draft approved"}


@router.post("/drafts/{draft_id}/publish")
def publish_draft(draft_id: str):
    """
    Publish a draft — copies the content to the appropriate collection
    and marks it as published and visible to students.
    """
    draft = content_drafts_collection.find_one({"id": draft_id})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    content_type = draft.get("content_type")
    content = draft.get("content", {})
    content["status"] = "published"
    content["published_at"] = datetime.now().isoformat()

    # Route to the correct collection
    collection_map = {
        "lesson": lessons_collection,
        "mcq": mcqs_collection,
        "challenge": coding_challenges_collection,
        "exercise": exercises_collection,
        "assignment": assignments_collection,
        "project": projects_collection,
        "revision": revision_material_collection,
        "interview_question": interview_questions_collection,
    }

    target_collection = collection_map.get(content_type)
    if target_collection:
        content.pop("_id", None)
        target_collection.insert_one(content)

    # Mark draft as published
    content_drafts_collection.update_one(
        {"id": draft_id},
        {"$set": {"status": "published", "published_at": datetime.now().isoformat()}}
    )

    return {"message": f"Draft published to {content_type} collection"}


@router.put("/drafts/{draft_id}")
def update_draft(draft_id: str, updates: dict):
    """Edit a draft before approving/publishing."""
    updates.pop("_id", None)
    updates["updated_at"] = datetime.now().isoformat()
    result = content_drafts_collection.update_one({"id": draft_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {"message": "Draft updated"}


@router.delete("/drafts/{draft_id}")
def delete_draft(draft_id: str):
    """Discard a draft."""
    result = content_drafts_collection.delete_one({"id": draft_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {"message": "Draft discarded"}