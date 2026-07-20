from pymongo import MongoClient
import datetime

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
lessons_collection = db["lessons"]

def create_lesson(id, title, category_id, category_title, description, theory, examples, mistakes, use_cases, practice, quiz, challenges=None, xp=100, difficulty="Beginner"):
    return {
        "id": id,
        "title": title,
        "category_id": category_id,
        "category_title": category_title,
        "description": description,
        "theory": theory,
        "code_examples": examples,
        "common_mistakes": mistakes,
        "real_world_use_cases": use_cases,
        "practice_questions": practice,
        "mcq_quiz": quiz,
        "coding_challenges": challenges or [],
        "xp_reward": xp,
        "difficulty": difficulty,
        "created_at": datetime.datetime.now().isoformat()
    }

# --- MODULE CONTENT DEFINITIONS (Summarized for seeding script) ---

INTRO_THEORY = """
## Welcome to the World of Python!

Python is not just a programming language; it's a powerful tool that has revolutionized the way we interact with technology. Whether you want to build the next viral web application, analyze massive datasets, automate your daily chores, or dive into the cutting-edge world of Artificial Intelligence, Python is your best friend.

### What is Python?
Python is a **high-level, interpreted, general-purpose programming language**. But what do these terms actually mean for a beginner?
1. **High-level**: This means the code looks a lot like English. You don't have to worry about the complex inner workings of your computer's memory or processor. You write sentences that a human can read, and Python handles the rest.
2. **Interpreted**: Unlike languages like C++ that need to be "compiled" into a machine language before running, Python is executed line-by-line. This makes it incredibly easy to test and debug your code on the fly.
3. **General-purpose**: Python isn't limited to just one niche. It's the "Swiss Army Knife" of coding. You can use it for almost anything!

### The History of Python
Python was conceived in the late 1980s by **Guido van Rossum** in the Netherlands. Interestingly, the name "Python" doesn't come from the snake, but from the British comedy group **Monty Python**, whom Guido was a big fan of. 

### Why Should You Learn Python?
- **Beginner-Friendly Syntax**: Python uses indentation (whitespace) to define blocks of code, which forces you to write clean and organized code.
- **Massive Community Support**: You'll find millions of solutions on sites like Stack Overflow.
- **Batteries Included**: Comes with a massive "Standard Library".
- **The AI Leader**: Industry standard for Machine Learning and Data Science.

### Getting Started
To write Python code, you usually need a **Python Interpreter** and a **Code Editor** (like VS Code or PyCharm). In this LMS, we provide an environment where you can learn and practice directly.
"""

VARS_THEORY = """
## Understanding Variables: The Storage Boxes of Code

Imagine you are moving to a new house. You have a lot of items. To keep track of them, you put them in boxes and label them. "Books", "Winter Clothes". This is exactly what **Variables** are in Python.

### What is a Variable?
A variable is a **named location in your computer's memory** used to store data. Once you put something in the container, you can use the label to refer to that data throughout your program.

### Creating (Declaring) Variables
Python is **dynamically typed**. You don't have to declare the type.
Example: `variable_name = value`

### Naming Rules:
1. **Must start with a letter or underscore**. Cannot start with a number.
2. **Alpha-numeric and underscores only**. No spaces or special characters.
3. **Case Sensitive**: `age` and `Age` are different.
4. **No Keywords**: Don't use words like `print` or `if`.

### Best Practices:
Use **Snake Case** (e.g., `user_name`) and **Descriptive Names**. Instead of `a = 25`, use `age = 25`.
"""

TYPES_THEORY = """
## Data Types: The Building Blocks of Values

Data Types define what *kind* of item you can put in your variable boxes. 

### Common Data Types:
1. **Integers (`int`)**: Whole numbers: `100`, `-5`.
2. **Floats (`float`)**: Decimal numbers: `3.14`, `10.0`.
3. **Strings (`str`)**: Text in quotes: `"Hello"`.
4. **Booleans (`bool`)**: `True` or `False`.

### Type Checking & Casting
Use `type(variable)` to check the type.
Use **Casting** to change types: `int("25")` or `str(10.5)`.
"""

OP_THEORY = """
## Operators: Making Code Do Something

Operators are symbols that perform tasks.

### 1. Arithmetic
`+`, `-`, `*`, `/`, `%` (Modulus/Remainder), `//` (Floor Division), `**` (Power).

### 2. Comparison
`==` (Equal), `!=` (Not Equal), `>`, `<`, `>=`, `<=`. Returns a Boolean.

### 3. Logical
`and`, `or`, `not`. Used to combine conditions.

### 4. Assignment
`=`, `+=`, `-=`, etc. `x += 5` is `x = x + 5`.
"""

STR_THEORY = """
## Strings: The Power of Text

Strings are sequences of characters.

### Indexing & Slicing
Python uses **Zero-based Indexing**. `s[0]` is the first char.
**Slicing**: `s[start:end]` extracting a portion.

### String Methods:
- `.upper()`, `.lower()`
- `.strip()` - remove spaces
- `.replace()` - swap text
- `.split()` - divide into list

### f-Strings
The modern way to format: `f"Hello {name}"`.
"""

LIST_THEORY = """
## Lists: Organized Collections

A list is an **ordered, mutable collection** of items in `[]`.

### Key Operations:
- **Access**: `items[0]`
- **Add**: `.append()` (end), `.insert()` (index)
- **Remove**: `.remove()`, `.pop()`
- **Sort**: `.sort()`
- **Length**: `len(items)`
"""

TUPLE_THEORY = """
## Tuples: Immutable Sequences

Tuples use `()` and **cannot be changed** after creation. They are faster and safer for fixed data like `(latitude, longitude)`.
"""

