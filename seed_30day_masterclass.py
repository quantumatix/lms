from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
lessons_coll = db["lessons"]
exercises_coll = db["lesson_exercises"]

SYLLABUS_30_DAYS = [
    # WEEK 1: THE FOUNDATIONS
    {"id": "day1", "week": 1, "title": "Day 1: Introduction to Python & Environment", "cat": "Basic", "desc": "Setup and your first Python program."},
    {"id": "day2", "week": 1, "title": "Day 2: Variables, Constants & Comments", "cat": "Basic", "desc": "Storing data and documenting code."},
    {"id": "day3", "week": 1, "title": "Day 3: Data Types & Type Casting", "cat": "Basic", "desc": "Strings, Integers, Floats and Booleans."},
    {"id": "day4", "week": 1, "title": "Day 4: Operators & Expressions", "cat": "Basic", "desc": "Arithmetic, Comparison and Logical operators."},
    {"id": "day5", "week": 1, "title": "Day 5: Working with Input/Output", "cat": "Basic", "desc": "Interacting with users and formatting output."},
    {"id": "day6", "week": 1, "title": "Day 6: Control Flow I: If-Else Logic", "cat": "Basic", "desc": "Decision making in Python."},
    {"id": "day7", "week": 1, "title": "Day 7: Control Flow II: Match-Case (Python 3.10+)", "cat": "Basic", "desc": "Modern pattern matching."},

    # WEEK 2: LOOPS & DATA STRUCTURES
    {"id": "day8", "week": 2, "title": "Day 8: For Loops & range()", "cat": "Intermediate", "desc": "Iteration over sequences."},
    {"id": "day9", "week": 2, "title": "Day 9: While Loops & break/continue", "cat": "Intermediate", "desc": "Condition-based repetition."},
    {"id": "day10", "week": 2, "title": "Day 10: Master Lists: Part I", "cat": "Intermediate", "desc": "Indexing, Slicing and Methods."},
    {"id": "day11", "week": 2, "title": "Day 11: Master Lists: Part II", "cat": "Intermediate", "desc": "Nested lists and List Comprehension."},
    {"id": "day12", "week": 2, "title": "Day 12: Tuples & Sets", "cat": "Intermediate", "desc": "Immutable data and Unique collections."},
    {"id": "day13", "week": 2, "title": "Day 13: Dictionaries: Keys & Values", "cat": "Intermediate", "desc": "Mapping and fast data lookup."},
    {"id": "day14", "week": 2, "title": "Day 14: String Manipulation Mastery", "cat": "Intermediate", "desc": "Regex, formatting, and string methods."},

    # WEEK 3: FUNCTIONS & OOP
    {"id": "day15", "week": 3, "title": "Day 15: Introduction to Functions", "cat": "Advanced", "desc": "Defining and calling reusable code."},
    {"id": "day16", "week": 3, "title": "Day 15: Arguments & Scope", "cat": "Advanced", "desc": "*args, **kwargs and Global vs Local."},
    {"id": "day17", "week": 3, "title": "Day 17: Lambda & High-Order Functions", "cat": "Advanced", "desc": "Map, Filter and Reduce."},
    {"id": "day18", "week": 3, "title": "Day 18: OOP: Classes & Objects", "cat": "Advanced", "desc": "Blueprint thinking in Python."},
    {"id": "day19", "week": 3, "title": "Day 19: OOP: Inheritance & Mixins", "cat": "Advanced", "desc": "Building hierarchical systems."},
    {"id": "day20", "week": 3, "title": "Day 20: OOP: Encapsulation & Polymorphism", "cat": "Advanced", "desc": "Hiding data and multi-form methods."},
    {"id": "day21", "week": 3, "title": "Day 21: Decorators & Iterators", "cat": "Advanced", "desc": "Advanced function wrappers."},

    # WEEK 4: REAL WORLD & PROJECTS
    {"id": "day22", "week": 4, "title": "Day 22: File Handling (I/O)", "cat": "Pro", "desc": "Read/Write files and context managers."},
    {"id": "day23", "week": 4, "title": "Day 23: Exception Handling Mastery", "cat": "Pro", "desc": "Try, Except, Finally and Custom errors."},
    {"id": "day24", "week": 4, "title": "Day 24: Modules & Package Management", "cat": "Pro", "desc": "Venv, pip and project structure."},
    {"id": "day25", "week": 4, "title": "Day 25: Working with APIs (Requests)", "cat": "Pro", "desc": "Connecting Python to the web."},
    {"id": "day26", "week": 4, "title": "Day 26: Databases in Python (SQLite)", "cat": "Pro", "desc": "Storing data persistently."},
    {"id": "day27", "week": 4, "title": "Day 27: Introduction to FastAPI", "cat": "Pro", "desc": "Building modern web backends."},
    {"id": "day28", "week": 4, "title": "Day 28: Data Analysis (Pandas/NumPy)", "cat": "Pro", "desc": "Introduction to data engineering."},
    {"id": "day29", "week": 4, "title": "Day 29: Unit Testing with PyTest", "cat": "Pro", "desc": "Ensuring code reliability."},
    {"id": "day30", "week": 4, "title": "Day 30: Final Project: Build an AI Tool", "cat": "Pro", "desc": "Deploying your knowledge."}
]

