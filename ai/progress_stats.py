"""Progress statistics for FITAI.

Computes progress metrics from workout history and goal data.
"""

from __future__ import annotations

from typing import Any


def compute_progress_stats(history: dict[str, Any]) -> dict[str, Any]:
    """Compute progress statistics from workout history.

    Expected history keys:
        - workouts: list of workout dicts (see history_analyzer)
        - goal: str
        - start_date: str (optional)
        - measurements: list of dicts with 'date' and metric fields
          (e.g., weight_kg, body_fat_pct, resting_hr, etc.)
        - personal_records: list of dicts with 'exercise', 'weight', 'reps', 'date'

    Returns structured progress JSON.
    """
    workouts = history.get("workouts", [])
    measurements = history.get("measurements", [])
    personal_records = history.get("personal_records", [])
    goal = history.get("goal", "general_fitness")

    # Completion stats
    total = len(workouts)
    completed = sum(1 for w in workouts if w.get("completed", False))
    completion_rate = completed / total if total else 0.0

    # Volume over time (weekly buckets)
    weekly_volume = _weekly_volume(workouts)

    # Measurement trends
    weight_trend = _measurement_trend(measurements, "weight_kg")
    bf_trend = _measurement_trend(measurements, "body_fat_pct")
    hr_trend = _measurement_trend(measurements, "resting_hr")

    # PR count
    pr_count = len(personal_records)

    # Overall progress score (0-100)
    score = _progress_score(completion_rate, len(weekly_volume), pr_count, weight_trend, goal)

    return {
        "goal": goal,
        "total_sessions": total,
        "completion_rate": round(completion_rate, 3),
        "weekly_volume": weekly_volume,
        "weight_trend": weight_trend,
        "body_fat_trend": bf_trend,
        "resting_hr_trend": hr_trend,
        "personal_records_count": pr_count,
        "progress_score": score,
        "summary": _summarize(score, completion_rate, weight_trend, pr_count),
    }


def _weekly_volume(workouts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Group workout volume by ISO week."""
    from datetime import datetime, timedelta

    buckets: dict[str, float] = {}
    for w in workouts:
        if not w.get("completed", False):
            continue
        try:
            d = datetime.fromisoformat(str(w["date"])[:10])
        except (ValueError, KeyError):
            continue
        iso = d.isocalendar()
        key = f"{iso[0]}-W{iso[1]:02d}"
        vol = _session_volume(w)
        buckets[key] = buckets.get(key, 0.0) + vol
    # Sort by week key
    sorted_keys = sorted(buckets.keys())
    return [{"week": k, "volume": round(buckets[k], 1)} for k in sorted_keys]


def _session_volume(workout: dict[str, Any]) -> float:
    exercises = workout.get("exercises", [])
    total = 0.0
    for ex in exercises:
        sets = ex.get("sets", 0)
        reps = ex.get("reps", 0)
        weight = ex.get("weight", 0) or 0
        total += sets * reps * weight
    return total


def _measurement_trend(measurements: list[dict[str, Any]], key: str) -> dict[str, Any]:
    """Compute trend for a measurement key (first vs last value)."""
    values = [
        (m["date"], m[key])
        for m in measurements
        if key in m and isinstance(m[key], (int, float))
    ]
    if not values:
        return {"value": None, "trend": "no_data", "change": None}
    values.sort(key=lambda x: x[0])
    first_val = values[0][1]
    last_val = values[-1][1]
    change = last_val - first_val
    if abs(change) < 1e-6:
        trend = "stable"
    elif change > 0:
        trend = "increasing"
    else:
        trend = "decreasing"
    return {
        "value": round(last_val, 2),
        "trend": trend,
        "change": round(change, 2),
        "first_value": round(first_val, 2),
    }


def _progress_score(
    completion_rate: float,
    weeks_active: int,
    pr_count: int,
    weight_trend: dict[str, Any],
    goal: str,
) -> int:
    """Compute a 0-100 progress score."""
    score = 0
    # Completion (max 40)
    score += min(40, int(completion_rate * 40))
    # Consistency (max 30)
    score += min(30, weeks_active * 5)
    # PRs (max 20)
    score += min(20, pr_count * 5)
    # Goal alignment (max 10)
    if goal in ("weight_loss",) and weight_trend.get("trend") == "decreasing":
        score += 10
    elif goal in ("muscle_gain", "strength") and weight_trend.get("trend") == "increasing":
        score += 10
    elif weight_trend.get("trend") == "stable":
        score += 5
    return min(100, max(0, score))


def _summarize(score: int, completion_rate: float, weight_trend: dict[str, Any], pr_count: int) -> str:
    parts = [f"Progress score: {score}/100."]
    parts.append(f"Completion rate: {completion_rate:.0%}.")
    if weight_trend.get("trend") != "no_data":
        parts.append(f"Weight trend: {weight_trend['trend']} ({weight_trend.get('change', 0):+.1f} kg).")
    parts.append(f"Personal records: {pr_count}.")
    return " ".join(parts)