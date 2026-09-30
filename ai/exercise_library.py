"""Exercise library for FITAI AI service.

A curated set of exercises with muscle group, difficulty, and equipment.
"""

from __future__ import annotations

from typing import Any

EXERCISES: list[dict[str, Any]] = [
    # Push
    {"id": "pushup", "name": "Push-up", "muscle_group": "push", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Keep body straight, lower chest to floor."},
    {"id": "dumbbell_bench", "name": "Dumbbell Bench Press", "muscle_group": "push", "difficulty": "intermediate", "equipment": "dumbbell", "instructions": "Press dumbbells up from chest, keep back flat."},
    {"id": "overhead_press", "name": "Overhead Press", "muscle_group": "push", "difficulty": "intermediate", "equipment": "dumbbell", "instructions": "Press weight overhead, arms straight at top."},
    {"id": "dips", "name": "Dips", "muscle_group": "push", "difficulty": "intermediate", "equipment": "bodyweight", "instructions": "Lower body between parallel bars, push back up."},
    {"id": "incline_pushups", "name": "Incline Push-up", "muscle_group": "push", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Hands on elevated surface, lower chest."},
    {"id": "chest_fly", "name": "Chest Fly", "muscle_group": "push", "difficulty": "intermediate", "equipment": "dumbbell", "instructions": "Hinge at elbows, open chest, squeeze at top."},

    # Pull
    {"id": "pullup", "name": "Pull-up", "muscle_group": "pull", "difficulty": "advanced", "equipment": "bodyweight", "instructions": "Pull body up to bar, chin over bar."},
    {"id": "bent_row", "name": "Bent-over Row", "muscle_group": "pull", "difficulty": "intermediate", "equipment": "dumbbell", "instructions": "Hinge at hips, pull dumbbells to lower ribs."},
    {"id": "lat_pulldown", "name": "Lat Pulldown", "muscle_group": "pull", "difficulty": "intermediate", "equipment": "cable", "instructions": "Pull bar to upper chest, squeeze lats."},
    {"id": "bicep_curl", "name": "Bicep Curl", "muscle_group": "pull", "difficulty": "beginner", "equipment": "dumbbell", "instructions": "Keep elbows fixed, curl weight up."},
    {"id": "face_pull", "name": "Face Pull", "muscle_group": "pull", "difficulty": "beginner", "equipment": "cable", "instructions": "Pull rope to face, squeeze rear delts."},
    {"id": "inverted_row", "name": "Inverted Row", "muscle_group": "pull", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Under bar, pull chest to bar."},

    # Legs
    {"id": "squat", "name": "Squat", "muscle_group": "legs", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Sit back, keep chest up, depth to parallel."},
    {"id": "deadlift", "name": "Deadlift", "muscle_group": "legs", "difficulty": "advanced", "equipment": "barbell", "instructions": "Flat back, hinge at hips, drive through heels."},
    {"id": "lunges", "name": "Lunge", "muscle_group": "legs", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Step forward, lower back knee to floor."},
    {"id": "leg_press", "name": "Leg Press", "muscle_group": "legs", "difficulty": "intermediate", "equipment": "machine", "instructions": "Press platform away, avoid locking knees."},
    {"id": "glute_bridge", "name": "Glute Bridge", "muscle_group": "legs", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Lift hips, squeeze glutes at top."},
    {"id": "calf_raise", "name": "Calf Raise", "muscle_group": "legs", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Rise onto toes, lower slowly."},

    # Full body
    {"id": "burpee", "name": "Burpee", "muscle_group": "full_body", "difficulty": "advanced", "equipment": "bodyweight", "instructions": "Squat, jump back, push-up, jump forward."},
    {"id": "kettlebell_swing", "name": "Kettlebell Swing", "muscle_group": "full_body", "difficulty": "intermediate", "equipment": "kettlebell", "instructions": "Hinge at hips, drive bell to chest height."},
    {"id": "mountain_climbers", "name": "Mountain Climbers", "muscle_group": "full_body", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Alternate legs in plank position."},
    {"id": "jump_squat", "name": "Jump Squat", "muscle_group": "full_body", "difficulty": "intermediate", "equipment": "bodyweight", "instructions": "Squat, explode upward, land softly."},

    # Core
    {"id": "plank", "name": "Plank", "muscle_group": "core", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Hold forearm plank, body straight."},
    {"id": "leg_raise", "name": "Leg Raise", "muscle_group": "core", "difficulty": "intermediate", "equipment": "bodyweight", "instructions": "Lying, raise legs, lower slowly."},
    {"id": "russian_twist", "name": "Russian Twist", "muscle_group": "core", "difficulty": "intermediate", "equipment": "bodyweight", "instructions": "Sit, twist torso side to side."},
    {"id": "dead_bug", "name": "Dead Bug", "muscle_group": "core", "difficulty": "beginner", "equipment": "bodyweight", "instructions": "Extend opposite arm/leg, keep back flat."},
]


def get_exercises_by_muscle(muscle_group: str) -> list[dict[str, Any]]:
    """Return all exercises for a given muscle group."""
    return [e for e in EXERCISES if e["muscle_group"] == muscle_group]


def get_exercises_by_equipment(equipment: str) -> list[dict[str, Any]]:
    """Return all exercises for a given equipment type."""
    return [e for e in EXERCISES if e["equipment"] == equipment]


def get_exercises_by_difficulty(difficulty: str) -> list[dict[str, Any]]:
    """Return all exercises for a given difficulty level."""
    return [e for e in EXERCISES if e["difficulty"] == difficulty]


def get_all_muscle_groups() -> list[str]:
    """Return unique muscle groups."""
    return sorted({e["muscle_group"] for e in EXERCISES})


def get_all_equipment() -> list[str]:
    """Return unique equipment types."""
    return sorted({e["equipment"] for e in EXERCISES})


def get_all_difficulties() -> list[str]:
    """Return unique difficulty levels."""
    return sorted({e["difficulty"] for e in EXERCISES})