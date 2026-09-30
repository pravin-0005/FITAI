# FITAI — Architecture

## Stack
- **Backend**: FastAPI (Python 3.11+)
- **Database**: SQLite via SQLAlchemy (zero setup)
- **AI**: Google Gemini API (structured JSON output)
- **Frontend**: React (separate repo concern)

## Structure
```
backend/
├── main.py              # FastAPI app, startup, CORS
├── database.py          # SQLAlchemy engine + session
├── models.py            # All ORM models
├── schemas.py           # Pydantic request/response schemas
├── seed.py              # Sample data seeder
├── services/
│   ├── workout.py       # Workout plan + daily log CRUD
│   ├── goal.py          # Fitness goal CRUD
│   ├── progress.py      # Stats aggregation + analytics
│   └── ai.py            # LLM-powered coach (plan gen, insights, adjustments)
└── routes/
    ├── workouts.py       # /api/workouts/*
    ├── goals.py          # /api/goals/*
    ├── progress.py       # /api/progress/*
    └── ai.py             # /api/ai/*
```

## Data Model
```
User (1) ──┬── (*) WorkoutPlan ──── (*) Exercise
            ├── (*) DailyWorkout ── (*) WorkoutLog
            ├── (*) FitnessGoal
            └── (derived) ProgressStats
```

## Key Decisions
- Single SQLite file — no DB server, instant startup
- No auth — single default user (hackathon MVP)
- AI calls are synchronous — keeps code simple
- All AI responses use structured JSON schema prompts
- No migrations tool — tables auto-created on startup
