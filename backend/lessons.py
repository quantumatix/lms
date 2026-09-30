from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from datetime import datetime

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
lessons_collection = db["lessons"]
user_progress_collection = db["user_lessons_progress"]
overall_progress_collection = db["progress"]

# Course Curriculum Data (Seeding)
CATEGORIES = [
    {
        "id": "fundamentals",
        "title": "Python Fundamentals",
        "lessons": [
            {"id": "intro", "title": "Introduction to Python"},
            {"id": "vars", "title": "Variables"},
            {"id": "types", "title": "Data Types"},
            {"id": "operators", "title": "Operators"},
            {"id": "io", "title": "Input/Output"}
        ]
    },
    {
        "id": "control_flow",
        "title": "Control Flow",
        "lessons": [
            {"id": "ifelse", "title": "If Else"},
            {"id": "loops", "title": "Loops"},
            {"id": "nested_loops", "title": "Nested Loops"}
        ]
    },
    {
        "id": "functions",
        "title": "Functions",
        "lessons": [
            {"id": "func_basics", "title": "Function Basics"},
            {"id": "args", "title": "Arguments"},
            {"id": "return", "title": "Return Values"},
            {"id": "lambda", "title": "Lambda Functions"}
        ]
    },
    {
        "id": "data_structures",
        "title": "Data Structures",
        "lessons": [
            {"id": "lists", "title": "Lists"},
            {"id": "tuples", "title": "Tuples"},
            {"id": "sets", "title": "Sets"},
            {"id": "dicts", "title": "Dictionaries"}
        ]
    },
    {
        "id": "oop",
        "title": "Object Oriented Programming",
        "lessons": [
            {"id": "classes", "title": "Classes"},
            {"id": "objects", "title": "Objects"},
            {"id": "inheritance", "title": "Inheritance"},
            {"id": "poly", "title": "Polymorphism"}
        ]
    },
    {
        "id": "advanced",
        "title": "Advanced Python",
        "lessons": [
            {"id": "file_handling", "title": "File Handling"},
            {"id": "exceptions", "title": "Exception Handling"},
            {"id": "modules", "title": "Modules"},
            {"id": "apis", "title": "APIs"}
        ]
    }
]

@router.get("/lessons/seed")
def seed_lessons():
    # Only seed if collection is empty
    if lessons_collection.count_documents({}) == 0:
        lessons_data = []
        for cat in CATEGORIES:
            for lesson in cat["lessons"]:
                lessons_data.append({
                    "id": lesson["id"],
                    "title": lesson["title"],
                    "category_id": cat["id"],
                    "category_title": cat["title"],
                    "description": f"Learn the concepts of {lesson['title']} in Python.",
                    "theory": f"### {lesson['title']}\n\nThis lesson covers the fundamental concepts of {lesson['title']}. Python is a high-level, interpreted language known for its readability.",
                    "code_examples": [
                        {
                            "title": "Basic Example",
                            "code": f"# Example of {lesson['title']}\nprint('Hello ' + '{lesson['title']}')"
                        }
                    ],
                    "key_concepts": ["Concept 1", "Concept 2", "Best Practices"],
                    "xp_reward": 50
                })
        lessons_collection.insert_many(lessons_data)
        return {"message": "Lessons seeded successfully"}
    return {"message": "Lessons already seeded"}

@router.get("/lessons")
def get_lessons(username: str = None, course_id: str = None):
    query = {}
    if course_id:
        query["course_id"] = course_id

    lessons = list(lessons_collection.find(query, {"_id": 0}))
    completed_ids = []
    if username:
        user_p = list(user_progress_collection.find({"username": username}, {"_id": 0}))
        completed_ids = [p["lesson_id"] for p in user_p if p.get("status") == "completed"]


    # Group by category (Module)
    grouped = {}
    for lesson in lessons:
        cat_id = lesson.get("category_id")
        if not cat_id:
            cat_id = "generated"
            lesson["category_id"] = "generated"
            lesson["category_title"] = "AI Generated Lessons"

        if cat_id not in grouped:
            grouped[cat_id] = {
                "id": cat_id,
                "title": lesson.get("category_title") or "Other Lessons",
                "lessons": []
            }

        lesson_id = lesson.get("id")
        if not lesson_id:
            import re
            title_slug = re.sub(r'[^a-zA-Z0-9]', '_', lesson.get("title", "").lower())
            lesson_id = f"gen_{title_slug}"
            lesson["id"] = lesson_id

        lesson_summary = {
            "id": lesson_id,
            "title": lesson.get("title") or "Untitled Lesson",
            "description": lesson.get("description", ""),
            "difficulty": lesson.get("difficulty", "Beginner"),
            "xp_reward": lesson.get("xp_reward", 50),
            "completed": lesson_id in completed_ids
        }
        grouped[cat_id]["lessons"].append(lesson_summary)

    return list(grouped.values())


