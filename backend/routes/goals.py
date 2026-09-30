from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import GoalCreate, GoalUpdate, GoalOut
from services import goal as svc

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.post("", response_model=GoalOut, status_code=201)
def create_goal(data: GoalCreate, db: Session = Depends(get_db)):
    return svc.create_goal(db, data)


@router.get("", response_model=list[GoalOut])
def list_goals(db: Session = Depends(get_db)):
    return svc.get_goals(db)


@router.patch("/{goal_id}", response_model=GoalOut)
def update_goal(goal_id: int, data: GoalUpdate, db: Session = Depends(get_db)):
    goal = svc.update_goal(db, goal_id, data)
    if not goal:
        raise HTTPException(404, "Goal not found")
    return goal


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    if not svc.delete_goal(db, goal_id):
        raise HTTPException(404, "Goal not found")
