import json
import os
import sys
from pathlib import Path
from sqlalchemy.orm import Session
from models import DailyWorkout, WorkoutPlan
from schemas import (
    AIGeneratePlanRequest, AIGeneratedPlan, AIInsightsResponse, AIAdjustResponse,
)

# Ensure 'ai' module can be imported from project root
_project_root = Path(__file__).resolve().parent.parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from ai.workout_generator import generate_workout_plan as rule_generate_plan
from ai.insights_generator import generate_insights as rule_generate_insights
from ai.adaptive_recommender import generate_adaptive_recommendations as rule_adapt_plan
from ai.progress_stats import compute_progress_stats

_configured = False


def _ensure_configured():
    global _configured
    if not _configured:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set.")
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        _configured = True


def _call_gemini(prompt: str) -> str:
    _ensure_configured()
    import google.generativeai as genai
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text


def _extract_json(text: str) -> dict:
    """Extract JSON from Gemini response (may be wrapped in ```json ... ```)."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)
    return json.loads(text)


def _generate_plan_fallback(req: AIGeneratePlanRequest) -> AIGeneratedPlan:
    profile = {
        "goal": req.fitness_goal,
        "difficulty": req.fitness_level,
        "equipment": req.equipment,
        "days_per_week": req.available_days,
        "duration_weeks": 4,
    }
    raw_plan = rule_generate_plan(profile)

    days = []
    for idx, block in enumerate(raw_plan.get("weekly_schedule", [])):
        ex_list = []
        for ex in block.get("exercises", []):
            ex_list.append({
                "name": ex.get("name", "Exercise"),
                "sets": ex.get("sets", 3),
                "repetitions": ex.get("reps", 10),
                "duration_minutes": None,
                "rest_seconds": ex.get("rest_seconds", 60),
                "difficulty": req.fitness_level,
            })
        days.append({
            "day": f"Day {idx + 1} - {block.get('focus', 'Workout').replace('_', ' ').title()}",
            "focus": block.get("focus", "General"),
            "exercises": ex_list,
        })

    return AIGeneratedPlan(
        plan_name=raw_plan.get("plan_name", "AI Workout Plan"),
        description=raw_plan.get("reasoning", "Personalized workout plan."),
        difficulty=raw_plan.get("difficulty", req.fitness_level),
        days=days,
        tips=raw_plan.get("safety_notes", []),
    )


def _generate_insights_fallback(db: Session, user_id: int = 1) -> AIInsightsResponse:
    workouts = (
        db.query(DailyWorkout)
        .filter(DailyWorkout.user_id == user_id)
        .order_by(DailyWorkout.date.desc())
        .limit(14)
        .all()
    )

    if not workouts:
        return AIInsightsResponse(
            summary="No workout data yet. Start logging workouts to get AI insights!",
            insights=[],
            overall_score=1,
        )

    history_workouts = []
    for w in workouts:
        exercises = [
            {"name": l.exercise_name, "sets": l.sets_completed, "reps": l.reps_completed, "duration": l.duration_minutes}
            for l in w.logs
        ]
        history_workouts.append({
            "date": str(w.date),
            "completed": w.completed,
            "duration_minutes": w.duration_minutes or 0,
            "exercises": exercises,
        })

    history = {
        "workouts": history_workouts,
        "measurements": [],
        "personal_records": [],
        "goal": "general_fitness",
    }

    res = rule_generate_insights(history)
    stats = compute_progress_stats(history)

    mapped_insights = []
    category_map = {
        "strength": "consistency",
        "warning": "volume",
        "info": "variety",
        "neutral": "consistency",
    }
    for item in res.get("insights", []):
        cat = category_map.get(item.get("type"), "consistency")
        mapped_insights.append({
            "category": cat,
            "finding": item.get("title", "Insight"),
            "recommendation": item.get("description", ""),
        })

    score = max(1, min(10, int(stats.get("progress_score", 50) / 10)))

    return AIInsightsResponse(
        summary=res.get("summary", "Analysis completed."),
        insights=mapped_insights,
        overall_score=score,
    )


def _adjust_plan_fallback(db: Session, plan_id: int, user_id: int = 1) -> AIAdjustResponse:
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise ValueError(f"Plan {plan_id} not found")

    profile = {"goal": "general_fitness", "difficulty": plan.difficulty}
    current_plan = {
        "name": plan.name,
        "difficulty": plan.difficulty,
        "exercises": [e.name for e in plan.exercises],
    }

    recent = (
        db.query(DailyWorkout)
        .filter(DailyWorkout.user_id == user_id, DailyWorkout.plan_id == plan_id)
        .order_by(DailyWorkout.date.desc())
        .limit(14)
        .all()
    )

    history_workouts = []
    for w in recent:
        exercises = [
            {"name": l.exercise_name, "sets": l.sets_completed, "reps": l.reps_completed, "weight": 0}
            for l in w.logs
        ]
        history_workouts.append({
            "date": str(w.date),
            "completed": w.completed,
            "exercises": exercises,
        })

    history = {"workouts": history_workouts, "goal": "general_fitness"}

    recs = rule_adapt_plan(profile, current_plan, history)

    adjustments = []
    for change in recs.get("recommended_changes", []):
        field = change.get("field", "intensity")
        from_val = str(change.get("from", "current"))
        to_val = str(change.get("to", "recommended"))
        adjustments.append({
            "exercise_name": f"Plan {field.title()}",
            "current": from_val,
            "suggested": to_val,
            "reason": change.get("reason", "Based on performance logs"),
        })

    if not adjustments:
        adjustments.append({
            "exercise_name": "Overall Workouts",
            "current": "Current Routine",
            "suggested": "Maintain Routine",
            "reason": recs.get("reasoning", "User is on track with current plan."),
        })

    return AIAdjustResponse(
        summary=recs.get("reasoning", "Plan adjustment summary."),
        adjustments=adjustments,
    )


def generate_plan(req: AIGeneratePlanRequest) -> AIGeneratedPlan:
    if not os.getenv("GEMINI_API_KEY"):
        return _generate_plan_fallback(req)

    try:
        equipment_str = ", ".join(req.equipment) if req.equipment else "bodyweight only"
        prompt = f"""You are a certified fitness coach. Generate a personalized workout plan as JSON.

