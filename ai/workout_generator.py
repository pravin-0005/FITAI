"""AI workout-plan generation for FITAI.

Produces structured JSON workout plans based on user profile and goal.
"""

from __future__ import annotations

from typing import Any

from .exercise_library import (
    EXERCISES,
    get_exercises_by_muscle,
    get_exercises_by_equipment,
    get_exercises_by_difficulty,
)

# Target sets/reps by difficulty
DIFFICULTY_PARAMS = {
    "beginner": {"sets": 2, "reps": 10, "rest_seconds": 60},
    "intermediate": {"sets": 3, "reps": 12, "rest_seconds": 45},
    "advanced": {"sets": 4, "reps": 8, "rest_seconds": 75},
}

# Days per week by goal
GOAL_DAYS = {
    "weight_loss": 4,
    "muscle_gain": 5,
    "strength": 4,
    "endurance": 4,
    "general_fitness": 3,
    "flexibility": 3,
}

# Muscle groups to cycle
MUSCLE_ROTATION = {
    "weight_loss": ["full_body", "full_body", "full_body", "full_body"],
    "muscle_gain": ["push", "pull", "legs", "push", "pull"],
    "strength": ["full_body", "full_body", "full_body", "full_body"],
    "endurance": ["full_body", "full_body", "full_body", "full_body"],
    "general_fitness": ["full_body", "full_body", "full_body"],
    "flexibility": ["full_body", "full_body", "full_body"],
}


def _select_exercises(muscle_group: str, equipment: list[str], difficulty: str, count: int = 4) -> list[dict]:
    """Select exercises for a given muscle group, filtering by equipment and difficulty."""
    pool = get_exercises_by_muscle(muscle_group)
    if equipment:
        filtered = [e for e in pool if e["equipment"] in equipment or e["equipment"] == "bodyweight"]
        if filtered:
            pool = filtered
    difficulty_ex = get_exercises_by_difficulty(difficulty)
    if difficulty_ex:
        pool = [e for e in pool if e in difficulty_ex] or pool
    selected = []
    seen = set()
    for ex in pool:
        if ex["id"] in seen:
            continue
        seen.add(ex["id"])
        selected.append(ex)
        if len(selected) >= count:
            break
    return selected


def _build_workout_block(muscle_group: str, equipment: list[str], difficulty: str) -> dict:
    """Build a single workout block for a muscle group."""
    exercises = _select_exercises(muscle_group, equipment, difficulty)
    params = DIFFICULTY_PARAMS.get(difficulty, DIFFICULTY_PARAMS["intermediate"])
    block = {
        "focus": muscle_group,
        "exercises": [],
    }
    for ex in exercises:
        block["exercises"].append({
            "name": ex["name"],
            "sets": params["sets"],
            "reps": params["reps"],
            "rest_seconds": params["rest_seconds"],
            "equipment": ex["equipment"],
            "muscle_group": ex["muscle_group"],
            "instructions": ex.get("instructions", ""),
        })
    return block


def generate_workout_plan(user_profile: dict[str, Any]) -> dict[str, Any]:
    """Generate an AI workout plan from a user profile.

    Expected user_profile keys:
        - goal: str (weight_loss, muscle_gain, strength, endurance, general_fitness, flexibility)
        - difficulty: str (beginner, intermediate, advanced)
        - equipment: list[str]
        - days_per_week: int (optional, overrides goal default)
        - duration_weeks: int (optional, default 4)
        - name: str (optional plan name)

    Returns structured JSON plan.
    """
    VALID_GOALS = {"weight_loss", "muscle_gain", "strength", "endurance", "flexibility", "general_fitness"}
    VALID_DIFFICULTIES = {"beginner", "intermediate", "advanced"}

    goal = user_profile.get("goal", "general_fitness")
    difficulty = user_profile.get("difficulty", "beginner")

    if goal not in VALID_GOALS:
        raise ValueError(f"Invalid goal '{goal}'. Must be one of: {', '.join(sorted(VALID_GOALS))}")
    if difficulty not in VALID_DIFFICULTIES:
        raise ValueError(f"Invalid difficulty '{difficulty}'. Must be one of: {', '.join(sorted(VALID_DIFFICULTIES))}")

    equipment = user_profile.get("equipment", []) or []
    days_per_week = user_profile.get("days_per_week") or GOAL_DAYS.get(goal, 3)
    duration_weeks = user_profile.get("duration_weeks", 4)

    if not (1 <= days_per_week <= 7):
        raise ValueError(f"days_per_week must be 1-7, got {days_per_week}")
    if not (1 <= duration_weeks <= 52):
        raise ValueError(f"duration_weeks must be 1-52, got {duration_weeks}")

    plan_name = user_profile.get("name", f"{goal.replace('_', ' ').title()} Plan")

    rotation = MUSCLE_ROTATION.get(goal, MUSCLE_ROTATION["general_fitness"])
    # Repeat rotation to fill days_per_week
    schedule = []
    for i in range(days_per_week):
        muscle = rotation[i % len(rotation)]
        block = _build_workout_block(muscle, equipment, difficulty)
        schedule.append(block)

    reasoning = (
        f"Plan designed for {goal.replace('_', ' ')} at {difficulty} level. "
        f"Schedule includes {days_per_week} sessions per week over {duration_weeks} weeks, "
        f"using available equipment: {', '.join(equipment) if equipment else 'bodyweight only'}. "
        f"Workouts rotate through {', '.join(sorted(set(m['focus'] for m in schedule)))} "
        f"to ensure balanced muscle development and adequate recovery."
    )

    safety_notes = []
    if difficulty == "beginner":
        safety_notes.append("Focus on form before adding weight or reps.")
        safety_notes.append("Warm up for 5-10 minutes before each session.")
    if "injury" in str(user_profile).lower():
        safety_notes.append("Consult a physician before starting any new exercise program.")
    if not equipment:
        safety_notes.append("Bodyweight exercises require no equipment; maintain proper alignment.")

    return {
        "plan_name": plan_name,
        "goal": goal,
        "difficulty": difficulty,
        "duration_weeks": duration_weeks,
        "weekly_schedule": schedule,
        "reasoning": reasoning,
        "safety_notes": safety_notes,
    }