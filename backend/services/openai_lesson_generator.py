import os
import json
import logging
import traceback
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Locate backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

if not API_KEY:
    logger.error("OPENAI_API_KEY not found in backend/.env configuration!")
    raise Exception("OPENAI_API_KEY not found in .env file")

client = OpenAI(api_key=API_KEY)

def generate_complete_lesson(lesson_id: str, topic: str, difficulty: str = "Beginner") -> dict:
    """
    Generates a full educational lesson module using a single OpenAI ChatCompletion request.
    Includes extremely detailed theory (2500-5000 words), 10 code examples, 10 practice questions,
    15 MCQs, 5 coding challenges, and 5 industry use cases.
    
    Implements a single retry if JSON decoding or key verification fails.
    """
    prompt = f"""
Generate a highly comprehensive, detailed, and production-ready Python lesson module in JSON format.
This module is for a Python Learning Management System. You must generate all items in one single request.

Topic: {topic}
Difficulty: {difficulty}
Lesson ID: {lesson_id}

You must return ONLY a raw JSON object with the following keys and data types:

{{
  "title": "Title of the lesson (string)",
  "description": "A high-level summary description of what this lesson covers (string)",
  "theory": "The comprehensive educational text, targeting 2500 to 5000 words. Format using GitHub Markdown. Ensure it is extremely detailed and includes:
             1. Introduction
             2. Concept Explanation
             3. Why it exists (motivation, historical context/problems solved)
             4. How it works internally (interpreter mechanism, memory layout)
             5. Syntax (detailed explanations of each component)
             6. Rules, constraints, and edge cases
             7. Inline code examples embedded in the text showing usage
             8. Visual text-based diagrams or Markdown tables displaying flowcharts, state transitions, or memory states
             9. Common Errors & compiler/runtime behaviors
             10. Best Practices & design patterns
             11. Professional/Industry Tips
             12. Core Technical Interview Questions (5 interview questions with detail)
             13. A concise section summary.
             Make this text long, structured, clear, and comprehensive.",
  "code_examples": [
    // Generate AT LEAST 10 detailed code examples
    {{
      "title": "Clear title of the example (string)",
      "code": "Actual runnable Python code block (string)",
      "output": "Expected stdout output or execution result (string)",
      "explanation": "Line-by-line detailed explanation of how this code works (string)",
      "difficulty": "Difficulty level: Beginner, Intermediate, or Advanced (string)"
    }}
  ],
  "real_world_examples": [
    // Generate AT LEAST 5 industry use cases (e.g. Banking, Healthcare, AI, Web Dev, Automation, Data Processing)
    {{
      "industry": "Industry Name (string)",
      "use_case": "Specific problem statement (string)",
      "solution_description": "Explanation of how the Python topic resolves this industry problem (string)",
      "code_snippet": "A brief Python snippet showing the solution (string)"
    }}
  ],
  "common_mistakes": [
    // List of typical newbie errors or bugs (array of strings, minimum 5)
    "Mistake description and code snippet representation, and the corrected version"
  ],
  "best_practices": [
    // Industry guide rules (array of strings, minimum 5)
    "Guidelines on when and how to implement this pattern or construct efficiently"
  ],
  "summary": "Full concluding summary emphasizing key takeaways of the topic (string)",
  "practice_questions": [
    // Generate EXACTLY 10 practice questions with detailed code/text solutions
    {{
      "question": "A fill-in-the-blank, prediction, or debugging question statement (string)",
      "solution": "The correct answer or source code solution explanation (string)"
    }}
  ],
  "mcqs": [
    // Generate EXACTLY 15 multi-choice questions
    {{
      "question": "Clear concept validation question (string)",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Must contain exactly 4 options
      "answer": "Option content matching exactly one of the options (string)",
      "explanation": "Clear educational explanation of why this option is correct and why others are wrong (string)",
      "difficulty": "Difficulty: Beginner, Intermediate, or Advanced (string)"
    }}
  ],
  "coding_challenges": [
    // Generate EXACTLY 5 interactive coding challenges
    {{
      "title": "Challenge title (string)",
      "problem_statement": "Detailed coding challenge description with constraints (string)",
      "starter_code": "Python skeleton code with basic def and pass statements (string)",
      "hints": ["Hint 1", "Hint 2"], // Array of 1-3 helpful hints
      "expected_output": "Expected stdout or result returned (string)",
      "sample_input": "Sample call argument or stdin (string)",
      "sample_output": "Expected output from the sample input (string)",
      "solution": "Complete correct Python code solution for testing validation (string)",
      "explanation": "Breakdown of the challenge logic and time/space complexity (string)"
    }}
  ],
  "xp_reward": 100 // Integer XP reward
}}

IMPORTANT:
- Ensure the JSON is 100% syntactically valid. Double quote all keys.
- Do NOT wrap your output in markdown ```json ... ``` formatting blocks. Output the pure JSON raw string directly.
"""
    
    required_keys = [
        "title", "description", "theory", "code_examples", "real_world_examples",
        "common_mistakes", "best_practices", "summary", "practice_questions",
        "mcqs", "coding_challenges", "xp_reward"
    ]
    
    for attempt in range(1, 3):
        logger.info(f"Attempting to generate complete lesson for Topic: '{topic}', Attempt {attempt}/2...")
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "You are a master Python educator that generates structured computer science curricula in raw JSON objects."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=15000,
                temperature=0.3
            )
            raw_content = response.choices[0].message.content.strip()
            
            # Parse JSON
            data = json.loads(raw_content)
            
            # Validate required keys at root level
            missing = [k for k in required_keys if k not in data]
            if missing:
                raise ValueError(f"Missing required root-level keys: {missing}")
                
            # Basic validation of key arrays
            if not isinstance(data.get("code_examples"), list) or len(data["code_examples"]) < 10:
                logger.warning(f"Generated {len(data.get('code_examples', []))} code examples. Expecting at least 10.")
            if not isinstance(data.get("mcqs"), list) or len(data["mcqs"]) < 15:
                logger.warning(f"Generated {len(data.get('mcqs', []))} MCQs. Expecting exactly 15.")
            if not isinstance(data.get("coding_challenges"), list) or len(data["coding_challenges"]) < 5:
                logger.warning(f"Generated {len(data.get('coding_challenges', []))} coding challenges. Expecting exactly 5.")
            if not isinstance(data.get("practice_questions"), list) or len(data["practice_questions"]) < 10:
                logger.warning(f"Generated {len(data.get('practice_questions', []))} practice questions. Expecting exactly 10.")
            if not isinstance(data.get("real_world_examples"), list) or len(data["real_world_examples"]) < 5:
                logger.warning(f"Generated {len(data.get('real_world_examples', []))} real-world examples. Expecting at least 5.")

            logger.info("OpenAI Lesson Generation completed and validated successfully.")
            return data
            
        except Exception as e:
            logger.error(f"Attempt {attempt} failed with error: {str(e)}")
            if attempt == 2:
                logger.critical("All attempts to generate valid lesson JSON via OpenAI failed!")
                raise e
