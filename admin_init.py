import os
import getpass
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["lms_database"]
users_collection = db["users"]

def create_admin():
    email = "admin@lms.com"  # the admin pages call the API with this username, keep it
    password = os.getenv("ADMIN_PASSWORD") or getpass.getpass(f"Password for {email}: ")
    if len(password) < 8:
        raise SystemExit("Admin password must be at least 8 characters.")

    existing = users_collection.find_one({"email": email})
    if existing:
        users_collection.update_one(
            {"email": email},
            {"$set": {"role": "admin", "password": password}}
        )
        print(f"User {email} updated to admin, password reset.")
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
