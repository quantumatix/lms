from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb://localhost:27017")
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

PHASE_4B_LESSONS = [
    {
        "id": "files",
        "title": "File Handling",
        "category_id": "advanced",
        "category_title": "Advanced Python",
        "difficulty": "Advanced",
        "xp_reward": 150,
        "description": "Read and write data to your computer. Persistent storage beyond program execution.",
        "theory": """
# File Handling: Saving Your Progress

File handling is an important part of any web or desktop application. Python has several functions for creating, reading, updating, and deleting files.

---

## 1. Opening a File
The key function for working with files in Python is the `open()` function.
`open(filename, mode)`

Modes:
*   `"r"` - Read (Default). Opens a file for reading, error if the file does not exist.
*   `"a"` - Append. Opens a file for appending, creates the file if it does not exist.
*   `"w"` - Write. Opens a file for writing, creates the file if it does not exist. (Overwrites content!).
*   `"x"` - Create. Creates the specified file, returns an error if the file exists.

---

## 2. Reading a File
```python
f = open("demofile.txt", "r")
print(f.read())
f.close()
```

---

## 3. The `with` Statement (Best Practice)
Using `with` ensures that the file is properly closed even if an exception occurs.
```python
with open("test.txt", "w") as f:
    f.write("Hello World")
```

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **Log Files** | Writing application events to a `.log` file for debugging. |
| **Data Export** | Saving user reports as `.txt` or `.csv`. |
| **Configuration** | Reading settings from a `.json` or `.ini` file. |

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Read File", "code": "# f = open('test.txt', 'r')\n# print(f.read())\n# f.close()"},
            {"title": "Write File", "code": "with open('note.txt', 'w') as f:\n    f.write('Python is awesome!')"},
            {"title": "Append File", "code": "with open('log.txt', 'a') as f:\n    f.write('Action performed\\n')"},
            {"title": "Read Lines", "code": "with open('data.txt', 'r') as f:\n    for line in f:\n        print(line)"},
            {"title": "Check Existence", "code": "import os\nif os.path.exists('file.txt'):\n    print('Found it!')"}
        ],
        "real_world_use_cases": [
            {"case": "Server Logging", "description": "Capturing every internal error into a file so developers can fix them later."},
            {"case": "Game Saves", "description": "Writing the player's level and inventory to a file on local storage."},
            {"case": "Machine Learning", "description": "Reading large datasets from CSV files into memory for training."}
        ],
        "common_mistakes": [
            {"mistake": "Forgotten close()", "correction": "Always use the 'with' statement. It handles closing automatically."},
            {"mistake": "Relative Paths", "correction": "Ensure your script is running in the correct directory, or use absolute paths."},
            {"mistake": "Overwrite danger", "correction": "Careful with 'w' mode as it deletes everything already in the file. Use 'a' to keep existing data."}
        ],
        "mcq_quiz": [
            {"question": "How to open a file for reading?", "options": ["open(f, 'r')", "read(f)", "get(f)", "None"], "answer": "open(f, 'r')", "explanation": "'r' is for read."},
            {"question": "How to open for appending?", "options": ["'w'", "'a'", "'r+'", "None"], "answer": "'a'", "explanation": "'a' stands for append."},
            {"question": "What does 'w' do to existing files?", "options": ["Adds to them", "Errors out", "Overwrites them", "None"], "answer": "Overwrites them", "explanation": "It starts from empty."},
            {"question": "Safe way to open (auto-close)?", "options": ["with open...", "open().close()", "try...finally", "None"], "answer": "with open...", "explanation": "Context managers handle cleanup."},
            {"question": "Which method reads one line?", "options": ["read()", "readline()", "readlines()", "None"], "answer": "readline()", "explanation": "Singular line read."},
            {"question": "Which method returns a list of lines?", "options": ["read()", "readline()", "readlines()", "None"], "answer": "readlines()", "explanation": "Plural lines read."},
            {"question": "Module to delete files?", "options": ["sys", "os", "math", "None"], "answer": "os", "explanation": "os.remove() handles file deletion."},
            {"question": "Difference between 'a' and 'w'?", "options": ["Read vs Write", "Append vs Overwrite", "Both", "None"], "answer": "Append vs Overwrite", "explanation": "Both are for writing."},
            {"question": "What if file missing in 'r' mode?", "options": ["FileCreatedError", "FileNotFoundError", "None", "None"], "answer": "FileNotFoundError", "explanation": "Python exception."},
            {"question": "Is 'b' used for binary files?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "e.g. 'rb' or 'wb' for images/zip."}
        ],
        "coding_challenges": [
            {"challenge": "Create a file 'test.txt' and write 'LMS Level 1' into it. Read it back and print the content.", "hints": ["Use 'w' and then 'r'."]}
        ],
        "summary": "File handling is the key to creating programs that preserve state across sessions."
    },
    {
        "id": "exceptions",
        "title": "Exception Handling",
        "category_id": "advanced",
        "category_title": "Advanced Python",
        "difficulty": "Advanced",
        "xp_reward": 150,
        "description": "Don't let your program crash! Learn how to catch and handle errors gracefully.",
        "theory": """
# Exceptions: Handling the Unexpected

When an error occurs, or exception as we call it, Python will normally stop and generate an error message. These exceptions can be handled using the `try` statement.

---

## 1. Try ... Except
*   **try:** lets you test a block of code for errors.
*   **except:** lets you handle the error.
*   **else:** lets you execute code when there is no error.
*   **finally:** lets you execute code, regardless of the result of the try- and except blocks.

```python
try:
  print(x)
except NameError:
  print("Variable x is not defined")
except:
  print("Something else went wrong")
```

---

## 2. Raising an Exception
As a Python developer you can choose to throw an exception if a condition occurs. To throw (or raise) an exception, use the `raise` keyword.

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **Network Loss** | Catching `ConnectionError` when a server is down. |
| **User Input** | Catching `ValueError` when a user enters text where a number is expected. |
| **DB Issues** | Handling `OperationalError` during queries. |

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Try Except", "code": "try:\n    print(1/0)\nexcept ZeroDivisionError:\n    print('Cant divide by zero')"},
            {"title": "Specific Exceptions", "code": "try:\n    int('abc')\nexcept ValueError:\n    print('Invalid Number')"},
            {"title": "Finally Block", "code": "try:\n    f = open('f.txt')\nfinally:\n    print('Closing resources...')"},
            {"title": "Else Block", "code": "try:\n    print('Success')\nexcept: pass\nelse:\n    print('No errors found')"},
            {"title": "Raise Error", "code": "def check_age(a):\n    if a < 0: raise ValueError('Age < 0')\n# check_age(-1)"}
        ],
        "real_world_use_cases": [
            {"case": "Web Servers", "description": "Returning a 500 status code inside an 'except' block instead of crashing the whole server."},
            {"case": "Data Validation", "description": "Prototypical use case: trying to convert user input to int and asking again if it fails."},
            {"case": "File Cleanup", "description": "Ensuring a file is closed in the 'finally' block even if the processing fails."}
        ],
        "common_mistakes": [
            {"mistake": "Bare Except", "correction": "Avoid using 'except:' without a specific error type. It catches even system exits (Ctrl+C). Use 'except Exception:' at least."},
            {"mistake": "Overusing try-except", "correction": "Don't use it for normal control flow. It should be for 'exceptional' cases."}
        ],
        "mcq_quiz": [
            {"question": "Keywords for error handling?", "options": ["if/else", "try/except", "begin/end", "None"], "answer": "try/except", "explanation": "Standard block structure."},
            {"question": "Which block runs regardless of error?", "options": ["finally", "else", "except", "None"], "answer": "finally", "explanation": "Guaranteed execution."},
            {"question": "How to throw a custom error?", "options": ["throw", "raise", "error", "None"], "answer": "raise", "explanation": "Keyword for manual exceptions."},
            {"question": "Which block runs if NO error?", "options": ["finally", "else", "except", "None"], "answer": "else", "explanation": "Exclusive success block."},
            {"question": "Error when dividing by 0?", "options": ["MathError", "ZeroDivisionError", "NoneError", "None"], "answer": "ZeroDivisionError", "explanation": "Specific built-in error."},
            {"question": "Error when variable missing?", "options": ["MissingError", "NameError", "VariableError", "None"], "answer": "NameError", "explanation": "Standard identifier error."},
            {"question": "Can you have multiple except blocks?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "For different error types."},
            {"question": "What is 'except Exception as e'?", "options": ["Encryption", "Naming the error object", "Secret code", "None"], "answer": "Naming the error object", "explanation": "Gives you details about the error."},
            {"question": "Is it better to ask permission or forgiveness (EAFP)?", "options": ["Permission", "Forgiveness", "None", "None"], "answer": "Forgiveness", "explanation": "Pythonic philosophy (using try-except)."},
            {"question": "Can try exist without except?", "options": ["No, needs except or finally", "Yes", "Only in functions", "None"], "answer": "No, needs except or finally", "explanation": "Incomplete syntax otherwise."}
        ],
        "coding_challenges": [
            {"challenge": "Ask the user for a number. If they enter text, print 'That is not a number'.", "hints": ["Use try and int(input())."]}
        ],
        "summary": "Exception handling makes your software robust and user-friendly."
    },
    {
        "id": "modules",
        "title": "Modules",
        "category_id": "advanced",
        "category_title": "Advanced Python",
        "difficulty": "Advanced",
        "xp_reward": 150,
        "description": "Code organization at scale. Import libraries and build your own modules.",
        "theory": """
# Modules: Libraries of Code

Consider a module to be the same as a code library. A file containing a set of functions you want to include in your application.

---

## 1. Creating and Using a Module
To create a module just save the code you want in a file with the file extension `.py`.
To use it, use the `import` statement.
```python
import mymodule
mymodule.greeting("Jonathan")
```

---

## 2. Variables in Modules
The module can contain functions, as well as variables of all types (arrays, dictionaries, objects etc).

---

## 3. Built-in Modules
Python has a set of built-in modules, which you can import whenever you like.
*   **math:** Math constants and operations.
*   **datetime:** Handling date and time.
*   **json:** Parsing/Writing JSON.
*   **random:** Generating random numbers.

---

## 4. The `dir()` Function
There is a built-in function to list all the function names (or variable names) in a module. The `dir()` function.

---

## Real-World Use Cases
| Module | Industry Usage |
| :--- | :--- |
| **pandas** | Data scientists using it for tabular data analysis. |
| **requests** | Developers fetching data from the web. |
| **flask** | Web developers building backend APIs. |

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Importing math", "code": "import math\nprint(math.sqrt(16))"},
            {"title": "Specific Import", "code": "from datetime import date\nprint(date.today())"},
            {"title": "Aliasing (as)", "code": "import random as r\nprint(r.randint(1, 10))"},
            {"title": "Built-in dir()", "code": "import platform\nprint(dir(platform))"},
            {"title": "Constants", "code": "import math\nprint(math.pi)"}
        ],
        "real_world_use_cases": [
            {"case": "Project Organization", "description": "Separating database logic into db.py and email logic into mail.py."},
            {"case": "Third-party Libraries", "description": "Using 'pip install numpy' to add massive numerical capabilities."},
            {"case": "Security", "description": "Using the 'secrets' module to generate secure tokens."}
        ],
        "common_mistakes": [
            {"mistake": "Circular Imports", "correction": "Module A importing B, while B imports A. This causes a crash. Rethink your architecture."},
            {"mistake": "Module Name Collision", "correction": "Naming your file 'math.py' will prevent you from importing the real 'math' module."},
            {"mistake": "Import *", "correction": "Avoid 'from module import *' as it makes it unclear where names come from."}
        ],
        "mcq_quiz": [
            {"question": "How to include a module?", "options": ["include", "import", "using", "require"], "answer": "import", "explanation": "Python keyword."},
            {"question": "File extension for modules?", "options": [".mod", ".py", ".pyc", ".txt"], "answer": ".py", "explanation": "Regular Python files."},
            {"question": "How to rename an import?", "options": ["alias", "as", "rename", "to"], "answer": "as", "explanation": "e.g. import pandas as pd."},
            {"question": "Import only one function?", "options": ["from m import f", "get f from m", "import f", "None"], "answer": "from m import f", "explanation": "Selective import."},
            {"question": "Function to list module contents?", "options": ["list()", "dir()", "help()", "None"], "answer": "dir()", "explanation": "Directory function."},
            {"question": "Module for math?", "options": ["calc", "math", "numbers", "None"], "answer": "math", "explanation": "Standard library."},
            {"question": "Module for time?", "options": ["datetime", "clock", "timer", "None"], "answer": "datetime", "explanation": "Standard library."},
            {"question": "Where does search look for modules?", "options": ["sys.path", "Desktop", "Downloads", "None"], "answer": "sys.path", "explanation": "List of directories."},
            {"question": "Can you make your own modules?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "It's just another .py file."},
            {"question": "What is __name__ == '__main__'?", "options": ["Error check", "Check if run directly", "Loop", "None"], "answer": "Check if run directly", "explanation": "Allows script to be both a module and a runnable tool."}
        ],
        "coding_challenges": [
            {"challenge": "Import the 'random' module and print a random number between 1 and 100.", "hints": ["Use random.randint(1, 100)."]}
        ],
        "summary": "Modules allow you to stand on the shoulders of giants by using verified, robust code libraries."
    },
    {
        "id": "apis",
        "title": "Working with APIs",
        "category_id": "advanced",
        "category_title": "Advanced Python",
        "difficulty": "Advanced",
        "xp_reward": 200,
        "description": "Connect to the world. Learn how to fetch data from web services using JSON and Requests.",
        "theory": """
# APIs: The Language of the Web

API stands for Application Programming Interface. In the context of Python, we usually mean **REST APIs** that allow our program to talk to servers across the internet.

---

## 1. What is JSON?
JSON (JavaScript Object Notation) is the most common data format for APIs. It looks almost exactly like a Python dictionary.
```python
import json
data = '{"name": "John"}'
y = json.loads(data) # Parse JSON
```

---

## 2. The `requests` Module
The `requests` module is the industry standard for making HTTP requests in Python.
```python
import requests
response = requests.get("https://api.github.com")
print(response.status_code)
print(response.json())
```

---

## 3. HTTP Methods
*   **GET:** Retrieve data.
*   **POST:** Send data/Create.
*   **PUT:** Update data.
*   **DELETE:** Remove data.

---

## Real-World Use Cases
| Service | API Usage |
| :--- | :--- |
| **Weather** | Fetching current temperature from OpenWeatherMap. |
| **Stocks** | Getting real-time prices for trading bots. |
| **Social Media** | Auto-posting tweets or fetching Instagram tags. |

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Parsing JSON", "code": "import json\njson_str = '{\"id\": 10, \"valid\": true}'\ndata = json.loads(json_str)\nprint(data['id'])"},
            {"title": "JSON to String", "code": "d = {'a': 1}\ns = json.dumps(d)\nprint(s)"},
            {"title": "GET Request", "code": "import requests\n# r = requests.get('https://api.github.com/users/octocat')\n# print(r.json()['name'])"},
            {"title": "Status Codes", "code": "import requests\n# r = requests.get('...') \n# if r.status_code == 200: print('OK')"},
            {"title": "API Keys", "code": "params = {'api_key': 'SECRET'}\n# r = requests.get(url, params=params)"}
        ],
        "real_world_use_cases": [
            {"case": "Payment Gateways", "description": "Sending credit card info to Stripe API and getting a success token back."},
            {"case": "Auth Providers", "description": "Using 'Login with Google' which works entirely through OAuth2 APIs."},
            {"case": "Chatbots", "description": "Sending user messages to the OpenAI API and receiving AI responses."}
        ],
        "common_mistakes": [
            {"mistake": "Unchecked JSON loads", "correction": "Always wrap json.loads() in a try-except because invalid JSON will crash your program."},
            {"mistake": "Exposing API Keys", "correction": "Never hardcode keys in your code. Use environment variables (os.environ)."},
            {"mistake": "Timeout", "correction": "Web requests can hang forever. Always set a 'timeout' parameter in requests.get()."}
        ],
        "mcq_quiz": [
            {"question": "What does API stand for?", "options": ["App Programmable Inter", "Application Programming Interface", "Auto Power Input", "None"], "answer": "Application Programming Interface", "explanation": "Standard definition."},
            {"question": "Most common format for APIs?", "options": ["XML", "JSON", "CSV", "Binary"], "answer": "JSON", "explanation": "Lightweight and human-readable."},
            {"question": "Module for HTTP requests?", "options": ["http", "web", "requests", "get"], "answer": "requests", "explanation": "The 'Requests' library."},
            {"question": "Convert string to dict?", "options": ["json.parse()", "json.loads()", "json.dict()", "None"], "answer": "json.loads()", "explanation": "'loads' = Load String."},
            {"question": "Convert dict to string?", "options": ["json.string()", "json.dumps()", "json.write()", "None"], "answer": "json.dumps()", "explanation": "'dumps' = Dump String."},
            {"question": "Status code for 'Success'?", "options": ["404", "500", "200", "301"], "answer": "200", "explanation": "200 OK."},
            {"question": "Status code for 'Not Found'?", "options": ["404", "500", "200", "301"], "answer": "404", "explanation": "Missing resource."},
            {"question": "HTTP method for fetching data?", "options": ["POST", "GET", "PUSH", "None"], "answer": "GET", "explanation": "Standard retrieval."},
            {"question": "HTTP method for sending new data?", "options": ["POST", "GET", "PUSH", "None"], "answer": "POST", "explanation": "Standard creation."},
            {"question": "What is a 'Bearer' token?", "options": ["Type of error", "Authentication token", "Animal name", "None"], "answer": "Authentication token", "explanation": "Commonly used in 'Authorization' headers."}
        ],
        "coding_challenges": [
            {"challenge": "Print a JSON string representation of a dictionary containing your top 3 favorite movies.", "hints": ["Use json.dumps()."]}
        ],
        "summary": "APIs are the ultimate tool for expanding your program's reach beyond its local environment."
    }
]

if __name__ == "__main__":
    seed_lessons(PHASE_4B_LESSONS)