@router.get("/lessons/{lesson_id}")
def get_lesson_detail(lesson_id: str, username: str = None, course_id: str = None):
    query = {"id": lesson_id}
    if course_id:
        if course_id == "python-core":
            query = {"id": lesson_id, "$or": [{"course_id": "python-core"}, {"course_id": {"$exists": False}}]}
        else:
            query = {"id": lesson_id, "course_id": course_id}

    lesson = lessons_collection.find_one(query, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found for this course")
    
    user_p_query = {"username": username, "lesson_id": lesson_id}
    if course_id:
        user_p_query["course_id"] = course_id
    user_p = user_progress_collection.find_one(user_p_query, {"_id": 0})
    lesson["completed"] = user_p.get("status") == "completed" if user_p else False
    
    mcq_quiz = lesson.get("mcq_quiz")
    if not mcq_quiz:
        mcq_query = {"lesson_id": lesson_id}
        if course_id:
            mcq_query["course_id"] = course_id
        mcq_quiz = list(db["mcqs"].find(mcq_query, {"_id": 0}))
        
    if not mcq_quiz:
        from services.ai_service import generate_mcqs
        try:
            diff = lesson.get("difficulty", "Beginner").capitalize()
            effective_course_id = course_id or lesson.get("course_id") or "python-core"
            c_doc = db["courses"].find_one({"id": effective_course_id})
            tech = (c_doc.get("technology") if c_doc else None) or (c_doc.get("title") if c_doc else None) or "Python"
            
            generated_mcqs = generate_mcqs(technology=tech, topic=lesson["title"], count=5, difficulty=diff)
            if generated_mcqs:
                if not isinstance(generated_mcqs, list):
                    generated_mcqs = [generated_mcqs]
                
                formatted_mcqs = []
                db_insert_list = []
                for m in generated_mcqs:
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
                        "explanation": str(expl)
                    }
                    formatted_mcqs.append(formatted_mcq)
                    
                    db_insert_list.append({
                        "question": str(q_text),
                        "options": opts,
                        "answer": str(ans),
                        "explanation": str(expl),
                        "lesson_id": lesson_id,
                        "course_id": effective_course_id,
                        "topic": lesson["title"],
                        "difficulty": diff,
                        "created_at": datetime.now().isoformat()
                    })
                
                # Push back to the lesson document under mcq_quiz
                lessons_collection.update_one(
                    {"id": lesson_id},
                    {"$set": {"mcq_quiz": formatted_mcqs}}
                )
                
                # Also save to the mcqs collection (with lesson_id and course_id)
                db["mcqs"].insert_many(db_insert_list)
                
                mcq_quiz = formatted_mcqs
        except Exception as e:
            print(f"Error auto-generating MCQs for {lesson_id}: {e}")
            mcq_quiz = []
            
    # Include all fields explicitly
    return {
        "id": lesson["id"],
        "title": lesson["title"],
        "description": lesson.get("description", ""),
        "theory": lesson.get("theory", ""),
        "code_examples": lesson.get("code_examples", []),
        "practice_questions": lesson.get("practice_questions", []),
        "practice_exercises": lesson.get("practice_exercises", []),
        "mcq_quiz": mcq_quiz or [],
        "common_mistakes": lesson.get("common_mistakes", []),
        "real_world_use_cases": lesson.get("real_world_use_cases", []),
        "coding_challenges": lesson.get("coding_challenges", []),
        "difficulty": lesson.get("difficulty", "Beginner"),
        "xp_reward": lesson.get("xp_reward", 50),
        "category_id": lesson.get("category_id", ""),
        "category_title": lesson.get("category_title", ""),
        "completed": lesson["completed"]
    }