User profile:
- Fitness goal: {req.fitness_goal}
- Fitness level: {req.fitness_level}
- Available days per week: {req.available_days}
- Workout duration: {req.workout_duration_minutes} minutes per session
- Equipment: {equipment_str}

Return ONLY valid JSON matching this exact schema (no extra text):
{{
  "plan_name": "string",
  "description": "string",
  "difficulty": "{req.fitness_level}",
  "days": [
    {{
      "day": "Day 1 - Monday",
      "focus": "e.g. Upper Body Push",
      "exercises": [
        {{
          "name": "Exercise Name",
          "sets": 3,
          "repetitions": 12,
          "duration_minutes": null,
          "rest_seconds": 60,
          "difficulty": "{req.fitness_level}"
        }}
      ]
    }}
  ],
  "tips": ["tip1", "tip2"]
}}

For cardio exercises, use duration_minutes instead of repetitions.
Include {req.available_days} days. Each session should total ~{req.workout_duration_minutes} minutes.
Use only the available equipment: {equipment_str}.
"""
        raw = _call_gemini(prompt)
        data = _extract_json(raw)
        return AIGeneratedPlan(**data)
    except Exception:
        return _generate_plan_fallback(req)


def generate_insights(db: Session, user_id: int = 1) -> AIInsightsResponse:
    if not os.getenv("GEMINI_API_KEY"):
        return _generate_insights_fallback(db, user_id)

    try:
        workouts = (
            db.query(DailyWorkout)
            .filter(DailyWorkout.user_id == user_id)
            .order_by(DailyWorkout.date.desc())
            .limit(14)
            .all()
        )

        if not workouts:
            return AIInsightsResponse(
                summary="No workout data yet. Start logging workouts to get AI insights!",
                insights=[],
                overall_score=1,
            )

        history = []
        for w in workouts:
            exercises = [
                {"name": l.exercise_name, "sets": l.sets_completed, "reps": l.reps_completed, "duration": l.duration_minutes}
                for l in w.logs
            ]
            history.append({
                "date": str(w.date),
                "completed": w.completed,
                "duration_minutes": w.duration_minutes,
                "exercises": exercises,
            })

        prompt = f"""You are a fitness analytics coach. Analyze this workout history and provide insights.

Workout history (last 14 sessions):
{json.dumps(history, indent=2)}

Return ONLY valid JSON matching this schema:
{{
  "summary": "2-3 sentence overview of the user's recent fitness activity",
  "insights": [
    {{
      "category": "one of: consistency, strength, volume, recovery, variety",
      "finding": "specific observation about a pattern",
      "recommendation": "actionable suggestion"
    }}
  ],
  "overall_score": 7
}}

Provide 3-5 insights. Score 1-10 based on consistency, volume, and progression.
"""
        raw = _call_gemini(prompt)
        data = _extract_json(raw)
        return AIInsightsResponse(**data)
    except Exception:
        return _generate_insights_fallback(db, user_id)


def adjust_plan(db: Session, plan_id: int, user_id: int = 1) -> AIAdjustResponse:
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise ValueError(f"Plan {plan_id} not found")

    if not os.getenv("GEMINI_API_KEY"):
        return _adjust_plan_fallback(db, plan_id, user_id)

    try:
        plan_data = {
            "name": plan.name,
            "exercises": [
                {"name": e.name, "sets": e.sets, "reps": e.repetitions, "duration": e.duration_minutes}
                for e in plan.exercises
            ],
        }

        recent = (
            db.query(DailyWorkout)
            .filter(DailyWorkout.user_id == user_id, DailyWorkout.plan_id == plan_id, DailyWorkout.completed == True)
            .order_by(DailyWorkout.date.desc())
            .limit(7)
            .all()
        )

        log_data = []
        for w in recent:
            for l in w.logs:
                log_data.append({
                    "date": str(w.date),
                    "exercise": l.exercise_name,
                    "sets_done": l.sets_completed,
                    "reps_done": l.reps_completed,
                    "duration": l.duration_minutes,
                })

        prompt = f"""You are a fitness coach reviewing a user's performance vs their plan.

Current plan:
{json.dumps(plan_data, indent=2)}

Recent performance logs:
{json.dumps(log_data, indent=2) if log_data else "No logs yet — suggest initial adjustments based on the plan difficulty."}

Analyze whether the user is meeting, exceeding, or struggling with each exercise.
Recommend adjustments (increase/decrease sets, reps, weight, or difficulty).

Return ONLY valid JSON:
{{
  "summary": "overview of recommended changes",
  "adjustments": [
    {{
      "exercise_name": "Push-ups",
      "current": "3 sets x 12 reps",
      "suggested": "4 sets x 15 reps",
      "reason": "User consistently completes all sets with notes indicating ease"
    }}
  ]
}}
"""
        raw = _call_gemini(prompt)
        data = _extract_json(raw)
        return AIAdjustResponse(**data)
    except Exception:
        return _adjust_plan_fallback(db, plan_id, user_id)
