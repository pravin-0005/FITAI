"""FITAI AI Service — main entry point.

Combines workout generation, history analysis, progress stats,
adaptive recommendations, and insights into a single service.
"""

from __future__ import annotations

from typing import Any

from .adaptive_recommender import generate_adaptive_recommendations
from .exercise_library import (
    EXERCISES,
    get_all_difficulties,
    get_all_equipment,
    get_all_muscle_groups,
)
from .history_analyzer import analyze_workout_history
from .insights_generator import generate_insights
from .progress_stats import compute_progress_stats
from .workout_generator import generate_workout_plan


class FITAI:
    """Main AI service for FITAI adaptive fitness coach."""

    def generate_plan(self, user_profile: dict[str, Any]) -> dict[str, Any]:
        """Generate a personalized workout plan."""
        return generate_workout_plan(user_profile)

    def analyze_history(self, workouts: list[dict[str, Any]]) -> dict[str, Any]:
        """Analyze workout history for completion, consistency, trends."""
        return analyze_workout_history(workouts)

    def compute_progress(self, history: dict[str, Any]) -> dict[str, Any]:
        """Compute progress statistics from history."""
        return compute_progress_stats(history)

    def get_insights(self, history: dict[str, Any]) -> dict[str, Any]:
        """Generate AI progress insights."""
        return generate_insights(history)

    def adapt_plan(
        self,
        user_profile: dict[str, Any],
        current_plan: dict[str, Any],
        history: dict[str, Any],
    ) -> dict[str, Any]:
        """Generate adaptive recommendations."""
        return generate_adaptive_recommendations(user_profile, current_plan, history)

    def get_exercise_library(self) -> list[dict[str, Any]]:
        """Return the full exercise library."""
        return list(EXERCISES)

    def get_available_muscle_groups(self) -> list[str]:
        return get_all_muscle_groups()

    def get_available_equipment(self) -> list[str]:
        return get_all_equipment()

    def get_available_difficulties(self) -> list[str]:
        return get_all_difficulties()