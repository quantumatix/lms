"""
gemini_service.py — Gemini-backed AI content generation.

All functions accept a `technology` parameter so the same service
generates content for Python, Java, JavaScript, SQL, etc.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Locate backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise Exception("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-3.5-flash")


def clean_json_formatting(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    first_bracket = text.find('[')
    first_brace = text.find('{')
    start_idx = -1
    end_idx = -1
    if first_bracket != -1 and (first_brace == -1 or first_bracket < first_brace):
        start_idx = first_bracket
        end_idx = text.rfind(']')
    elif first_brace != -1:
        start_idx = first_brace
        end_idx = text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx:end_idx + 1]
    return text.strip()


def extract_list_from_json(data) -> list:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, list):
                return value
        return [data]
    return []


# ─────────────────────────────────────────────
# LESSON
# ─────────────────────────────────────────────

def generate_lesson(technology: str, topic: str, difficulty: str = "Beginner"):
    prompt = f"""
Generate a complete {technology} lesson in JSON format.

Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON with this structure:

{{
  "title": "",
  "description": "",
  "category": "{technology}",
  "difficulty": "{difficulty}",
  "theory": "",
  "code_examples": [
    {{
      "title": "",
      "code": "",
      "output": ""
    }}
  ],
  "real_world_use_cases": [],
  "common_mistakes": [],
  "mcqs": [
    {{
      "question": "",
      "options": ["","","",""],
      "answer": ""
    }}
  ],
  "practice_exercises": [],
  "coding_challenges": []
}}

Do not return markdown.
Do not return explanation.
Return JSON only.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# MCQs
# ─────────────────────────────────────────────

def generate_mcqs(technology: str, topic: str, count: int = 5, difficulty: str = "Beginner"):
    prompt = f"""
Generate {count} multiple choice questions (MCQ) for {technology} in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON as a list of questions with this structure:
[
  {{
    "question": "The question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "The exact correct option string",
    "explanation": "Detailed explanation of why this answer is correct"
  }}
]

Do not return markdown.
Do not return conversational explanations outside the JSON array.
Return JSON only.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# SINGLE CHALLENGE
# ─────────────────────────────────────────────

def generate_challenge(technology: str, topic: str, difficulty: str = "Beginner"):
    prompt = f"""
Generate a {technology} programming coding challenge in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON with this structure:
{{
  "title": "",
  "task": "",
  "initial_code": "",
  "expected_output": "",
  "hints": [""]
}}

Do not return markdown.
Do not return explanation.
Return JSON only.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# CODING CHALLENGES (bulk)
# ─────────────────────────────────────────────

def generate_coding_challenges(technology: str, topic: str, difficulty: str = "Beginner", count: int = 3):
    prompt = f"""
Generate {count} {technology} programming coding challenges in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON as a list of challenges with this structure:
[
  {{
    "title": "Challenge Title",
    "problem": "Problem description showing constraints and requirements",
    "difficulty": "{difficulty}",
    "starter_code": "Initial setup code",
    "expected_output": "The expected return output",
    "sample_input": "Format/Value of sample input",
    "sample_output": "Value/Stdout of sample output",
    "hints": [
      "Hint 1",
      "Hint 2",
      "Hint 3"
    ],
    "solution": "Full working solution code",
    "explanation": "Explanation of the solution"
  }}
]

Do not return markdown.
Do not return conversational explanations outside the JSON array.
Return JSON only.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# PRACTICE EXERCISES
# ─────────────────────────────────────────────

def generate_practice_exercises(technology: str, topic: str, difficulty: str = "Beginner", count: int = 5):
    prompt = f"""
Generate {count} {technology} programming practice exercises in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Instructions:
1. Dynamically generate a mixture of the following exercise types:
   - Output Prediction (a code fragment where the student must predict the stdout/return value)
   - Fill in the Blank (code containing a blank like ___ where the student must fill it)
   - Debug the Code (buggy code where the student must find the correct fix or output)
   - Short Coding Exercise (a small coding task)
   - Code Completion (partially completed code that must be finished)
2. Return ONLY valid JSON as a list of exercises with this exact structure:
[
  {{
    "title": "Exercise Title",
    "type": "Output Prediction",
    "question": "Question text explaining what needs to be done",
    "code": "{technology} code block related to the question (use empty string if no code is needed)",
    "expected_answer": "The expected solution or answer",
    "hint": "Subtle hint to help the user",
    "explanation": "Detailed explanation of why the expected answer is correct"
  }}
]

