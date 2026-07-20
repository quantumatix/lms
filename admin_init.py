from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
users_collection = db["users"]

def create_admin():
    email = "admin@lms.com"
    password = "admin_password"  # You should change this after first login
    
    existing = users_collection.find_one({"email": email})
    if existing:
        users_collection.update_one(
            {"email": email},
            {"$set": {"role": "admin"}}
        )
        print(f"User {email} updated to admin.")
    else:
        users_collection.insert_one({
            "email": email,
            "password": password,
            "role": "admin",
            "name": "System Admin"
        })
        print(f"Admin user created with email: {email}")

if __name__ == "__main__":
    create_admin()
