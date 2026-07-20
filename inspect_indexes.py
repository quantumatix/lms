from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
coll = db["lesson_exercises"]

print("Indexes on lesson_exercises:")
for idx in coll.list_indexes():
    print(idx)