CRITICAL RULES:
- Do NOT generate Multiple Choice Questions (MCQs).
- Do NOT include "options", "choices", "answer", or other extra fields in the JSON.
- Every exercise object must strictly have ONLY these keys: "title", "type", "question", "code", "expected_answer", "hint", "explanation".

Do not return markdown.
Do not return conversational explanations outside the JSON array.
Return JSON only.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# FALLBACK QUESTIONS (used when AI call fails)
# ─────────────────────────────────────────────

FALLBACK_QUESTIONS = {
    "Technical": [
        {"topic": "Data Types", "question": "What is the difference between mutable and immutable data types? Give examples of both."},
        {"topic": "Functions", "question": "Explain the difference between a function and a method. How do you pass arguments by reference or value?"},
        {"topic": "OOP", "question": "What is inheritance in Object-Oriented Programming? How does the language support multiple inheritance?"},
        {"topic": "Exception Handling", "question": "Explain the purpose of try, catch/except, and finally blocks."},
        {"topic": "Loops", "question": "What is the difference between for and while loops, and when would you use each?"},
    ],
    "Coding": [
        {"topic": "Loops", "question": "Write a function that takes a list of numbers and returns the second largest number without using built-in sorting."},
        {"topic": "Functions", "question": "Write a recursive function to compute the factorial of a given number."},
        {"topic": "OOP", "question": "Create a class 'Car' with attributes 'make', 'model', and 'year'. Add a method 'get_description' returning a formatted string."},
        {"topic": "Data Types", "question": "Write a function to merge two dictionaries. If a key is present in both, sum their values."},
    ],
    "Scenario": [
        {"topic": "Exception Handling", "question": "You are writing a program to process payments. If the network goes down mid-step, how would you design your exception handling?"},
        {"topic": "OOP", "question": "If you are designing a dashboard system with different types of widgets, how would you use polymorphism to draw them dynamically?"},
    ],
    "Behavioral": [
        {"topic": "General", "question": "Describe a situation where you had to work on a codebase created by someone else. How did you get familiar with it?"},
        {"topic": "General", "question": "Tell me about a time you found a critical bug in code that was about to go live. What did you do?"},
    ]
}


def get_fallback_questions(username: str, difficulty: str, number_of_questions: int, profile: dict):
    weak_topics = profile.get("weak_topics", []) or []
    strong_topics = profile.get("strong_topics", []) or []

    technical_count = round(number_of_questions * 0.40)
    coding_count = round(number_of_questions * 0.30)
    scenario_count = round(number_of_questions * 0.20)
    behavioral_count = number_of_questions - (technical_count + coding_count + scenario_count)
    if behavioral_count < 0:
        behavioral_count = 0

    counts = {
        "Technical": technical_count,
        "Coding": coding_count,
        "Scenario": scenario_count,
        "Behavioral": behavioral_count
    }

    selected_questions = []

    for q_type, target_count in counts.items():
        pool = FALLBACK_QUESTIONS.get(q_type, [])

        def sort_key(item_idx_pair):
            idx, q = item_idx_pair
            topic = q.get("topic")
            if topic in weak_topics:
                return (0, idx)
            elif topic in strong_topics:
                return (2, idx)
            else:
                return (1, idx)

        enumerated_pool = list(enumerate(pool))
        sorted_enumerated = sorted(enumerated_pool, key=sort_key)

        chunk = [q for idx, q in sorted_enumerated]
        for q in chunk[:target_count]:
            selected_questions.append({
                "type": q_type,
                "topic": q.get("topic"),
                "question": f"[{difficulty}] {q.get('question')}"
            })

    return selected_questions


# ─────────────────────────────────────────────
# INTERVIEW QUESTIONS (mock interview generation)
# ─────────────────────────────────────────────

