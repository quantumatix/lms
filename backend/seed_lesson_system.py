from pymongo import MongoClient
import datetime

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
lessons_collection = db["lessons"]

PYTHON_MODULES = [
    {
        "id": "intro",
        "title": "Introduction",
        "category_id": "getting_started",
        "category_title": "Getting Started",
        "description": "Welcome to Python! Learn what Python is and why it's the most popular language today.",
        "theory": "Python is a high-level, interpreted, general-purpose programming language. Created by Guido van Rossum and first released in 1991, Python's design philosophy emphasizes code readability with its notable use of significant whitespace.\n\nKey features include:\n- **Simple Syntax**: Similar to the English language.\n- **Interpreted**: Code is executed line by line.\n- **Dynamic Typing**: No need to declare variable types.\n- **Large Ecosystem**: Millions of libraries for AI, Web, and Automation.",
        "code_examples": [
            {"title": "Your First Program", "code": "print('Hello, Python World!')"}
        ],
        "practice_questions": ["What year was Python first released?", "Who created Python?"],
        "xp_reward": 100,
        "difficulty": "Beginner"
    },
    {
        "id": "variables",
        "title": "Variables",
        "category_id": "basics",
        "category_title": "Python Basics",
        "description": "Learn how to store and manage data using variables.",
        "theory": "Variables are containers for storing data values. In Python, a variable is created the moment you first assign a value to it.\n\nRules for naming variables:\n- Must start with a letter or an underscore.\n- Cannot start with a number.\n- Can only contain alpha-numeric characters and underscores (A-z, 0-9, and _ ).\n- Variable names are case-sensitive (age, Age and AGE are three different variables).",
        "code_examples": [
            {"title": "Declaring Variables", "code": "name = 'Ayush'\nage = 22\nprint(name)\nprint(age)"}
        ],
        "practice_questions": ["Is '2variable' a valid variable name?", "Create a variable named 'score' and set it to 100."],
        "xp_reward": 100,
        "difficulty": "Beginner"
    },
    {
        "id": "datatypes",
        "title": "Data Types",
        "category_id": "basics",
        "category_title": "Python Basics",
        "description": "Explore the built-in data types: Numbers, Strings, and Booleans.",
        "theory": "Python has various data types built-in by default:\n- **Text Type**: `str` (String)\n- **Numeric Types**: `int` (Integer), `float` (Decimal)\n- **Boolean Type**: `bool` (True/False)\n\nYou can get the data type of any object by using the `type()` function.",
        "code_examples": [
            {"title": "Type Checking", "code": "x = 5\ny = 'Hello'\nprint(type(x))  # <class 'int'>\nprint(type(y))  # <class 'str'>"}
        ],
        "practice_questions": ["Convert the float 10.5 into an integer.", "What is the result of type(True)?"],
        "xp_reward": 100,
        "difficulty": "Beginner"
    },
    {
"id": "operators",
"title": "Operators",
"category_id": "basics",
"category_title": "Python Basics",


"description": "Master Arithmetic, Comparison, Assignment and Logical Operators in Python.",

"theory": """


# Python Operators

Operators are special symbols used to perform operations on variables and values.

In real-world programming, operators are used in calculators, banking software, shopping websites, AI systems, games, and almost every application.

## Types of Operators

1. Arithmetic Operators
2. Comparison Operators
3. Assignment Operators
4. Logical Operators
5. Membership Operators
6. Identity Operators

---

## Arithmetic Operators

Arithmetic operators perform mathematical calculations.

* Addition

- Subtraction

* Multiplication
  / Division
  % Modulus
  ** Exponentiation
  // Floor Division

Example:

a = 10
b = 3

a + b = 13
a - b = 7
a * b = 30
a / b = 3.33
a % b = 1
a ** b = 1000
a // b = 3

---

## Comparison Operators

Used to compare values.

== Equal To
!= Not Equal To

> Greater Than
> < Less Than
> = Greater Than or Equal To
> <= Less Than or Equal To

These operators always return True or False.

---

## Logical Operators

and
or
not

Used to combine multiple conditions.

Example:

age = 20

age > 18 and age < 60

Result: True

---

## Assignment Operators

Used to assign values.

=
+=
-=
*=
/=

Example:

x = 10
x += 5

Result = 15

---

## Membership Operators

in
not in

Example:

fruits = ["apple", "banana"]

"apple" in fruits

Result = True

---

## Identity Operators

is
is not

Used to compare memory locations.

Example:

x = [1,2]
y = x

x is y

Result = True

---

## Summary

Operators are essential building blocks of Python programming. Understanding them is necessary before learning conditions, loops, functions and data structures.
""",

"code_examples": [
    {
        "title": "Arithmetic Operators",
        "code": """


a = 10
b = 3

print(a+b)
print(a-b)
print(a*b)
print(a/b)
print(a%b)
"""
},
{
"title": "Comparison Operators",
"code": """
x = 10
y = 20

print(x < y)
print(x == y)
print(x != y)
"""
},
{
"title": "Logical Operators",
"code": """
age = 20

print(age > 18 and age < 60)
"""
}
],

"common_mistakes": [
    {
        "mistake": "Division by Zero",
        "explanation": "10/0 causes ZeroDivisionError."
    },
    {
        "mistake": "Confusing / and //",
        "explanation": "/ returns float division while // returns floor division."
    },
    {
        "mistake": "Using = instead of ==",
        "explanation": "= assigns a value while == compares values."
    }
],

"real_world_use_cases": [
    "Calculator Applications",
    "Banking Systems",
    "Shopping Cart Price Calculations",
    "Game Score Systems",
    "Scientific Calculations"
],

"practice_questions": [
    "Find the remainder when 17 is divided by 5.",
    "Find square of 9 using exponentiation operator.",
    "Check whether 25 is greater than 10.",
    "Use logical operators to verify age eligibility."
],

"coding_challenges": [
    {
        "title": "Mini Calculator",
        "problem": "Create a calculator that performs + - * / operations."
    },
    {
        "title": "Even or Odd Checker",
        "problem": "Use modulus operator to check whether a number is even or odd."
    }
],

"mcq_quiz": [
    {
        "question": "What is output of 5 % 2 ?",
        "options": ["0", "1", "2", "5"],
        "answer": "1"
    },
    {
        "question": "Which operator is used for exponentiation?",
        "options": ["*", "**", "//", "%"],
        "answer": "**"
    },
    {
        "question": "Which operator checks equality?",
        "options": ["=", "==", "!=", ">"],
        "answer": "=="
    }
],

"xp_reward": 100,
"difficulty": "Beginner"


}
lty": "Beginner"
    },
    {
        "id": "strings",
        "title": "Strings",
        "category_id": "data_structures",
        "category_title": "Core Data Structures",
        "description": "Work with text, slicing, and string methods.",
        "theory": "Strings in python are surrounded by either single quotation marks, or double quotation marks. You can output a string literal with the `print()` function.\n\nString slicing allows you to get a range of characters. Use `[:]` to slice strings.",
        "code_examples": [
            {"title": "String Slicing", "code": "s = 'Python'\nprint(s[0:2]) # 'Py'\nprint(s.upper()) # 'PYTHON'"}
        ],
        "practice_questions": ["Reverse the string 'Hello' using slicing.", "What does the .strip() method do?"],
        "xp_reward": 100,
        "difficulty": "Beginner"
    },
    {
        "id": "lists",
        "title": "Lists",
        "category_id": "data_structures",
        "category_title": "Core Data Structures",
        "description": "Learn to store multiple items in a single variable.",
        "theory": "Lists are used to store multiple items in a single variable. Lists are one of 4 built-in data types in Python used to store collections of data. Lists are ordered, changeable, and allow duplicate values.",
        "code_examples": [
            {"title": "List Methods", "code": "fruits = ['apple', 'banana', 'cherry']\nfruits.append('orange')\nprint(fruits[1]) # 'banana'"}
        ],
        "practice_questions": ["How do you add an item to the end of a list?", "Change 'apple' to 'kiwi' in a list named fruits."],
        "xp_reward": 100,
        "difficulty": "Beginner"
    },
    {
        "id": "tuples",
        "title": "Tuples",
        "category_id": "data_structures",
        "category_title": "Core Data Structures",
        "description": "Understand immutable sequences in Python.",
        "theory": "Tuples are used to store multiple items in a single variable. A tuple is a collection which is ordered and unchangeable. Tuples are written with round brackets `()`.",
        "code_examples": [
            {"title": "Tuple Example", "code": "mytuple = ('apple', 'banana', 'cherry')\nprint(len(mytuple))"}
        ],
        "practice_questions": ["Are tuples mutable?", "Check if 'apple' exists in a tuple."],
        "xp_reward": 100,
        "difficulty": "Beginner"
    },
    {
        "id": "dicts",
        "title": "Dictionaries",
        "category_id": "data_structures",
        "category_title": "Core Data Structures",
        "description": "Store data in key:value pairs for fast retrieval.",
        "theory": "Dictionaries are used to store data values in key:value pairs. A dictionary is a collection which is ordered, changeable and does not allow duplicates.",
        "code_examples": [
            {"title": "Accessing Dict", "code": "car = {\n  'brand': 'Ford',\n  'model': 'Mustang',\n  'year': 1964\n}\nprint(car['model'])"}
        ],
        "practice_questions": ["How do you get the value of a key 'name'?", "Add a new key 'color' with value 'red' to the car dictionary."],
        "xp_reward": 150,
        "difficulty": "Intermediate"
    },
    {
        "id": "sets",
        "title": "Sets",
        "category_id": "data_structures",
        "category_title": "Core Data Structures",
        "description": "Work with unordered collections of unique items.",
        "theory": "Sets are used to store multiple items in a single variable. A set is a collection which is unordered, unchangeable, and unindexed. No duplicate members allowed.",
        "code_examples": [
            {"title": "Set Operations", "code": "myset = {'apple', 'banana', 'cherry'}\nmyset.add('orange')\nprint(myset)"}
        ],
        "practice_questions": ["Do sets allow duplicate values?", "How do you remove an item from a set?"],
        "xp_reward": 100,
        "difficulty": "Beginner"
    },
    {
        "id": "conditions",
        "title": "Conditions",
        "category_id": "control_flow",
        "category_title": "Control Flow",
        "description": "Use If-Else statements to make decisions.",
        "theory": "Python supports the usual logical conditions from mathematics:\n- Equals: `a == b`\n- Not Equals: `a != b`\n- Less than: `a < b`\n- Greater than: `a > b`.\n\nThese conditions can be used in several ways, most commonly in 'if' statements and loops.",
        "code_examples": [
            {"title": "If-Else Example", "code": "a = 200\nb = 33\nif b > a:\n  print('b is greater than a')\nelif a == b:\n  print('a and b are equal')\nelse:\n  print('a is greater than b')"}
        ],
        "practice_questions": ["Write an 'if' statement to check if a is equal to b.", "What is the 'elif' keyword short for?"],
        "xp_reward": 100,
        "difficulty": "Beginner"
    },
    {
        "id": "loops",
        "title": "Loops",
        "category_id": "control_flow",
        "category_title": "Control Flow",
        "description": "Repeat code blocks using For and While loops.",
        "theory": "Python has two primitive loop commands:\n- **while loops**: Executes as long as a condition is true.\n- **for loops**: Used for iterating over a sequence (list, tuple, dict, set, string).",
        "code_examples": [
            {"title": "For Loop", "code": "fruits = ['apple', 'banana', 'cherry']\nfor x in fruits:\n  print(x)"}
        ],
        "practice_questions": ["How do you stop a loop prematurely?", "Write a loop that prints numbers 1 to 5."],
        "xp_reward": 150,
        "difficulty": "Intermediate"
    },
    {
        "id": "functions",
        "title": "Functions",
        "category_id": "modular_python",
        "category_title": "Modular Python",
        "description": "Create reusable blocks of code.",
        "theory": "A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function. A function can return data as a result.",
        "code_examples": [
            {"title": "Defining Function", "code": "def my_function(fname):\n  print(fname + ' Refsnes')\n\nmy_function('Emil')"}
        ],
        "practice_questions": ["What keyword is used to create a function?", "How do you return a value from a function?"],
        "xp_reward": 150,
        "difficulty": "Intermediate"
    },
    {
        "id": "oop",
        "title": "OOP",
        "category_id": "advanced",
        "category_title": "Advanced Python",
        "description": "Master Classes, Objects, and Inheritance.",
        "theory": "Python is an object oriented programming language. Almost everything in Python is an object, with its properties and methods. A Class is like an object constructor, or a 'blueprint' for creating objects.",
        "code_examples": [
            {"title": "Class and Object", "code": "class Person:\n  def __init__(self, name, age):\n    self.name = name\n    self.age = age\n\np1 = Person('John', 36)\nprint(p1.name)"}
        ],
        "practice_questions": ["What is the purpose of the __init__ method?", "How do you inherit from another class?"],
        "xp_reward": 200,
        "difficulty": "Advanced"
    },
    {
        "id": "file_handling",
        "title": "File Handling",
        "category_id": "advanced",
        "category_title": "Advanced Python",
        "description": "Read and write files on your computer.",
        "theory": "The key function for working with files in Python is the `open()` function. The `open()` function takes two parameters; filename, and mode.\n- 'r' - Read\n- 'a' - Append\n- 'w' - Write\n- 'x' - Create",
        "code_examples": [
            {"title": "Reading File", "code": "f = open('demofile.txt', 'r')\nprint(f.read())"}
        ],
        "practice_questions": ["What mode do you use to write to a file?", "Why is it important to close a file after operations?"],
        "xp_reward": 150,
        "difficulty": "Intermediate"
    },
    {
        "id": "exception_handling",
        "title": "Exception Handling",
        "category_id": "advanced",
        "category_title": "Advanced Python",
        "description": "Handle errors gracefully using Try-Except blocks.",
        "theory": "When an error occurs, or exception as we call it, Python will normally stop and generate an error message. These exceptions can be handled using the `try` statement.",
        "code_examples": [
            {"title": "Try-Except Example", "code": "try:\n  print(x)\nexcept NameError:\n  print('Variable x is not defined')\nexcept:\n  print('Something else went wrong')"}
        ],
        "practice_questions": ["What does the 'finally' block do?", "Can you have multiple 'except' blocks for one 'try'?"],
        "xp_reward": 150,
        "difficulty": "Intermediate"
    },
    {
        "id": "modules",
        "title": "Modules & Packages",
        "category_id": "modular_python",
        "category_title": "Modular Python",
        "description": "Oragnize code into modules and use external packages.",
        "theory": "Consider a module to be the same as a code library. A file containing a set of functions you want to include in your application.\n\nYou can use the `import` statement to include modules. Packages are namespaces containing multiple modules.",
        "code_examples": [
            {"title": "Importing Module", "code": "import platform\nx = platform.system()\nprint(x)"}
        ],
        "practice_questions": ["How do you import a specific function from a module?", "What is 'pip' used for?"],
        "xp_reward": 150,
        "difficulty": "Intermediate"
    }
]

def seed():
    print("Clearing existing lessons...")
    lessons_collection.delete_many({})
    print(f"Seeding {len(PYTHON_MODULES)} lessons...")
    lessons_collection.insert_many(PYTHON_MODULES)
    print("Success!")

if __name__ == "__main__":
    seed()
