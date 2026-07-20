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

PHASE_3_LESSONS = [
    {
        "id": "lists",
        "title": "Lists in Python",
        "category_id": "data_structures",
        "category_title": "Data Structures",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Store multiple items in one variable. Learn the most versatile data structure in Python.",
        "theory": """
# Lists: Ordered and Mutable Collections

Lists are used to store multiple items in a single variable. They are one of 4 built-in data types in Python used to store collections of data.

---

## 1. List Characteristics
*   **Ordered:** The items have a defined order, and that order will not change (unless modified).
*   **Changeable (Mutable):** We can change, add, and remove items in a list after it has been created.
*   **Allow Duplicates:** Since lists are indexed, lists can have items with the same value.

---

## 2. List Access (Indexing)
List items are indexed and you can access them by referring to the index number. **Indexes start at 0.**
```python
thislist = ["apple", "banana", "cherry"]
print(thislist[1]) # banana
```
### Negative Indexing
`-1` refers to the last item, `-2` refers to the second last item etc.

---

## 3. List Operations
*   **append():** Add an item to the end of the list.
*   **insert():** Add an item at the specified index.
*   **remove():** Remove a specific item.
*   **pop():** Remove an item at a specific index (or the last one).
*   **sort():** Sort the list alphabetically or numerically.

---

## 4. List Comprehension
Offers a shorter syntax when you want to create a new list based on the values of an existing list.
`newlist = [x for x in fruits if "a" in x]`

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **Shopping Cart** | A list of items a user wants to buy. |
| **Undo Stack** | A list of previous actions in an editor. |
| **Leaderboards** | A sorted list of player scores. |

---

## Common Mistakes
*   **IndexError:** Trying to access `list[10]` when the list only has 5 items.
*   **Modifying while Iterating:** Removing items from a list while you are looping through it (lead to skipped items).
*   **Assuming Sort returns a list:** `mylist.sort()` sorts in-place and returns `None`.

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic List", "code": "fruits = ['apple', 'banana', 'cherry']\nprint(len(fruits))"},
            {"title": "Modifying List", "code": "items = [1, 2, 3]\nitems.append(4)\nitems[0] = 0\nprint(items)"},
            {"title": "Slicing", "code": "nums = [0, 1, 2, 3, 4, 5]\nprint(nums[1:4]) # [1, 2, 3]"},
            {"title": "List Comprehension", "code": "squares = [x**2 for x in range(5)]\nprint(squares)"},
            {"title": "Search", "code": "names = ['Alice', 'Bob']\nprint('Alice' in names)"}
        ],
        "real_world_use_cases": [
            {"case": "To-Do Apps", "description": "Storing a list of tasks that can be marked off (removed) or reordered."},
            {"case": "Music Playlists", "description": "Storing a sequence of song objects that plays in order."},
            {"case": "Search Suggestions", "description": "Returning a list of possible matches to a user's query."}
        ],
        "common_mistakes": [
            {"mistake": "Index out of range", "correction": "Check len(list) before accessing high indices."},
            {"mistake": "Copying lists", "correction": "Use list.copy() instead of new = old, which just creates a reference."}
        ],
        "mcq_quiz": [
            {"question": "How do you start a list?", "options": ["[]", "()", "{}", "<>"], "answer": "[]", "explanation": "Square brackets define a list."},
            {"question": "Are lists mutable?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "You can change their contents."},
            {"question": "What is the index of the first item?", "options": ["1", "0", "-1", "None"], "answer": "0", "explanation": "Python is 0-indexed."},
            {"question": "How to add item to end?", "options": ["add()", "push()", "append()", "insert()"], "answer": "append()", "explanation": "Standard method."},
            {"question": "What is list slicing?", "options": ["Deleting item", "Getting a sub-range", "Sorting", "None"], "answer": "Getting a sub-range", "explanation": "e.g. list[1:3]."},
            {"question": "Function to get total items?", "options": ["size()", "count()", "len()", "length()"], "answer": "len()", "explanation": "Standard for all sequences."},
            {"question": "How to remove by value?", "options": ["remove()", "pop()", "del", "None"], "answer": "remove()", "explanation": "pop() removes by index."},
            {"question": "Result of ['a'] * 3?", "options": ["['aaa']", "['a', 'a', 'a']", "Error", "None"], "answer": "['a', 'a', 'a']", "explanation": "List repetition."},
            {"question": "What is list comprehension?", "options": ["A way to explain lists", "A concise loop for lists", "A memory optimization", "None"], "answer": "A concise loop for lists", "explanation": "Highly idiomatic Python."},
            {"question": "How to check if item exists?", "options": ["exists", "contains", "in", "has"], "answer": "in", "explanation": "Membership operator."}
        ],
        "coding_challenges": [
            {"challenge": "Create a list of 5 colors. Remove the 2nd color and add 'Purple' to the end. Print the final list.", "hints": ["Use pop(1) and append()."]}
        ],
        "summary": "Lists are the workhorse of Python data management, providing order and flexibility."
    },
    {
        "id": "tuples",
        "title": "Tuples in Python",
        "category_id": "data_structures",
        "category_title": "Data Structures",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Safe and unchangeable collections. Learn when to use Tuples over Lists.",
        "theory": """
# Tuples: Fixed and Final

Tuples are used to store multiple items in a single variable. A tuple is a collection which is **ordered** and **unchangeable**.

---

## 1. Tuple Characteristics
*   **Ordered:** Items have a defined order.
*   **Unchangeable (Immutable):** We cannot change, add, or remove items after the tuple has been created.
*   **Allow Duplicates:** Like lists, tuples are indexed.

---

## 2. When to use a Tuple?
*   **Data Protection:** When you have data that should not be modified (e.g., coordinates, RGB colors).
*   **Speed:** Tuples are slightly faster than lists.
*   **Dictionary Keys:** Tuples can be used as keys for dictionaries, lists cannot.

---

## 3. Tuple Unpacking
You can "extract" the values back into variables.
```python
fruits = ("apple", "banana", "cherry")
(green, yellow, red) = fruits
```

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **GPS Coordinates** | `(40.7128, 74.0060)` - latitude/longitude rarely changes in context. |
| **Database Records** | A single row fetched from a DB is often represented as a tuple. |
| **Constants** | `DAYS_OF_WEEK = ("Mon", "Tue", ...)` |

---

## Common Mistakes
*   **Trying to Modify:** `mytuple[0] = "new"` will throw a `TypeError`.
*   **Single Item Confusion:** To create a tuple with one item, you MUST add a comma: `(item,)`. Otherwise, it's just a string in parentheses.

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Tuple", "code": "point = (10, 20)\nprint(point[0])"},
            {"title": "Unpacking", "code": "person = ('Alice', 25)\nname, age = person\nprint(f'{name} is {age}')"},
            {"title": "Immutable Error", "code": "t = (1, 2)\n# t[0] = 5 # This would crash!"},
            {"title": "Single Item Tuple", "code": "not_a_tuple = (5)\ntuple_one = (5,)\nprint(type(not_a_tuple))\nprint(type(tuple_one))"},
            {"title": "Joining Tuples", "code": "t1 = (1, 2)\nt2 = (3, 4)\nprint(t1 + t2)"}
        ],
        "real_world_use_cases": [
            {"case": "Configuration", "description": "Defining a set of permissions that shouldn't be altered during runtime."},
            {"case": "Graph Theory", "description": "Representing edges between nodes as (start, end) pairs."},
            {"case": "Color Theory", "description": "Storing RGB values as (255, 0, 0)."}
        ],
        "common_mistakes": [
            {"mistake": "Forgotten comma", "correction": "Always use (val,) for single-element tuples."},
            {"mistake": "List methods", "correction": "Don't try to use .append() or .sort() on tuples."}
        ],
        "mcq_quiz": [
            {"question": "How do you define a tuple?", "options": ["[]", "()", "{}", "<>"], "answer": "()", "explanation": "Parentheses define a tuple."},
            {"question": "Are tuples mutable?", "options": ["Yes", "No"], "answer": "No", "explanation": "They are immutable."},
            {"question": "Can you add an item to a tuple?", "options": ["Yes", "No", "Only if empty", "None"], "answer": "No", "explanation": "Once created, it's fixed."},
            {"question": "What is tuple unpacking?", "options": ["Deleting tuple", "Extracting to variables", "Sorting", "None"], "answer": "Extracting to variables", "explanation": "Assigning elements to names."},
            {"question": "Benefit of tuple over list?", "options": ["More items", "Immutable/Protected", "Dynamic size", "None"], "answer": "Immutable/Protected", "explanation": "Useful for data integrity."},
            {"question": "How to create one-item tuple?", "options": ["(1)", "(1,)", "[1]", "tuple(1)"], "answer": "(1,)", "explanation": "The comma is crucial."},
            {"question": "Can tuples have duplicate values?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Like lists, they are indexed."},
            {"question": "Is (1, 2) + (3, 4) valid?", "options": ["Yes, result is (1,2,3,4)", "No", "Only for ints", "None"], "answer": "Yes, result is (1,2,3,4)", "explanation": "Concatenation creates a NEW tuple."},
            {"question": "Which method is valid for tuple?", "options": ["append()", "count()", "sort()", "remove()"], "answer": "count()", "explanation": "Tuples only have .count() and .index()."},
            {"question": "Are tuples faster than lists?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Due to memory optimization."}
        ],
        "coding_challenges": [
            {"challenge": "Create a tuple representing a user (ID, Username, Email). Unpack it into 3 variables and print them.", "hints": ["(id, name, email) = user_tuple."]}
        ],
        "summary": "Tuples provide a layer of security and efficiency for data that shouldn't change."
    },
    {
        "id": "sets",
        "title": "Sets in Python",
        "category_id": "data_structures",
        "category_title": "Data Structures",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Unordered collections of unique items. Perfect for mathematical operations like Union and Intersection.",
        "theory": """
# Sets: Unique and Unordered

A set is a collection which is **unordered**, **unchangeable***, and **unindexed**.
*Note:* Set items are unchangeable, but you can remove items and add new items.

---

## 1. Set Characteristics
*   **Unordered:** Items do not have a defined order. You cannot refer to them by index.
*   **Unique:** No two items can have the same value.
*   **Unindexed:** You cannot access items using `set[0]`.

---

## 2. Adding and Removing
*   **add():** To add one item.
*   **update():** To add multiple items (like a list) to a set.
*   **remove():** Remove item (errors if not found).
*   **discard():** Remove item (does NOT error if not found).

---

## 3. Join Sets
Sets are great for mathematical set operations:
*   **union():** Combines all unique items from both sets.
*   **intersection():** Keeps only items present in BOTH sets.
*   **difference():** Keeps items present in first set but NOT second.

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **Tagging Systems** | Ensuring a blog post doesn't have duplicate tags. |
| **Friend Recommendations** | Finding 'mutual friends' using `intersection`. |
| **Unique Visitor Tracking** | Storing IP addresses to count unique visits. |

---

## Common Mistakes
*   **Accessing by Index:** `myset[0]` is a `TypeError`.
*   **Duplicate Add:** Adding `"item"` to a set that already has `"item"` does nothing (no error, just no change).
*   **Empty Set Confusion:** `x = {}` creates a dictionary. You must use `x = set()` for an empty set.

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Set", "code": "myset = {1, 2, 3, 3}\nprint(myset) # {1, 2, 3}"},
            {"title": "Adding Items", "code": "s = {1}\ns.add(2)\ns.update([3, 4])\nprint(s)"},
            {"title": "Intersection", "code": "a = {1, 2, 3}\nb = {2, 3, 4}\nprint(a.intersection(b)) # {2, 3}"},
            {"title": "Difference", "code": "print(a.difference(b)) # {1}"},
            {"title": "Discard vs Remove", "code": "s = {1}\ns.discard(5) # No error\n# s.remove(5) # Error!"}
        ],
        "real_world_use_cases": [
            {"case": "Removing Duplicates", "description": "Converting a list with duplicates to a set and back to remove them quickly."},
            {"case": "Mutual Connections", "description": "Finding interests shared by two users."},
            {"case": "Vocabulary Tracker", "description": "Storing all unique words seen in a book."}
        ],
        "common_mistakes": [
            {"mistake": "Unordered nature", "correction": "Never rely on the order of a set. It changes every time you run the code."},
            {"mistake": "Creating empty set", "correction": "Always use set() for empty sets, not {} (which is an empty dict)."}
        ],
        "mcq_quiz": [
            {"question": "How to define a set?", "options": ["[]", "()", "{}", "<>"], "answer": "{}", "explanation": "Curly braces define a set (or dict)."},
            {"question": "Are duplicate items allowed?", "options": ["Yes", "No"], "answer": "No", "explanation": "Sets only store unique items."},
            {"question": "Can you access set items by index?", "options": ["Yes", "No"], "answer": "No", "explanation": "Sets are unindexed/unordered."},
            {"question": "How to add an item?", "options": ["append()", "push()", "add()", "insert()"], "answer": "add()", "explanation": "Sets use .add()."},
            {"question": "What is intersection?", "options": ["Combined distinct items", "Items in both sets", "Items in neither", "None"], "answer": "Items in both sets", "explanation": "Mathematical overlap."},
            {"question": "How to create an empty set?", "options": ["{}", "set()", "[]", "()"], "answer": "set()", "explanation": "{} is reserved for dictionaries."},
            {"question": "What is union?", "options": ["Items in both", "All unique items from both", "Items in first only", "None"], "answer": "All unique items from both", "explanation": "Combining sets."},
            {"question": "Does removed() error if item missing?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Use discard() to avoid errors."},
            {"question": "Are sets mutable?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "You can add/remove items (but items themselves must be immutable)."},
            {"question": "Is [1, 2] == {1, 2}?", "options": ["Yes", "No"], "answer": "No", "explanation": "Different types (List vs Set)."}
        ],
        "coding_challenges": [
            {"challenge": "Given two lists, find the items that are present in both using sets.", "hints": ["Convert both to sets and use intersection()."]}
        ],
        "summary": "Sets are powerful tools for uniqueness and relationship math between collections."
    },
    {
        "id": "dicts",
        "title": "Dictionaries in Python",
        "category_id": "data_structures",
        "category_title": "Data Structures",
        "difficulty": "Intermediate",
        "xp_reward": 100,
        "description": "Store data as Key-Value pairs. The most efficient way to look up information.",
        "theory": """
# Dictionaries: Key-Value Mapping

Dictionaries are used to store data values in **key:value** pairs. A dictionary is a collection which is **ordered***, **changeable** and **does not allow duplicates**.
*Note:* As of Python 3.7, dictionaries are ordered. In 3.6 and earlier, they were unordered.

---

## 1. Dictionary Structure
Items are presented in key:value pairs, and can be referred to by using the key name.
```python
thisdict = {
  "brand": "Ford",
  "model": "Mustang",
  "year": 1964
}
```

---

## 2. Accessing Items
You can access the items of a dictionary by referring to its key name, inside square brackets:
```python
x = thisdict["model"]
```
Alternatively, use the `.get()` method (which returns `None` instead of an error if the key doesn't exist).

---

## 3. Modifying Dictionaries
*   **Add/Update:** `thisdict["year"] = 2020`
*   **pop():** Removes item with specific key.
*   **keys():** Returns a list of all keys.
*   **values():** Returns a list of all values.
*   **items():** Returns a list of (key, value) tuples.

---

## Real-World Use Cases
| Scenario | Usage |
| :--- | :--- |
| **User Profiles** | `{"username": "ayush", "id": 101, "email": "..."}` |
| **Product Catalogs** | `{"SKU123": {"name": "Laptop", "price": 999}}` |
| **Fast Lookups** | Finding a definition for a word in a digital dictionary. |

---

## Common Mistakes
*   **KeyError:** Trying to access `dict["missing_key"]`.
*   **Duplicate Keys:** Defining `{"name": "A", "name": "B"}`. The last one ("B") will overwrite the first.
*   **Non-Hashable Keys:** Trying to use a list as a key (Keys must be immutable, like strings or tuples).

---

## MCQ Quiz
... (Full script adds 10) ...
""",
        "code_examples": [
            {"title": "Basic Dict", "code": "car = {'brand': 'Tesla', 'model': 'S'}\nprint(car['brand'])"},
            {"title": "Using Get", "code": "user = {'id': 1}\nprint(user.get('name', 'Anonymous'))"},
            {"title": "Adding/Updating", "code": "d = {'a': 1}\nd['b'] = 2\nd['a'] = 0\nprint(d)"},
            {"title": "Iterating", "code": "scores = {'A': 90, 'B': 80}\nfor k, v in scores.items():\n    print(f'{k}: {v}')"},
            {"title": "Nested Dict", "code": "users = {1: {'name': 'Ayush'}}\nprint(users[1]['name'])"}
        ],
        "real_world_use_cases": [
            {"case": "REST APIs", "description": "Most web APIs return data in JSON format, which maps perfectly to Python dictionaries."},
            {"case": "Settings/Config", "description": "Storing application settings as key-value pairs for easy access."},
            {"case": "Frequency Count", "description": "Counting how many times each word appears in a text `{'word': count}`."}
        ],
        "common_mistakes": [
            {"mistake": "Unchecked Key Access", "correction": "Either use .get() or check 'if key in dict' before accessing to avoid crashes."},
            {"mistake": "Mutable Keys", "correction": "Never use lists or other dicts as keys. Use strings, numbers, or tuples."}
        ],
        "mcq_quiz": [
            {"question": "How are items stored in dicts?", "options": ["Index", "Key-Value pairs", "Unordered", "None"], "answer": "Key-Value pairs", "explanation": "Mapping structure."},
            {"question": "How to access item 'name'?", "options": ["d[0]", "d('name')", "d['name']", "None"], "answer": "d['name']", "explanation": "Square brackets with key."},
            {"question": "Which method is safer for access?", "options": ["pop()", "get()", "keys()", "None"], "answer": "get()", "explanation": "Returns None instead of KeyError."},
            {"question": "What if you use duplicate keys?", "options": ["Error", "Both kept", "Last one wins", "None"], "answer": "Last one wins", "explanation": "Overwrites previous value."},
            {"question": "Can keys be lists?", "options": ["Yes", "No"], "answer": "No", "explanation": "Keys must be hashable/immutable."},
            {"question": "Are dicts mutable?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "You can change values and add keys."},
            {"question": "How to get all keys?", "options": ["keys()", "all()", "list()", "None"], "answer": "keys()", "explanation": "Built-in method."},
            {"question": "How to remove an item?", "options": ["remove()", "discard()", "pop()", "None"], "answer": "pop()", "explanation": "Requires the key name."},
            {"question": "Result of len(dict)?", "options": ["Keys count", "Values count", "Both", "None"], "answer": "Keys count", "explanation": "Number of pairs."},
            {"question": "Is {'a':1} == {'a':1}?", "options": ["Yes", "No"], "answer": "Yes", "explanation": "Equality check works for content."}
        ],
        "coding_challenges": [
            {"challenge": "Create a dictionary 'student' with name, age, and grade. Update the grade and print the entire dictionary.", "hints": ["student['grade'] = 'A'."]}
        ],
        "summary": "Dictionaries are the core of efficient data organization in Python."
    }
]

if __name__ == "__main__":
    seed_lessons(PHASE_3_LESSONS)
