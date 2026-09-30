"""Seed the database with sample data for demo purposes."""
from datetime import date, timedelta
from database import SessionLocal, engine, Base
from models import User, WorkoutPlan, Exercise, DailyWorkout, WorkoutLog, FitnessGoal

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clear existing
for model in [WorkoutLog, DailyWorkout, Exercise, WorkoutPlan, FitnessGoal, User]:
    db.query(model).delete()
db.commit()

# User
user = User(id=1, name="Demo User")
db.add(user)
db.commit()

# Plan with exercises
plan = WorkoutPlan(id=1, user_id=1, name="Beginner Full Body", description="3-day beginner plan", difficulty="beginner")
db.add(plan)
db.commit()

exercises = [
    Exercise(plan_id=1, name="Push-ups", sets=3, repetitions=10, rest_seconds=60, difficulty="beginner", order=0),
    Exercise(plan_id=1, name="Squats", sets=3, repetitions=15, rest_seconds=60, difficulty="beginner", order=1),
    Exercise(plan_id=1, name="Plank", sets=3, duration_minutes=1, rest_seconds=45, difficulty="beginner", order=2),
    Exercise(plan_id=1, name="Lunges", sets=3, repetitions=12, rest_seconds=60, difficulty="beginner", order=3),
    Exercise(plan_id=1, name="Jumping Jacks", sets=2, duration_minutes=2, rest_seconds=30, difficulty="beginner", order=4),
]
db.add_all(exercises)
db.commit()

# Daily workouts for last 7 days
today = date.today()
for i in range(7):
    d = today - timedelta(days=i)
    completed = i != 2  # skip one day for realism
    dw = DailyWorkout(user_id=1, plan_id=1, date=d, completed=completed, duration_minutes=35 if completed else None)
    db.add(dw)
    db.commit()
    db.refresh(dw)
    if completed:
        logs = [
            WorkoutLog(daily_workout_id=dw.id, exercise_name="Push-ups", sets_completed=3, reps_completed=10, duration_minutes=5),
            WorkoutLog(daily_workout_id=dw.id, exercise_name="Squats", sets_completed=3, reps_completed=15, duration_minutes=7),
            WorkoutLog(daily_workout_id=dw.id, exercise_name="Plank", sets_completed=3, reps_completed=0, duration_minutes=3),
        ]
        db.add_all(logs)
db.commit()

# Goals
goals = [
    FitnessGoal(user_id=1, title="50 push-ups", description="Do 50 consecutive push-ups", target_value=50, current_value=10, unit="reps"),
    FitnessGoal(user_id=1, title="30-day streak", description="Work out every day for 30 days", target_value=30, current_value=5, unit="days"),
]
db.add_all(goals)
db.commit()

db.close()
print("Seeded: 1 user, 1 plan with 5 exercises, 7 daily workouts (6 completed), 18 logs, 2 goals.")
