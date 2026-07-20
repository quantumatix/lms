import sys
import os
import time
from datetime import datetime
from pymongo import MongoClient

# Add backend directory to Python path to import gemini service
sys.path.append(os.path.abspath("backend"))

from services.gemini_service import generate_python_mcqs

def run_mcq_generation_and_sync():
    client = MongoClient("mongodb://localhost:27017")
    db = client["lms_database"]
    lessons_col = db["lessons"]
    mcqs_col = db["mcqs"]
    
    lessons = list(lessons_col.find().sort("id", 1))
    print(f"Found {len(lessons)} lessons in the database.")
    
    # Tracking for the report
    lessons_with_existing = []
    lessons_missing = []
    lessons_generated = []
    total_mcqs_created = 0
    
    for idx, lesson in enumerate(lessons):
        lesson_id = lesson.get("id")
        title = lesson.get("title")
        difficulty = lesson.get("difficulty", "Beginner")
        
        print(f"\n[{idx+1}/{len(lessons)}] Checking Lesson: {lesson_id} ('{title}')")
        
        # Check current MCQs in the mcqs collection
        db_mcqs = list(mcqs_col.find({"lesson_id": lesson_id}))
        db_mcq_count = len(db_mcqs)
        
        # We want precisely 5 questions per lesson.
        # If a lesson has 0 questions or less than 5, we consider it missing/incomplete.
        if db_mcq_count >= 5:
            print(f"-> Lesson already has {db_mcq_count} MCQs in the 'mcqs' collection. Verifying sync...")
            lessons_with_existing.append(title)
            
            # Verify and sync with lessons collection
            embed_mcqs = lesson.get("mcq_quiz")
            if not embed_mcqs or len(embed_mcqs) != db_mcq_count:
                print("   [Sync] Mismatch or missing embed_mcq in lesson document. Syncing now...")
                formatted = []
                for m in db_mcqs:
                    formatted.append({
                        "question": m.get("question"),
                        "options": m.get("options"),
                        "answer": m.get("answer"),
                        "explanation": m.get("explanation", "")
                    })
                lessons_col.update_one({"id": lesson_id}, {"$set": {"mcq_quiz": formatted}})
                print("   [Sync] Lesson document synced successfully.")
            else:
                print("   [Sync] Already fully in sync.")
                
        else:
            print(f"-> Lesson {lesson_id} is missing or has incomplete MCQs ({db_mcq_count}/5 in DB). Generating...")
            lessons_missing.append(title)
            
            # Delete any existing incomplete MCQs to avoid duplicates or mixing
            if db_mcq_count > 0:
                print(f"   Deleting {db_mcq_count} stale/incomplete MCQs from 'mcqs' collection...")
                mcqs_col.delete_many({"lesson_id": lesson_id})
            
            success = False
            retries = 5
            backoff = 15
            
            while retries > 0 and not success:
                try:
                    diff = difficulty.capitalize()
                    print(f"   Requesting Gemini to generate 5 MCQs for topic: '{title}' (Difficulty: {diff})...")
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
                        
                        # Insert into both collections
                        if formatted_mcqs:
                            lessons_col.update_one({"id": lesson_id}, {"$set": {"mcq_quiz": formatted_mcqs}})
                            mcqs_col.insert_many(db_insert_list)
                            
                            print(f"   Successfully saved 5 new MCQs for {lesson_id} in lessons and mcqs collections.")
                            success = True
                            lessons_generated.append(title)
                            total_mcqs_created += len(formatted_mcqs)
                            
                            # Sleep 3 seconds to respect rate limits
                            print("   Sleeping 3 seconds to respect rate limits...")
                            time.sleep(3)
                        else:
                            raise Exception("Generated MCQ list was empty or invalid format")
                    else:
                        raise Exception("Empty response from MCQ generator")
                        
                except Exception as e:
                    retries -= 1
                    print(f"   Error generating (Retries left: {retries}): {e}")
                    if retries > 0:
                        print(f"   Waiting {backoff} seconds before route retry...")
                        time.sleep(backoff)
                        backoff *= 2  # Exponential backoff
                        
            if not success:
                print(f"   FAILED: Could not generate MCQs for {lesson_id} after all retries.")
                lessons_col.update_one({"id": lesson_id}, {"$set": {"mcq_quiz": []}})
    
    print("\n" + "="*50)
    print("MIGRATION & GENERATION REPORT")
    print("="*50)
    print(f"Lessons with existing MCQs ({len(lessons_with_existing)}):")
    for l in lessons_with_existing:
        print(f" - {l}")
    print(f"\nLessons missing MCQs ({len(lessons_missing)}):")
    for l in lessons_missing:
        print(f" - {l}")
    print(f"\nLessons automatically generated ({len(lessons_generated)}):")
    for l in lessons_generated:
        print(f" - {l}")
    print(f"\nTotal MCQs created: {total_mcqs_created}")
    print("="*50)
    
    # Save report to raw file for easy reading
    with open("tmp/mcq_generation_report.txt", "w", encoding="utf-8") as f:
        f.write("MIGRATION & GENERATION REPORT\n")
        f.write("="*50 + "\n")
        f.write(f"Lessons with existing MCQs ({len(lessons_with_existing)}):\n")
        for l in lessons_with_existing:
            f.write(f" - {l}\n")
        f.write(f"\nLessons missing MCQs ({len(lessons_missing)}):\n")
        for l in lessons_missing:
            f.write(f" - {l}\n")
        f.write(f"\nLessons automatically generated ({len(lessons_generated)}):\n")
        for l in lessons_generated:
            f.write(f" - {l}\n")
        f.write(f"\nTotal MCQs created: {total_mcqs_created}\n")
        f.write("="*50 + "\n")

if __name__ == "__main__":
    run_mcq_generation_and_sync()
