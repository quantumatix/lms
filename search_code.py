import os
import re

search_terms = ["lesson_exercises", "practice_exercises", "insert_many", "insert_one"]
found_matches = []

for root, dirs, files in os.walk("."):
    if any(p in root for p in [".git", "node_modules", "__pycache__", "env", "venv"]):
        continue
    for file in files:
        if file.endswith((".py", ".js", ".jsx")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for term in search_terms:
                        if term in content:
                            found_matches.append((path, term))
            except Exception as e:
                pass

print("Search matches:")
for path, term in sorted(list(set(found_matches))):
    print(f"- {path} matches '{term}'")

