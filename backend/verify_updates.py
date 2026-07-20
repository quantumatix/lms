import requests

BASE_URL = "http://127.0.0.1:8000"

def test_coding():
    print("Testing Coding Challenges...")
    res = requests.get(f"{BASE_URL}/challenges")
    print(f"Challenges Found: {len(res.json())}")
    
    # Test valid solution for ch_1
    data = {
        "username": "test_user",
        "challenge_id": "ch_1",
        "code": "def greet():\n    return 'Hello, Python!'"
    }
    res = requests.post(f"{BASE_URL}/validate", json=data)
    print(f"Validation Result (Expected True): {res.json()['passed']}")

def test_interview():
    print("\nTesting Interview Prep...")
    res = requests.get(f"{BASE_URL}/interview/questions?category=Beginner")
    print(f"Beginner Questions: {len(res.json())}")
    
    # Test Evaluation
    data = {
        "question_id": "int_1",
        "answer": "Lists are mutable and tuples are immutable."
    }
    res = requests.post(f"{BASE_URL}/interview/evaluate", json=data)
    print(f"Evaluation Score: {res.json()['score']}")

if __name__ == "__main__":
    test_coding()
    test_interview()