DICT_THEORY = """
## Dictionaries: Key-Value Pairs

Like an address book, dictionaries use `{}` to map unique **Keys** to **Values**.
Example: `{"name": "Alice", "age": 25}`.
Methods: `.keys()`, `.values()`, `.get()`.
"""

SET_THEORY = """
## Sets: Unique & Unordered

Sets use `{}` and only store unique items. Great for removing duplicates and math operations like **Union** and **Intersection**.
"""

COND_THEORY = """
## Conditions: The Brain of Code

Use `if`, `elif`, and `else` to make decisions. 
**CRITICAL**: Python uses **Indentation** to define code blocks. Incorrect spacing will cause errors.
"""

LOOP_THEORY = """
## Loops: Automating Repetition

- **For Loop**: Iterate over a sequence or `range()`.
- **While Loop**: Run as long as a condition is True.
Use `break` to stop and `continue` to skip an iteration.
"""

FUNC_THEORY = """
## Functions: Reusable Blueprints

Define once with `def` and call anywhere. Use **Parameters** to pass data and `return` to send data back. Functions help keep code clean and organized.
"""

OOP_THEORY = """
## OOP: Classes and Objects

Model real-world things.
- **Class**: The blueprint (e.g., `Dog` class).
- **Object**: The instance (e.g., your dog `Rex`).
- **__init__**: The constructor that sets initial data.
- **Inheritance**: Subclasses getting features from parent classes.
"""

FILE_THEORY = """
## File Handling: Working with Disk

Use `open()` to read or write files.
**Best Practice**: Use the `with` statement to ensure files close automatically.
Example: `with open('file.txt', 'r') as f:`
"""

EXCEPT_THEORY = """
## Exception Handling: Managing Errors

Prevent your program from crashing using `try` and `except` blocks.
- **try**: Code that might fail.
- **except**: What to do if it fails.
- **finally**: Code that runs no matter what.
"""

MODULES_THEORY = """
## Modules and Packages: Scaling Projects

- **Module**: A Python file with code you want to reuse. Use `import`.
- **Package**: A folder containing multiple modules.
- **pip**: The package installer for Python to download external libraries like `requests` or `pandas`.
"""

# --- SEEDING DATA ---

UNIFIED_SYLLABUS = [
    create_lesson("intro", "Introduction", "getting_started", "Getting Started", "Python fundamentals and history.", INTRO_THEORY, [{"title": "Hello World", "code": "print('Hello!')", "output": "Hello!"}], ["Misspelling print"], ["Web Dev", "AI"], ["What is Python?"], [{"question": "Who created Python?", "options": ["Guido", "Bill"], "answer": "Guido"}]),
    create_lesson("variables", "Variables", "basics", "Python Basics", "Storing and managing data.", VARS_THEORY, [{"title": "Assigning", "code": "x = 5", "output": ""}], ["Starting with number"], ["Game HP", "User Profiles"], ["How to name variables?"], [{"question": "Is 1st_var valid?", "options": ["Yes", "No"], "answer": "No"}]),
    create_lesson("datatypes", "Data Types", "basics", "Python Basics", "Numbers, Strings, Booleans.", TYPES_THEORY, [], [], ["Finance"], [], []),
    create_lesson("operators", "Operators", "basics", "Python Basics", "Math and logic.", OP_THEORY, [], [], ["Calculators"], [], []),
    create_lesson("strings", "Strings", "data_structures", "Core Data Structures", "Text manipulation.", STR_THEORY, [], [], ["Chatbots"], [], []),
    create_lesson("lists", "Lists", "data_structures", "Core Data Structures", "Ordered collections.", LIST_THEORY, [], [], ["Shopping lists"], [], []),
    create_lesson("tuples", "Tuples", "data_structures", "Core Data Structures", "Immutable sequences.", TUPLE_THEORY, [], [], ["GPS Coordinates"], [], []),
    create_lesson("dicts", "Dictionaries", "data_structures", "Core Data Structures", "Key-Value pairs.", DICT_THEORY, [], [], ["Databases"], [], []),
    create_lesson("sets", "Sets", "data_structures", "Core Data Structures", "Unique collections.", SET_THEORY, [], [], ["Deduplication"], [], []),
    create_lesson("conditions", "Conditions", "control_flow", "Control Flow", "Decision making.", COND_THEORY, [], [], ["Login systems"], [], []),
    create_lesson("loops", "Loops", "control_flow", "Control Flow", "Repetition.", LOOP_THEORY, [], [], ["Data processing"], [], []),
    create_lesson("functions", "Functions", "modular", "Modular Python", "Reusable code blocks.", FUNC_THEORY, [], [], ["Math helpers"], [], []),
    create_lesson("oop", "OOP", "modular", "Modular Python", "Classes and Objects.", OOP_THEORY, [], [], ["System Architecture"], [], []),
    create_lesson("file_handling", "File Handling", "io", "I/O Operations", "Reading/Writing files.", FILE_THEORY, [], [], ["Logging"], [], []),
    create_lesson("exception_handling", "Exception Handling", "advanced", "Advanced Python", "Error management.", EXCEPT_THEORY, [], [], ["Robust Apps"], [], []),
    create_lesson("modules", "Modules & Packages", "advanced", "Advanced Python", "Importing and pip.", MODULES_THEORY, [], [], ["Library usage"], [], []),
]

def seed():
    print("Seeding ULTIMATE High-Quality Content...")
    lessons_collection.delete_many({})
    lessons_collection.insert_many(UNIFIED_SYLLABUS)
    print(f"Successfully seeded {len(UNIFIED_SYLLABUS)} modules.")

if __name__ == "__main__":
    seed()
