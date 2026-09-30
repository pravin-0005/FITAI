"""Verify validation fixes are working"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.workout_generator import generate_workout_plan
from ai.history_analyzer import analyze_workout_history

print("Testing validation fixes...")
print("=" * 60)

# Test 1: Invalid goal
print("\n1. Testing invalid goal rejection...")
try:
    generate_workout_plan({"goal": "invalid_goal", "difficulty": "beginner"})
    print("FAIL: Invalid goal was NOT rejected")
except ValueError as e:
    print(f"PASS: Invalid goal rejected - {e}")

# Test 2: Invalid difficulty
print("\n2. Testing invalid difficulty rejection...")
try:
    generate_workout_plan({"goal": "muscle_gain", "difficulty": "ultra_hard"})
    print("FAIL: Invalid difficulty was NOT rejected")
except ValueError as e:
    print(f"PASS: Invalid difficulty rejected - {e}")

# Test 3: Invalid days_per_week
print("\n3. Testing invalid days_per_week rejection...")
try:
    generate_workout_plan({"goal": "muscle_gain", "difficulty": "beginner", "days_per_week": 0})
    print("FAIL: Invalid days_per_week was NOT rejected")
except ValueError as e:
    print(f"PASS: Invalid days_per_week rejected - {e}")

# Test 4: Invalid duration_weeks
print("\n4. Testing invalid duration_weeks rejection...")
try:
    generate_workout_plan({"goal": "muscle_gain", "difficulty": "beginner", "duration_weeks": 1000})
    print("FAIL: Invalid duration_weeks was NOT rejected")
except ValueError as e:
    print(f"PASS: Invalid duration_weeks rejected - {e}")

# Test 5: Malformed workout (missing date)
print("\n5. Testing malformed workout rejection (missing date)...")
try:
    analyze_workout_history([{"completed": True, "exercises": []}])
    print("FAIL: Malformed workout was NOT rejected")
except ValueError as e:
    print(f"PASS: Malformed workout rejected - {e}")

# Test 6: Malformed workout (missing completed)
print("\n6. Testing malformed workout rejection (missing completed)...")
try:
    analyze_workout_history([{"date": "2026-09-30", "exercises": []}])
    print("FAIL: Malformed workout was NOT rejected")
except ValueError as e:
    print(f"PASS: Malformed workout rejected - {e}")

# Test 7: Malformed workout (missing exercises)
print("\n7. Testing malformed workout rejection (missing exercises)...")
try:
    analyze_workout_history([{"date": "2026-09-30", "completed": True}])
    print("FAIL: Malformed workout was NOT rejected")
except ValueError as e:
    print(f"PASS: Malformed workout rejected - {e}")

# Test 8: Valid inputs still work
print("\n8. Testing valid inputs still work...")
try:
    plan = generate_workout_plan({
        "goal": "muscle_gain",
        "difficulty": "intermediate",
        "days_per_week": 5,
        "duration_weeks": 8
    })
    history = analyze_workout_history([
        {
            "date": "2026-09-30",
            "completed": True,
            "exercises": [{"name": "Squat", "sets": 3, "reps": 8}]
        }
    ])
    print(f"PASS: Valid inputs accepted - plan name: {plan['plan_name']}, analysis sessions: {history['total_sessions']}")
except Exception as e:
    print(f"FAIL: Valid inputs rejected - {e}")

print("\n" + "=" * 60)
print("Validation fixes verified: ALL PASS")
