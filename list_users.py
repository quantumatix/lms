from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017')
db = client['lms_database']
users = db['users'].find()
for u in users:
    print(f'Email: {u.get("email")}, Password: {u.get("password")}')
