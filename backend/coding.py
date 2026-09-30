from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from datetime import datetime
from pydantic import BaseModel
import subprocess
import sys
import tempfile
import os
import time

router = APIRouter()

client = MongoClient("mongodb://localhost:27017")
db = client["lms_database"]
coding_challenges = db["coding_challenges"]
history_collection = db["practice_history"]
overall_progress_collection = db["progress"]
coding_results = db["coding_results"]

class CodeRunRequest(BaseModel):
    username: str
    lesson_id: str
    challenge_id: str
    code: str
    submit: bool = True

def execute_code_safely(code: str, test_input: str = None) -> dict:
    if test_input:
        script = f"""{code}

# Safe test evaluation
try:
    _res = {test_input}
    print("===TEST_RESULT===")
    print(_res)
except Exception as _e:
    print("===TEST_ERROR===")
    import traceback
    traceback.print_exc()
"""
    else:
        script = code

    temp_path = None
    start_time = time.time()
    try:
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as f:
            f.write(script)
            temp_path = f.name

        proc = subprocess.run(
            [sys.executable, temp_path],
            capture_output=True,
            text=True,
            timeout=2.0
        )
        execution_time = round(time.time() - start_time, 4)
        
        if os.path.exists(temp_path):
            os.unlink(temp_path)
            
        return {
            "success": proc.returncode == 0,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "execution_time": execution_time,
            "error": proc.stderr if proc.returncode != 0 else None
        }
    except subprocess.TimeoutExpired:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
        return {
            "success": False,
            "stdout": "",
            "stderr": "TimeLimitExceeded: Code execution exceeded limit of 2.0 seconds.",
            "execution_time": 2.0,
            "error": "TimeLimitExceeded"
        }
    except Exception as e:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
        return {
            "success": False,
            "stdout": "",
            "stderr": str(e),
            "execution_time": 0.0,
            "error": str(e)
        }

def check_match(received: str, expected: str) -> bool:
    rec = received.strip().replace("'", '"')
    exp = expected.strip().replace("'", '"')
    return rec == exp

@router.get("/challenges")
def get_challenges(lesson_id: str = None, difficulty: str = None, course_id: str = None):
    query = {}
    if lesson_id:
        query["lesson_id"] = lesson_id
    if difficulty:
        query["difficulty"] = difficulty
    if course_id:
        query["course_id"] = course_id
    return list(coding_challenges.find(query, {"_id": 0}))


@router.get("/challenges/{challenge_id}")
def get_challenge(challenge_id: str):
    challenge = coding_challenges.find_one({"id": challenge_id}, {"_id": 0})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge

@router.post("/validate")
def validate_code(data: dict):
    # Keep validate endpoint for safety and legacy components compatibility
    username = data["username"]
    challenge_id = data["challenge_id"]
    user_code = data["code"]
    
    challenge = coding_challenges.find_one({"id": challenge_id})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    results = []
    all_passed = True
    
    for test in challenge["test_cases"]:
        try:
            local_vars = {}
            exec(user_code, {"__builtins__": __builtins__}, local_vars)
            result = eval(test["input"], {"__builtins__": __builtins__}, local_vars)
            expected = eval(test["expected"]) if isinstance(test["expected"], str) and (test["expected"].startswith("[") or test["expected"].startswith("(")) else test["expected"]
            passed = str(result) == str(test["expected"])
            if not passed: all_passed = False
            
            results.append({
                "input": test["input"],
                "expected": test["expected"],
                "received": str(result),
                "passed": passed
            })
        except Exception as e:
            all_passed = False
            results.append({
                "input": test["input"],
                "expected": test["expected"],
                "error": str(e),
                "passed": False
            })
            
    status = "success" if all_passed else "failed"
    course_id = challenge.get("course_id", "python-core")
    history_collection.insert_one({
        "username": username,
        "challenge_id": challenge_id,
        "course_id": course_id,
        "code": user_code,
        "status": status,
        "timestamp": datetime.now().isoformat()
    })
    
    xp_earned = 0
    if all_passed:
        already_done = history_collection.find_one({"username": username, "challenge_id": challenge_id, "status": "success", "timestamp": {"$lt": datetime.now().isoformat()}})
        if not already_done:
            xp_earned = challenge.get("xp_reward", 50)
            overall_progress_collection.update_one(
                {"username": username, "course_id": course_id},
                {"$inc": {"xp": xp_earned}},
                upsert=True
            )

    return {
        "passed": all_passed,
        "results": results,
        "xp_earned": xp_earned
    }

