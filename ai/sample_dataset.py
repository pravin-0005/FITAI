"""Sample fitness dataset for testing FITAI AI service.

Contains realistic test cases:
- beginner profile
- intermediate profile
- high completion history
- low completion history
- increasing performance
- declining performance
"""

from __future__ import annotations

from datetime import date, timedelta


def _date(days_ago: int) -> str:
    return (date.today() - timedelta(days=days_ago)).isoformat()


# --- User Profiles ---

BEGINNER_USER = {
    "goal": "general_fitness",
    "difficulty": "beginner",
    "equipment": ["bodyweight"],
    "days_per_week": 3,
    "duration_weeks": 4,
    "name": "Beginner Fitness Plan",
    "age": 28,
    "weight_kg": 75.0,
}

INTERMEDIATE_USER = {
    "goal": "muscle_gain",
    "difficulty": "intermediate",
    "equipment": ["dumbbell", "bodyweight"],
    "days_per_week": 5,
    "duration_weeks": 8,
    "name": "Intermediate Muscle Gain Plan",
    "age": 32,
    "weight_kg": 80.0,
}

ADVANCED_USER = {
    "goal": "strength",
    "difficulty": "advanced",
    "equipment": ["barbell", "dumbbell", "bodyweight"],
    "days_per_week": 4,
    "duration_weeks": 6,
    "name": "Advanced Strength Plan",
    "age": 35,
    "weight_kg": 85.0,
}


# --- Workout Histories ---

def _make_workouts(
    count: int,
    completion_rate: float,
    start_days_ago: int,
    volume_base: float = 100.0,
    volume_trend: float = 0.0,  # per-session change
    include_measurements: bool = False,
    weight_start: float = 80.0,
    weight_trend: float = 0.0,  # per-workout change
) -> tuple[list[dict], list[dict]]:
    """Generate a synthetic workout history.

    Returns (workouts, measurements).
    """
    workouts = []
    measurements = []
    for i in range(count):
        d = start_days_ago - i
        completed = (i % 10) < int(completion_rate * 10)
        vol = volume_base + volume_trend * i
        exercises = [
            {
                "name": "Squat",
                "sets": 3,
                "reps": 8,
                "weight": vol / 24,
            },
            {
                "name": "Push-up",
                "sets": 3,
                "reps": 12,
                "weight": 0,
            },
        ]
        workouts.append({
            "date": _date(d),
            "completed": completed,
            "exercises": exercises,
            "duration_minutes": 45 if completed else 0,
        })
        if include_measurements and i % 7 == 0:
            measurements.append({
                "date": _date(d),
                "weight_kg": weight_start + weight_trend * i,
                "body_fat_pct": 20 - i * 0.1,
                "resting_hr": 60 + i * 0.05,
            })
    return workouts, measurements


# High completion (85%+)
HIGH_COMPLETION_WORKOUTS, HIGH_COMPLETION_MEASUREMENTS = _make_workouts(
    count=30,
    completion_rate=0.87,
    start_days_ago=29,
    volume_base=200.0,
    volume_trend=5.0,
    include_measurements=True,
    weight_start=82.0,
    weight_trend=-0.3,  # losing weight
)

# Low completion (30%)
LOW_COMPLETION_WORKOUTS, LOW_COMPLETION_MEASUREMENTS = _make_workouts(
    count=30,
    completion_rate=0.30,
    start_days_ago=29,
    volume_base=150.0,
    volume_trend=-3.0,
    include_measurements=True,
    weight_start=80.0,
    weight_trend=0.0,
)

# Increasing performance (muscle_gain goal, rising volume, rising weight)
INCREASING_WORKOUTS, INCREASING_MEASUREMENTS = _make_workouts(
    count=24,
    completion_rate=0.92,
    start_days_ago=23,
    volume_base=180.0,
    volume_trend=12.0,
    include_measurements=True,
    weight_start=78.0,
    weight_trend=0.5,  # gaining mass
)

# Declining performance (overtraining, dropping volume)
DECLINING_WORKOUTS, DECLINING_MEASUREMENTS = _make_workouts(
    count=24,
    completion_rate=0.55,
    start_days_ago=23,
    volume_base=220.0,
    volume_trend=-15.0,
    include_measurements=True,
    weight_start=80.0,
    weight_trend=-1.0,  # losing mass
)


# --- Full histories ---

HIGH_COMPLETION_HISTORY = {
    "workouts": HIGH_COMPLETION_WORKOUTS,
    "measurements": HIGH_COMPLETION_MEASUREMENTS,
    "personal_records": [
        {"exercise": "Squat", "weight": 100, "reps": 5, "date": _date(5)},
        {"exercise": "Push-up", "weight": 0, "reps": 30, "date": _date(3)},
    ],
    "goal": "weight_loss",
}

LOW_COMPLETION_HISTORY = {
    "workouts": LOW_COMPLETION_WORKOUTS,
    "measurements": LOW_COMPLETION_MEASUREMENTS,
    "personal_records": [],
    "goal": "general_fitness",
}

INCREASING_HISTORY = {
    "workouts": INCREASING_WORKOUTS,
    "measurements": INCREASING_MEASUREMENTS,
    "personal_records": [
        {"exercise": "Squat", "weight": 90, "reps": 5, "date": _date(2)},
    ],
    "goal": "muscle_gain",
}

DECLINING_HISTORY = {
    "workouts": DECLINING_WORKOUTS,
    "measurements": DECLINING_MEASUREMENTS,
    "personal_records": [
        {"exercise": "Squat", "weight": 95, "reps": 3, "date": _date(20)},
    ],
    "goal": "strength",
}

BEGINNER_HISTORY = {
    "workouts": _make_workouts(10, 0.6, 9, volume_base=80.0)[0],
    "measurements": [],
    "personal_records": [],
    "goal": "general_fitness",
}

INTERMEDIATE_HISTORY = {
    "workouts": _make_workouts(20, 0.75, 19, volume_base=150.0)[0],
    "measurements": _make_workouts(20, 0.75, 19, volume_base=150.0)[1],
    "personal_records": [
        {"exercise": "Bench Press", "weight": 60, "reps": 5, "date": _date(1)},
    ],
    "goal": "muscle_gain",
}