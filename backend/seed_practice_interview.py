from pymongo import MongoClient
import datetime

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

# --- CODING CHALLENGES SEEDING ---
coding_challenges_collection = db["coding_challenges"]

CHALLENGES = [
    # EASY
    {
        "id": "ch_1",
        "lesson_id": "intro",
        "title": "The Simple Hello",
        "description": "Write a function `greet()` that returns the string 'Hello, Python!'.",
        "difficulty": "Easy",
        "initial_code": "def greet():\n    # Your code here\n    pass",
        "test_cases": [
            {"input": "greet()", "expected": "Hello, Python!"}
        ],
        "hints": ["Return a string enclosed in quotes.", "Make sure the spelling and punctuation match exactly."],
        "xp_reward": 50
    },
    {
        "id": "ch_2",
        "lesson_id": "variables",
        "title": "Variable Swapper",
        "description": "Given two variables `a` and `b`, swap their values and return them as a tuple.",
        "difficulty": "Easy",
        "initial_code": "def swap(a, b):\n    # Your code here\n    pass",
        "test_cases": [
            {"input": "swap(10, 20)", "expected": "(20, 10)"},
            {"input": "swap('X', 'Y')", "expected": "('Y', 'X')"}
        ],
        "hints": ["You can use a temporary variable.", "Python allows a, b = b, a for easy swapping!"],
        "xp_reward": 50
    },
    # MEDIUM
    {
        "id": "ch_3",
        "lesson_id": "lists",
        "title": "Sum of Evens",
        "description": "Write a function `sum_evens(nums)` that takes a list of numbers and returns the sum of all even numbers.",
        "difficulty": "Medium",
        "initial_code": "def sum_evens(nums):\n    # Your code here\n    pass",
        "test_cases": [
            {"input": "sum_evens([1, 2, 3, 4, 5, 6])", "expected": "12"},
            {"input": "sum_evens([1, 3, 5])", "expected": "0"}
        ],
        "hints": ["Use a for loop to iterate through the list.", "Use the modulus operator (%) to check if a number is even."],
        "xp_reward": 100
    },
    # HARD
    {
        "id": "ch_4",
        "lesson_id": "loops",
        "title": "Prime Factorization",
        "description": "Write a function `get_factors(n)` that returns a list of prime factors of a number `n`.",
        "difficulty": "Hard",
        "initial_code": "def get_factors(n):\n    # Your code here\n    pass",
        "test_cases": [
            {"input": "get_factors(12)", "expected": "[2, 2, 3]"},
            {"input": "get_factors(31)", "expected": "[31]"}
        ],
        "hints": ["Start dividing by the smallest prime number (2).", "Continuously divide until it's no longer divisible, then move to the next number."],
        "xp_reward": 200
    }
]

# --- INTERVIEW QUESTIONS SEEDING ---
interview_questions_collection = db["interview_questions"]

INTERVIEW_QUESTIONS = [
    # BEGINNER
    {
        "id": "int_1",
        "category": "Beginner",
        "question": "What is the difference between a List and a Tuple in Python?",
        "ideal_answer": "The main difference is Mutability. Lists are mutable (can be changed after creation), while Tuples are immutable (cannot be changed). Lists use square brackets [], while Tuples use parentheses ().",
        "keywords": ["mutable", "immutable", "brackets", "parentheses", "change"],
        "points": ["Mutability difference", "Syntax difference (brackets vs parentheses)", "Performance context (Tuples are faster)"]
    },
    # INTERMEDIATE
    {
        "id": "int_2",
        "category": "Intermediate",
        "question": "How does memory management work in Python?",
        "ideal_answer": "Python uses a private heap to store objects. The Python Memory Manager handles the allocation and deallocation of space. Most importantly, it uses Reference Counting and a Garbage Collector to clean up unused objects.",
        "keywords": ["heap", "reference counting", "garbage collector", "allocation", "deallocation"],
        "points": ["Private heap explanation", "Reference counting mechanism", "Garbage collection in cyclic references"]
    },
    # ADVANCED
    {
        "id": "int_3",
        "category": "Advanced",
        "question": "What are Decorators and how do they work?",
        "ideal_answer": "Decorators are a tool for wrapping a function with another function to extend its behavior without permanently modifying it. They use the '@' symbol and leverage the fact that functions are first-class objects in Python.",
        "keywords": ["wrap", "function", "modify", "@", "first-class", "wrapper"],
        "points": ["Wrapping behavior", "@ syntax", "First-class objects context", "Example use case (logging/auth)"]
    },
    # SYSTEM DESIGN
    {
        "id": "int_4",
        "category": "System Design",
        "question": "How would you design a rate-limiting system using Python?",
        "ideal_answer": "A rate-limiter can be implemented using algorithms like Token Bucket or Leaking Bucket. In Python, we can use Redis to store hit counts with an expiration time, using a sliding window approach for accuracy.",
        "keywords": ["token bucket", "leaking bucket", "redis", "sliding window", "expiration"],
        "points": ["Algorithm choice (Token/Leaking Bucket)", "Storage choice (Redis/In-memory)", "Window strategy (Fixed vs Sliding)"]
    }
]

def seed():
    print("Seeding Practice & Interview Data...")
    coding_challenges_collection.delete_many({})
    coding_challenges_collection.insert_many(CHALLENGES)
    
    interview_questions_collection.delete_many({})
    interview_questions_collection.insert_many(INTERVIEW_QUESTIONS)
    print("Successfully seeded challenges and interview questions.")

if __name__ == "__main__":
    seed()
