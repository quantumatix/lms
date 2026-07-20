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


def generate_python_lesson(topic: str, difficulty: str = "Beginner"):
    prompt = f"""
Generate a complete Python lesson in JSON format.

Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON with this structure:

{{
  "title": "",
  "description": "",
  "category": "Python",
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


def generate_python_mcqs(topic: str, count: int = 5, difficulty: str = "Beginner"):
    prompt = f"""
Generate {count} multiple choice questions (MCQ) for Python in JSON format.
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


def generate_python_challenge(topic: str, difficulty: str = "Beginner"):
    prompt = f"""
Generate a Python programming coding challenge in JSON format.
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


def generate_python_coding_challenges(topic: str, difficulty: str = "Beginner", count: int = 3):
    prompt = f"""
Generate {count} Python programming coding challenges in JSON format.
Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON as a list of challenges with this structure:
[
  {{
    "title": "Challenge Title",
    "problem": "Problem description showing constraints and requirements",
    "difficulty": "{difficulty}",
    "starter_code": "Initial setup code, like def my_func():",
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


def generate_python_practice_exercises(topic: str, difficulty: str = "Beginner", count: int = 5):
    prompt = f"""
Generate {count} Python programming practice exercises in JSON format.
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
    "type": "Output Prediction" | "Fill in the Blank" | "Debug the Code" | "Short Coding Exercise" | "Code Completion",
    "question": "Question text explaining what needs to be done",
    "code": "Python code block related to the question (use empty string if no code is needed)",
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


FALLBACK_QUESTIONS = {
    "Technical": [
        {"topic": "Data Types", "question": "What is the difference between mutable and immutable data types in Python? Give examples of both."},
        {"topic": "Functions", "question": "Explain the difference between a function and a method in Python. How do you pass arguments by reference or value?"},
        {"topic": "OOP", "question": "What is inheritance in Object-Oriented Programming, and how does Python support multiple inheritance?"},
        {"topic": "Exception Handling", "question": "Explain the purpose of 'try', 'except', 'else', and 'finally' blocks in Python."},
        {"topic": "File Handling", "question": "Explain the difference between 'r', 'w', 'a', and 'r+' file opening modes in Python."},
        {"topic": "Loops", "question": "What is the differences between 'for' and 'while' loops, and when should you use an 'else' block with loops?"},
        {"topic": "Modules", "question": "What is the difference between importing a module using 'import module_name' versus 'from module_name import function_name'?"},
        {"topic": "Variables", "question": "What is variable shadowing in Python, and how do local and global scopes work?"},
        {"topic": "Operators", "question": "What is the difference between the 'is' operator and the '==' operator in Python?"}
    ],
    "Coding": [
        {"topic": "Loops", "question": "Write a Python function that takes a list of numbers and returns the second largest number in the list without using built-in sorting functions."},
        {"topic": "Functions", "question": "Write a recursive Python function to compute the factorial of a given number."},
        {"topic": "OOP", "question": "Create a Python class 'Car' with attributes 'make', 'model', and 'year'. Add a method 'get_description' that returns a formatted string containing these attributes."},
        {"topic": "File Handling", "question": "Write a Python script to read a file named 'data.txt' and count the frequency of each word, printing the results in descending order."},
        {"topic": "Exception Handling", "question": "Write a Python snippet that prompts the user for age, raises a CustomException if the age is negative, and safely catches it."},
        {"topic": "Data Types", "question": "Write a Python function to merge two dictionaries. If a key is present in both, sum their values."},
        {"topic": "Variables", "question": "Write a Python script that swaps the values of two variables without using a third helper variable."}
    ],
    "Scenario": [
        {"topic": "Exception Handling", "question": "You are writing a program to process payments. If the network goes down mid-step, how would you design your exception handling block to prevent double charging?"},
        {"topic": "OOP", "question": "If you are designing a dashboard system with different types of widgets, how would you use polymorphism to draw them dynamically?"},
        {"topic": "File Handling", "question": "You need to process a huge log file (10GB) using Python. How would you read and parse the file without running out of RAM memory?"},
        {"topic": "Modules", "question": "You are writing a modular application and find two files imports each other, causing a circular dependecy error. How would you refactor the code to fix this?"}
    ],
    "Behavioral": [
        {"topic": "General", "question": "Describe a situation where you had to work on a Python codebase created by someone else. How did you get familiar with the code?"},
        {"topic": "General", "question": "Tell me about a time you found a critical bug in code that was about to go live. What did you do?"},
        {"topic": "General", "question": "How do you handle situations where a team member disagrees with your variable naming or function structure?"}
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


def generate_interview_questions(username: str, difficulty: str, number_of_questions: int, profile: dict):
    weak_topics = profile.get("weak_topics", [])
    strong_topics = profile.get("strong_topics", [])
    
    # Calculate exact counts of questions according to key percentages:
    # 40% Technical Theory, 30% Coding, 20% Scenario-based, 10% Behavioral
    technical_count = round(number_of_questions * 0.40)
    coding_count = round(number_of_questions * 0.30)
    scenario_count = round(number_of_questions * 0.20)
    behavioral_count = number_of_questions - (technical_count + coding_count + scenario_count)
    
    if behavioral_count < 0:
        behavioral_count = 0

    try:
        prompt = f"""
Generate a personalized Python mock interview in JSON format.
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
1. Ground the questions in Python core concepts (Variables, Data Types, Operators, Loops, Functions, OOP, File Handling, Exception Handling, Modules).
2. The questions should match the difficulty level: {difficulty}.
3. Prioritize setting the topic of the questions to the student's weak topics. Only use strong topics for a minority of the questions (e.g., 20-30%).
4. For behavioral questions, the topic can be "General" or a specific professional aspect of programming.
5. Return ONLY a valid JSON array of question objects where each object has exactly these keys: "type", "topic", "question".

Example output format:
[
  {{
    "type": "Technical",
    "topic": "OOP",
    "question": "Describe encapsulation and how it is implemented in Python."
  }},
  {{
    "type": "Coding",
    "topic": "Loops",
    "question": "Write a Python function to solve..."
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


def get_fallback_evaluation(qa_list: list):
    # Simple hardcoded fallback values for robustness
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
        "summary": "Fallback Evaluation. Good initial coding effort. Spend more time practicing scenario-based OOP questions.",
        "question_feedback": question_feedback
    }


def evaluate_interview_session(qa_list: list):
    try:
        prompt = f"""
Evaluate the following student answers from a Python mock interview.

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