@router.post("/coding/run")
def run_and_validate_code(request: CodeRunRequest):
    username = request.username
    lesson_id = request.lesson_id
    challenge_id = request.challenge_id
    user_code = request.code
    submit = request.submit

    challenge = coding_challenges.find_one({"id": request.challenge_id})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Check runtime field — only python3 is supported for live execution
    runtime = challenge.get("runtime", "python3")
    if runtime not in ("python3", "python"):
        language = challenge.get("language", runtime)
        return {
            "status": "not_supported",
            "output": "",
            "expected_output": challenge.get("expected_output", ""),
            "execution_time": 0.0,
            "xp_earned": 0,
            "error": None,
            "message": f"Live code execution for {language} is not yet available. Check back later."
        }

    test_cases = challenge.get("test_cases", [])
    if not test_cases:
        test_cases = [{"input": "", "expected": ""}]

    all_passed = True
    first_output = ""
    first_expected = ""
    first_error = None
    total_time = 0.0
    results_list = []

    if not submit:
        exec_res = execute_code_safely(user_code)
        output_str = exec_res["stdout"]
        if exec_res["stderr"]:
            output_str += "\n" + exec_res["stderr"]
        return {
            "status": "Executed",
            "output": output_str,
            "expected_output": "",
            "execution_time": exec_res["execution_time"],
            "xp_earned": 0,
            "error": exec_res["error"]
        }
        
    for i, test in enumerate(test_cases):
        test_input = test["input"]
        test_expected = test["expected"]
        
        exec_res = execute_code_safely(user_code, test_input)
        total_time += exec_res["execution_time"]
        
        stdout = exec_res["stdout"]
        stderr = exec_res["stderr"]
        
        output_val = ""
        error_val = exec_res["error"]
        passed = False
        
        if exec_res["success"]:
            if "===TEST_RESULT===" in stdout:
                parts = stdout.split("===TEST_RESULT===")
                output_val = parts[1].strip()
                passed = check_match(output_val, test_expected)
            elif "===TEST_ERROR===" in stdout:
                parts = stdout.split("===TEST_ERROR===")
                error_val = parts[1].strip()
                passed = False
            else:
                output_val = stdout.strip()
                passed = check_match(output_val, test_expected)
        else:
            passed = False
            error_val = stderr.strip() if stderr else "Execution error"
            
        if not passed:
            all_passed = False
            
        if i == 0:
            first_output = output_val if passed or not error_val else error_val
            first_expected = test_expected
            first_error = error_val
            
        results_list.append({
            "input": test_input,
            "expected": test_expected,
            "received": output_val if not error_val else error_val,
            "passed": passed
        })
        
    status = "Passed" if all_passed else "Failed"
    xp_reward = challenge.get("xp_reward", 50)
    xp_earned = 0
    
    if submit:
        if all_passed:
            already_done = coding_results.find_one({
                "username": username,
                "challenge_id": challenge_id,
                "status": "Passed"
            })
            if not already_done:
                xp_earned = xp_reward
                
                # Update user_progress
                user_progress = db["user_progress"].find_one({"username": username})
                if not user_progress:
                    user_progress = {
                        "username": username,
                        "xp": 0,
                        "level": "Beginner",
                        "progress": 0
                    }
                    db["user_progress"].insert_one(user_progress)
                
                new_xp = user_progress.get("xp", 0) + xp_earned
                if new_xp >= 200:
                    level = "Advanced"
                elif new_xp >= 100:
                    level = "Intermediate"
                else:
                    level = "Beginner"
                progress = min(new_xp, 100)
                
                db["user_progress"].update_one(
                    {"username": username},
                    {"$set": {
                        "xp": new_xp,
                        "level": level,
                        "progress": progress
                    }}
                )
                
                course_id = challenge.get("course_id", "python-core") if challenge else "python-core"
                # Update progress
                db["progress"].update_one(
                    {"username": username, "course_id": course_id},
                    {
                        "$inc": {"xp": xp_earned},
                        "$addToSet": {"completed_topics": challenge.get("lesson_id", "")},
                        "$set": {"course_id": course_id}
                    },
                    upsert=True
                )
                
        course_id = challenge.get("course_id", "python-core") if challenge else "python-core"
        result = coding_results.insert_one({
            "username": username,
            "course_id": course_id,
            "lesson_id": lesson_id or challenge.get("lesson_id", ""),
            "challenge_id": challenge_id,
            "submitted_code": user_code,
            "output": first_output,
            "expected_output": first_expected,
            "status": status,
            "execution_time": round(total_time, 4),
            "xp_earned": xp_earned,
            "submitted_at": datetime.now().isoformat()
        })
        print("Inserted ID:", result.inserted_id)
        
    return {
        "status": status,
        "output": first_output,
        "expected_output": first_expected,
        "execution_time": round(total_time, 4),
        "xp_earned": xp_earned,
        "error": first_error,
        "results": results_list
    }

@router.get("/history/{username}")
def get_user_history(username: str):
    return list(history_collection.find({"username": username}, {"_id": 0}).sort("timestamp", -1))