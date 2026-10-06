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

PHASE_4A_LESSONS = [
    {
        "id": "classes",
        "title": "Classes in Python",
        "category_id": "oop",
        "category_title": "Object Oriented Programming",
        "difficulty": "Advanced",
        "xp_reward": 150,
        "description": "Blueprint for objects. Learn the fundamental concept of Object Oriented Programming (OOP).",
        "theory": """
# Classes: The Blueprint of Code

Python is an object-oriented programming language. Almost everything in Python is an object, with its properties and methods. A **Class** is like an object constructor, or a "blueprint" for creating objects.

---

## 1. Syntax
We use the `class` keyword to create a class.
```python
class MyClass:
  x = 5
```

---

## 2. The `__init__()` Function
To understand classes, we must understand the built-in `__init__()` function. All classes have a function called `__init__()`, which is always executed when the class is being initiated.
Use the `__init__()` function to assign values to object properties.
```python
class Person:
  def __init__(self, name, age):
    self.name = name
    self.age = age
```

---

## 3. The `self` Parameter
The `self` parameter is a reference to the current instance of the class and is used to access variables that belong to the class. It doesn't have to be named `self` (but is highly recommended).

---

## Real-World Use Cases
| Item | Class Blueprint |
| :--- | :--- |
| **User** | Attributes: `email`, `password`, `is_admin`. Methods: `login()`, `logout()`. |
| **Product** | Attributes: `price`, `stock`, `name`. Methods: `update_price()`. |
| **Vehicle** | Attributes: `model`, `brand`. Methods: `start_engine()`. |

---

## Common Mistakes
*   **Forgetting `self`:** Trying to access attributes without `self.` inside methods.
*   **Case Sensitivity:** Classes should usually start with an Uppercase letter (e.g., `Student` vs `student`).
*   **Indentation:** Methods must be indented inside the `class` block.

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Class", "code": "class MyClass:\n    data = 10\nobj = MyClass()\nprint(obj.data)"},
            {"title": "Using __init__", "code": "class Dog:\n    def __init__(self, name):\n        self.name = name\nd = Dog('Rocky')\nprint(d.name)"},
            {"title": "Class Methods", "code": "class Math:\n    def square(self, n):\n        return n*n\nm = Math()\nprint(m.square(5))"},
            {"title": "Updating Properties", "code": "class Counter:\n    def __init__(self): self.count = 0\n    def inc(self): self.count += 1\n\nc = Counter()\nc.inc()\nprint(c.count)"},
            {"title": "Empty Class", "code": "class Empty:\n    pass\n# use 'pass' to avoid errors"}
        ],
        "real_world_use_cases": [
            {"case": "Game Characters", "description": "Defining a 'Player' class with health, power, and weapons."},
            {"case": "Financial Systems", "description": "Defining a 'Bank_Account' class with balance and transaction history."},
            {"case": "Employee Management", "description": "Defining an 'Employee' class with salary and department."}
        ],
        "common_mistakes": [
            {"mistake": "Missing __init__", "correction": "Use __init__ to set up initial data for your objects."},
            {"mistake": "Class vs Object confusion", "correction": "The Class is the blueprint (concept), the Object is the actual house (data)."}
        ],
        "mcq_quiz": [
            {"question": "How to define a class?", "options": ["class Name:", "def Name():", "object Name:", "None"], "answer": "class Name:", "explanation": "class keyword is used."},
            {"question": "What is the constructor in Python?", "options": ["__main__", "__init__", "__start__", "None"], "answer": "__init__", "explanation": "It initializes the object."},
            {"question": "What is 'self'?", "options": ["System variable", "Reference to current instance", "Keyword for loop", "None"], "answer": "Reference to current instance", "explanation": "Mandatory first param in methods."},
            {"question": "Can a class have multiple objects?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Infinitely many from one blueprint."},
            {"question": "How to create an object of MyClass?", "options": ["o = new MyClass()", "o = MyClass()", "o = MyClass", "None"], "answer": "o = MyClass()", "explanation": "Call the class name."},
            {"question": "Is Python object-oriented?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "It's a multi-paradigm language."},
            {"question": "What is an attribute?", "options": ["Function", "Variable within a class", "Comment", "None"], "answer": "Variable within a class", "explanation": "It represents data."},
            {"question": "What is a method?", "options": ["Attribute", "Function within a class", "Special logic", "None"], "answer": "Function within a class", "explanation": "It represents behavior."},
            {"question": "Can classes have default values?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Define them in __init__ or class level."},
            {"question": "How to access x in obj?", "options": ["obj.x", "obj->x", "obj(x)", "None"], "answer": "obj.x", "explanation": "Dot notation."}
        ],
        "coding_challenges": [
            {"challenge": "Create a class 'Book' with title and author. Create two objects of this class and print their details.", "hints": ["Use __init__(self, title, author)."]}
        ],
        "summary": "Classes are the foundation of sophisticated, organized software architecture."
    },
    {
        "id": "objects",
        "title": "Objects in Python",
        "category_id": "oop",
        "category_title": "Object Oriented Programming",
        "difficulty": "Advanced",
        "xp_reward": 150,
        "description": "The actual instances of classes. Master the bridge between concept and data.",
        "theory": """
# Objects: Data in Action

An object is an instance of a Class. When the class is defined, no memory is allocated. When we create an object (instantiation), memory is allocated for the attributes.

---

## 1. Instantiation
We create objects by "calling" the class.
```python
p1 = Person("John", 36)
```

---

## 2. Object Methods
Objects can also contain methods. Methods in objects are functions that belong to the object.
```python
class Person:
  def myfunc(self):
    print("Hello my name is " + self.name)
```

---

## 3. Deleting Objects
You can delete properties or objects using the `del` keyword.
```python
del p1.age
del p1
```

---

## Real-World Use Cases
| Scenario | Object |
| :--- | :--- |
| **Login** | A `User` object is created when a person logs in. |
| **Shopping** | Every `Item` in the cart is an object of the `Product` class. |
| **Geometry** | A `Circle` object with a specific radius. |

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Creating Objects", "code": "class Car: pass\nc1 = Car()\nc2 = Car()"},
            {"title": "Instance Attributes", "code": "class User:\n    def __init__(self, u):\n        self.u = u\nua = User('Ayush')\nub = User('Bob')\nprint(ua.u, ub.u)"},
            {"title": "Calling Methods", "code": "class Calc:\n    def add(self, a, b): return a + b\nc = Calc()\nprint(c.add(1, 2))"},
            {"title": "Deleting Property", "code": "class X: a = 1\nobj = X()\ndel obj.a # Errors later if accessed"},
            {"title": "Self naming", "code": "class X:\n    def f(myself): print('hi') # works but unpythonic"}
        ],
        "real_world_use_cases": [
            {"case": "Smart Home", "description": "Every 'SmartLight' device is an object with states like 'brightness' and 'on/off'."},
            {"case": "E-commerce", "description": "The 'Order' instance that gets saved to the database."},
            {"case": "Banking", "description": "A 'Transaction' object created every time money moves."}
        ],
        "common_mistakes": [
            {"mistake": "Sharing attributes", "correction": "Be careful with class-level attributes vs instance-level attributes (use __init__ for instance specific data)."},
            {"mistake": "Accessing deleted info", "correction": "Check if an object property exists before using it if you use 'del'."}
        ],
        "mcq_quiz": [
            {"question": "What is an object?", "options": ["A blueprint", "An instance of a class", "A type", "None"], "answer": "An instance of a class", "explanation": "Concrete realization of class."},
            {"question": "How to delete an object?", "options": ["remove", "del", "kill", "None"], "answer": "del", "explanation": "Keyword for memory deallocation."},
            {"question": "Are objects allocated memory?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Classes are not, objects are."},
            {"question": "Can objects have different attribute values?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "That's the point of instances."},
            {"question": "What is instantiation?", "options": ["Starting code", "Creating an object", "Stopping code", "None"], "answer": "Creating an object", "explanation": "Technical term."},
            {"question": "Do objects inherit class methods?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "They can call any method defined in class."},
            {"question": "What happens to object data on program exit?", "options": ["Saved", "Lost from RAM", "Encrypted", "None"], "answer": "Lost from RAM", "explanation": "Unless serialized to disk/DB."},
            {"question": "Can you check object type?", "options": ["Yes, with type()", "No"], "answer": "Yes, with type()", "explanation": "Will return the class name."},
            {"question": "Is 'str' an object?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Everything in Python is an object."},
            {"question": "Function inside a class?", "options": ["Attribute", "Method", "Logic", "None"], "answer": "Method", "explanation": "Class-level function."}
        ],
        "coding_challenges": [
            {"challenge": "Create a class 'Rectangle'. Create an object with length 10 and width 5. Add a method 'area' that returns length * width.", "hints": ["Return self.l * self.w."]}
        ],
        "summary": "Objects bring your classes to life with real data and interactive behaviors."
    },
    {
        "id": "inheritance",
        "title": "Inheritance",
        "category_id": "oop",
        "category_title": "Object Oriented Programming",
        "difficulty": "Advanced",
        "xp_reward": 150,
        "description": "Don't repeat yourself (DRY). Learn how classes can inherit from each other.",
        "theory": """
# Inheritance: Shared DNA between Classes

Inheritance allows us to define a class that inherits all the methods and properties from another class.

---

## 1. Parent vs Child Class
*   **Parent class** is the class being inherited from, also called base class.
*   **Child class** is the class that inherits from another class, also called derived class.

```python
class Animal:
  def speak(self):
    print("Animal sound")

class Dog(Animal):
  pass # Inherits speak()
```

---

## 2. Overriding Methods
If you add a method in the child class with the same name as a function in the parent class, the inheritance of the parent method will be overridden.

---

## 3. The `super()` Function
Python also has a `super()` function that will make the child class inherit all the methods and properties from its parent:
```python
class Student(Person):
  def __init__(self, fname, lname):
    super().__init__(fname, lname)
```

---

## Real-World Use Cases
| Base Class | Derived Class |
| :--- | :--- |
| **User** | Admin, Teacher, Student (all share 'email' but have different actions). |
| **Shape** | Circle, Square, Triangle (all have 'area' but different formulas). |
| **Employee** | Manager, Developer, Intern (all have 'base_salary' but different bonuses). |

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Inheritance", "code": "class Parent: a=1\nclass Child(Parent): b=2\nc = Child()\nprint(c.a, c.b)"},
            {"title": "Method Overriding", "code": "class Bird: def fly(self): print('Fly')\nclass Penguin(Bird): def fly(self): print('Cant')\np = Penguin()\np.fly()"},
            {"title": "Using super()", "code": "class A: def __init__(self): print('A')\nclass B(A): def __init__(self): super().__init__(); print('B')\nobj = B()"},
            {"title": "Multiple Inheritance", "code": "class X: pass\nclass Y: pass\nclass Z(X, Y): pass"},
            {"title": "Multi-level", "code": "class A: pass\nclass B(A): pass\nclass C(B): pass"}
        ],
        "real_world_use_cases": [
            {"case": "Game Design", "description": "Creating an 'Enemy' base class and then specific 'Zombie' and 'Robot' enemies."},
            {"case": "UI Frameworks", "description": "Basic 'Widget' class which 'Button' and 'TextInput' inherit from."},
            {"case": "Vehicle Management", "description": "Base 'Vehicle' class with 'id', inherited by 'Car', 'Truck', and 'Bike'."}
        ],
        "common_mistakes": [
            {"mistake": "Deep Hierarchies", "correction": "Don't go too deep with inheritance (e.g., A->B->C->D->E) as it gets hard to maintain. Favor composition if needed."},
            {"mistake": "Missing super()", "correction": "Forgetting to call super().__init__() can mean half-initialized child objects."}
        ],
        "mcq_quiz": [
            {"question": "What is inheritance?", "options": ["Copying code", "Class taking traits from another", "Looping", "None"], "answer": "Class taking traits from another", "explanation": "Code reuse pattern."},
            {"question": "Keyword for inheriting?", "options": ["class Child(Parent):", "class Child <- Parent", "class Child : Parent", "None"], "answer": "class Child(Parent):", "explanation": "Parentheses syntax."},
            {"question": "What is a parent class?", "options": ["Class that is inherited from", "Class that inherits", "Method", "None"], "answer": "Class that is inherited from", "explanation": "Also called Base class."},
            {"question": "Purpose of super()?", "options": ["Make code faster", "Call parent methods", "Override parent", "None"], "answer": "Call parent methods", "explanation": "Delegates to parent class."},
            {"question": "What is overriding?", "options": ["Deleting parent method", "Redefining parent method in child", "Using same name", "None"], "answer": "Redefining parent method in child", "explanation": "Child version takes priority."},
            {"question": "Multiple inheritance?", "options": ["One child, many parents", "One parent, many children", "Not in Python", "None"], "answer": "One child, many parents", "explanation": "Python supports multiple base classes."},
            {"question": "Multi-level inheritance?", "options": ["A->B->C", "A,B->C", "A->B,C", "None"], "answer": "A->B->C", "explanation": "Chain of inheritance."},
            {"question": "Is 'issubclass(a, b)' a thing?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Checks inheritance relation."},
            {"question": "Does inheritance follow DRY?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "It reduces redundant code."},
            {"question": "Can strings inherit from integers?", "options": ["Yes", "No", "Technically but useless", "None"], "answer": "No", "explanation": "Doesn't make logical/structural sense."}
        ],
        "coding_challenges": [
            {"challenge": "Create a class 'Shape' with a method 'show'. Create a class 'Circle' that inherits from 'Shape' and overrides 'show' to print 'Drawing Circle'.", "hints": ["Use class Circle(Shape)."]}
        ],
        "summary": "Inheritance enables a powerful, hierarchical structure that saves time and mental overhead."
    },
    {
        "id": "poly",
        "title": "Polymorphism",
        "category_id": "oop",
        "category_title": "Object Oriented Programming",
        "difficulty": "Advanced",
        "xp_reward": 150,
        "description": "Many forms. Learn how different classes can share the same interface.",
        "theory": """
# Polymorphism: Many Forms, One Interface

The word "polymorphism" means "many forms", and in programming it refers to methods/functions/operators with the same name that can be executed on many objects or classes.

---

## 1. Function Polymorphism
A common example is the `len()` function. It can handle strings, lists, tuples, etc.
```python
len("Hello") # 5
len([1, 2, 3]) # 3
```

---

## 2. Class Polymorphism
Polymorphism is often used in Class methods, where we can have multiple classes with the same method name.
```python
class Car:
  def move(self): print("Drive")

class Boat:
  def move(self): print("Sail")
```

---

## 3. Why Polymorphism?
It allows us to write code that can work with different types of objects without knowing exactly which object it is dealing with.

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **Payment Processors** | `Payment` class with `pay()` method, implemented by `Stripe`, `PayPal`, and `Crypto`. |
| **Document Exporters** | `Exporter` with `export()` method for `PDF`, `Docx`, and `HTML`. |
| **Game Rendering** | `Entity` with `draw()` method for `Player`, `Enemy`, and `NPC`. |

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Operator Polymorphism", "code": "print(1 + 1) # Add\nprint('a' + 'b') # Concat"},
            {"title": "Method Polymorphism", "code": "class X: f=lambda self: 'X'\nclass Y: f=lambda self: 'Y'\nfor o in [X(), Y()]: print(o.f())"},
            {"title": "len() Polymorphism", "code": "print(len('text'))\nprint(len([1, 2]))"},
            {"title": "Override Polymorphism", "code": "class Shape: def draw(self): pass\nclass Square(Shape): def draw(self): print('SQ')"},
            {"title": "Inheritance Poly", "code": "def run_move(obj): obj.move()\n# works for any obj that has .move()"}
        ],
        "real_world_use_cases": [
            {"case": "Pluggable Architecture", "description": "Building a system where users can add new plugins as long as they follow the 'Plugin' method structure."},
            {"case": "Unit Testing", "description": "Mocking objects that behave like real ones by sharing the same method names."},
            {"case": "Graphics Design", "description": "A single 'Refresh' button that calls '.repaint()' on every layer object regardless of type."}
        ],
        "common_mistakes": [
            {"mistake": "Missing methods", "correction": "Ensure all classes in a polymorphic group actually implement the expected method name, or use Abstract Base Classes (ABCs)."},
            {"mistake": "Type checking", "correction": "Relying on isinstance() too much defeats the purpose of polymorphism. Just call the method!"}
        ],
        "mcq_quiz": [
            {"question": "What is polymorphism?", "options": ["Many forms", "Many classes", "Many loops", "None"], "answer": "Many forms", "explanation": "Same interface, multiple types."},
            {"question": "How does len() show it?", "options": ["Works only for strings", "Works for many types", "Returns many values", "None"], "answer": "Works for many types", "explanation": "Universal interface for size."},
            {"question": "Common way to use it in classes?", "options": ["Different names", "Same method names in different classes", "No methods", "None"], "answer": "Same method names in different classes", "explanation": "Logic abstraction."},
            {"question": "Is '+' polymorphic?", "options": ["Yes (math & concat)", "No"], "answer": "Yes (math & concat)", "explanation": "Behavior changes based on operands."},
            {"question": "Does it require inheritance?", "options": ["Not strictly, but often used together", "Yes", "No", "None"], "answer": "Not strictly, but often used together", "explanation": "Interface congruence is the key."},
            {"question": "Benefit?", "options": ["Fast math", "Simplified code interfacing", "Encryption", "None"], "answer": "Simplified code interfacing", "explanation": "One function handles any valid object."},
            {"question": "Duck typing?", "options": ["If it walks like a duck...", "Only for ducks", "Error", "None"], "answer": "If it walks like a duck...", "explanation": "A type of polymorphism in Python."},
            {"question": "Can you override methods for polymorphism?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Essential for specialized behavior."},
            {"question": "What is Method Overloading?", "options": ["Multiple methods same name diff params", "Not in native Python", "Overriding parent", "None"], "answer": "Not in native Python", "explanation": "Python handles this via defaults/args, not signature overloading."},
            {"question": "Is it useful for APIs?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Standardizing request/response handlers."}
        ],
        "coding_challenges": [
            {"challenge": "Define two classes 'Cat' and 'Dog' both with a method 'make_sound'. Call 'make_sound' in a loop through a list of sound-making objects.", "hints": ["for animal in [cat, dog]: animal.make_sound()."]}
        ],
        "summary": "Polymorphism creates elegant, flexible code that focuses on 'what' is being done, not 'who' is doing it."
    }
]

if __name__ == "__main__":
    seed_lessons(PHASE_4A_LESSONS)
