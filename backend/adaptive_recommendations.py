from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")

db = client["lms_database"]

progress_collection = db["progress"]
coding_results_collection = db["coding_results"]


@router.get("/adaptive-recommendations/{username}")
def adaptive_recommendations(username: str, course_id: str = None):
    cid = course_id or "python-core"
    query = {"username": username, "course_id": cid}

    student = progress_collection.find_one(query)
    if not student and cid == "python-core":
        student = progress_collection.find_one({"username": username})

    course = db["courses"].find_one({"id": cid})
    tech = course.get("technology", "Programming") if course else "Programming"
    course_name = course.get("name", tech) if course else tech

    level = student.get("level", "Beginner") if student else "Beginner"

    coding_query = {"username": username, "course_id": cid}
    total = coding_results_collection.count_documents(coding_query)
    correct = coding_results_collection.count_documents(
        {**coding_query, "$or": [{"result": "Correct"}, {"status": "Passed"}]}
    )

    accuracy = 0
    if total > 0:
        accuracy = round((correct / total) * 100, 2)

    # Dynamic course-aware recommendations based on actual course lessons
    uncompleted_lessons = list(db["lessons"].find(
        {"course_id": cid},
        {"_id": 0, "title": 1, "category_title": 1}
    ).limit(3))

    recommendations = []
    if uncompleted_lessons:
        for l in uncompleted_lessons:
            recommendations.append(f"Study: {l.get('title')}")
    else:
        if level == "Beginner":
            recommendations.extend([
                f"Master {tech} Syntax",
                f"Learn {tech} Variables & Types",
                f"Practice Basic {tech} Logic"
            ])
        elif level == "Intermediate":
            recommendations.extend([
                f"Explore {tech} Functions & Classes",
                f"Study Object-Oriented {tech}",
                f"Solve Intermediate {tech} Challenges"
            ])
        else:
            recommendations.extend([
                f"Build Advanced {tech} Projects",
                f"Master Design Patterns in {tech}",
                f"Prepare for {tech} Technical Interviews"
            ])

    if accuracy < 70 and total > 0:
        recommendations.append(
            f"Practice More {tech} Coding Questions"
        )

    return {
        "level": level,
        "coding_accuracy": accuracy,
        "recommendations": recommendations,
        "course_id": cid,
        "course_name": course_name
    }