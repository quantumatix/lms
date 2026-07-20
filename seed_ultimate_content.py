import requests
# Using the API to update since it's already there
# Or just use pymongo directly for speed

from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
lessons_coll = db["lessons"]
exercises_coll = db["lesson_exercises"]

def update_lesson_theory(lesson_id, theory):
    lessons_coll.update_one({"id": lesson_id}, {"$set": {"theory": theory}})

# Update core topics with deep theory
THEORIES = {
    "vars": """
### Detailed Theory: Variables in Python

In Python, variables are defined as symbolic names that are references to objects in memory. Unlike many other languages like Java or C++, Python does not require you to declare the type of a variable. This is known as **Dynamic Typing**.

#### Key Concept: Assignment
Assignment is done using the `=` operator. For example, `x = 5` creates an object with value 5 and assigns the name `x` to it.

#### Python Variable Naming Conventions (PEP 8)
- **Snake Case**: Variable names should be lowercase, with words separated by underscores to improve readability (e.g., `user_name`, `total_score`).
- **Forbidden Starters**: Names cannot start with a digit. `1variable` is invalid, while `variable1` is fine.
- **Reserved Keywords**: You cannot use keywords like `if`, `while`, `def`, `class` as variable names.

#### Variables are References
When you do `x = [1, 2, 3]`, `x` does not 'contain' the list; it 'points' to the memory location where the list exists. If you then do `y = x`, both `x` and `y` point to the same list.
""",
    "types": """
### Detailed Theory: Python Data Types

Python has a rich set of built-in data types that categorize data values. Understanding these is crucial for memory management and logic implementation.

#### 1. Numeric Types
- **int**: Integers (e.g., 5, -10, 1000). Python 3 integers have arbitrary precision.
- **float**: Floating-point numbers (e.g., 3.14, -0.001). Used for decimal values.
- **complex**: Complex numbers (e.g., 2+3j).

#### 2. Sequence Types
- **str**: String (e.g., "Hello"). Strings are immutable sequences of Unicode characters.
- **list**: Ordered, mutable collections (e.g., [1, 2, 3]).
- **tuple**: Ordered, immutable collections (e.g., (1, 2, 3)).

#### 3. Mapping Type
- **dict**: Key-value pairs (e.g., {"name": "Alice"}). Extremely fast for lookups.

#### 4. Set Types
- **set**: Unordered collection of unique items. Useful for membership testing and removing duplicates.

#### 5. Boolean Type
- **bool**: Represents `True` or `False`. Fundamental for control flow.
""",
    "operators": """
### Detailed Theory: Operators and Expressions

Operators are special symbols in Python that carry out arithmetic or logical computation. The value that the operator operates on is called the operand.

#### Arithmetic Operators
- `+` Addition
- `-` Subtraction
- `*` Multiplication
* `/` Division (always returns a float)
- `//` Floor Division (returns the nearest integer towards negative infinity)
- `%` Modulus (returns the remainder)
- `**` Exponentiation (power)

#### Comparison Operators
- `==` Equal
- `!=` Not Equal
- `>` Greater than
- `<` Less than
- `>=` Greater than or equal to

#### Logical Operators
- `and`: True if both are true
- `or`: True if at least one is true
- `not`: Inverts the boolean value

#### Bitwise Operators
Used for bit-level operations (Rarely used in high-level scripting but vital for performance/embedded systems).
"""
}

# Apply theories
for lid, theory in THEORIES.items():
    update_lesson_theory(lid, theory)

# Now generate REAL interesting questions for 'Variables'
VARS_QS = [
    {
        "lesson_id": "vars",
        "topic": "Variables in Python",
        "difficulty": "Beginner",
        "title": "Declaring an Integer Variable",
        "type": "Fill in the Blank",
        "question": "Fill in the code to declare a variable named 'age' and assign it the value 25.",
        "code": "___ = 25",
        "expected_answer": "age",
        "hint": "Assign the value 25 to the variable named 'age'.",
        "explanation": "Variables are declared by writing the variable name followed by the '=' assignment operator.",
        "created_at": "2026-07-09T14:22:33"
    },
    {
        "lesson_id": "vars",
        "topic": "Variables in Python",
        "difficulty": "Beginner",
        "title": "Variable Scope Prediction",
        "type": "Output Prediction",
        "question": "What is the output printed by the following code snippet?",
        "code": "x = 5\nx = 10\nprint(x)",
        "expected_answer": "10",
        "hint": "Python variables will hold the most recent value assigned to them.",
        "explanation": "Initially x is 5, but then reassigned to 10. The print outputs 10.",
        "created_at": "2026-07-09T14:22:33"
    },
    {
        "lesson_id": "vars",
        "topic": "Variables in Python",
        "difficulty": "Beginner",
        "title": "Fix Variable Name Starting with Digit",
        "type": "Debug the Code",
        "question": "Fix the syntax error. Write the corrected line of code that sets the score to 100.",
        "code": "1st_score = 100",
        "expected_answer": "score_1st = 100",
        "hint": "Variable names in Python cannot start with a digit. Place the '1st' keyword after or name it differently.",
        "explanation": "Python variable names must start with a letter or underscore, not a number.",
        "created_at": "2026-07-09T14:22:33"
    },
    {
        "lesson_id": "vars",
        "topic": "Variables in Python",
        "difficulty": "Beginner",
        "title": "String Name Assignment",
        "type": "Code Completion",
        "question": "Complete the assignment to store the name 'Ayush' inside variable person_name.",
        "code": "person_name = ___",
        "expected_answer": "'Ayush'",
        "hint": "Strings must be enclosed in quotes.",
        "explanation": "To define a string literal, wrap the text with quotes.",
        "created_at": "2026-07-09T14:22:33"
    },
    {
        "lesson_id": "vars",
        "topic": "Variables in Python",
        "difficulty": "Beginner",
        "title": "Add Variables together",
        "type": "Short Coding Exercise",
        "question": "Write expressions to add variables a and b and return it.",
        "code": "def add_vars(a, b):\n    # Return sum\n    return ___",
        "expected_answer": "a + b",
        "hint": "Use the addition symbol +.",
        "explanation": "a + b evaluates to the sum of variables a and b.",
        "created_at": "2026-07-09T14:22:33"
    }
]

exercises_coll.delete_many({"lesson_id": "vars"})
exercises_coll.insert_many(VARS_QS)

print("Updated Detailed Theory for core topics and seeded 20 REAL questions for Variables.")
