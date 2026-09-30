from sqlalchemy.orm import Session
from models import WorkoutPlan, Exercise, DailyWorkout, WorkoutLog
from schemas import PlanCreate, ExerciseCreate, DailyWorkoutCreate, WorkoutLogCreate


def create_plan(db: Session, data: PlanCreate, user_id: int = 1) -> WorkoutPlan:
    plan = WorkoutPlan(user_id=user_id, **data.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def get_plans(db: Session, user_id: int = 1) -> list[WorkoutPlan]:
    return db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).order_by(WorkoutPlan.created_at.desc()).all()


def get_plan(db: Session, plan_id: int) -> WorkoutPlan | None:
    return db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()


def add_exercise(db: Session, plan_id: int, data: ExerciseCreate) -> Exercise:
    max_order = db.query(Exercise.order).filter(Exercise.plan_id == plan_id).order_by(Exercise.order.desc()).first()
    order = (max_order[0] + 1) if max_order else 0
    ex = Exercise(plan_id=plan_id, order=order, **data.model_dump())
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex


def delete_exercise(db: Session, plan_id: int, exercise_id: int) -> bool:
    ex = db.query(Exercise).filter(Exercise.id == exercise_id, Exercise.plan_id == plan_id).first()
    if not ex:
        return False
    db.delete(ex)
    db.commit()
    return True


def create_daily_workout(db: Session, data: DailyWorkoutCreate, user_id: int = 1) -> DailyWorkout:
    dw = DailyWorkout(user_id=user_id, **data.model_dump())
    db.add(dw)
    db.commit()
    db.refresh(dw)
    return dw


def get_daily_workouts(db: Session, user_id: int = 1, days: int | None = None) -> list[DailyWorkout]:
    q = db.query(DailyWorkout).filter(DailyWorkout.user_id == user_id)
    if days:
        from datetime import date, timedelta
        cutoff = date.today() - timedelta(days=days)
        q = q.filter(DailyWorkout.date >= cutoff)
    return q.order_by(DailyWorkout.date.desc()).all()


def add_workout_log(db: Session, daily_id: int, data: WorkoutLogCreate) -> WorkoutLog:
    log = WorkoutLog(daily_workout_id=daily_id, **data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def complete_daily_workout(db: Session, daily_id: int) -> DailyWorkout | None:
    dw = db.query(DailyWorkout).filter(DailyWorkout.id == daily_id).first()
    if not dw:
        return None
    total = sum(log.duration_minutes for log in dw.logs)
    dw.completed = True
    dw.duration_minutes = int(total) if total else None
    db.commit()
    db.refresh(dw)
    return dw