def generate_interview_questions(username: str, difficulty: str, number_of_questions: int, profile: dict, technology: str = "Python"):
    weak_topics = profile.get("weak_topics", [])
    strong_topics = profile.get("strong_topics", [])

    technical_count = round(number_of_questions * 0.40)
    coding_count = round(number_of_questions * 0.30)
    scenario_count = round(number_of_questions * 0.20)
    behavioral_count = number_of_questions - (technical_count + coding_count + scenario_count)

    if behavioral_count < 0:
        behavioral_count = 0

    try:
        prompt = f"""
Generate a personalized {technology} mock interview in JSON format.
Student Name: {username}
Selected Difficulty: {difficulty}

Student Skill Profile Context:
- Weak Topics (focus on these primarily): {", ".join(weak_topics) if weak_topics else "None"}
- Strong Topics (include a few questions from these): {", ".join(strong_topics) if strong_topics else "None"}
- Overall Progress: {profile.get("overall_progress")}%
- Total XP: {profile.get("xp")}
- MCQ Accuracy: {profile.get("mcq_accuracy")}%
- Coding Success Rate: {profile.get("coding_success_rate")}%

Question Distribution:
- Generate exactly {technical_count} questions of type "Technical" (Technical Theory)
- Generate exactly {coding_count} questions of type "Coding" (Coding questions/challenges)
- Generate exactly {scenario_count} questions of type "Scenario" (Scenario-based questions)
- Generate exactly {behavioral_count} questions of type "Behavioral" (Behavioral/situational questions)

Total questions to generate: {number_of_questions}

Rules:
1. Ground the questions in {technology} core concepts relevant to the technology.
2. The questions should match the difficulty level: {difficulty}.
3. Prioritize setting the topic of the questions to the student's weak topics. Only use strong topics for a minority of the questions (e.g., 20-30%).
4. For behavioral questions, the topic can be "General" or a specific professional aspect of programming.
5. Return ONLY a valid JSON array of question objects where each object has exactly these keys: "type", "topic", "question".

Example output format:
[
  {{
    "type": "Technical",
    "topic": "OOP",
    "question": "Describe encapsulation and how it is implemented in {technology}."
  }},
  {{
    "type": "Coding",
    "topic": "Loops",
    "question": "Write a {technology} function to solve..."
  }},
  {{
    "type": "Scenario",
    "topic": "Exception Handling",
    "question": "How would you handle invalid input inside a production pipeline?"
  }},
  {{
    "type": "Behavioral",
    "topic": "General",
    "question": "Tell me about a time you had to debug a complex issue under pressure."
  }}
]

Do not return markdown formatting blocks (like ```json).
Do not return any introductory or trailing conversational explanation text.
Return ONLY the JSON array.
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        text = clean_json_formatting(text)
        return json.loads(text)
    except Exception as e:
        print(f"Gemini API error (fallback active): {str(e)}")
        return get_fallback_questions(username, difficulty, number_of_questions, profile)


# ─────────────────────────────────────────────
# INTERVIEW EVALUATION
# ─────────────────────────────────────────────

def get_fallback_evaluation(qa_list: list):
    question_feedback = []
    total_score = 0
    max_total = 0
    for qa in qa_list:
        ans_len = len(qa.get("student_answer", "").strip())
        score = 8 if ans_len > 30 else (5 if ans_len > 5 else 1)
        question_feedback.append({
            "question_number": qa.get("question_number"),
            "question": qa.get("question"),
            "student_answer": qa.get("student_answer"),
            "score": score,
            "max_score": 10,
            "feedback": "Valid attempt. Good basic understanding." if score > 5 else "Insufficient answer or blank response.",
            "improvement": "Provide more code examples and structural explanations." if score > 5 else "Ensure you try to answer every question in detail."
        })
        total_score += score
        max_total += 10

    percentage = int((total_score / max_total) * 100) if max_total > 0 else 0

    return {
        "overall_score": percentage,
        "percentage": percentage,
        "communication": 7,
        "technical_knowledge": 7,
        "problem_solving": 6,
        "confidence": 7,
        "strengths": ["Variables", "Functions"],
        "weak_areas": ["Advanced OOP", "Error Management"],
        "recommended_topics": ["Classes", "Exceptions"],
        "summary": "Fallback Evaluation. Good initial coding effort. Spend more time practicing scenario-based questions.",
        "question_feedback": question_feedback
    }


def evaluate_interview_session(qa_list: list, technology: str = "Python"):
    try:
        prompt = f"""
Evaluate the following student answers from a {technology} mock interview.

Interview Q&A details:
{json.dumps(qa_list, indent=2)}

For each answer, evaluate it and return a score out of 10.
Also generate an overall summary of the student's performance, including:
- overall_score (overall rating score out of 100 representing average rating percentage)
- percentage (0-100 representation of overall rating score)
- communication rating (1 to 10 scale)
- technical_knowledge rating (1 to 10 scale)
- problem_solving rating (1 to 10 scale)
- confidence rating (1 to 10 scale)
- strengths (list of topics/concepts the student knows well based on their answers)
- weak_areas (list of topics/concepts the student struggled with or got low scores on)
- recommended_topics (list of sub-topics/chapters to revise)
- summary (a concise final feedback summary paragraph)

