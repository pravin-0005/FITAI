from datetime import date as _date, datetime
from pydantic import BaseModel, Field


# --- Workout Plan ---

class ExerciseCreate(BaseModel):
    name: str
    duration_minutes: int | None = None
    repetitions: int | None = None
    sets: int = 3
    difficulty: str = "intermediate"
    rest_seconds: int = 60

class ExerciseOut(ExerciseCreate):
    id: int
    order: int = 0
    model_config = {"from_attributes": True}

class PlanCreate(BaseModel):
    name: str
    description: str | None = None
    difficulty: str = "intermediate"

class PlanOut(BaseModel):
    id: int
    name: str
    description: str | None
    difficulty: str
    is_ai_generated: bool
    created_at: datetime
    exercises: list[ExerciseOut] = []
    model_config = {"from_attributes": True}

class PlanListOut(BaseModel):
    id: int
    name: str
    difficulty: str
    is_ai_generated: bool
    exercise_count: int = 0
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Daily Workout ---

class DailyWorkoutCreate(BaseModel):
    plan_id: int | None = None
    date: _date = Field(default_factory=_date.today)
    notes: str | None = None

class WorkoutLogCreate(BaseModel):
    exercise_id: int | None = None
    exercise_name: str
    sets_completed: int = 0
    reps_completed: int = 0
    duration_minutes: float = 0
    notes: str | None = None

class WorkoutLogOut(WorkoutLogCreate):
    id: int
    model_config = {"from_attributes": True}

class DailyWorkoutOut(BaseModel):
    id: int
    plan_id: int | None
    date: _date
    completed: bool
    duration_minutes: int | None
    notes: str | None
    created_at: datetime
    logs: list[WorkoutLogOut] = []
    model_config = {"from_attributes": True}


# --- Goals ---

class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    target_value: float | None = None
    current_value: float = 0
    unit: str | None = None
    deadline: _date | None = None

class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    target_value: float | None = None
    current_value: float | None = None
    unit: str | None = None
    deadline: _date | None = None
    achieved: bool | None = None

class GoalOut(BaseModel):
    id: int
    title: str
    description: str | None
    target_value: float | None
    current_value: float
    unit: str | None
    deadline: _date | None
    achieved: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Progress ---

class ProgressStats(BaseModel):
    total_workouts: int
    completed_workouts: int
    current_streak: int
    longest_streak: int
    avg_duration_minutes: float
    total_exercises_logged: int
    this_week_workouts: int

class WeeklyBreakdown(BaseModel):
    week_start: _date
    workouts: int
    total_duration: int
    exercises_logged: int

class ExerciseHistoryPoint(BaseModel):
    date: _date
    sets: int
    reps: int
    duration: float


# --- AI ---

class AIGeneratePlanRequest(BaseModel):
    fitness_goal: str
    fitness_level: str = "intermediate"
    available_days: int = 4
    workout_duration_minutes: int = 45
    equipment: list[str] = []

class AIExercise(BaseModel):
    name: str
    sets: int
    repetitions: int | None = None
    duration_minutes: int | None = None
    rest_seconds: int = 60
    difficulty: str = "intermediate"

class AIDayPlan(BaseModel):
    day: str
    focus: str
    exercises: list[AIExercise]

class AIGeneratedPlan(BaseModel):
    plan_name: str
    description: str
    difficulty: str
    days: list[AIDayPlan]
    tips: list[str] = []

class AIInsight(BaseModel):
    category: str
    finding: str
    recommendation: str

class AIInsightsResponse(BaseModel):
    summary: str
    insights: list[AIInsight]
    overall_score: int = Field(ge=1, le=10)

class AIAdjustment(BaseModel):
    exercise_name: str
    current: str
    suggested: str
    reason: str

class AIAdjustResponse(BaseModel):
    summary: str
    adjustments: list[AIAdjustment]
