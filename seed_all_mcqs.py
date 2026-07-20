import sys
import os
import time
from datetime import datetime
from pymongo import MongoClient

# Add backend directory to Python path to import gemini service
sys.path.append(os.path.abspath("backend"))

from services.gemini_service import generate_python_mcqs

def run_migration_and_seed():
    client = MongoClient("mongodb://localhost:27017")
    db = client["lms_database"]
    lessons_col = db["lessons"]
    mcqs_col = db["mcqs"]
    
    print("--- STEP 1: Remap Stale / Orphaned MCQs ---")
    
    # 1. Remap loops MCQs to day8
    loops_mcq_count = mcqs_col.count_documents({"lesson_id": "loops"})
    if loops_mcq_count > 0:
        print(f"Found {loops_mcq_count} loops MCQs. Remapping to day8...")
        mcqs_col.update_many({"lesson_id": "loops"}, {"$set": {"lesson_id": "day8", "topic": "Day 8: For Loops & range()"}})
        print("Loops MCQs remapped.")
        
    # 2. Remap old functions MCQs to day15
    func_stale_id = "6a4de84078ccbb8b7ef3a667"
    func_mcq_count = mcqs_col.count_documents({"lesson_id": func_stale_id})
    if func_mcq_count > 0:
        print(f"Found {func_mcq_count} functions MCQs with stale ID. Remapping to day15...")
        mcqs_col.update_many({"lesson_id": func_stale_id}, {"$set": {"lesson_id": "day15", "topic": "Day 15: Introduction to Functions"}})
        print("Functions MCQs remapped.")
        
    print("--- STEP 2: Sync existing MCQs with lesson documents ---")
    
    print("--- STEP 3: Iterate through all 30 day lessons to ensure MCQs are populated ---")
    
    lessons = list(lessons_col.find().sort("id", 1))
    print(f"Found {len(lessons)} lessons in the database.")
    
    generator_count = 0
    for idx, lesson in enumerate(lessons):
        lesson_id = lesson.get("id")
        title = lesson.get("title")
        difficulty = lesson.get("difficulty", "Beginner")
        
        print(f"\n[{idx+1}/{len(lessons)}] Checking Lesson: {lesson_id} ('{title}')")
        
        # Check if we have MCQs in mcqs collection for this lesson_id
        lesson_mcqs = list(mcqs_col.find({"lesson_id": lesson_id}))
        
        if len(lesson_mcqs) > 0:
            print(f"-> Lesson already has {len(lesson_mcqs)} MCQs in DB. Syncing with lesson document...")
            formatted = []
            for m in lesson_mcqs:
                formatted.append({
                    "question": m.get("question"),
                    "options": m.get("options"),
                    "answer": m.get("answer"),
                    "explanation": m.get("explanation", "")
                })
            lessons_col.update_one({"id": lesson_id}, {"$set": {"mcq_quiz": formatted}})
        else:
            print(f"-> Lesson {lesson_id} is missing MCQs. Generating via Gemini AI...")
            # Automatically retry on failure
            success = False
            retries = 3
            while retries > 0 and not success:
                try:
                    diff = difficulty.capitalize()
                    generated = generate_python_mcqs(topic=title, count=5, difficulty=diff)
                    if generated:
                        if not isinstance(generated, list):
                            generated = [generated]
                        
                        formatted_mcqs = []
                        db_insert_list = []
                        for m in generated:
                            q_text = m.get("question") or m.get("text") or ""
                            opts = m.get("options") or m.get("choices") or []
                            ans = m.get("answer") or m.get("correct_answer") or m.get("correct") or ""
                            expl = m.get("explanation") or m.get("rationale") or ""
                            
                            if not isinstance(opts, list):
                                opts = [opts] if opts else []
                            if len(opts) < 4:
                                opts = list(opts) + [""] * (4 - len(opts))
                            opts = [str(o) for o in opts[:4]]
                            
                            formatted_mcqs.append({
                                "question": str(q_text),
                                "options": opts,
                                "answer": str(ans),
                                "explanation": str(expl)
                            })
                            
                            db_insert_list.append({
                                "question": str(q_text),
                                "options": opts,
                                "answer": str(ans),
                                "explanation": str(expl),
                                "lesson_id": lesson_id,
                                "topic": title,
                                "difficulty": diff,
                                "created_at": datetime.now().isoformat()
                            })
                        
                        # Save back
                        lessons_col.update_one({"id": lesson_id}, {"$set": {"mcq_quiz": formatted_mcqs}})
                        mcqs_col.insert_many(db_insert_list)
                        print(f"Successfully generated and inserted 5 MCQs for {lesson_id}.")
                        success = True
                        generator_count += 1
                        # Sleep 10 seconds to stay safely within the API rate limits
                        time.sleep(10)
                except Exception as e:
                    retries -= 1
                    print(f"Generation error (retries left={retries}): {e}")
                    if retries > 0:
                        time.sleep(20)
            
            if not success:
                print(f"WARNING: Could not generate MCQs for {lesson_id} after retries.")
                
    print("\n--- Seed process completed successfully ---")
    print(f"Generated MCQs for {generator_count} new lessons.")

if __name__ == "__main__":
    run_migration_and_seed()
