from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import ProgressStats, WeeklyBreakdown, ExerciseHistoryPoint
from services import progress as svc

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/stats", response_model=ProgressStats)
def stats(db: Session = Depends(get_db)):
    return svc.get_stats(db)


@router.get("/weekly", response_model=list[WeeklyBreakdown])
def weekly(weeks: int = 4, db: Session = Depends(get_db)):
    return svc.get_weekly_breakdown(db, weeks=weeks)


@router.get("/exercise/{exercise_name}", response_model=list[ExerciseHistoryPoint])
def exercise_history(exercise_name: str, db: Session = Depends(get_db)):
    return svc.get_exercise_history(db, exercise_name)