@router.post("/lessons/complete")
def complete_lesson(data: dict):
    username = data["username"]
    lesson_id = data["lesson_id"]
    lesson = lessons_collection.find_one({"id": lesson_id})
    course_id = data.get("course_id") or (lesson.get("course_id") if lesson else "python-core") or "python-core"
    
    # Check if already completed
    existing = user_progress_collection.find_one({
        "username": username,
        "lesson_id": lesson_id,
        "course_id": course_id
    })
    if not existing:
        existing = user_progress_collection.find_one({"username": username, "lesson_id": lesson_id})
    if existing and existing.get("status") == "completed":
        return {"message": "Lesson already completed"}
    
    # Mark as completed
    user_progress_collection.update_one(
        {"username": username, "lesson_id": lesson_id},
        {"$set": {
            "status": "completed",
            "course_id": course_id,
            "completed_at": datetime.now().isoformat()
        }},
        upsert=True
    )
    
    # Update Overall Progress and XP for this course
    xp_to_add = lesson.get("xp_reward", 50) if lesson else 50
    
    user_overall = overall_progress_collection.find_one({"username": username, "course_id": course_id})
    if not user_overall and course_id == "python-core":
        user_overall = overall_progress_collection.find_one({"username": username, "course_id": {"$exists": False}})

    if not user_overall:
        user_overall = {"username": username, "course_id": course_id, "xp": 0, "completed_topics": [], "progress": 0}
    
    completed_topics = user_overall.get("completed_topics", [])
    if lesson_id not in completed_topics:
        completed_topics.append(lesson_id)
    
    total_lessons = lessons_collection.count_documents({"course_id": course_id})
    completed_count = user_progress_collection.count_documents(
        {"username": username, "course_id": course_id, "status": "completed"}
    )
    new_progress = round((completed_count / total_lessons) * 100, 2) if total_lessons > 0 else 0
    
    overall_progress_collection.update_one(
        {"username": username, "course_id": course_id},
        {"$set": {
            "course_id": course_id,
            "xp": user_overall.get("xp", 0) + xp_to_add,
            "completed_topics": completed_topics,
            "progress": new_progress,
            "last_activity": str(datetime.now().date())
        }},
        upsert=True
    )
    
    return {
        "message": "Lesson completed!",
        "xp_earned": xp_to_add,
        "new_progress": new_progress,
        "course_id": course_id
    }

@router.get("/lessons/recommendations/{username}")
def get_lesson_recommendations(username: str, course_id: str = None):
    cid = course_id or "python-core"
    mistakes_collection = db["mcq_mistakes"]
    mistake_query = {"username": username}
    if course_id:
        mistake_query["course_id"] = course_id
    mistakes = list(mistakes_collection.find(mistake_query))
    
    weak_keywords = []
    for m in mistakes:
        q = m.get("question", "").lower()
        if "loop" in q: weak_keywords.append("loops")
        elif "function" in q: weak_keywords.append("functions")
        elif "variable" in q: weak_keywords.append("vars")
        elif "dict" in q: weak_keywords.append("dicts")
        elif "list" in q: weak_keywords.append("lists")
    
    recommended_lessons = []
    if weak_keywords:
        recommended_lessons = list(lessons_collection.find(
            {"course_id": cid, "id": {"$in": list(set(weak_keywords))}},
            {"_id": 0, "id": 1, "title": 1, "category_title": 1, "course_id": 1}
        ))
    
    # If no mistake-based recommendations found, recommend the first 3 uncompleted lessons of this course
    if not recommended_lessons:
        completed = list(user_progress_collection.find(
            {"username": username, "course_id": cid, "status": "completed"},
            {"lesson_id": 1}
        ))
        completed_ids = [c["lesson_id"] for c in completed]
        recommended_lessons = list(lessons_collection.find(
            {"course_id": cid, "id": {"$nin": completed_ids}},
            {"_id": 0, "id": 1, "title": 1, "category_title": 1, "course_id": 1}
        ).limit(3))
        
    return recommended_lessons

@router.get("/lessons/{lesson_id}/exercises")
def get_lesson_exercises(lesson_id: str):
    return list(db["lesson_exercises"].find({"lesson_id": lesson_id}, {"_id": 0}))
