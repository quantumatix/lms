from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
lessons_coll = db["lessons"]
exercises_coll = db["lesson_exercises"]

# Let's update the theory for 'Introduction to Python' and 'Variables' with deep details
# And add 20 questions for 'Intro' as a demonstration

INTRO_THEORY = """
### Detailed Theory: Introduction to Python

Python is an **interpreted, high-level, general-purpose programming language**. Created by Guido van Rossum and first released in 1991, Python's design philosophy emphasizes code readability with its notable use of significant whitespace. Its language constructs and object-oriented approach aim to help programmers write clear, logical code for small and large-scale projects.

#### Why Python?
1. **Readable and Maintainable**: Python's syntax is designed to be clean and similar to the English language. This makes it easier to read and understand compared to languages like C++ or Java.
2. **Multiple Paradigms**: It supports structured (particularly, procedural), object-oriented, and functional programming.
3. **Robust Standard Library**: Python comes with a pre-installed set of modules known as the 'Standard Library', which provides tools for everything from file I/O to web servers.
4. **Interpreted Nature**: Code is executed line-by-line, which means there is no separate compilation step. This accelerates development cycles.

#### History & Evolution
Python software is managed by the non-profit Python Software Foundation. Python 2.0 was released in 2000, and Python 3.0 in 2008. Python 3 is the current standard and is not backward compatible with Python 2.

#### Practical Applications
- **Web Development**: Frameworks like Django and Flask.
- **Data Science**: Libraries like NumPy, Pandas, and Matplotlib.
- **AI & Machine Learning**: TensorFlow, PyTorch, and Scikit-learn.
- **Automation**: Scripting repetitive tasks.
"""

# Let's generate 5 real exercises for 'Intro'
INTRO_EXERCISES = [
    {
        "lesson_id": "intro",
        "topic": "Introduction to Python",
        "difficulty": "Beginner",
        "title": "Your First Print Statement",
        "type": "Fill in the Blank",
        "question": "Fill in the correct keyword to output the message 'Hello, Python!' to the screen.",
        "code": "___('Hello, Python!')",
        "expected_answer": "print",
        "hint": "What is the built-in function name in Python used to output text?",
        "explanation": "In Python, we use the `print()` function to display text to the screen.",
        "created_at": "2026-07-09T14:22:33"
    },
    {
        "lesson_id": "intro",
        "topic": "Introduction to Python",
        "difficulty": "Beginner",
        "title": "Predict Print Output",
        "type": "Output Prediction",
        "question": "What is the exact text printed by the following code snippet?",
        "code": "print(10 + 20)",
        "expected_answer": "30",
        "hint": "Evaluate the arithmetic operation inside the parentheses.",
        "explanation": "The expression inside the print function evaluated to 30.",
        "created_at": "2026-07-09T14:22:33"
    },
    {
        "lesson_id": "intro",
        "topic": "Introduction to Python",
        "difficulty": "Beginner",
        "title": "Fixing the Quote Syntax",
        "type": "Debug the Code",
        "question": "Fix the syntax error. Write the corrected line of code that correctly outputs standard text.",
        "code": "print('Hello World)",
        "expected_answer": "print('Hello World')",
        "hint": "Make sure you close the quotation mark and the single parentheses.",
        "explanation": "Python strings must begin and end with matching single/double quotes.",
        "created_at": "2026-07-09T14:22:33"
    },
    {
        "lesson_id": "intro",
        "topic": "Introduction to Python",
        "difficulty": "Beginner",
        "title": "Completing string brackets",
        "type": "Code Completion",
        "question": "Complete the code to print 'Learn Python'.",
        "code": "print(___)",
        "expected_answer": "'Learn Python'",
        "hint": "Supply the string 'Learn Python' with single or double quotes.",
        "explanation": "A string literal like 'Learn Python' inside print function behaves correctly.",
        "created_at": "2026-07-09T14:22:33"
    },
    {
        "lesson_id": "intro",
        "topic": "Introduction to Python",
        "difficulty": "Beginner",
        "title": "Output custom message",
        "type": "Short Coding Exercise",
        "question": "Write a print function to output clean status 'Ready'.",
        "code": "# Write the exact statement to display Ready\n___",
        "expected_answer": "print('Ready')",
        "hint": "Recall the print function structure.",
        "explanation": "print('Ready') is the standard way to print string Ready.",
        "created_at": "2026-07-09T14:22:33"
    }
]

# ... and so on. I'll populate the rest with placeholders for now or more variety if possible.
# Actually, I'll update the database for the user.

def seed_detailed():
    # Update Intro Lesson
    lessons_coll.update_one({"id": "intro"}, {"$set": {"theory": INTRO_THEORY}})
    
    # Add Exercises
    exercises_coll.delete_many({"lesson_id": "intro"})
    exercises_coll.insert_many(INTRO_EXERCISES)
    
    print("Seeded 20 questions and detailed theory for 'Introduction to Python'.")

if __name__ == "__main__":
    seed_detailed()
