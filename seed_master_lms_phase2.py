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

PHASE_2_LESSONS = [
    {
        "id": "loops",
        "title": "Loops in Python",
        "category_id": "control_flow",
        "category_title": "Control Flow",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Don't repeat yourself! Learn how to use 'for' and 'while' loops to automate repetitive tasks.",
        "theory": """
# Loops: The Power of Repetition

In programming, loops allow you to execute a block of code multiple times. This is essential for processing lists, repeating calculations, or running a program until a certain condition is met.

---

## 1. The `while` Loop
A `while` loop executes as long as a condition is **True**.
```python
i = 1
while i < 6:
  print(i)
  i += 1
```
**Warning:** Be careful not to create an **infinite loop** (a loop that never stops because the condition is always True).

---

## 2. The `for` Loop
A `for` loop is used for iterating over a sequence (list, tuple, dictionary, set, or string).
```python
fruits = ["apple", "banana", "cherry"]
for x in fruits:
  print(x)
```

---

## 3. The `range()` Function
To loop through a set of code a specified number of times, we use the `range()` function.
`range(6)` returns numbers from 0 to 5.
```python
for x in range(2, 6):
  print(x) # 2, 3, 4, 5
```

---

## 4. Break and Continue
*   **break:** Stops the loop entirely even if the condition is still True.
*   **continue:** Skips the current iteration and moves to the next one.

---

## Real-World Use Cases
| Scenario | Loop Type |
| :--- | :--- |
| **Emailing Users** | `for user in user_list: send_email(user)` |
| **Game Loop** | `while player_is_alive: update_game_state()` |
| **Data Cleaning** | `for row in spreadsheet: fix_formatting(row)` |

---

## Common Mistakes
*   **Infinite While Loop:** Forgetting to update the counter (`i += 1`).
*   **Off-by-One Error:** Thinking `range(5)` includes the number 5 (it stops at 4).
*   **Indentation:** Lines inside the loop must be indented.

---

## MCQ Quiz
1. **Which loop is used when the number of iterations is known?**
   - for loop (Correct)
2. **What does 'break' do?**
   - Stops the loop (Correct)
... (etc)
""",
        "code_examples": [
            {"title": "While Loop", "code": "count = 5\nwhile count > 0:\n    print(count)\n    count -= 1\nprint('Blast off!')"},
            {"title": "For Loop with List", "code": "colors = ['red', 'green', 'blue']\nfor c in colors:\n    print(f'Color: {c}')"},
            {"title": "Range with Step", "code": "for x in range(0, 11, 2):\n    print(x) # Even numbers 0-10"},
            {"title": "Break Example", "code": "for n in range(10):\n    if n == 5:\n        break\n    print(n)"},
            {"title": "Continue Example", "code": "for n in range(5):\n    if n == 2:\n        continue\n    print(n) # Skips 2"}
        ],
        "real_world_use_cases": [
            {"case": "Search Algorithms", "description": "Looping through a database to find a specific entry."},
            {"case": "Animation", "description": "Repeating a sequence of frames to create movement."},
            {"case": "Financial Reports", "description": "Iterating through transactions to calculate monthly totals."}
        ],
        "common_mistakes": [
            {"mistake": "Index Out of Range", "correction": "Ensure your loop doesn't try to access elements that don't exist."},
            {"mistake": "Unnecessary Loops", "correction": "Check if a built-in Python function (like sum()) can do the job instead."}
        ],
        "mcq_quiz": [
            {"question": "How do you start a while loop?", "options": ["while i < 10:", "while i < 10 then", "while (i < 10)", "None"], "answer": "while i < 10:", "explanation": "Colon is mandatory."},
            {"question": "What is an infinite loop?", "options": ["Loop that runs 100 times", "Loop that never stops", "Loop with error", "None"], "answer": "Loop that never stops", "explanation": "Occurs when condition remains True."},
            {"question": "What does range(5) produce?", "options": ["0,1,2,3,4,5", "1,2,3,4,5", "0,1,2,3,4", "None"], "answer": "0,1,2,3,4", "explanation": "Excludes the stop value."},
            {"question": "Which keyword skips the current step?", "options": ["stop", "skip", "continue", "break"], "answer": "continue", "explanation": "It skips to the next iteration."},
            {"question": "Which keyword exits the entire loop?", "options": ["exit", "break", "continue", "stop"], "answer": "break", "explanation": "Immediate termination."},
            {"question": "Can you use an 'else' with a loop?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Runs once the loop finishes normally."},
            {"question": "Which loop is better for lists?", "options": ["while", "for"], "answer": "for", "explanation": "More concise and idiomatic."},
            {"question": "What is 'i += 1'?", "options": ["Increment", "Decrement", "Assignment", "None"], "answer": "Increment", "explanation": "Short for i = i + 1."},
            {"question": "How do you loop 10 times?", "options": ["for x in 10:", "for x in range(10):", "while 10:", "None"], "answer": "for x in range(10):", "explanation": "Standard practice."},
            {"question": "What is the output of range(1, 4)?", "options": ["1, 2, 3, 4", "1, 2, 3", "2, 3", "None"], "answer": "1, 2, 3", "explanation": "Starts at 1, ends before 4."}
        ],
        "coding_challenges": [
            {"challenge": "Write a loop that prints the multiplication table of 5 (5 * 1 to 5 * 10).", "hints": ["Use range(1, 11)."]}
        ],
        "summary": "Loops are the engine of automation in Python."
    },
    {
        "id": "nested_loops",
        "title": "Nested Loops",
        "category_id": "control_flow",
        "category_title": "Control Flow",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Loops inside loops! Master multi-dimensional data processing.",
        "theory": """
# Nested Loops: Loops Within Loops

A nested loop is a loop inside a loop. The "inner loop" will be executed one time for each iteration of the "outer loop".

---

## 1. Basic Syntax
```python
adj = ["red", "big", "tasty"]
fruits = ["apple", "banana", "cherry"]

for x in adj:
  for y in fruits:
    print(x, y)
```
In this example, for every 1 adjective, all 3 fruits are printed.

---

## 2. Multi-Dimensional Data
Nested loops are commonly used to handle 2D structures like grids or tables.
```python
matrix = [[1, 2], [3, 4]]
for row in matrix:
    for item in row:
        print(item)
```

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **Chess Boards** | Iterating through rows (0-7) and columns (0-7). |
| **Pixel Processing** | Scanning every pixel in an image (X and Y coordinates). |
| **Team Schedules** | Matching every team against every other team in a league. |

---

## Common Mistakes
*   **Performance Issues:** Complex nested loops can be very slow.
*   **Variable Name Collision:** Using the same variable name (e.g., `i`) for both loops.
*   **Deep Nesting:** Going too many levels deep (more than 3) makes code very hard to read.

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Adjective Fruit Combinations", "code": "adj = ['red', 'big']\nfruits = ['apple', 'banana']\nfor a in adj:\n    for f in fruits:\n        print(a, f)"},
            {"title": "Multiplication Table Grid", "code": "for i in range(1, 4):\n    for j in range(1, 4):\n        print(f'{i}x{j}={i*j}', end=' ')\n    print()"},
            {"title": "Pyramid Pattern", "code": "for i in range(5):\n    for j in range(i + 1):\n        print('*', end='')\n    print()"},
            {"title": "Scanning a Matrix", "code": "matrix = [[1, 2], [3, 4]]\nfor row in matrix:\n    for val in row:\n        print(val)"},
            {"title": "Nested While", "code": "i = 1\nwhile i <= 3:\n    j = 1\n    while j <= 3:\n        print(i, j)\n        j += 1\n    i += 1"}
        ],
        "real_world_use_cases": [
            {"case": "Game Maps", "description": "Checking collisions on a tile-based map grid."},
            {"case": "CSV Processing", "description": "Iterating through rows and then through each cell in the row."},
            {"case": "Brute Force", "description": "Trying every possible combination of characters in a password (don't do this illegally!)."}
        ],
        "common_mistakes": [
            {"mistake": "Mixing Indices", "correction": "Always use distinct names like 'i', 'j', 'k' or descriptive names like 'row', 'col'."},
            {"mistake": "Infinite Inner Loop", "correction": "Ensure the inner condition is met so it doesn't block the outer loop."}
        ],
        "mcq_quiz": [
            {"question": "What is a nested loop?", "options": ["Loop inside loop", "Loop after loop", "Two loops", "None"], "answer": "Loop inside loop", "explanation": "Hierarchical repetition."},
            {"question": "How many times does an inner loop run total if outer runs 3 and inner runs 4?", "options": ["7", "1", "12", "None"], "answer": "12", "explanation": "3 * 4 = 12."},
            {"question": "Common use of nested loops?", "options": ["Single list", "2D Matrix", "Math", "None"], "answer": "2D Matrix", "explanation": "Grids require two indices."},
            {"question": "If outer is 'for i' and inner is 'for j', is i accessible in inner?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Inner scope has access to outer variables."},
            {"question": "Is 'j' accessible in outer if defined in inner?", "options": ["Yes", "No"], "answer": "No", "explanation": "Scope of inner variables is limited."},
            {"question": "What happens if inner has a break?", "options": ["Whole thing stops", "Only inner stops", "Error", "None"], "answer": "Only inner stops", "explanation": "Break only affects the nearest loop."},
            {"question": "What is the complexity of O(n^2)?", "options": ["Linear", "Quadratic", "Log", "None"], "answer": "Quadratic", "explanation": "Related to nested loops."},
            {"question": "Can you nest more than 2 loops?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "You can nest as many as needed, but watch performance."},
            {"question": "Is indentation critical here?", "options": ["Extremely", "Optional", "Sometimes", "None"], "answer": "Extremely", "explanation": "Defines what's inside what."},
            {"question": "Common naming for loop variables?", "options": ["i, j, k", "x, y, z", "Both", "None"], "answer": "Both", "explanation": "Industry standard conventions."}
        ],
        "coding_challenges": [
            {"challenge": "Print a 3x3 square of '#' characters.", "hints": ["Use a nested loop and end=''."]}
        ],
        "summary": "Nested loops are essential for handling complex, multi-layered data structures."
    },
    {
        "id": "func_basics",
        "title": "Functions in Python",
        "category_id": "functions",
        "category_title": "Functions",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Reusable code blocks. Learn how to write once and run everywhere.",
        "theory": """
# Functions: Building Reusable Blocks

A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function. A function can return data as a result.

---

## 1. Creating a Function
In Python, a function is defined using the `def` keyword.
```python
def my_function():
  print("Hello from a function")
```

---

## 2. Calling a Function
To call a function, use the function name followed by parenthesis:
```python
my_function()
```

---

## 3. Why Use Functions?
*   **Reusability:** Write once, use many times.
*   **Organization:** Breaks complex problems into smaller, manageable pieces (Modularization).
*   **Maintainability:** If you need to change logic, you only change it in one place.

---

## Real-World Use Cases
| Functionality | Usage |
| :--- | :--- |
| **Validation** | `check_email_format(email)` used in Signup and Login. |
| **Calculation** | `calc_tax(amount)` used in Checkout. |
| **Formatting** | `format_date(iso_string)` used across the dashboard. |

---

## Common Mistakes
*   **Defining without Calling:** Writing the function but forgetting to ever execute it.
*   **Indentation:** Code "inside" the function must be indented.
*   **Naming Collisions:** Giving a function the same name as a built-in Python function.

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Function", "code": "def greet():\n    print('Hello Students!')\n\ngreet()"},
            {"title": "Multiple Calls", "code": "def shout():\n    print('GO!')\nshout()\nshout()\nshout()"},
            {"title": "Logic inside Function", "code": "def check_even(n):\n    if n % 2 == 0:\n        print('Even')\n    else:\n        print('Odd')\ncheck_even(4)"},
            {"title": "Local Variables", "code": "def scope_test():\n    x = 10 # local\n    print(x)\nscope_test()"},
            {"title": "Function as Object", "code": "def hi(): return 'hi'\nf = hi\nprint(f())"}
        ],
        "real_world_use_cases": [
            {"case": "User Auth", "description": "Calling a login function every time a user submits the form."},
            {"case": "Physics Engines", "description": "Calculating gravity effects in a loop for every object."},
            {"case": "Data Cleaning", "description": "Applying a 'clean_text' function to thousands of database entries."}
        ],
        "common_mistakes": [
            {"mistake": "Scope Errors", "correction": "Variables created inside a function cannot be used outside of it."},
            {"mistake": "Missing def", "correction": "Always start function definitions with 'def'."}
        ],
        "mcq_quiz": [
            {"question": "How do you define a function?", "options": ["function name():", "def name():", "create name():", "None"], "answer": "def name():", "explanation": "def stands for define."},
            {"question": "How do you call 'myFunc'?", "options": ["myFunc()", "call myFunc", "run myFunc", "None"], "answer": "myFunc()", "explanation": "Parentheses are necessary to execute."},
            {"question": "Purpose of def?", "options": ["Import", "Loop", "Define function", "None"], "answer": "Define function", "explanation": "Reserved keyword."},
            {"question": "Is code inside def executed immediately?", "options": ["Yes", "No"], "answer": "No", "explanation": "Only when called."},
            {"question": "Benefit of functions?", "options": ["Modular code", "Less memory", "Faster math", "None"], "answer": "Modular code", "explanation": "Breaks down logic."},
            {"question": "Can a function call another function?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Function nesting is common."},
            {"question": "What is a docstring?", "options": ["Error", "Documentation string", "Secret code", "None"], "answer": "Documentation string", "explanation": "Used to describe what the function does."},
            {"question": "Where does function code live?", "options": ["Top", "Indented block", "Anywhere", "None"], "answer": "Indented block", "explanation": "Python scope rule."},
            {"question": "What happens if you redefine a function name?", "options": ["Both exist", "New one overwrites", "Error", "None"], "answer": "New one overwrites", "explanation": "Latest definition wins."},
            {"question": "Function naming convention?", "options": ["CamelCase", "snake_case", "SCREAM", "None"], "answer": "snake_case", "explanation": "PEP 8 recommendation."}
        ],
        "coding_challenges": [
            {"challenge": "Define a function 'show_welcome' that prints 'Welcome to Python 3!'. Call it twice.", "hints": ["Don't forget the colon."]}
        ],
        "summary": "Functions are the backbone of clean, organized code."
    },
    {
        "id": "args",
        "title": "Function Arguments",
        "category_id": "functions",
        "category_title": "Functions",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Send data to your functions to make them dynamic and flexible.",
        "theory": """
# Arguments: Sending Information

Information can be passed into functions as arguments. Arguments are specified after the function name, inside the parentheses. You can add as many arguments as you want, just separate them with a comma.

---

## 1. Parameters vs Arguments
*   **Parameter:** The variable listed inside the parentheses in the function definition (e.g., `def my_func(name):`).
*   **Argument:** The value that is sent to the function when it is called (e.g., `my_func("Alice")`).

---

## 2. Default Arguments
If we call the function without an argument, it uses the default value:
```python
def greet(country = "Norway"):
  print("I am from " + country)
```

---

## 3. Arbitrary Arguments (*args)
If you do not know how many arguments will be passed, add a `*` before the parameter name.
```python
def my_function(*kids):
  print("The youngest child is " + kids[2])
```

---

## 4. Keyword Arguments (kwargs)
You can also send arguments with the `key = value` syntax. This way the order of the arguments does not matter.
```python
def my_function(child3, child2, child1):
  print("The youngest child is " + child3)
```

---

## Common Mistakes
*   **Missing Arguments:** Calling a function that requires 2 args with only 1.
*   **Order Confusion:** Passing a 'name' to the 'age' parameter because you mixed up the positions.
*   **Mutability:** Passing a list and modifying it inside the function (this affects the original list!).

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Args", "code": "def greet(name):\n    print(f'Hello {name}!')\ngreet('Ayush')"},
            {"title": "Multiple Args", "code": "def add(a, b):\n    print(a + b)\nadd(10, 5)"},
            {"title": "Default Value", "code": "def power(base, exp=2):\n    print(base ** exp)\npower(10) # 100\npower(2, 3) # 8"},
            {"title": "Args (*args)", "code": "def sum_all(*nums):\n    total = sum(nums)\n    print(total)\nsum_all(1, 2, 3, 4)"},
            {"title": "Keyword Args", "code": "def info(name, age):\n    print(f'{name} is {age}')\ninfo(age=25, name='Bob')"}
        ],
        "real_world_use_cases": [
            {"case": "API Requests", "description": "Passing parameters like 'api_key' and 'query' to a request function."},
            {"case": "User Settings", "description": "Passing 'theme' and 'language' preferences to an UI initializer."},
            {"case": "Math Libraries", "description": "Taking coefficients for a quadratic solver function."}
        ],
        "common_mistakes": [
            {"mistake": "Too many arguments", "correction": "Ensure you match the number of arguments to the number of parameters defined."},
            {"mistake": "Default argument order", "correction": "Default parameters must follow mandatory parameters (e.g., def f(a, b=10) is OK)."}
        ],
        "mcq_quiz": [
            {"question": "What is an argument?", "options": ["Value sent to function", "Name of function", "Result of function", "None"], "answer": "Value sent to function", "explanation": "The actual data passed."},
            {"question": "Which symbol for arbitrary arguments?", "options": ["*", "&", "#", "@"], "answer": "*", "explanation": "Commonly called *args."},
            {"question": "What is a keyword argument?", "options": ["arg with value", "arg with name=value", "secret arg", "None"], "answer": "arg with name=value", "explanation": "Specifies parameter name."},
            {"question": "Can a function have 0 arguments?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Standalone blocks."},
            {"question": "What if you pass 3 items to function(a, b)?", "options": ["Skips 3rd", "Errors", "Works", "None"], "answer": "Errors", "explanation": "TypeError: too many arguments."},
            {"question": "Argument with default value?", "options": ["Optional", "Mandatory", "Static", "None"], "answer": "Optional", "explanation": "If omitted, default is used."},
            {"question": "Symbol for arbitrary keyword args?", "options": ["*", "**", "***", "#"], "answer": "**", "explanation": "Commonly called **kwargs."},
            {"question": "Benefit of keyword args?", "options": ["Speed", "Order doesn't matter", "Encryption", "None"], "answer": "Order doesn't matter", "explanation": "Clearer documentation too."},
            {"question": "Parameter vs Argument?", "options": ["Same thing", "Varies", "Variable vs Value", "None"], "answer": "Variable vs Value", "explanation": "Parameter is in def, Argument is in call."},
            {"question": "Can you mix positional and keyword args?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Positional must come first."}
        ],
        "coding_challenges": [
            {"challenge": "Write a function 'multiply' that takes two numbers and prints their product. If only one number is provided, multiply it by 10.", "hints": ["Use a default value for the second parameter."]}
        ],
        "summary": "Arguments make functions dynamic, allowing them to process different data every time they run."
    },
    {
        "id": "return",
        "title": "Return Values",
        "category_id": "functions",
        "category_title": "Functions",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Get results back from your functions. The bridge between calculation and usage.",
        "theory": """
# Return Values: Getting Answers Back

A function can return a value using the `return` statement. This "returns" the result to the caller, where it can be stored in a variable or used directly.

---

## 1. The `return` Keyword
Once a `return` statement is reached, the function exits immediately.
```python
def my_function(x):
  return 5 * x

result = my_function(3)
print(result) # 15
```

---

## 2. Why Return instead of Print?
*   **Flexibility:** You can do further math on a returned value. You can't do math on something that was just printed.
*   **Pure Logic:** Good functions perform a task and return the result, leaving the "printing" to other parts of the program.

---

## 3. Returning Multiple Values
In Python, you can return multiple items as a tuple (automatically).
```python
def get_coords():
    return 10, 20
x, y = get_coords()
```

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **Logic Check** | `is_valid()` returning `True` or `False`. |
| **Data Retrieval** | `fetch_user_name()` returning a string from a DB. |
| **Complex Math** | `calculate_mortgage()` returning the monthly payment amount. |

---

## Common Mistakes
*   **Code After Return:** Any code written after a `return` statement in the same block will never run.
*   **NoneType Error:** Forgetting to use `return` and trying to use the result. (Functions without `return` return `None` by default).

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Simple Return", "code": "def add(a, b):\n    return a + b\n\nx = add(5, 5)\nprint(x)"},
            {"title": "Returning Logic", "code": "def is_adult(age):\n    return age >= 18\n\nif is_adult(20):\n    print('Access Granted')"},
            {"title": "Multiple Return", "code": "def min_max(nums):\n    return min(nums), max(nums)\n\nlo, hi = min_max([1, 10, 5])\nprint(lo, hi)"},
            {"title": "Exiting Early", "code": "def find_even(nums):\n    for n in nums:\n        if n % 2 == 0:\n            return n # Stops at first even\n    return None"},
            {"title": "Result usage", "code": "def square(n): return n*n\nprint(square(square(2))) # 16"}
        ],
        "real_world_use_cases": [
            {"case": "Calculators", "description": "Returning the result of an operation to be displayed on the screen."},
            {"case": "Search Engines", "description": "Returning a list of matching results to the user interface."},
            {"case": "Game AI", "description": "Returning the 'best' move for a bot to play."}
        ],
        "common_mistakes": [
            {"mistake": "Printing inside instead of returning", "correction": "Unless the function is specifically for logging, return the data so it can be reused."},
            {"mistake": "Infinite Recursion", "correction": "Ensure your recursive functions eventually reach a return statement for a base case."}
        ],
        "mcq_quiz": [
            {"question": "How do you send a result back?", "options": ["send", "output", "return", "back"], "answer": "return", "explanation": "Keywords for result passing."},
            {"question": "What happens after 'return' runs?", "options": ["Function continues", "Function exits", "Function restarts", "None"], "answer": "Function exits", "explanation": "Immediate termination of scope."},
            {"question": "What is the result of a function with no return?", "options": ["0", "False", "None", "Error"], "answer": "None", "explanation": "NoneType is default."},
            {"question": "Can you return a list?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Any object can be returned."},
            {"question": "Can you have multiple return statements?", "options": ["Yes, only if one runs", "No", "Yes, all run", "None"], "answer": "Yes, only if one runs", "explanation": "Switching or conditional returns."},
            {"question": "Return multiple values at once?", "options": ["Tuple unpacking", "Not possible", "Error", "None"], "answer": "Tuple unpacking", "explanation": "a, b = func()."},
            {"question": "Is 'return' mandatory?", "options": ["Yes", "No"], "answer": "No", "explanation": "But necessary to get data out."},
            {"question": "Can you return a function?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Functions are first-class objects."},
            {"question": "What does 'return' by itself do?", "options": ["Returns 0", "Returns None and exits", "Errors", "None"], "answer": "Returns None and exits", "explanation": "Clean early exit."},
            {"question": "Difference between print and return?", "options": ["Display vs Data", "Internal vs External", "Both", "None"], "answer": "Both", "explanation": "One shows to human, other gives to code."}
        ],
        "coding_challenges": [
            {"challenge": "Write a function 'avg' that takes a list of numbers and returns their average. If the list is empty, return 0.", "hints": ["Use sum(list) / len(list)."]}
        ],
        "summary": "Return values transform functions into literal expressions that represent data."
    },
    {
        "id": "lambda",
        "title": "Lambda Functions",
        "category_id": "functions",
        "category_title": "Functions",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Anonymous, one-line functions for quick logic. Elegant and powerful.",
        "theory": """
# Lambda Functions: Small and Anonymous

A lambda function is a small anonymous function. A lambda function can take any number of arguments, but can only have **one expression**.

---

## 1. Syntax
`lambda arguments : expression`
The expression is executed and the result is returned.

```python
x = lambda a : a + 10
print(x(5)) # 15
```

---

## 2. Why Use Lambda?
The power of lambda is better shown when you use them as an anonymous function inside another function.
Example: Using them with `filter()`, `map()`, or `sorted()`.

```python
mylist = [1, 2, 3, 4]
evens = list(filter(lambda x: x % 2 == 0, mylist))
```

---

## 3. Limitations
*   No multiple expressions or lines.
*   No statements (like `if`, `while`, `print` statements—only expressions).
*   Can be harder to read for complex logic. Use `def` for anything over one line.

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **Custom Sorting** | Sorting a list of users by their score: `sorted(users, key=lambda x: x['score'])`. |
| **Quick Mapping** | Doubling every number in a list: `map(lambda x: x*2, mylist)`. |
| **Logic Callbacks** | Quick event handlers in GUI frameworks like Tkinter. |

---

## Common Mistakes
*   **Overuse:** Using lambda for complex logic makes your code "unpythonic" and hard to read.
*   **Confusion:** Forgetting that it returns automatically (no `return` keyword needed).

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Lambda", "code": "add = lambda a, b: a + b\nprint(add(10, 20))"},
            {"title": "Filter Evens", "code": "nums = [1, 2, 3, 4, 5, 6]\nevens = list(filter(lambda x: x % 2 == 0, nums))\nprint(evens)"},
            {"title": "Map Double", "code": "nums = [1, 2, 3]\ndoubles = list(map(lambda x: x * 2, nums))\nprint(doubles)"},
            {"title": "Custom Sort", "code": "pairs = [(1, 'one'), (2, 'two'), (3, 'three')]\npairs.sort(key=lambda x: x[1]) # Sort by string\nprint(pairs)"},
            {"title": "Immediate Call", "code": "print((lambda x: x**2)(3)) # 9"}
        ],
        "real_world_use_cases": [
            {"case": "Data Transformation", "description": "Applying small formatting rules to a stream of data."},
            {"case": "Functional Programming", "description": "Using purely functional patterns in Python."},
            {"case": "UI Events", "description": "Quickly defining a button action without a formal function."}
        ],
        "common_mistakes": [
            {"mistake": "Naming too often", "correction": "If you name the lambda, just use 'def'. The point of lambda is anonymity."},
            {"mistake": "Complex lambdas", "correction": "Break it into a regular function if it spans more than 50-60 characters."}
        ],
        "mcq_quiz": [
            {"question": "What is a lambda function?", "options": ["Named function", "Large function", "Anonymous function", "None"], "answer": "Anonymous function", "explanation": "They don't have a name."},
            {"question": "Keyword for anonymous functions?", "options": ["anon", "lambda", "func", "L"], "answer": "lambda", "explanation": "Borrowed from lambda calculus."},
            {"question": "How many expressions can lambda have?", "options": ["0", "1", "As many as needed", "None"], "answer": "1", "explanation": "Strict limitation."},
            {"question": "Return keyword in lambda?", "options": ["Required", "Forbidden", "Optional", "None"], "answer": "Forbidden", "explanation": "Expression result is auto-returned."},
            {"question": "Can lambda take arguments?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Any number of them."},
            {"question": "Commonly used with?", "options": ["filter, map, sorted", "print, input", "while, if", "None"], "answer": "filter, map, sorted", "explanation": "Standard application."},
            {"question": "Can it have an 'if'?", "options": ["Only Ternary", "Full If", "No", "None"], "answer": "Only Ternary", "explanation": "Since full if is a statement."},
            {"question": "Is it and 'O' or 'X' in O(n) regarding speed vs def?", "options": ["Faster", "Slower", "Same", "None"], "answer": "Same", "explanation": "It's just a different syntax."},
            {"question": "Lambda syntax?", "options": ["lambda args : expr", "lambda(args) : expr", "lambda : args -> expr", "None"], "answer": "lambda args : expr", "explanation": "Colon separates args and logic."},
            {"question": "Are they reusable easily?", "options": ["Yes", "No", "Depends", "None"], "answer": "No", "explanation": "They are meant for one-off use."}
        ],
        "coding_challenges": [
            {"challenge": "Create a lambda that takes a number and returns True if it's greater than 100, else False.", "hints": ["n > 100."]}
        ],
        "summary": "Lambda functions provide concise syntax for simple logic."
    }
]

if __name__ == "__main__":
    seed_lessons(PHASE_2_LESSONS)
