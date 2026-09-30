from sqlalchemy.orm import Session
from models import FitnessGoal
from schemas import GoalCreate, GoalUpdate


def create_goal(db: Session, data: GoalCreate, user_id: int = 1) -> FitnessGoal:
    goal = FitnessGoal(user_id=user_id, **data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_goals(db: Session, user_id: int = 1) -> list[FitnessGoal]:
    return db.query(FitnessGoal).filter(FitnessGoal.user_id == user_id).order_by(FitnessGoal.created_at.desc()).all()


def update_goal(db: Session, goal_id: int, data: GoalUpdate) -> FitnessGoal | None:
    goal = db.query(FitnessGoal).filter(FitnessGoal.id == goal_id).first()
    if not goal:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(goal, k, v)
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, goal_id: int) -> bool:
    goal = db.query(FitnessGoal).filter(FitnessGoal.id == goal_id).first()
    if not goal:
        return False
    db.delete(goal)
    db.commit()
    return True
