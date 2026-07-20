from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]

with open("db_details.txt", "w", encoding="utf-8") as f:
    f.write("Collections in lms_database:\n")
    for name in sorted(db.list_collection_names()):
        count = db[name].count_documents({})
        f.write(f"- {name}: {count} documents\n")
        if count > 0:
            sample = db[name].find_one()
            f.write(f"  Keys: {list(sample.keys())}\n")
            if "lesson_id" in sample:
                f.write(f"  Sample lesson_id: {sample.get('lesson_id')}\n")
            if name == "lesson_exercises":
                f.write(f"  Sample document fields detail: {sample}\n")
            if name == "practice_exercises":
                f.write(f"  Sample document fields detail: {sample}\n")
