from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
lessons_collection = db["lessons"]

SYLLABUS = [
    {
        "category_id": "fundamentals",
        "category_title": "Python Fundamentals",
        "lessons": [
            {
                "id": "intro",
                "title": "Introduction to Python",
                "description": "An overview of Python, its features, and how to get started.",
                "theory": "Python is a high-level, interpreted, and general-purpose programming language. It was created by Guido van Rossum and first released in 1991. Python's design philosophy emphasizes code readability with its notable use of significant whitespace.\n\nKey Features:\n- Simple and Easy to Learn: Python has a very simple and elegant syntax. It is much easier to read and write than other languages like C++, Java, or C#.\n- Interpreted Language: Python code is executed line by line, which makes debugging easier.\n- Large Standard Library: Python provides a vast library that contains modules for everything from web development to data science.",
                "code_examples": [
                    {"title": "First Program", "code": "print('Hello, Python World!')"}
                ],
                "key_concepts": ["Readability", "Interpreted", "High-level language"],
                "xp_reward": 50
            },
            {
                "id": "vars",
                "title": "Variables",
                "description": "Understanding how to store and manipulate data using variables.",
                "theory": "Variables are containers for storing data values. Unlike other languages, Python has no command for declaring a variable; it is created the moment you first assign a value to it.\n\nRules for Variable Names:\n1. Must start with a letter or underscore.\n2. Cannot start with a number.\n3. Case-sensitive (age, Age, and AGE are three different variables).",
                "code_examples": [
                    {"title": "Assignment", "code": "name = 'Alice'\nage = 25\nprint(name)\nprint(age)"}
                ],
                "key_concepts": ["Assignment", "Naming Rules", "Dynamic Typing"],
                "xp_reward": 50
            },
            {
                "id": "types",
                "title": "Data Types",
                "description": "Exploring built-in data types: int, float, string, and boolean.",
                "theory": "Python has several built-in data types:\n- Numeric: int (integers), float (decimal numbers).\n- Text: str (strings enclosed in quotes).\n- Boolean: bool (True or False).\n\nYou can use the type() function to check the data type of any variable.",
                "code_examples": [
                    {"title": "Data Type Examples", "code": "x = 10        # int\ny = 10.5      # float\nz = 'Python'  # str\nis_valid = True # bool\n\nprint(type(x))\nprint(type(z))"}
                ],
                "key_concepts": ["int", "float", "str", "bool", "type() function"],
                "xp_reward": 50
            },
            {
                "id": "operators",
                "title": "Operators",
                "description": "Performing arithmetic, logical, and comparison operations.",
                "theory": "Operators are used to perform operations on variables and values. \n\nCategories:\n- Arithmetic: +, -, *, /, %, **, //\n- Comparison: ==, !=, >, <, >=, <=\n- Logical: and, or, not",
                "code_examples": [
                    {"title": "Arithmetic", "code": "a = 10\nb = 3\nprint(a + b)  # 13\nprint(a // b) # Floor division: 3\nprint(a % b)  # Modulo: 1"}
                ],
                "key_concepts": ["Arithmetic", "Logical", "Comparison"],
                "xp_reward": 50
            },
            {
                "id": "io",
                "title": "Input/Output",
                "description": "How to interact with users using input() and print().",
                "theory": "Interaction is key in programming. Use print() to display output and input() to take data from the user. Note that input() always returns a string; use type casting (int(), float()) to convert it.",
                "code_examples": [
                    {"title": "Simple Chat", "code": "name = input('Enter your name: ')\nprint('Hi ' + name + '!')\n\nage = int(input('Enter your age: '))\nprint('Next year you will be', age + 1)"}
                ],
                "key_concepts": ["print()", "input()", "Type Casting"],
                "xp_reward": 50
            }
        ]
    },
    {
        "category_id": "control_flow",
        "category_title": "Control Flow",
        "lessons": [
            {
                "id": "ifelse",
                "title": "If Else",
                "description": "Making decisions in your code based on conditions.",
                "theory": "Control Flow allows your program to make decisions. The 'if' statement evaluates a condition. If True, the code block runs. 'elif' provides additional conditions, and 'else' handles everything else.",
                "code_examples": [
                    {"title": "Grade Checker", "code": "score = 85\nif score >= 90:\n    print('Grade: A')\nelif score >= 80:\n    print('Grade: B')\nelse:\n    print('Grade: C')"}
                ],
                "key_concepts": ["Conditional statements", "Indentation", "elif"],
                "xp_reward": 50
            },
            {
                "id": "loops",
                "title": "Loops",
                "description": "Repeating tasks with 'for' and 'while' loops.",
                "theory": "Loops repeat a block of code multiple times.\n- 'for' loops are used for iterating over a sequence (like a list or range).\n- 'while' loops run as long as a condition is True.",
                "code_examples": [
                    {"title": "For Loop", "code": "for i in range(5):\n    print('Number:', i)\n\n# While Loop\ncount = 0\nwhile count < 3:\n    print('Count:', count)\n    count += 1"}
                ],
                "key_concepts": ["Iteration", "range()", "Infinite loops"],
                "xp_reward": 50
            },
            {
                "id": "nested_loops",
                "title": "Nested Loops",
                "description": "Loops inside other loops for complex iterations.",
                "theory": "A nested loop is a loop inside another loop. The inner loop executes completely for each iteration of the outer loop. This is commonly used for working with multi-dimensional data like matrices or patterns.",
                "code_examples": [
                    {"title": "Star Pattern", "code": "for i in range(1, 4):\n    for j in range(i):\n        print('*', end='')\n    print()"}
                ],
                "key_concepts": ["Inner loop", "Outer loop", "Patterns"],
                "xp_reward": 50
            }
        ]
    },
    {
        "category_id": "functions",
        "category_title": "Functions",
        "lessons": [
            {
                "id": "func_basics",
                "title": "Function Basics",
                "description": "Defining and calling functions to modularize code.",
                "theory": "A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function. Functions help in code reusability.",
                "code_examples": [
                    {"title": "Simple Function", "code": "def greet():\n    print('Hello from a function!')\n\ngreet()"}
                ],
                "key_concepts": ["def keyword", "Calling functions", "Code reuse"],
                "xp_reward": 50
            },
            {
                "id": "args",
                "title": "Arguments",
                "description": "Passing data into functions using parameters and arguments.",
                "theory": "Information can be passed into functions as arguments. Arguments are specified after the function name, inside the parentheses. You can add as many arguments as you want, just separate them with a comma.",
                "code_examples": [
                    {"title": "Parameterized Function", "code": "def greet_user(name):\n    print('Hello ' + name)\n\ngreet_user('Dev')"}
                ],
                "key_concepts": ["Parameters", "Positional args", "Keyword args"],
                "xp_reward": 50
            },
            {
                "id": "return",
                "title": "Return Values",
                "description": "How to pass data back from a function to the caller.",
                "theory": "To let a function return a value, use the 'return' statement. This allows you to store the output of a function into a variable for later use.",
                "code_examples": [
                    {"title": "Addition", "code": "def add(x, y):\n    return x + y\n\nresult = add(5, 3)\nprint(result)"}
                ],
                "key_concepts": ["return keyword", "Output", "Function variables"],
                "xp_reward": 50
            },
            {
                "id": "lambda",
                "title": "Lambda Functions",
                "description": "Anonymous one-liner functions for quick operations.",
                "theory": "A lambda function is a small anonymous function. A lambda function can take any number of arguments, but can only have one expression. Syntax: lambda arguments : expression",
                "code_examples": [
                    {"title": "Lambda Square", "code": "square = lambda x : x * x\nprint(square(5))"}
                ],
                "key_concepts": ["Anonymous functions", "Single expression", "Quick functions"],
                "xp_reward": 50
            }
        ]
    },
    {
        "category_id": "data_structures",
        "category_title": "Data Structures",
        "lessons": [
            {
                "id": "lists",
                "title": "Lists",
                "description": "Storing ordered, mutable sequences of items.",
                "theory": "Lists are used to store multiple items in a single variable. They are ordered, changeable, and allow duplicate values. Items are indexed, starting from 0.",
                "code_examples": [
                    {"title": "List Methods", "code": "fruits = ['apple', 'banana']\nfruits.append('cherry')\nprint(fruits[0])\nprint(len(fruits))"}
                ],
                "key_concepts": ["Indexing", "Mutable", "append()", "len()"],
                "xp_reward": 50
            },
            {
                "id": "tuples",
                "title": "Tuples",
                "description": "Immutable sequences of items for data protection.",
                "theory": "Tuples are used to store multiple items in a single variable. A tuple is a collection which is ordered and unchangeable (immutable). Once created, you cannot change its items.",
                "code_examples": [
                    {"title": "Tuple Example", "code": "point = (10, 20)\nprint(point[1])\n# point[0] = 5  # This would cause an error!"}
                ],
                "key_concepts": ["Immutable", "Faster than lists", "Data integrity"],
                "xp_reward": 50
            },
            {
                "id": "sets",
                "title": "Sets",
                "description": "Unordered collections of unique items.",
                "theory": "Sets are used to store multiple items in a single variable. A set is a collection which is unordered, unchangeable (but you can remove items and add new items), and unindexed. No duplicate members allowed.",
                "code_examples": [
                    {"title": "Set Operations", "code": "colors = {'red', 'blue', 'red'}\nprint(colors)  # {'red', 'blue'}\ncolors.add('green')"}
                ],
                "key_concepts": ["Unordered", "Unique items", "add()", "remove()"],
                "xp_reward": 50
            },
            {
                "id": "dicts",
                "title": "Dictionaries",
                "description": "Key-value pairs for structured data storage.",
                "theory": "Dictionaries are used to store data values in key:value pairs. A dictionary is a collection which is ordered (as of Python 3.7), changeable, and does not allow duplicates.",
                "code_examples": [
                    {"title": "User Dict", "code": "user = {'name': 'Alice', 'role': 'Admin'}\nprint(user['name'])\nuser['email'] = 'alice@web.com'"}
                ],
                "key_concepts": ["Key-value", "Fast lookup", "keys()", "values()"],
                "xp_reward": 50
            }
        ]
    },
    {
        "category_id": "oop",
        "category_title": "Object Oriented Programming",
        "lessons": [
            {
                "id": "classes",
                "title": "Classes",
                "description": "Blueprints for creating your own objects.",
                "theory": "Python is an object-oriented programming language. Almost everything in Python is an object, with its properties and methods. A Class is like an object constructor, or a 'blueprint' for creating objects.",
                "code_examples": [
                    {"title": "User Class", "code": "class MyClass:\n    x = 5\n\np1 = MyClass()\nprint(p1.x)"}
                ],
                "key_concepts": ["Blueprint", "Attributes", "Methods"],
                "xp_reward": 50
            },
            {
                "id": "objects",
                "title": "Objects",
                "description": "Instances of classes with their own attributes.",
                "theory": "Objects are basic building blocks of OOP. An object has a state (attributes) and behavior (methods). You can create multiple objects from a single class.",
                "code_examples": [
                    {"title": "Init Method", "code": "class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\np1 = Person('John', 36)\nprint(p1.name)"}
                ],
                "key_concepts": ["__init__", "self parameter", "Instance"],
                "xp_reward": 50
            },
            {
                "id": "inheritance",
                "title": "Inheritance",
                "description": "Creating new classes based on existing ones.",
                "theory": "Inheritance allows us to define a class that inherits all the methods and properties from another class. Parent class is the class being inherited from. Child class is the class that inherits.",
                "code_examples": [
                    {"title": "Student Inherits Person", "code": "class Person:\n    def printname(self):\n        print('Full Name')\n\nclass Student(Person):\n    pass\n\nx = Student()\nx.printname()"}
                ],
                "key_concepts": ["Parent class", "Child class", "Reusability"],
                "xp_reward": 50
            },
            {
                "id": "poly",
                "title": "Polymorphism",
                "description": "Using a unified interface for different data types.",
                "theory": "The word 'polymorphism' means 'many forms', and in programming it refers to methods/functions/operators with the same name that can be executed on many objects or classes.",
                "code_examples": [
                    {"title": "Len Polymorphism", "code": "print(len('Python')) # Length of string\nprint(len([1, 2, 3])) # Number of items"}
                ],
                "key_concepts": ["Unified interface", "Method overriding"],
                "xp_reward": 50
            }
        ]
    },
    {
        "category_id": "advanced",
        "category_title": "Advanced Python",
        "lessons": [
            {
                "id": "file_handling",
                "title": "File Handling",
                "description": "Reading from and writing to local files.",
                "theory": "The key function for working with files in Python is the open() function. The open() function takes two parameters: filename, and mode (r for read, a for append, w for write, x for create).",
                "code_examples": [
                    {"title": "Write & Read", "code": "f = open('myfile.txt', 'w')\nf.write('Hello!')\nf.close()\n\nf = open('myfile.txt', 'r')\nprint(f.read())"}
                ],
                "key_concepts": ["open()", "read()", "write()", "close()"],
                "xp_reward": 50
            },
            {
                "id": "exceptions",
                "title": "Exception Handling",
                "description": "Managing errors gracefully using try-except blocks.",
                "theory": "When an error occurs, Python will normally stop and generate an error message. These exceptions can be handled using the try statement. The except block lets you handle the error.",
                "code_examples": [
                    {"title": "Try Except", "code": "try:\n    print(x)\nexcept NameError:\n    print('Variable x is not defined')\nfinally:\n    print('Cleanup done')"}
                ],
                "key_concepts": ["try", "except", "finally", "Error management"],
                "xp_reward": 50
            },
            {
                "id": "modules",
                "title": "Modules",
                "description": "Using external libraries and organizing large codebases.",
                "theory": "Consider a module to be the same as a code library. A file containing a set of functions you want to include in your application. Use the import statement to use a module.",
                "code_examples": [
                    {"title": "Math Module", "code": "import math\nprint(math.sqrt(64))"}
                ],
                "key_concepts": ["import", "Built-in modules", "pip"],
                "xp_reward": 50
            },
            {
                "id": "apis",
                "title": "APIs with requests",
                "description": "Interacting with web services using the requests library.",
                "theory": "The requests module allows you to send HTTP requests using Python. The HTTP request returns a Response Object with all the response data (content, encoding, status, etc).",
                "code_examples": [
                    {"title": "GET Request", "code": "import requests\nx = requests.get('https://w3schools.com')\nprint(x.status_code)"}
                ],
                "key_concepts": ["GET", "POST", "JSON", "Status codes"],
                "xp_reward": 50
            }
        ]
    }
]

def seed():
    lessons_collection.delete_many({})  # Clear existing
    flat_lessons = []
    for cat in SYLLABUS:
        for lesson in cat["lessons"]:
            lesson["category_id"] = cat["category_id"]
            lesson["category_title"] = cat["category_title"]
            flat_lessons.append(lesson)
    
    lessons_collection.insert_many(flat_lessons)
    print(f"Successfully seeded {len(flat_lessons)} detailed lessons.")

if __name__ == "__main__":
    seed()
