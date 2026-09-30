"""
openai_service.py — OpenAI-backed AI content generation.

All functions accept a `technology` parameter so that the same
service generates content for Python, Java, JavaScript, SQL, etc.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Locate backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

if not API_KEY:
    raise Exception("OPENAI_API_KEY not found in .env file")

client = OpenAI(api_key=API_KEY)


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


def call_openai_gpt(prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content.strip()


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
  "theory": "Detailed educational theory text with explanation, headers, and description of the topic in markdown format.",
  "code_examples": [
    {{
      "title": "Example Title",
      "code": "{technology} code demonstrating the topic...",
      "output": "Expected stdout or return value of the code example..."
    }}
  ],
  "real_world_use_cases": ["Real-world application case 1", "Real-world application case 2"],
  "common_mistakes": ["Common mistake 1 and how to avoid it", "Common mistake 2 and how to avoid it"],
  "mcqs": [
    {{
      "question": "Concept check question text?",
      "options": ["Option A","Option B","Option C","Option D"],
      "answer": "Exact string matching the correct option"
    }}
  ],
  "practice_exercises": [
    {{
      "title": "Exercise Title",
      "type": "Output Prediction" | "Fill in the Blank" | "Debug the Code" | "Short Coding Exercise" | "Code Completion",
      "question": "Question text explaining what needs to be done",
      "code": "{technology} code block related to the question (use empty string if no code is needed)",
      "expected_answer": "The expected solution or answer",
      "hint": "Subtle hint to help the user",
      "explanation": "Detailed explanation of why the expected answer is correct"
    }}
  ],
  "coding_challenges": [
    {{
      "title": "Challenge Title",
      "problem": "Problem description showing constraints and requirements",
      "starter_code": "Initial setup code",
      "expected_output": "The expected return output",
      "sample_input": "Format/Value of sample input",
      "sample_output": "Value/Stdout of sample output",
      "hints": [
        "Hint 1",
        "Hint 2"
      ],
      "solution": "Full working solution code",
      "explanation": "Explanation of the solution"
    }}
  ]
}}

Do not return markdown.
Do not return explanation.
Return JSON only.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    return json.loads(text)


# ─────────────────────────────────────────────
# MCQs
# ─────────────────────────────────────────────

def generate_mcqs(technology: str, topic: str, count: int = 5, difficulty: str = "Beginner"):
    prompt = f"""
Generate {count} multiple choice questions (MCQ) for {technology} in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON as an object containing a list representing the questions with this structure:
{{
  "questions": [
    {{
      "question": "The question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "The exact correct option string",
      "explanation": "Detailed explanation of why this answer is correct"
    }}
  ]
}}

Do not return markdown.
Do not return conversational explanations outside the JSON structure.
Return JSON only.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    data = json.loads(text)
    return extract_list_from_json(data)


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
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    return json.loads(text)


# ─────────────────────────────────────────────
# CODING CHALLENGES (bulk)
# ─────────────────────────────────────────────

def generate_coding_challenges(technology: str, topic: str, difficulty: str = "Beginner", count: int = 3):
    prompt = f"""
Generate {count} {technology} programming coding challenges in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON with a "challenges" key containing a list of challenges with this structure:
{{
  "challenges": [
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
}}

Do not return markdown.
Do not return conversational explanations outside the JSON array.
Return JSON only.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    data = json.loads(text)
    return extract_list_from_json(data)


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
2. Return ONLY valid JSON as an object containing a list representing the exercises with this structure:
{{
  "exercises": [
    {{
      "title": "Exercise Title",
      "type": "Output Prediction" | "Fill in the Blank" | "Debug the Code" | "Short Coding Exercise" | "Code Completion",
      "question": "Question text explaining what needs to be done",
      "code": "{technology} code block related to the question (use empty string if no code is needed)",
      "expected_answer": "The expected solution or answer",
      "hint": "Subtle hint to help the user",
      "explanation": "Detailed explanation of why the expected answer is correct"
    }}
  ]
}}

CRITICAL RULES:
- Do NOT generate Multiple Choice Questions (MCQs).
- Do NOT include "options", "choices", "answer", or other extra fields in the JSON.
- Every exercise object must strictly have ONLY these keys: "title", "type", "question", "code", "expected_answer", "hint", "explanation".

Do not return markdown.
Do not return conversational explanations outside the JSON array.
Return JSON only.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    data = json.loads(text)
    return extract_list_from_json(data)


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
5. Return ONLY a valid JSON object containing a "questions" key with list of question objects where each object has exactly these keys: "type", "topic", "question".

Example output format:
{{
  "questions": [
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
}}

Do not return markdown formatting blocks.
Do not return any introductory or trailing conversational explanation text.
Return ONLY the JSON.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    data = json.loads(text)
    return extract_list_from_json(data)


# ─────────────────────────────────────────────
# INTERVIEW EVALUATION
# ─────────────────────────────────────────────

def evaluate_interview_session(qa_list: list, technology: str = "Python"):
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

Do not return markdown formatting blocks.
Do not return any conversational text.
Return ONLY the JSON.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    return json.loads(text)


# ─────────────────────────────────────────────
# INTERVIEW BANK QUESTIONS
# ─────────────────────────────────────────────

def generate_interview_bank_questions(technology: str, category: str, count: int = 5):
    prompt = f"""
Generate {count} {technology} mock interview questions for an interview question bank.
Category: {category}

For each question, formulate a comprehensive bank item in JSON format:
- question: The interview question text. Make it realistic and specific to {technology} or software engineering concepts matching the category '{category}'.
- ideal_answer: A detailed model answer that a candidate should ideally give.
- keywords: A list of 4-6 specific technical key terms/phrases that must be inside the candidate's answer for scoring.
- points: A list of 3-4 key conceptual details or hints that suggest missing content if not touched upon.

Return ONLY a valid JSON object containing a "questions" key with list of question objects with this structure:
{{
  "questions": [
    {{
      "question": "...",
      "ideal_answer": "...",
      "keywords": ["...", "..."],
      "points": ["...", "..."]
    }}
  ]
}}

Do not return markdown formatting blocks.
Do not return any conversational text.
Return ONLY the JSON.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    data = json.loads(text)
    return extract_list_from_json(data)


# ─────────────────────────────────────────────
# ASSIGNMENTS
# ─────────────────────────────────────────────

def generate_assignments(technology: str, topic: str, difficulty: str = "Beginner", count: int = 3):
    prompt = f"""
Generate {count} {technology} programming assignments in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON with an "assignments" key containing a list:
{{
  "assignments": [
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
}}

Do not return markdown.
Return JSON only.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    data = json.loads(text)
    return extract_list_from_json(data)


# ─────────────────────────────────────────────
# PROJECTS
# ─────────────────────────────────────────────

def generate_projects(technology: str, topic: str, difficulty: str = "Beginner", count: int = 2):
    prompt = f"""
Generate {count} {technology} project ideas in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON with a "projects" key containing a list:
{{
  "projects": [
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
}}

Do not return markdown.
Return JSON only.
"""
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
    data = json.loads(text)
    return extract_list_from_json(data)


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
    response_text = call_openai_gpt(prompt)
    text = clean_json_formatting(response_text)
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
