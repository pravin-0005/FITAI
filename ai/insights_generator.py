"""AI-generated progress insights for FITAI.

Turns raw history and stats into natural-language insights.
"""

from __future__ import annotations

from typing import Any


def generate_insights(history: dict[str, Any]) -> dict[str, Any]:
    """Generate AI progress insights from workout history and measurements.

    Returns structured JSON with insights array and summary.
    """
    from .history_analyzer import analyze_workout_history
    from .progress_stats import compute_progress_stats

    workouts = history.get("workouts", [])
    analysis = analyze_workout_history(workouts)
    progress = compute_progress_stats(history)

    insights: list[dict[str, Any]] = []

    # Completion insight
    cr = analysis["completion_rate"]
    if cr >= 0.8:
        insights.append({
            "type": "strength",
            "title": "Consistency Champion",
            "description": f"You've completed {analysis['completed_sessions']}/{analysis['total_sessions']} workouts — outstanding consistency.",
            "metric": "completion_rate",
            "value": cr,
        })
    elif cr >= 0.5:
        insights.append({
            "type": "neutral",
            "title": "Building Habit",
            "description": "Good progress, but there's room to improve completion rate.",
            "metric": "completion_rate",
            "value": cr,
        })
    elif analysis["total_sessions"] > 0:
        insights.append({
            "type": "warning",
            "title": "Needs Attention",
            "description": "Completion rate is low. Consider adjusting your plan or schedule.",
            "metric": "completion_rate",
            "value": cr,
        })

    # Streak insight
    if analysis["current_streak"] >= 7:
        insights.append({
            "type": "strength",
            "title": "Hot Streak",
            "description": f"You're on a {analysis['current_streak']}-day workout streak!",
            "metric": "current_streak",
            "value": analysis["current_streak"],
        })

    # Volume trend
    vt = analysis["volume_trend"]
    if vt == "increasing":
        insights.append({
            "type": "strength",
            "title": "Rising Volume",
            "description": "Training volume is trending upward — great for strength and muscle gains.",
            "metric": "volume_trend",
            "value": vt,
        })
    elif vt == "decreasing":
        insights.append({
            "type": "warning",
            "title": "Volume Declining",
            "description": "Training volume has dropped. Review recovery, scheduling, or motivation.",
            "metric": "volume_trend",
            "value": vt,
        })

    # Weight trend
    wt = progress.get("weight_trend", {})
    if wt.get("trend") not in (None, "no_data"):
        insights.append({
            "type": "info",
            "title": "Weight Trend",
            "description": f"Weight is {wt['trend']} by {wt.get('change', 0):+.1f} kg over the tracked period.",
            "metric": "weight_trend",
            "value": wt["trend"],
        })

    # Progress score
    score = progress.get("progress_score", 0)
    if score >= 70:
        insights.append({
            "type": "strength",
            "title": "Strong Progress",
            "description": f"Overall progress score is {score}/100. Keep pushing!",
            "metric": "progress_score",
            "value": score,
        })
    elif score >= 40:
        insights.append({
            "type": "neutral",
            "title": "Steady Progress",
            "description": f"Progress score is {score}/100. You're moving in the right direction.",
            "metric": "progress_score",
            "value": score,
        })

    # Summary
    if not insights:
        summary = "Not enough data yet. Log some workouts to see insights."
    else:
        strengths = sum(1 for i in insights if i["type"] == "strength")
        warnings = sum(1 for i in insights if i["type"] == "warning")
        summary = f"{len(insights)} insights generated ({strengths} positive, {warnings} need attention)."

    return {
        "insights": insights,
        "summary": summary,
        "total_insights": len(insights),
    }