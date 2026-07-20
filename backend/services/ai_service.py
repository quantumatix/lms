import os
import services.gemini_service as gemini
import services.openai_service as openai

def get_provider() -> str:
    return os.getenv("AI_PROVIDER", "openai").lower()

def generate_python_lesson(topic: str, difficulty: str = "Beginner"):
    if get_provider() == "gemini":
        return gemini.generate_python_lesson(topic, difficulty)
    else:
        return openai.generate_python_lesson(topic, difficulty)

def generate_python_mcqs(topic: str, count: int = 5, difficulty: str = "Beginner"):
    if get_provider() == "gemini":
        return gemini.generate_python_mcqs(topic, count, difficulty)
    else:
        return openai.generate_python_mcqs(topic, count, difficulty)

def generate_python_challenge(topic: str, difficulty: str = "Beginner"):
    if get_provider() == "gemini":
        return gemini.generate_python_challenge(topic, difficulty)
    else:
        return openai.generate_python_challenge(topic, difficulty)

def generate_python_coding_challenges(topic: str, difficulty: str = "Beginner", count: int = 3):
    if get_provider() == "gemini":
        return gemini.generate_python_coding_challenges(topic, difficulty, count)
    else:
        return openai.generate_python_coding_challenges(topic, difficulty, count)

def generate_python_practice_exercises(topic: str, difficulty: str = "Beginner", count: int = 5):
    if get_provider() == "gemini":
        return gemini.generate_python_practice_exercises(topic, difficulty, count)
    else:
        return openai.generate_python_practice_exercises(topic, difficulty, count)

def generate_interview_questions(username: str, difficulty: str, number_of_questions: int, profile: dict):
    if get_provider() == "gemini":
        return gemini.generate_interview_questions(username, difficulty, number_of_questions, profile)
    else:
        return openai.generate_interview_questions(username, difficulty, number_of_questions, profile)

def evaluate_interview_session(qa_list: list):
    if get_provider() == "gemini":
        return gemini.evaluate_interview_session(qa_list)
    else:
        return openai.evaluate_interview_session(qa_list)
