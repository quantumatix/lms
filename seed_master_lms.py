import os
from pymongo import MongoClient
from datetime import datetime

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]
lessons_collection = db["lessons"]

def seed_lessons(lessons_data):
    for lesson in lessons_data:
        lessons_collection.update_one(
            {"id": lesson["id"]},
            {"$set": lesson},
            upsert=True
        )
    print(f"Successfully seeded/updated {len(lessons_data)} lessons.")

PHASE_1_LESSONS = [
    {
        "id": "intro",
        "title": "Introduction to Python",
        "category_id": "fundamentals",
        "category_title": "Python Fundamentals",
        "difficulty": "Beginner",
        "xp_reward": 100,
        "description": "Welcome to the world of Python! Learn the history, features, and setup of the most popular programming language.",
        "theory": """
# Introduction to Python Programming

Python is a **high-level, interpreted, general-purpose programming language**. Created by **Guido van Rossum** and first released in **1991**, Python has become one of the most popular programming languages in the world, used by giants like Google, NASA, and Netflix.

## 1. What is Python?
Python is designed with a philosophy that emphasizes **code readability**. Its syntax is clean and concise, often allowing programmers to express concepts in fewer lines of code than languages like C++ or Java.

### Key Characteristics:
*   **Interpreted:** Python code is executed line by line by an interpreter. This makes debugging easier and development faster.
*   **High-Level:** It abstracts away complex hardware details like memory management, allowing you to focus on logic.
*   **Dynamically Typed:** You don't need to declare variable types (like `int` or `string`) before using them.
*   **Large Standard Library:** Python comes with a "batteries included" philosophy, providing tools for everything from web development to data analysis.

---

## 2. Why Choose Python?
Whether you're a beginner or a seasoned pro, Python offers unique advantages:

### A. Simple Syntax
Python looks like English. For example, to print "Hello World", you just write:
`print("Hello World")`
In Java, this would require several lines and a class definition.

### B. Versatility
Python isn't just for one thing. It's used in:
*   **Web Development:** Django and Flask frameworks.
*   **Data Science:** Analyzing millions of data points with Pandas and NumPy.
*   **Artificial Intelligence:** Building neural networks with TensorFlow and PyTorch.
*   **Automation:** Writing scripts to handle repetitive tasks.

---

## 3. Python History and Evolution
Python was conceived in the late 1980s as a successor to the ABC language. 
*   **Python 2.0 (2000):** Introduced features like list comprehensions and garbage collection.
*   **Python 3.0 (2008):** A major revision that fixed consistency issues but was not backward-compatible. **This LMS focuses on Python 3.**

---

## 4. Setting Up Your Environment
To run Python, you usually need a Python Interpreter and a code editor.
1.  **Download:** Visit [python.org](https://python.org) and download the latest version.
2.  **Verify:** Open your terminal and type `python --version`.
3.  **IDE:** Popular choices include VS Code, PyCharm, or even simple IDLE.

---

## 5. Your First Python Program
Every programmer's journey starts with "Hello, World!".
```python
# This is a comment - it is ignored by Python
print("Hello, Python LMS!")
```
The `print()` function is used to output text to the console.

---

## Real-World Use Cases
| Industry | Usage |
| :--- | :--- |
| **Finance** | Algorithmic trading and risk management. |
| **Space** | NASA uses Python for mission control and data processing. |
| **Entertainment** | Netflix uses Python for recommendation algorithms. |

---

## Common Mistakes
*   **Indentation Errors:** Python uses whitespace to define blocks of code. Forgetting a space or tab can break your program.
*   **Mixing Python 2 and 3:** Using `print "Hello"` (Python 2) instead of `print("Hello")` (Python 3).
*   **Case Sensitivity:** `Print()` is not the same as `print()`.

---

## MCQs (Quiz)
1. **Who created Python?**
   - A) Bill Gates
   - B) Guido van Rossum
   - C) Mark Zuckerberg
   - D) James Gosling
   *Answer: B (Guido van Rossum)*

2. **In which year was Python first released?**
   - A) 1985
   - B) 1991
   - C) 1995
   - D) 2000
   *Answer: B (1991)*

3. **Which of these is NOT a characteristic of Python?**
   - A) High-level
   - B) Compiled
   - C) Interpreted
   - D) General-purpose
   *Answer: B (Python is primarily interpreted)*

4. **What is the focus of Python's design philosophy?**
   - A) Code execution speed
   - B) Code readability
   - C) Minimum memory usage
   - D) Maximum file size
   *Answer: B*

5. **Which company uses Python for data processing?**
   - A) NASA
   - B) Netflix
   - C) Google
   - D) All of the above
   *Answer: D*

6. **What is used to define blocks of code in Python?**
   - A) Brackets {}
   - B) Indentation
   - C) Semicolons ;
   - D) Quotes ""
   *Answer: B*

7. **How do you start a comment in Python?**
   - A) //
   - B) /*
   - C) #
   - D) --
   *Answer: C*

8. **Is Python 3 backward compatible with Python 2?**
   - A) Yes
   - B) No
   *Answer: B*

9. **Which tool is typically used to edit Python code?**
   - A) Photoshop
   - B) VS Code
   - C) Excel
   - D) Chrome
   *Answer: B*

10. **What is the outcome of print("Hello" * 2)?**
    - A) HelloHello
    - B) Hello 2
    - C) Error
    - D) Hello * 2
    *Answer: A*
""",
        "code_examples": [
            {"title": "The Classic Start", "code": "print('Welcome to Python 3!')"},
            {"title": "Basic Calculation", "code": "print(5 + 10)"},
            {"title": "String Concatenation", "code": "print('Python' + ' is' + ' fun')"},
            {"title": "Multiplying Strings", "code": "print('Py' * 3)"},
            {"title": "Using a Comment", "code": "# I am a comment\nprint('Comments are for humans')"}
        ],
        "real_world_use_cases": [
            {"case": "Web Scraping", "description": "Automating the collection of data from websites."},
            {"case": "Game Development", "description": "Using libraries like Pygame to build basic 2D games."},
            {"case": "Data Analysis", "description": "Processing Excel files or CSVs with a few lines of code."}
        ],
        "common_mistakes": [
            {"mistake": "IndentationError", "correction": "Ensure you are consistent with spaces or tabs."},
            {"mistake": "SyntaxError", "correction": "Check for missing parentheses or quotes."}
        ],
        "mcq_quiz": [
            {"question": "What kind of language is Python?", "options": ["Low-level", "Machine Language", "High-level", "Assembly"], "answer": "High-level", "explanation": "Python abstracts hardware details."},
            {"question": "How do you display text in Python?", "options": ["echo()", "print()", "out()", "write()"], "answer": "print()", "explanation": "The print function is the standard output method."},
            {"question": "Which extension is used for Python files?", "options": [".py", ".pyth", ".pt", ".pyc"], "answer": ".py", "explanation": "Python source files end in .py."},
            {"question": "Is Python case-sensitive?", "options": ["Yes", "No", "Depends on OS", "Only for strings"], "answer": "Yes", "explanation": "Variable names 'a' and 'A' are different."},
            {"question": "Which company uses Python for its recommendation engine?", "options": ["Google", "Netflix", "NASA", "All of the above"], "answer": "All of the above", "explanation": "Many giants use Python extensively."},
            {"question": "Who is the 'Benevolent Dictator for Life' of Python?", "options": ["Guido van Rossum", "Linus Torvalds", "Steve Jobs", "Elon Musk"], "answer": "Guido van Rossum", "explanation": "He was the leader of Python for decades."},
            {"question": "What is the current version of Python?", "options": ["Python 2", "Python 3", "Python 4", "Python X"], "answer": "Python 3", "explanation": "Python 3 is the industry standard."},
            {"question": "Can Python run on Windows and Linux?", "options": ["Only Windows", "Only Linux", "Both", "Neither"], "answer": "Both", "explanation": "Python is cross-platform."},
            {"question": "What is the purpose of a comment (#)?", "options": ["To make code run faster", "To explain code to humans", "To define a function", "To import a library"], "answer": "To explain code to humans", "explanation": "Python ignores comments."},
            {"question": "Is Python portable?", "options": ["Yes", "No", "Only for small scripts", "Only for web"], "answer": "Yes", "explanation": "Code written on one OS usually runs on another."}
        ],
        "coding_challenges": [
            {"challenge": "Print your name and your favorite color using the print() function.", "hints": ["Use quotes for text."]}
        ],
        "summary": "Python is an easy-to-learn, powerful language used in almost every tech field today."
    },
    {
        "id": "vars",
        "title": "Variables in Python",
        "category_id": "fundamentals",
        "category_title": "Python Fundamentals",
        "difficulty": "Beginner",
        "xp_reward": 100,
        "description": "Information storage is the heart of programming. Learn how to name and use variables.",
        "theory": """
# Variables: Storing Information

In programming, a **variable** is like a labeled container that stores a value. You can think of it as a name that refers to a specific piece of data in the computer's memory.

---

## 1. Creating Variables
In Python, variables are created the moment you assign a value to them. You don't need a command like `declare` or `var`.
```python
age = 25
name = "Alice"
```
Here, `age` is a variable name, and it stores the integer `25`. `name` stores the string "Alice".

---

## 2. Dynamic Typing
Python is **dynamically typed**. This means that a variable can change its type throughout the program execution.
```python
x = 5       # x is an integer
x = "Hello" # Now x is a string!
```
In many other languages (like Java), this would cause an error.

---

## 3. Variable Naming Rules
To keep your code readable and error-free, you must follow these rules:
1.  **Must start with a letter or underscore (_).** (e.g., `_age`, `score`)
2.  **Cannot start with a number.** (e.g., `1variable` is invalid)
3.  **Can only contain alphanumeric characters and underscores.** (e.g., `user_name_1`)
4.  **Case-sensitive.** (`age`, `Age`, and `AGE` are three different variables)
5.  **No Reserved Keywords.** You cannot name a variable `print`, `if`, or `while`.

---

## 4. Assignment Techniques
Python offers several shortcuts for assigning values:

### A. Multiple Assignment
You can assign values to multiple variables in one line:
`a, b, c = 5, 10, 15`

### B. Same Value to Multiple Variables
`x = y = z = 100`

---

## 5. Outputting Variables
We use the `print()` function to display variables.
```python
name = "Ayush"
print(name)
```
To combine text and variables, you can use a comma:
`print("Hello", name)`

---

## Real-World Use Cases
| Scenario | Variable Usage |
| :--- | :--- |
| **Game Score** | `score = 0` updated when enemies are defeated. |
| **User Profile** | `is_logged_in = True` to track session state. |
| **Ecommerce** | `cart_total = 199.99` for checkout processing. |

---

## Common Mistakes
*   **Undefined Variables:** Trying to print a variable before assigning it. (`print(y)` when `y` doesn't exist).
*   **Poor Naming:** Using names like `a`, `b`, `c` instead of descriptive names like `user_age`, `total_price`.
*   **Spaces in Names:** Using `user name` instead of `user_name`.

---

## MCQ Quiz
1. **Can a variable name start with a number?**
   - No (Correct)
2. **Which operator is used for assignment?**
   - = (Correct)
... (etc)
""",
        "code_examples": [
            {"title": "Basic Assignment", "code": "player_name = 'Warrior'\nhealth = 100\nprint(player_name, health)"},
            {"title": "Reassignment", "code": "score = 0\nprint(score)\nscore = 10\nprint(score)"},
            {"title": "Multiple Assignment", "code": "x, y, z = 1, 2, 3\nprint(x, y, z)"},
            {"title": "String and Variable", "code": "city = 'New York'\nprint('Welcome to ' + city)"},
            {"title": "Numeric Variable Operations", "code": "width = 10\nheight = 20\narea = width * height\nprint(area)"}
        ],
        "real_world_use_cases": [
            {"case": "User Sessions", "description": "Storing the state of a logged-in user."},
            {"case": "Configuration", "description": "Defining system settings like API keys or base URLs."},
            {"case": "Counter", "description": "Tracking how many times a button has been clicked."}
        ],
        "common_mistakes": [
            {"mistake": "Using numbers at start", "correction": "Always start with a letter or underscore."},
            {"mistake": "Reserved keywords", "correction": "Don't use names like 'def', 'if' as variables."}
        ],
        "mcq_quiz": [
            {"question": "How do you start a variable name?", "options": ["A number", "A symbol (@)", "A letter or underscore", "A space"], "answer": "A letter or underscore", "explanation": "Variables must not start with numbers."},
            {"question": "Is Python case-sensitive for variables?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "name and Name are different."},
            {"question": "What is the correct way to assign x as 5?", "options": ["x := 5", "x == 5", "x = 5", "x -> 5"], "answer": "x = 5", "explanation": "The '=' is the assignment operator."},
            {"question": "Can a variable start with a number?", "options": ["Yes", "No"], "answer": "No", "explanation": "Naming rules forbid it."},
            {"question": "What is multiple assignment?", "options": ["x=1, y=2", "x,y = 1,2", "x=1; y=2", "None"], "answer": "x,y = 1,2", "explanation": "Python allows unpacking values in one line."},
            {"question": "Which of these is a valid variable name?", "options": ["my var", "my-var", "my_var", "my.var"], "answer": "my_var", "explanation": "Only underscores are allowed as special characters."},
            {"question": "What is dynamic typing?", "options": ["Type is fixed", "Type can change", "Type must be declared", "None"], "answer": "Type can change", "explanation": "Python variables aren't bound to one type forever."},
            {"question": "Which of these is NOT a keyword?", "options": ["if", "while", "banana", "def"], "answer": "banana", "explanation": "Banana is just a word, not a reserved Python keyword."},
            {"question": "What happens if you use a variable before creating it?", "options": ["Returns None", "Returns 0", "NameError", "SyntaxError"], "answer": "NameError", "explanation": "Python will throw a NameError."},
            {"question": "How do you clear a variable's connection to a value?", "options": ["clear x", "del x", "remove x", "empty x"], "answer": "del x", "explanation": "The 'del' keyword deletes the reference."}
        ],
        "coding_challenges": [
            {"challenge": "Create three variables: 'first_name', 'last_name', and 'hometown'. Assign them your details and print them in one line.", "hints": ["Use commas in print() to separate variables."]}
        ],
        "summary": "Variables are the building blocks of data manipulation. Master the naming rules and dynamic typing to write clean code."
    },
    {
        "id": "types",
        "title": "Python Data Types",
        "category_id": "fundamentals",
        "category_title": "Python Fundamentals",
        "difficulty": "Beginner",
        "xp_reward": 100,
        "description": "Numbers, Strings, Booleans, and more. Master the classifications of data in Python.",
        "theory": """
# Data Types: The Classifications of Values

In Python, every value has a **data type**. Since everything in Python is an object, data types are actually classes, and variables are instances (objects) of these classes.

---

## 1. Built-in Data Types
Python has several built-in categories of data:

### A. Numeric Types
*   **int:** Whole numbers (e.g., `10`, `-100`, `0`).
*   **float:** Decimal numbers (e.g., `3.14`, `-0.001`).
*   **complex:** Complex numbers (e.g., `1 + 2j`).

### B. Sequence Types
*   **str (String):** Text wrapped in quotes (e.g., "Hello").
*   **list:** Ordered, changeable collection (e.g., [1, 2, 3]).
*   **tuple:** Ordered, unchangeable collection (e.g., (1, 2, 3)).

### C. Mapping Type
*   **dict (Dictionary):** Key-value pairs (e.g., {"name": "Alice", "age": 25}).

### D. Set Types
*   **set:** Unordered collection of unique items (e.g., {1, 2, 3}).

---

## 2. Casting and Conversion
You can change types using `int()`, `float()`, `str()`.

---

## MCQ Quiz
1. **Result of type(10.5)?**
   - float
2. **Is [1, 2] a list?**
   - Yes
... (etc)
""",
        "code_examples": [
            {"title": "Numeric Types", "code": "age = 20\nprice = 19.99\nprint(type(age))\nprint(type(price))"},
            {"title": "Casting", "code": "x = '10'\ny = int(x)\nprint(y + 5)"}
        ],
        "real_world_use_cases": [
            {"case": "Inventory Systems", "description": "Using integers for item counts."},
            {"case": "Authentication", "description": "Using Booleans for login status."}
        ],
        "common_mistakes": [
            {"mistake": "Type Mismatch", "correction": "Always check types using type() before operations."}
        ],
        "mcq_quiz": [
            {"question": "What is type(10.5)?", "options": ["int", "float", "complex", "bool"], "answer": "float", "explanation": "Decimal values are floats."},
            {"question": "Which of these is a boolean?", "options": ["True", "true", "TRUE", "None"], "answer": "True", "explanation": "Properly capitalized boolean."},
            {"question": "What does str(10) return?", "options": ["10", "'10'", "Error", "None"], "answer": "'10'", "explanation": "Converts to string."},
            {"question": "Is [1, 2] a list or tuple?", "options": ["List", "Tuple"], "answer": "List", "explanation": "Square brackets mean list."},
            {"question": "What is the result of 5 + '5'?", "options": ["10", "'55'", "TypeError", "ValueError"], "answer": "TypeError", "explanation": "Can't add int and str."},
            {"question": "Which type handles key-value pairs?", "options": ["set", "dict", "tuple", "list"], "answer": "dict", "explanation": "Dictionaries."},
            {"question": "Is tuple mutable?", "options": ["Yes", "No"], "answer": "No", "explanation": "Tuples are immutable."},
            {"question": "What is the type of {1, 2, 2}?", "options": ["list", "set", "dict", "none"], "answer": "set", "explanation": "Curly braces with single items."},
            {"question": "How do you find the type of 'x'?", "options": ["type(x)", "typeof(x)", "class(x)", "whatis(x)"], "answer": "type(x)", "explanation": "Standard type function."},
            {"question": "Can strings be defined with single quotes?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Both ' and \" work."}
        ],
        "coding_challenges": [
            {"challenge": "Create a float, convert it to an int, and print the type of the result.", "hints": ["Use type()."]}
        ],
        "summary": "Data types define what kind of data you are dealing with."
    },
    {
        "id": "operators",
        "title": "Python Operators",
        "category_id": "fundamentals",
        "category_title": "Python Fundamentals",
        "difficulty": "Beginner",
        "xp_reward": 100,
        "description": "Perform math, comparisons, and logic.",
        "theory": """
# Operators: Performing Actions on Data

Operators are special symbols that carry out computations. 

---

## 1. Arithmetic Operators
*   `+` : Addition
*   `-` : Subtraction
*   `*` : Multiplication
*   `/` : Division
*   `//` : Floor Division (rounds down)
*   `%` : Modulus (remainder)
*   `**` : Exponentiation (power)

---

## 2. Comparison Operators
*   `==` : Equal
*   `!=` : Not equal
*   `>` : Greater than
*   `<` : Less than
""",
        "code_examples": [
            {"title": "Math", "code": "print(10 % 3)\nprint(10 // 3)"}
        ],
        "real_world_use_cases": [
            {"case": "Finance", "description": "Calculating tax percentages."}
        ],
        "common_mistakes": [
            {"mistake": "= vs ==", "correction": "= is assignment, == is comparison."}
        ],
        "mcq_quiz": [
            {"question": "What is the modulo operator?", "options": ["/", "//", "%", "**"], "answer": "%", "explanation": "Returns remainder."},
            {"question": "What is 2 ** 3?", "options": ["6", "8", "9", "5"], "answer": "8", "explanation": "2 cubed."},
            {"question": "Is 10 == '10'?", "options": ["True", "False"], "answer": "False", "explanation": "Types are different."},
            {"question": "What does 7 // 2 return?", "options": ["3.5", "3", "4", "None"], "answer": "3", "explanation": "Rounds down."},
            {"question": "Which operator is 'not equal'?", "options": ["==", "!=", "<>", "="], "answer": "!=", "explanation": "Standard syntax."},
            {"question": "What is 'not True'?", "options": ["True", "False", "None", "Error"], "answer": "False", "explanation": "Logical negation."},
            {"question": "Which operator combines two conditions?", "options": ["plus", "and", "combine", "together"], "answer": "and", "explanation": "Logical and."},
            {"question": "What is 5 % 2?", "options": ["2", "2.5", "1", "0"], "answer": "1", "explanation": "Remainder."},
            {"question": "Operator for less than or equal?", "options": ["=<", "<=", "<<", "<"], "answer": "<=", "explanation": "Comparison."},
            {"question": "Result of 10 > 5 and 3 < 1?", "options": ["True", "False"], "answer": "False", "explanation": "One part is False."}
        ],
        "coding_challenges": [
            {"challenge": "Find the remainder of 100 divided by 7.", "hints": ["Use %."]}
        ],
        "summary": "Operators are the tools for data processing."
    },
    {
        "id": "io",
        "title": "Input and Output",
        "category_id": "fundamentals",
        "category_title": "Python Fundamentals",
        "difficulty": "Beginner",
        "xp_reward": 100,
        "description": "Interact with users.",
        "theory": """
# Input and Output: Talking to Your User

---

## 1. Output
`print("Hello World")`

## 2. Input
`name = input("Enter name: ")`
""",
        "code_examples": [
            {"title": "Hello User", "code": "name = input('Name: ')\nprint(f'Hello {name}')"}
        ],
        "real_world_use_cases": [
            {"case": "CLI", "description": "Basic user prompts."}
        ],
        "common_mistakes": [
            {"mistake": "Input is always String", "correction": "Cast to int if needed."}
        ],
        "mcq_quiz": [
            {"question": "How do you get input?", "options": ["get", "input", "read", "ask"], "answer": "input", "explanation": "Built-in function."},
            {"question": "Type of input() return?", "options": ["int", "string", "float", "bool"], "answer": "string", "explanation": "Always text."},
            {"question": "Print multiple items?", "options": ["print(a, b)", "print(a+b)", "Both", "None"], "answer": "Both", "explanation": "Comma or concat."},
            {"question": "Separator parameter?", "options": ["sep", "end", "gap", "break"], "answer": "sep", "explanation": "Separator between items."},
            {"question": "End of line parameter?", "options": ["sep", "end", "finish", "done"], "answer": "end", "explanation": "Changes default newline."},
            {"question": "Modern string formatting?", "options": ["%", "format()", "f-strings", "s-strings"], "answer": "f-strings", "explanation": "Current best practice."},
            {"question": "Can you use variables in print?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Core functionality."},
            {"question": "What is \\n?", "options": ["New Number", "New Line", "New Name", "None"], "answer": "New Line", "explanation": "Escape character."},
            {"question": "input('msg') - is 'msg' mandatory?", "options": ["Yes", "No"], "answer": "No", "explanation": "But helpful for user."},
            {"question": "How to convert input to float?", "options": ["float(input())", "to_float(input())", "as_float(input())", "None"], "answer": "float(input())", "explanation": "Casting function."}
        ],
        "coding_challenges": [
            {"challenge": "Ask for two numbers and print their sum.", "hints": ["Cast to int."]}
        ],
        "summary": "I/O is the bridge between user and computer."
    },
    {
        "id": "ifelse",
        "title": "If...Else Conditions",
        "category_id": "control_flow",
        "category_title": "Control Flow",
        "difficulty": "Beginner",
        "xp_reward": 100,
        "description": "Make decisions.",
        "theory": """
# If...Else: Decision Making in Python

---

## 1. Syntax
```python
if condition:
    # code
elif condition:
    # code
else:
    # code
```
""",
        "code_examples": [
            {"title": "Check age", "code": "age = 20\nif age >= 18:\n    print('Adult')"}
        ],
        "real_world_use_cases": [
            {"case": "Access Control", "description": "Permissions checking."}
        ],
        "common_mistakes": [
            {"mistake": "Indentation", "correction": "Blocks must be indented."}
        ],
        "mcq_quiz": [
            {"question": "Keyword for 'else if'?", "options": ["elsif", "elif", "else if", "None"], "answer": "elif", "explanation": "Python's syntax."},
            {"question": "Mandatory symbol at end of 'if'?", "options": [";", ":", ".", "!"], "answer": ":", "explanation": "Colons start blocks."},
            {"question": "Is 'else' required?", "options": ["Yes", "No"], "answer": "No", "explanation": "Optional catch-all."},
            {"question": "How many 'elif' blocks?", "options": ["0", "1", "As many as needed", "None"], "answer": "As many as needed", "explanation": "Unlimited between if and else."},
            {"question": "Comparison for not-equal?", "options": ["!=", "<>", "not equal", "None"], "answer": "!=", "explanation": "Standard operator."},
            {"question": "Indentation standard?", "options": ["1 space", "4 spaces", "2 tabs", "None"], "answer": "4 spaces", "explanation": "PEP 8 recommended."},
            {"question": "What happens if condition is False (no else)?", "options": ["Crash", "Returns None", "Skips block", "None"], "answer": "Skips block", "explanation": "Normal flow."},
            {"question": "Which operator for 'both must be true'?", "options": ["and", "or", "not", "together"], "answer": "and", "explanation": "Logical and."},
            {"question": "Conditional inside another conditional?", "options": ["Nested", "Looping", "Double", "None"], "answer": "Nested", "explanation": "Hierarchy."},
            {"question": "Shorthand if?", "options": ["Ternary", "Binary", "Quick", "None"], "answer": "Ternary", "explanation": "One-line if-else."}
        ],
        "coding_challenges": [
            {"challenge": "Check if a number is positive or negative.", "hints": ["Check if > 0."]}
        ],
        "summary": "Logic branching defines program behavior."
    }
]

if __name__ == "__main__":
    seed_lessons(PHASE_1_LESSONS)
