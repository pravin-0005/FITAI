from datetime import datetime, date
from sqlalchemy import String, Integer, Float, Text, Boolean, ForeignKey, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), default="Default User")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    plans: Mapped[list["WorkoutPlan"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    daily_workouts: Mapped[list["DailyWorkout"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    goals: Mapped[list["FitnessGoal"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), default=1)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), default="intermediate")
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="plans")
    exercises: Mapped[list["Exercise"]] = relationship(back_populates="plan", cascade="all, delete-orphan")

    @property
    def exercise_count(self) -> int:
        return len(self.exercises)


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("workout_plans.id"))
    name: Mapped[str] = mapped_column(String(200))
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    repetitions: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sets: Mapped[int] = mapped_column(Integer, default=3)
    difficulty: Mapped[str] = mapped_column(String(20), default="intermediate")
    rest_seconds: Mapped[int] = mapped_column(Integer, default=60)
    order: Mapped[int] = mapped_column(Integer, default=0)

    plan: Mapped["WorkoutPlan"] = relationship(back_populates="exercises")


class DailyWorkout(Base):
    __tablename__ = "daily_workouts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), default=1)
    plan_id: Mapped[int | None] = mapped_column(ForeignKey("workout_plans.id"), nullable=True)
    date: Mapped[date] = mapped_column(Date, default=date.today)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="daily_workouts")
    logs: Mapped[list["WorkoutLog"]] = relationship(back_populates="daily_workout", cascade="all, delete-orphan")


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    daily_workout_id: Mapped[int] = mapped_column(ForeignKey("daily_workouts.id"))
    exercise_id: Mapped[int | None] = mapped_column(ForeignKey("exercises.id"), nullable=True)
    exercise_name: Mapped[str] = mapped_column(String(200))
    sets_completed: Mapped[int] = mapped_column(Integer, default=0)
    reps_completed: Mapped[int] = mapped_column(Integer, default=0)
    duration_minutes: Mapped[float] = mapped_column(Float, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    daily_workout: Mapped["DailyWorkout"] = relationship(back_populates="logs")


class FitnessGoal(Base):
    __tablename__ = "fitness_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), default=1)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_value: Mapped[float] = mapped_column(Float, default=0)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    achieved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="goals")
