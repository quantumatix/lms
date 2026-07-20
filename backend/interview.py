from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
import random
from datetime import datetime

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
questions_collection = db["interview_questions"]
mock_sessions_collection = db["mock_interviews"]

@router.get("/questions")
def get_questions(category: str = None):
    query = {}
    if category: query["category"] = category
    return list(questions_collection.find(query, {"_id": 0}))

@router.post("/evaluate")
def evaluate_answer(data: dict):
    if "interview_id" in data and "username" in data:
        interview_id = data["interview_id"]
        username = data["username"]
        
        from bson import ObjectId
        try:
            obj_id = ObjectId(interview_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid interview ID format")
            
        mock_doc = db["mock_interviews"].find_one({"_id": obj_id})
        if not mock_doc:
            raise HTTPException(status_code=404, detail="Interview session not found")
        
        questions = mock_doc.get("questions", [])
        
        # Retrieve student answers
        user_answers = list(db["interview_answers"].find({
            "interview_id": interview_id,
            "username": username
        }))
        
        answers_map = {}
        for ans in user_answers:
            q_num = ans.get("question_number")
            answers_map[q_num] = ans.get("student_answer", "")
            
        qa_list = []
        for idx, q_item in enumerate(questions):
            q_num = idx + 1
            qa_list.append({
                "question_number": q_num,
                "question": q_item.get("question"),
                "student_answer": answers_map.get(q_num, "")
            })
            
        eval_report = evaluate_interview_session(qa_list)
        
        result_doc = {
            "interview_id": interview_id,
            "username": username,
            "overall_score": eval_report.get("overall_score", 0),
            "percentage": eval_report.get("percentage", 0),
            "communication": eval_report.get("communication", 0),
            "technical_knowledge": eval_report.get("technical_knowledge", 0),
            "problem_solving": eval_report.get("problem_solving", 0),
            "confidence": eval_report.get("confidence", 0),
            "strengths": eval_report.get("strengths", []),
            "weak_areas": eval_report.get("weak_areas", []),
            "recommended_topics": eval_report.get("recommended_topics", []),
            "summary": eval_report.get("summary", ""),
            "question_feedback": eval_report.get("question_feedback", []),
            "evaluated_at": datetime.now().isoformat()
        }
        
        db["interview_results"].update_one(
            {"interview_id": interview_id, "username": username},
            {"$set": result_doc},
            upsert=True
        )
        
        if "_id" in result_doc:
             del result_doc["_id"]
             
        return result_doc
        
    else:
        user_answer = data["answer"].lower()
        question_id = data["question_id"]
        
        question = questions_collection.find_one({"id": question_id})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        keywords = question.get("keywords", [])
        matches = [k for k in keywords if k.lower() in user_answer]
        score = round((len(matches) / len(keywords)) * 10) if keywords else 5
        
        ideal_points = question.get("points", [])
        missing_points = ideal_points[len(matches):] if len(matches) < len(keywords) else []
        
        return {
            "score": score,
            "ideal_answer": question["ideal_answer"],
            "missing_points": missing_points,
            "feedback": "Great effort! " + ("Try to touch upon more technical specifics." if score < 7 else "You covered the main points well.")
        }

@router.get("/mock/start")
def start_mock_interview():
    # Fetch 5 random questions across categories
    all_q = list(questions_collection.find({}, {"_id": 0}))
    selected = random.sample(all_q, min(5, len(all_q)))
    return selected

@router.post("/mock/submit")
def submit_mock_results(data: dict):
    # Save the session results
    username = data["username"]
    results = data["results"] # List of {question_id, score, answer}
    total_score = sum([r["score"] for r in results])
    avg_score = total_score / len(results) if results else 0
    
    session = {
        "username": username,
        "avg_score": avg_score,
        "results": results,
        "timestamp": datetime.now().isoformat()
    }
    mock_sessions_collection.insert_one(session)
    return {"message": "Mock interview saved", "avg_score": avg_score}

@router.get("/history/{username}")
def get_interview_history(username: str):
    return list(mock_sessions_collection.find({"username": username}, {"_id": 0}).sort("timestamp", -1))


@router.get("/skill-analysis/{username}")
def get_skill_analysis(username: str):
    # Try to find user by name or email
    user = db["users"].find_one({"name": username})
    if not user:
        user = db["users"].find_one({"email": username})
    
    if not user:
        raise HTTPException(status_code=404, detail=f"Student {username} not found")
        
    actual_username = user.get("name", username)
    email = user.get("email", "")
    
    # 1. Total lessons count
    total_lessons = db["lessons"].count_documents({})
    
    # 2. Progress and XP
    completed_lessons_docs = list(db["user_lessons_progress"].find({
        "$or": [{"username": actual_username}, {"username": email}],
        "status": "completed"
    }))
    completed_lesson_ids = {d["lesson_id"] for d in completed_lessons_docs}
    completed_count = len(completed_lesson_ids)
    remaining_count = max(0, total_lessons - completed_count)
    
    overall_progress = round((completed_count / total_lessons) * 100) if total_lessons > 0 else 0
    
    xp = 0
    up_doc = db["user_progress"].find_one({"username": actual_username})
    if not up_doc and email:
        up_doc = db["user_progress"].find_one({"username": email})
    if up_doc:
        xp = up_doc.get("xp", 0)
    else:
        p_doc = db["progress"].find_one({"username": actual_username})
        if not p_doc and email:
            p_doc = db["progress"].find_one({"username": email})
        if p_doc:
            xp = p_doc.get("xp", 0) or p_doc.get("score", 0) or 0
    
    # 3. MCQ Analysis
    mcq_results_docs = list(db["mcq_results"].find({"$or": [{"username": actual_username}, {"username": email}]}))
    mcq_attempted = sum(d.get("total", 0) for d in mcq_results_docs)
    mcq_correct = sum(d.get("score", 0) for d in mcq_results_docs)
    mcq_wrong = max(0, mcq_attempted - mcq_correct)
    mcq_accuracy = round((mcq_correct / mcq_attempted) * 100) if mcq_attempted > 0 else 0
    
    # 4. Coding Analysis
    coding_attempts = list(db["coding_results"].find({"$or": [
        {"username": actual_username},
        {"email": email},
        {"username": email},
        {"email": actual_username}
    ]}))
    coding_attempted = len(coding_attempts)
    coding_passed = len([c for c in coding_attempts if c.get("status") == "Passed" or c.get("result") == "Correct"])
    coding_failed = max(0, coding_attempted - coding_passed)
    coding_success_rate = round((coding_passed / coding_attempted) * 100) if coding_attempted > 0 else 0
    
    # 5. Practice Exercise Analysis
    practice_attempts = list(db["practice_history"].find({"$or": [{"username": actual_username}, {"username": email}]}))
    practice_attempted = len(practice_attempts)
    practice_completed = len([p for p in practice_attempts if p.get("status") in ["success", "completed", "Passed"]])
    practice_average = round((practice_completed / practice_attempted) * 100) if practice_attempted > 0 else 0
    
    # 6. Topic-wise calculations (exact 9 topics requested of Python Core)
    topics_list = [
        "Variables", "Data Types", "Operators", "Loops", "Functions",
        "OOP", "File Handling", "Exception Handling", "Modules"
    ]
    
    TOPIC_LESSONS = {
        "Variables": ["day2"],
        "Data Types": ["day3", "day10", "day11", "day12", "day13"],
        "Operators": ["day4"],
        "Loops": ["day8", "day9"],
        "Functions": ["day15", "day16", "day17"],
        "OOP": ["day18", "day19", "day20"],
        "File Handling": ["day22"],
        "Exception Handling": ["day23"],
        "Modules": ["day24"]
    }
    
    TOPIC_KEYWORDS = {
        "Variables": ["variable", "const", "comment"],
        "Data Types": ["type", "cast", "list", "tuple", "set", "dict", "string"],
        "Operators": ["operator", "expression", "arithmetic", "logical", "comparison"],
        "Loops": ["loop", "for", "while", "range", "break", "continue"],
        "Functions": ["function", "def", "arg", "scope", "lambda", "return"],
        "OOP": ["class", "object", "inherit", "mixin", "encapsul", "polymorph"],
        "File Handling": ["file", "read", "write", "open", "i/o"],
        "Exception Handling": ["exception", "try", "except", "raise", "error"],
        "Modules": ["module", "package", "import", "pip"]
    }
    
    # Pre-load mistakes for keyword matching
    mistakes_docs = list(db["mcq_mistakes"].find({"$or": [{"username": actual_username}, {"username": email}]}))
    
    skills = []
    strong_topics = []
    weak_topics = []
    
    for topic in topics_list:
        # A. Lesson Completion Score
        lesson_ids = TOPIC_LESSONS.get(topic, [])
        if lesson_ids:
            completed_in_topic = len([lid for lid in lesson_ids if lid in completed_lesson_ids])
            lesson_score = (completed_in_topic / len(lesson_ids)) * 100
        else:
            lesson_score = 0
            
        # B. MCQ Topic Score
        keywords = TOPIC_KEYWORDS.get(topic, [])
        mistakes_count = 0
        for m in mistakes_docs:
            question_text = m.get("question", "").lower()
            if any(k in question_text for k in keywords):
                mistakes_count += 1
                
        base_mcq = mcq_accuracy if mcq_attempted > 0 else 85
        mcq_score = max(30, base_mcq - (mistakes_count * 15))
        
        # C. Coding Topic Score
        topic_coding_attempts = [
            c for c in coding_attempts 
            if c.get("lesson_id") in lesson_ids or c.get("challenge_id", "").startswith(topic.lower()[:3])
        ]
        if topic_coding_attempts:
            passed_topic = len([c for c in topic_coding_attempts if c.get("status") == "Passed" or c.get("result") == "Correct"])
            coding_score = (passed_topic / len(topic_coding_attempts)) * 100
        else:
            coding_score = coding_success_rate if coding_attempted > 0 else 80
            
        # D. Practice Topic Score
        topic_practice_attempts = [
            p for p in practice_attempts
            if p.get("challenge_id", "").startswith(topic.lower()[:3])
        ]
        if topic_practice_attempts:
            passed_practice = len([p for p in topic_practice_attempts if p.get("status") in ["success", "completed", "Passed"]])
            practice_score = (passed_practice / len(topic_practice_attempts)) * 100
        else:
            practice_score = practice_average if practice_attempted > 0 else 80
            
        # Master Topic Calculation
        topic_score = round(
            (lesson_score * 0.40) +
            (mcq_score * 0.20) +
            (coding_score * 0.20) +
            (practice_score * 0.20)
        )
        
        # Clamp to 0-100
        topic_score = max(0, min(100, topic_score))
        
        skills.append({
            "topic": topic,
            "score": topic_score
        })
        
        if topic_score >= 80:
            strong_topics.append(topic)
        elif topic_score <= 60:
            weak_topics.append(topic)
            
    return {
        "username": actual_username,
        "email": email,
        "overall_progress": overall_progress,
        "xp": xp,
        "completed_lessons": completed_count,
        "remaining_lessons": remaining_count,
        "mcq_attempted": mcq_attempted,
        "mcq_correct": mcq_correct,
        "mcq_wrong": mcq_wrong,
        "mcq_accuracy": mcq_accuracy,
        "coding_attempted": coding_attempted,
        "coding_passed": coding_passed,
        "coding_failed": coding_failed,
        "coding_success_rate": coding_success_rate,
        "practice_attempted": practice_attempted,
        "practice_completed": practice_completed,
        "practice_average": practice_average,
        "skills": skills,
        "strong_topics": strong_topics,
        "weak_topics": weak_topics
    }


from pydantic import BaseModel
from services.ai_service import generate_interview_questions, evaluate_interview_session


class InterviewRequest(BaseModel):
    username: str
    difficulty: str = "Beginner"
    number_of_questions: int = 10

@router.post("/generate")
def generate_interview_endpoint(req: InterviewRequest):
    username = req.username
    difficulty = req.difficulty
    number_of_questions = req.number_of_questions
    
    # 1. Fetch skill profile
    try:
        profile = get_skill_analysis(username)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # 2. Call Gemini AI helper to generate questions
    try:
        questions = generate_interview_questions(username, difficulty, number_of_questions, profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate interview via AI: {str(e)}")
        
    # 3. Store to MongoDB in mock_interviews collection
    doc = {
        "username": username,
        "difficulty": difficulty,
        "created_at": datetime.now().isoformat(),
        "questions": questions
    }
    result = db["mock_interviews"].insert_one(doc)
    doc_id = str(result.inserted_id)
    
    return {
        "message": "Interview Generated Successfully",
        "interview_id": doc_id,
        "username": username,
        "difficulty": difficulty,
        "total_questions": len(questions),
        "questions": questions
    }


from bson import ObjectId

class SaveAnswerRequest(BaseModel):
    interview_id: str
    question_number: int
    username: str
    answer: str

@router.get("/session/{interview_id}")
def get_interview_session(interview_id: str):
    try:
        obj_id = ObjectId(interview_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid interview ID format")
        
    doc = db["mock_interviews"].find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    questions = []
    for idx, q in enumerate(doc.get("questions", [])):
        questions.append({
            "question_number": idx + 1,
            "type": q.get("type"),
            "topic": q.get("topic"),
            "question": q.get("question")
        })
        
    return {
        "interview_id": str(doc["_id"]),
        "username": doc.get("username"),
        "difficulty": doc.get("difficulty"),
        "total_questions": len(questions),
        "questions": questions
    }

@router.post("/answer")
def save_student_answer(req: SaveAnswerRequest):
    try:
        obj_id = ObjectId(req.interview_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid interview ID format")
        
    doc = db["mock_interviews"].find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    questions = doc.get("questions", [])
    idx = req.question_number - 1
    if idx < 0 or idx >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question number")
        
    question_text = questions[idx].get("question")
    
    # Upsert the answer
    filter_query = {
        "interview_id": req.interview_id,
        "question_number": req.question_number,
        "username": req.username
    }
    update_doc = {
        "$set": {
            "question": question_text,
            "student_answer": req.answer,
            "created_at": datetime.now().isoformat()
        }
    }
    db["interview_answers"].update_one(filter_query, update_doc, upsert=True)
    
    return {"message": "Answer saved successfully"}


@router.get("/session/{interview_id}/answers")
def get_session_answers(interview_id: str, username: str):
    return list(db["interview_answers"].find({
        "interview_id": interview_id,
        "username": username
    }, {"_id": 0}))


@router.get("/results")
def get_user_interview_results(username: str):
    return list(db["interview_results"].find({"username": username}, {"_id": 0}).sort("evaluated_at", -1))


@router.get("/result/{interview_id}")
def get_interview_result_by_id(interview_id: str, username: str = None):
    query = {"interview_id": interview_id}
    if username:
        query["username"] = username
    doc = db["interview_results"].find_one(query, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Interview result not found")
    return doc
