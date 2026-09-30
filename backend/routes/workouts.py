from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import (
    PlanCreate, PlanOut, PlanListOut, ExerciseCreate, ExerciseOut,
    DailyWorkoutCreate, DailyWorkoutOut, WorkoutLogCreate, WorkoutLogOut,
)
from services import workout as svc

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


# --- Plans ---
@router.post("/plans", response_model=PlanOut, status_code=201)
def create_plan(data: PlanCreate, db: Session = Depends(get_db)):
    return svc.create_plan(db, data)


@router.get("/plans", response_model=list[PlanListOut])
def list_plans(db: Session = Depends(get_db)):
    return svc.get_plans(db)


@router.get("/plans/{plan_id}", response_model=PlanOut)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = svc.get_plan(db, plan_id)
    if not plan:
        raise HTTPException(404, "Plan not found")
    return plan


# --- Exercises ---
@router.post("/plans/{plan_id}/exercises", response_model=ExerciseOut, status_code=201)
def add_exercise(plan_id: int, data: ExerciseCreate, db: Session = Depends(get_db)):
    if not svc.get_plan(db, plan_id):
        raise HTTPException(404, "Plan not found")
    return svc.add_exercise(db, plan_id, data)


@router.delete("/plans/{plan_id}/exercises/{exercise_id}", status_code=204)
def delete_exercise(plan_id: int, exercise_id: int, db: Session = Depends(get_db)):
    if not svc.delete_exercise(db, plan_id, exercise_id):
        raise HTTPException(404, "Exercise not found")


# --- Daily Workouts ---
@router.post("/daily", response_model=DailyWorkoutOut, status_code=201)
def create_daily(data: DailyWorkoutCreate, db: Session = Depends(get_db)):
    return svc.create_daily_workout(db, data)


@router.get("/daily", response_model=list[DailyWorkoutOut])
def list_daily(days: int | None = None, db: Session = Depends(get_db)):
    return svc.get_daily_workouts(db, days=days)


# --- Workout Logs ---
@router.post("/daily/{daily_id}/logs", response_model=WorkoutLogOut, status_code=201)
def add_log(daily_id: int, data: WorkoutLogCreate, db: Session = Depends(get_db)):
    return svc.add_workout_log(db, daily_id, data)


@router.post("/daily/{daily_id}/complete", response_model=DailyWorkoutOut)
def complete_daily(daily_id: int, db: Session = Depends(get_db)):
    dw = svc.complete_daily_workout(db, daily_id)
    if not dw:
        raise HTTPException(404, "Daily workout not found")
    return dw
