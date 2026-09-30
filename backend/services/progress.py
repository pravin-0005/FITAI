from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import DailyWorkout, WorkoutLog
from schemas import ProgressStats, WeeklyBreakdown, ExerciseHistoryPoint


def get_stats(db: Session, user_id: int = 1) -> ProgressStats:
    workouts = db.query(DailyWorkout).filter(DailyWorkout.user_id == user_id).order_by(DailyWorkout.date.desc()).all()

    total = len(workouts)
    completed = sum(1 for w in workouts if w.completed)

    # Streak calc
    current_streak = 0
    longest_streak = 0
    streak = 0
    today = date.today()
    completed_dates = sorted({w.date for w in workouts if w.completed}, reverse=True)
    check = today
    for d in completed_dates:
        if d == check or d == check - timedelta(days=1):
            streak += 1
            check = d - timedelta(days=1)
        else:
            if current_streak == 0:
                current_streak = streak
            longest_streak = max(longest_streak, streak)
            streak = 1
            check = d - timedelta(days=1)
    if current_streak == 0:
        current_streak = streak
    longest_streak = max(longest_streak, streak)

    durations = [w.duration_minutes for w in workouts if w.duration_minutes]
    avg_dur = sum(durations) / len(durations) if durations else 0

    total_logs = db.query(func.count(WorkoutLog.id)).scalar() or 0

    week_start = today - timedelta(days=today.weekday())
    this_week = sum(1 for w in workouts if w.completed and w.date >= week_start)

    return ProgressStats(
        total_workouts=total,
        completed_workouts=completed,
        current_streak=current_streak,
        longest_streak=longest_streak,
        avg_duration_minutes=round(avg_dur, 1),
        total_exercises_logged=total_logs,
        this_week_workouts=this_week,
    )


def get_weekly_breakdown(db: Session, user_id: int = 1, weeks: int = 4) -> list[WeeklyBreakdown]:
    today = date.today()
    result = []
    for i in range(weeks):
        end = today - timedelta(weeks=i)
        start = end - timedelta(days=end.weekday())
        end = start + timedelta(days=6)

        workouts = db.query(DailyWorkout).filter(
            DailyWorkout.user_id == user_id,
            DailyWorkout.date >= start,
            DailyWorkout.date <= end,
            DailyWorkout.completed == True,
        ).all()

        dur = sum(w.duration_minutes or 0 for w in workouts)
        logs = sum(len(w.logs) for w in workouts)

        result.append(WeeklyBreakdown(
            week_start=start,
            workouts=len(workouts),
            total_duration=dur,
            exercises_logged=logs,
        ))
    return result


def get_exercise_history(db: Session, exercise_name: str, user_id: int = 1) -> list[ExerciseHistoryPoint]:
    logs = (
        db.query(WorkoutLog, DailyWorkout.date)
        .join(DailyWorkout)
        .filter(
            DailyWorkout.user_id == user_id,
            WorkoutLog.exercise_name.ilike(f"%{exercise_name}%"),
        )
        .order_by(DailyWorkout.date)
        .all()
    )
    return [
        ExerciseHistoryPoint(date=d, sets=log.sets_completed, reps=log.reps_completed, duration=log.duration_minutes)
        for log, d in logs
    ]