def generate_questions(lesson_id, title):
    import datetime
    exercises = []
    
    # 1. Fill in the Blank
    exercises.append({
        "lesson_id": lesson_id,
        "topic": title,
        "difficulty": "Beginner",
        "title": f"Fill in the Blank: {title} Syntax",
        "type": "Fill in the Blank",
        "question": f"Complete the code block to implement the syntax taught in {title}.",
        "code": "# Complete the code\n___ x = 10:\n    print(\"Matches!\")",
        "expected_answer": "if",
        "hint": "What is the keyword used for conditional testing in Python?",
        "explanation": "The 'if' keyword starts a conditional check block.",
        "created_at": datetime.datetime.now().isoformat()
    })
    
    # 2. Output Prediction
    exercises.append({
        "lesson_id": lesson_id,
        "topic": title,
        "difficulty": "Beginner",
        "title": f"Output Prediction: {title} Evaluation",
        "type": "Output Prediction",
        "question": "What will be printed when this code is executed?",
        "code": "a = 5\nb = a * 2\nprint(b)",
        "expected_answer": "10",
        "hint": "Multiply 5 by 2.",
        "explanation": "5 times 2 is 10, which is assigned to b and printed.",
        "created_at": datetime.datetime.now().isoformat()
    })
    
    # 3. Debug the Code
    exercises.append({
        "lesson_id": lesson_id,
        "topic": title,
        "difficulty": "Beginner",
        "title": f"Debug the Code: Print statement",
        "type": "Debug the Code",
        "question": "Fix the syntax error in the print definition.",
        "code": "print \"Hello World\"",
        "expected_answer": "print(\"Hello World\")",
        "hint": "In Python 3, print is a function and requires parentheses.",
        "explanation": "Python 3 print requires surrounding parentheses around arguments.",
        "created_at": datetime.datetime.now().isoformat()
    })
    
    # 4. Code Completion
    exercises.append({
        "lesson_id": lesson_id,
        "topic": title,
        "difficulty": "Beginner",
        "title": f"Code Completion: List print",
        "type": "Code Completion",
        "question": "Complete function definition to print elements.",
        "code": "def print_elements(lst):\n    for element ___ lst:\n        print(element)",
        "expected_answer": "in",
        "hint": "What membership/looping keyword iterates through collections?",
        "explanation": "The 'in' keyword is used in for-loops to iterate over items of a sequence.",
        "created_at": datetime.datetime.now().isoformat()
    })

    # 5. Short Coding Exercise
    exercises.append({
        "lesson_id": lesson_id,
        "topic": title,
        "difficulty": "Beginner",
        "title": f"Short Coding Exercise: Square a Value",
        "type": "Short Coding Exercise",
        "question": "Write a line of code to square x and return it.",
        "code": "def square(x):\n    # Write return statement\n    return ___",
        "expected_answer": "x ** 2",
        "hint": "Use exponentiation operator **.",
        "explanation": "x ** 2 evaluates x raised to the power of 2.",
        "created_at": datetime.datetime.now().isoformat()
    })

    return exercises

def seed():
    lessons_coll.delete_many({})
    exercises_coll.delete_many({})
    
    flat_lessons = []
    all_exercises = []
    
    for l in SYLLABUS_30_DAYS:
        flat_lessons.append({
            "id": l["id"],
            "title": l["title"],
            "category_id": f"week{l['week']}",
            "category_title": f"Week {l['week']}: {l['cat']}",
            "description": l["desc"],
            "theory": f"# {l['title']} Detailed Theory\n\nWelcome to your 30-day Python masterclass. This lesson covers {l['desc']} in depth.\n\n### Core Concepts\n1. Foundational Syntax\n2. Implementation Details\n3. Best Practices (PEP 8)\n\n### Practice & Implementation\nTo master this, you need to spend 3 hours today: 1 hour on theory, 1 hour on the 20 practice questions, and 1 hour building the micro-project.",
            "code_examples": [{"title": "Implementation", "code": "# Code for " + l["title"] + "\ndef study_today():\n    print('Learning " + l["title"] + "')\n\nstudy_today()"}],
            "key_concepts": ["Logic", "Implementation", "Pythonic Way"],
            "xp_reward": 100
        })
        all_exercises.extend(generate_questions(l["id"], l["title"]))

    lessons_coll.insert_many(flat_lessons)
    exercises_coll.insert_many(all_exercises)
    print(f"30-Day Masterclass seeded: {len(flat_lessons)} lessons, {len(all_exercises)} questions.")

if __name__ == "__main__":
    seed()
