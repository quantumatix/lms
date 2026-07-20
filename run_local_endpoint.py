import sys
import traceback
from admin import ai_generate_practice_exercises, AIPracticeExerciseGenerationRequest

try:
    req = AIPracticeExerciseGenerationRequest(
        lesson_id="intro",
        topic="Introduction to Python",
        difficulty="Beginner",
        number_of_exercises=3
    )
    res = ai_generate_practice_exercises(req)
    print("Success:", res)
except Exception as e:
    print("Error:", e)
    traceback.print_exc()
