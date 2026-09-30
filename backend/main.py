from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient


from auth.auth import router as auth_router
from progress import router as progress_router
from mcq import router as mcq_router
from mcq_result import router as mcq_result_router
from analytics import router as analytics_router
from coding import router as coding_router
from coding_result import router as coding_result_router
import coding_analytics
from coding_analytics import router as coding_analytics_router
from adaptive_recommendations import router as adaptive_router
from score_history import router as score_history_router
from history import router as history_router
from highest_score import router as highest_score_router
from routes.mcq_score import router as mcq_score_router
from routes.leaderboard import router as leaderboard_router
from routes.mistake_analysis import router as mistake_router
from user_progress import router as user_progress_router
from routes.daily_review import router as daily_review_router
from retry_review import router as retry_router
from weak_topics import router as weak_topics_router
from lessons import router as lessons_router
from exercises import router as exercises_router
from admin import router as admin_router
from interview import router as interview_router
from courses import router as courses_router






app = FastAPI()

# Routers
app.include_router(auth_router)
app.include_router(progress_router)
app.include_router(mcq_router)
app.include_router(mcq_result_router)
app.include_router(analytics_router)
app.include_router(coding_router)
app.include_router(coding_result_router)
app.include_router(coding_analytics_router)
app.include_router(adaptive_router)
app.include_router(score_history_router)
app.include_router(history_router)
app.include_router(highest_score_router)
app.include_router(mcq_score_router)
app.include_router(leaderboard_router)
app.include_router(mistake_router)
app.include_router(user_progress_router)
app.include_router(daily_review_router)
app.include_router(retry_router)
app.include_router(weak_topics_router)
app.include_router(lessons_router)
app.include_router(exercises_router)
app.include_router(admin_router)
app.include_router(interview_router, prefix="/interview", tags=["interview"])
app.include_router(courses_router)



# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017")

db = client["lms_database"]

students_collection = db["students"]

@app.get("/")
def home():
    return {
        "message": "AI-Powered Python LMS Backend Running Successfully"
    }