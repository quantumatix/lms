import os

search_term = "/exercises"
found_files = []

for root, dirs, files in os.walk("./myapp/src"):
    for file in files:
        if file.endswith((".js", ".jsx", ".ts", ".tsx")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    if search_term in content:
                        found_files.append(path)
            except Exception as e:
                pass

print(f"Files containing '{search_term}':")
for p in found_files:
    print(p)