Return ONLY a valid JSON object matching this structure:
{{
  "overall_score": 82,
  "percentage": 82,
  "communication": 8,
  "technical_knowledge": 9,
  "problem_solving": 8,
  "confidence": 7,
  "strengths": ["Functions", "Loops"],
  "weak_areas": ["OOP", "Exception Handling"],
  "recommended_topics": ["Classes", "Inheritance", "Try-Except"],
  "summary": "The student demonstrates a solid understanding...",
  "question_feedback": [
    {{
      "question_number": 1,
      "question": "Question text...",
      "student_answer": "Student answer...",
      "score": 8,
      "max_score": 10,
      "feedback": "Feedback for this specific answer...",
      "improvement": "Suggested improvement..."
    }}
  ]
}}

Do not return markdown formatting blocks (like ```json).
Do not return any conversational text.
Return ONLY the JSON.
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        text = clean_json_formatting(text)
        return json.loads(text)
    except Exception as e:
        print(f"Gemini evaluation API error (fallback active): {str(e)}")
        return get_fallback_evaluation(qa_list)


# ─────────────────────────────────────────────
# INTERVIEW BANK QUESTIONS
# ─────────────────────────────────────────────

def generate_interview_bank_questions(technology: str, category: str, count: int = 5):
    prompt = f"""
Generate {count} {technology} mock interview questions for an interview question bank.
Category: {category}

For each question, formulate a comprehensive bank item:
- question: Realistic question specific to {technology} and category '{category}'.
- ideal_answer: A detailed model answer.
- keywords: A list of 4-6 specific technical key terms that must be in the answer.
- points: A list of 3-4 key conceptual details.

Return ONLY a valid JSON array:
[
  {{
    "question": "...",
    "ideal_answer": "...",
    "keywords": ["...", "..."],
    "points": ["...", "..."]
  }}
]

Do not return markdown formatting blocks.
Do not return any conversational text.
Return ONLY the JSON.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# ASSIGNMENTS
# ─────────────────────────────────────────────

def generate_assignments(technology: str, topic: str, difficulty: str = "Beginner", count: int = 3):
    prompt = f"""
Generate {count} {technology} programming assignments in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON as a list:
[
  {{
    "title": "Assignment Title",
    "description": "Detailed assignment description and requirements",
    "objectives": ["Learning objective 1", "Learning objective 2"],
    "tasks": ["Task 1", "Task 2", "Task 3"],
    "deliverables": ["What to submit 1", "What to submit 2"],
    "estimated_time": "e.g. 2-3 hours",
    "difficulty": "{difficulty}",
    "hints": ["Hint 1", "Hint 2"],
    "evaluation_criteria": ["Criterion 1", "Criterion 2"]
  }}
]

Do not return markdown.
Return JSON only.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# PROJECTS
# ─────────────────────────────────────────────

def generate_projects(technology: str, topic: str, difficulty: str = "Beginner", count: int = 2):
    prompt = f"""
Generate {count} {technology} project ideas in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON as a list:
[
  {{
    "title": "Project Title",
    "description": "Detailed project description",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "tech_stack": ["{technology}", "other tools if needed"],
    "difficulty": "{difficulty}",
    "estimated_time": "e.g. 1-2 weeks",
    "learning_outcomes": ["Outcome 1", "Outcome 2"],
    "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
    "extension_ideas": ["Optional extension 1", "Optional extension 2"]
  }}
]

Do not return markdown.
Return JSON only.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# REVISION MATERIAL
# ─────────────────────────────────────────────

def generate_revision_material(technology: str, topic: str, difficulty: str = "Beginner"):
    prompt = f"""
Generate a complete revision guide for {technology} in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON with this structure:
{{
  "title": "Revision: {topic}",
  "technology": "{technology}",
  "difficulty": "{difficulty}",
  "summary": "A concise 2-3 sentence summary of the topic",
  "key_concepts": [
    {{
      "concept": "Concept name",
      "explanation": "Brief clear explanation",
      "example": "Short code or text example"
    }}
  ],
  "quick_reference": ["Quick tip 1", "Quick tip 2", "Quick tip 3"],
  "common_pitfalls": ["Pitfall 1", "Pitfall 2"],
  "practice_questions": [
    {{
      "question": "Quick revision question?",
      "answer": "Expected answer"
    }}
  ],
  "cheat_sheet": "Key syntax or rules formatted as a short text block"
}}

Do not return markdown.
Return JSON only.
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    text = clean_json_formatting(text)
    return json.loads(text)


# ─────────────────────────────────────────────
# BACKWARD-COMPATIBLE ALIASES (deprecated)
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