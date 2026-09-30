"""Adaptive workout recommendations for FITAI.

Analyzes workout history and progress to recommend plan adjustments.
"""

from __future__ import annotations

from typing import Any

from .history_analyzer import analyze_workout_history
from .progress_stats import compute_progress_stats


def generate_adaptive_recommendations(
    user_profile: dict[str, Any],
    current_plan: dict[str, Any],
    history: dict[str, Any],
) -> dict[str, Any]:
    """Generate adaptive recommendations based on user history.

    Args:
        user_profile: User data (goal, difficulty, etc.)
        current_plan: The currently active workout plan
        history: Dict with 'workouts', 'measurements', 'personal_records'

    Returns:
        Structured JSON with status, insights, recommended_changes, reasoning.
    """
    analysis = analyze_workout_history(history.get("workouts", []))
    progress = compute_progress_stats(history)

    insights: list[str] = []
    recommended_changes: list[dict[str, Any]] = []
    status = "on_track"

    completion_rate = analysis["completion_rate"]
    volume_trend = analysis["volume_trend"]
    consistency = analysis["consistency_score"]
    current_streak = analysis["current_streak"]
    longest_streak = analysis["longest_streak"]
    weight_trend = progress.get("weight_trend", {})
    goal = user_profile.get("goal", "general_fitness")
    difficulty = user_profile.get("difficulty", "beginner")

    # --- Completion-based insights ---
    if completion_rate >= 0.8:
        insights.append(f"Excellent completion rate ({completion_rate:.0%}). User is highly committed.")
    elif completion_rate >= 0.6:
        insights.append(f"Good completion rate ({completion_rate:.0%}). Room for improvement.")
    elif completion_rate >= 0.4:
        insights.append(f"Moderate completion rate ({completion_rate:.0%}). Consider reducing plan intensity.")
        status = "needs_adjustment"
        recommended_changes.append({
            "type": "reduce_intensity",
            "field": "difficulty",
            "from": difficulty,
            "to": _lower_difficulty(difficulty),
            "reason": "Low completion rate suggests current difficulty may be too high.",
        })
    else:
        insights.append(f"Low completion rate ({completion_rate:.0%}). Plan requires significant adjustment.")
        status = "needs_adjustment"
        recommended_changes.append({
            "type": "reduce_intensity",
            "field": "difficulty",
            "from": difficulty,
            "to": "beginner",
            "reason": "Very low completion rate; reset to beginner level to build consistency.",
        })

    # --- Consistency insights ---
    if consistency < 0.3 and analysis["total_sessions"] > 0:
        insights.append(f"Low consistency ({consistency:.0%} of days active). Consider fewer weekly sessions.")
        status = "needs_adjustment"
        recommended_changes.append({
            "type": "reduce_frequency",
            "field": "days_per_week",
            "reason": "Low consistency suggests too many sessions per week.",
        })
    elif consistency >= 0.6:
        insights.append(f"Good consistency ({consistency:.0%}). User is building a habit.")

    # --- Volume trend insights ---
    if volume_trend == "decreasing" and analysis["total_sessions"] >= 4:
        insights.append("Volume is declining. Review recovery and program structure.")
        status = "needs_adjustment"
        recommended_changes.append({
            "type": "deload_week",
            "reason": "Declining volume suggests need for a deload week.",
        })
    elif volume_trend == "increasing":
        insights.append("Volume is increasing steadily. Great progress!")
        if difficulty == "beginner":
            recommended_changes.append({
                "type": "progression",
                "field": "difficulty",
                "from": difficulty,
                "to": "intermediate",
                "reason": "Consistent volume increase indicates readiness for progression.",
            })
            status = "progressing"

    # --- Goal-specific insights ---
    if goal == "weight_loss":
        if weight_trend.get("trend") == "decreasing":
            insights.append(f"Weight decreasing ({weight_trend.get('change', 0):+.1f} kg). On track for goal.")
        elif weight_trend.get("trend") == "increasing":
            insights.append("Weight increasing despite weight_loss goal. Review nutrition.")
            status = "needs_adjustment"
            recommended_changes.append({
                "type": "increase_activity",
                "reason": "Weight trend conflicts with weight_loss goal.",
            })
    elif goal in ("muscle_gain", "strength"):
        if weight_trend.get("trend") == "increasing":
            insights.append(f"Weight increasing ({weight_trend.get('change', 0):+.1f} kg). Good for muscle gain.")
        elif weight_trend.get("trend") == "stable" and volume_trend != "increasing":
            insights.append("Weight stable. Consider increasing progressive overload.")
            recommended_changes.append({
                "type": "increase_load",
                "reason": "Plateau detected; increase weight or reps progressively.",
            })

    # --- Streak insights ---
    if current_streak >= 7:
        insights.append(f"{current_streak}-day streak! Keep it going.")
    elif longest_streak >= 14:
        insights.append(f"Previously achieved a {longest_streak}-day streak. Rebuild it.")

    # --- Default reasoning ---
    if not recommended_changes:
        reasoning = (
            f"User is on track with {completion_rate:.0%} completion and "
            f"{consistency:.0%} consistency. No major changes needed."
        )
    else:
        reasoning = (
            f"Based on {analysis['total_sessions']} sessions, {completion_rate:.0%} completion, "
            f"and volume trend '{volume_trend}', adjustments are recommended."
        )

    return {
        "status": status,
        "insights": insights,
        "recommended_changes": recommended_changes,
        "reasoning": reasoning,
        "analysis_snapshot": {
            "completion_rate": analysis["completion_rate"],
            "consistency_score": analysis["consistency_score"],
            "volume_trend": analysis["volume_trend"],
            "current_streak": analysis["current_streak"],
        },
    }


def _lower_difficulty(difficulty: str) -> str:
    order = ["beginner", "intermediate", "advanced"]
    if difficulty in order:
        idx = order.index(difficulty)
        return order[max(0, idx - 1)]
    return "beginner"