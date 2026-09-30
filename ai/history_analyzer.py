"""Workout-history analysis for FITAI.

Computes completion rate, consistency, volume trends, and streaks.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any


def _parse_date(value: Any) -> date:
    """Parse a date string or datetime object."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return datetime.fromisoformat(value[:10]).date()
    raise ValueError(f"Cannot parse date from {value!r}")


def analyze_workout_history(workouts: list[dict[str, Any]]) -> dict[str, Any]:
    """Analyze a list of workout log entries.

    Expected workout keys:
        - date: str (ISO) or datetime
        - completed: bool
        - exercises: list of dicts with optional 'weight', 'reps', 'duration_minutes'
        - notes: str (optional)

    Returns structured analysis JSON.
    """
    if not workouts:
        return {
            "total_sessions": 0,
            "completion_rate": 0.0,
            "consistency_score": 0.0,
            "current_streak": 0,
            "longest_streak": 0,
            "volume_trend": "no_data",
            "average_session_duration": 0.0,
            "summary": "No workout data available.",
        }

    for i, w in enumerate(workouts):
        if "date" not in w:
            raise ValueError(f"Workout {i}: missing required field 'date'")
        if "completed" not in w:
            raise ValueError(f"Workout {i}: missing required field 'completed'")
        if "exercises" not in w:
            raise ValueError(f"Workout {i}: missing required field 'exercises'")
        if not isinstance(w["exercises"], list):
            raise ValueError(f"Workout {i}: 'exercises' must be a list")

    # Sort by date
    sorted_workouts = sorted(workouts, key=lambda w: _parse_date(w["date"]))
    total = len(sorted_workouts)
    completed = sum(1 for w in sorted_workouts if w.get("completed", False))
    completion_rate = completed / total if total else 0.0

    # Consistency: fraction of possible days worked (last 30 days window)
    today = date.today()
    window_start = today - timedelta(days=29)
    days_in_window = (today - window_start).days + 1
    unique_workout_days = {
        _parse_date(w["date"]) for w in sorted_workouts if window_start <= _parse_date(w["date"]) <= today
    }
    consistency_score = len(unique_workout_days) / days_in_window if days_in_window else 0.0

    # Streaks
    current_streak = 0
    longest_streak = 0
    streak = 0
    prev_day = None
    for w in sorted_workouts:
        d = _parse_date(w["date"])
        if not w.get("completed", False):
            streak = 0
            prev_day = d
            continue
        if prev_day is not None:
            if (d - prev_day).days == 1:
                streak += 1
            elif (d - prev_day).days > 1:
                streak = 1
            else:
                streak = max(streak, 1)
        else:
            streak = 1
        prev_day = d
        longest_streak = max(longest_streak, streak)
        if d >= today - timedelta(days=1):
            current_streak = streak

    # Volume trend (simple: compare first half vs second half of completed sessions)
    completed_sessions = [w for w in sorted_workouts if w.get("completed", False)]
    volume_trend = "stable"
    if len(completed_sessions) >= 4:
        mid = len(completed_sessions) // 2
        first_half = completed_sessions[:mid]
        second_half = completed_sessions[mid:]
        first_vol = sum(_session_volume(w) for w in first_half)
        second_vol = sum(_session_volume(w) for w in second_half)
        if first_vol == 0 and second_vol == 0:
            volume_trend = "stable"
        elif second_vol > first_vol * 1.1:
            volume_trend = "increasing"
        elif second_vol < first_vol * 0.9:
            volume_trend = "decreasing"
        else:
            volume_trend = "stable"

    # Average session duration
    durations = [
        w.get("duration_minutes", 0)
        for w in sorted_workouts
        if isinstance(w.get("duration_minutes"), (int, float))
    ]
    avg_duration = sum(durations) / len(durations) if durations else 0.0

    summary = (
        f"User completed {completed}/{total} sessions ({completion_rate:.0%}). "
        f"Consistency over last 30 days: {consistency_score:.0%}. "
        f"Volume trend: {volume_trend}."
    )

    return {
        "total_sessions": total,
        "completed_sessions": completed,
        "completion_rate": round(completion_rate, 3),
        "consistency_score": round(consistency_score, 3),
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "volume_trend": volume_trend,
        "average_session_duration": round(avg_duration, 1),
        "summary": summary,
    }


def _session_volume(workout: dict[str, Any]) -> float:
    """Compute a simple volume score for a workout (sets x reps x weight)."""
    exercises = workout.get("exercises", [])
    total = 0.0
    for ex in exercises:
        sets = ex.get("sets", 0)
        reps = ex.get("reps", 0)
        weight = ex.get("weight", 0) or 0
        total += sets * reps * weight
    return total