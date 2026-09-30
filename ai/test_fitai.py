"""Tests for FITAI AI service."""
import json
import sys
import os

# Add parent directory to path so we can import 'ai' package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.service import FITAI
from ai.workout_generator import generate_workout_plan
from ai.history_analyzer import analyze_workout_history
from ai.progress_stats import compute_progress_stats
from ai.adaptive_recommender import generate_adaptive_recommendations
from ai.insights_generator import generate_insights
from ai.sample_dataset import (
    BEGINNER_USER,
    INTERMEDIATE_USER,
    ADVANCED_USER,
    HIGH_COMPLETION_HISTORY,
    LOW_COMPLETION_HISTORY,
    INCREASING_HISTORY,
    DECLINING_HISTORY,
    BEGINNER_HISTORY,
    INTERMEDIATE_HISTORY,
)


def assert_keys(d, required, label=""):
    missing = [k for k in required if k not in d]
    assert not missing, f"{label} missing keys: {missing}"


def test_generate_plan_beginner():
    plan = generate_workout_plan(BEGINNER_USER)
    assert_keys(plan, ["plan_name", "goal", "difficulty", "weekly_schedule", "reasoning", "safety_notes"], "plan")
    assert plan["goal"] == "general_fitness"
    assert plan["difficulty"] == "beginner"
    assert len(plan["weekly_schedule"]) == 3
    for block in plan["weekly_schedule"]:
        assert "focus" in block
        assert "exercises" in block
        assert len(block["exercises"]) > 0
    print("PASS: test_generate_plan_beginner")


def test_generate_plan_intermediate():
    plan = generate_workout_plan(INTERMEDIATE_USER)
    assert plan["difficulty"] == "intermediate"
    assert len(plan["weekly_schedule"]) == 5
    print("PASS: test_generate_plan_intermediate")


def test_generate_plan_advanced():
    plan = generate_workout_plan(ADVANCED_USER)
    assert plan["difficulty"] == "advanced"
    print("PASS: test_generate_plan_advanced")


def test_analyze_high_completion():
    analysis = analyze_workout_history(HIGH_COMPLETION_HISTORY["workouts"])
    assert analysis["total_sessions"] == 30
    assert analysis["completion_rate"] >= 0.8
    assert analysis["volume_trend"] == "increasing"
    print("PASS: test_analyze_high_completion")


def test_analyze_low_completion():
    analysis = analyze_workout_history(LOW_COMPLETION_HISTORY["workouts"])
    assert analysis["total_sessions"] == 30
    assert analysis["completion_rate"] <= 0.4
    print("PASS: test_analyze_low_completion")


def test_progress_stats_increasing():
    stats = compute_progress_stats(INCREASING_HISTORY)
    assert stats["weight_trend"]["trend"] == "increasing"
    assert stats["progress_score"] > 50
    print("PASS: test_progress_stats_increasing")


def test_progress_stats_declining():
    stats = compute_progress_stats(DECLINING_HISTORY)
    assert stats["weight_trend"]["trend"] == "decreasing"
    print("PASS: test_progress_stats_declining")


def test_adaptive_high_completion():
    plan = generate_workout_plan(BEGINNER_USER)
    recs = generate_adaptive_recommendations(BEGINNER_USER, plan, HIGH_COMPLETION_HISTORY)
    assert_keys(recs, ["status", "insights", "recommended_changes", "reasoning"], "recs")
    assert recs["status"] in ("on_track", "progressing", "needs_adjustment")
    print(f"PASS: test_adaptive_high_completion (status={recs['status']})")


def test_adaptive_low_completion():
    plan = generate_workout_plan(BEGINNER_USER)
    recs = generate_adaptive_recommendations(BEGINNER_USER, plan, LOW_COMPLETION_HISTORY)
    assert recs["status"] == "needs_adjustment"
    assert len(recs["recommended_changes"]) > 0
    print("PASS: test_adaptive_low_completion")


def test_insights_generation():
    insights = generate_insights(HIGH_COMPLETION_HISTORY)
    assert_keys(insights, ["insights", "summary", "total_insights"], "insights")
    assert insights["total_insights"] > 0
    print("PASS: test_insights_generation")


def test_fitai_service():
    ai = FITAI()
    plan = ai.generate_plan(BEGINNER_USER)
    assert "weekly_schedule" in plan
    analysis = ai.analyze_history(HIGH_COMPLETION_HISTORY["workouts"])
    assert analysis["total_sessions"] > 0
    progress = ai.compute_progress(HIGH_COMPLETION_HISTORY)
    assert "progress_score" in progress
    recs = ai.adapt_plan(BEGINNER_USER, plan, HIGH_COMPLETION_HISTORY)
    assert "status" in recs
    print("PASS: test_fitai_service")


def test_output_is_json_serializable():
    """Ensure all outputs are JSON-serializable."""
    plan = generate_workout_plan(INTERMEDIATE_USER)
    json.dumps(plan)
    analysis = analyze_workout_history(INCREASING_HISTORY["workouts"])
    json.dumps(analysis)
    progress = compute_progress_stats(INCREASING_HISTORY)
    json.dumps(progress)
    recs = generate_adaptive_recommendations(INTERMEDIATE_USER, plan, INCREASING_HISTORY)
    json.dumps(recs)
    insights = generate_insights(INCREASING_HISTORY)
    json.dumps(insights)
    print("PASS: test_output_is_json_serializable")


def run_all():
    tests = [
        test_generate_plan_beginner,
        test_generate_plan_intermediate,
        test_generate_plan_advanced,
        test_analyze_high_completion,
        test_analyze_low_completion,
        test_progress_stats_increasing,
        test_progress_stats_declining,
        test_adaptive_high_completion,
        test_adaptive_low_completion,
        test_insights_generation,
        test_fitai_service,
        test_output_is_json_serializable,
    ]
    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            passed += 1
        except Exception as e:
            print(f"FAIL: {t.__name__}: {e}")
            failed += 1
    print(f"\n{'='*50}")
    print(f"Results: {passed} passed, {failed} failed")
    return failed == 0


if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)
