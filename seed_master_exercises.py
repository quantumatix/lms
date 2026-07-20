from pymongo import MongoClient
import datetime

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
lessons_coll = db["lessons"]
exercises_coll = db["lesson_exercises"]

def get_exercises(topic_id, title, difficulty="Beginner"):
    exercises = []
    
    # 1. Fill in the Blank
    exercises.append({
        "lesson_id": topic_id,
        "topic": title,
        "difficulty": difficulty,
        "title": f"Fill in the Blank: {title} Definition",
        "type": "Fill in the Blank",
        "question": f"Complete the code to define a simple function in Python.",
        "code": "___ my_function():\n    print(\"Hello from " + title + "!\")\n\nmy_function()",
        "expected_answer": "def",
        "hint": "Use the standard three-letter keyword used to define functions in Python.",
        "explanation": "The 'def' keyword is used to start a function definition syntax.",
        "created_at": datetime.datetime.now().isoformat()
    })
    
    # 2. Output Prediction
    exercises.append({
        "lesson_id": topic_id,
        "topic": title,
        "difficulty": difficulty,
        "title": f"Output Prediction: {title} Variables",
        "type": "Output Prediction",
        "question": "What is the exact output printed by the following code snippet?",
        "code": "x = 10\ny = 5\nprint(x + y)",
        "expected_answer": "15",
        "hint": "Evaluate the arithmetic operation: 10 + 5.",
        "explanation": "The print function evaluates x + y where x is 10 and y is 5, printing 15.",
        "created_at": datetime.datetime.now().isoformat()
    })
    
    # 3. Debug the Code
    exercises.append({
        "lesson_id": topic_id,
        "topic": title,
        "difficulty": difficulty,
        "title": f"Debug the Code: Equality Check",
        "type": "Debug the Code",
        "question": "Fix the line with comparison error. Write the correct 'if' condition statement checking if value equals 5.",
        "code": "value = 5\nif value = 5:\n    print(\"Matches!\")",
        "expected_answer": "if value == 5:",
        "hint": "Ensure you are using the comparison equality operator instead of assignment.",
        "explanation": "Use == to compare values in Python. Single = is for assignment.",
        "created_at": datetime.datetime.now().isoformat()
    })
    
    # 4. Code Completion
    exercises.append({
        "lesson_id": topic_id,
        "topic": title,
        "difficulty": difficulty,
        "title": f"Code Completion: Append to List",
        "type": "Code Completion",
        "question": "Complete the list built-in method to append 4 to the list.",
        "code": "my_list = [1, 2, 3]\nmy_list.___(___)\nprint(my_list)  # Output should be [1, 2, 3, 4]",
        "expected_answer": "append(4)",
        "hint": "What list method adds an element to the end of a list? Specify method and argument.",
        "explanation": "The append() method is used to add an item to the end of a list.",
        "created_at": datetime.datetime.now().isoformat()
    })

    # 5. Short Coding Exercise
    exercises.append({
        "lesson_id": topic_id,
        "topic": title,
        "difficulty": difficulty,
        "title": f"Short Coding Exercise: Multiply Value",
        "type": "Short Coding Exercise",
        "question": "Write a line of code to multiply key variable 'val' by 10.",
        "code": "def multiply_ten(val):\n    # Write return statement here\n    return ___",
        "expected_answer": "val * 10",
        "hint": "Use the * operator to multiply.",
        "explanation": "val * 10 multiplies the variable val by ten.",
        "created_at": datetime.datetime.now().isoformat()
    })

    return exercises

def seed_all_questions():
    lessons = list(lessons_coll.find({}, {"id": 1, "title": 1, "difficulty": 1}))
    all_exercises = []
    
    for l in lessons:
        diff = l.get("difficulty", "Beginner")
        all_exercises.extend(get_exercises(l["id"], l["title"], diff))
    
    exercises_coll.delete_many({})
    exercises_coll.insert_many(all_exercises)
    print(f"Successfully seeded {len(all_exercises)} practice exercises.")

if __name__ == "__main__":
    seed_all_questions()

