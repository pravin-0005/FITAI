# FITAI — API Contract

Base URL: `http://localhost:8000/api`

---

## Workout Plans

### `POST /workouts/plans`
Create a workout plan.
```json
// Request
{ "name": "Week 1 - Strength", "description": "Upper body focus", "difficulty": "intermediate" }
// Response → 201
{ "id": 1, "name": "...", "description": "...", "difficulty": "intermediate", "created_at": "..." }
```

### `GET /workouts/plans`
List all plans.

### `GET /workouts/plans/{id}`
Get plan with exercises.

### `POST /workouts/plans/{plan_id}/exercises`
Add exercise to plan.
```json
{ "name": "Push-ups", "duration_minutes": 5, "repetitions": 15, "sets": 3, "difficulty": "intermediate" }
```

### `DELETE /workouts/plans/{plan_id}/exercises/{exercise_id}`
Remove exercise.

---

## Daily Workouts

### `POST /workouts/daily`
Log a daily workout session.
```json
{ "plan_id": 1, "notes": "Felt strong today" }
```

### `GET /workouts/daily`
List daily workouts. Optional `?days=7` filter.

### `POST /workouts/daily/{daily_id}/logs`
Log individual exercise completion.
```json
{ "exercise_id": 1, "sets_completed": 3, "reps_completed": 14, "duration_minutes": 5, "notes": "Last set was tough" }
```

### `PUT /workouts/daily/{daily_id}/complete`
Mark daily workout as complete.

---

## Goals

### `POST /goals`
```json
{ "title": "Lose 5kg", "target_value": 5, "unit": "kg", "deadline": "2025-03-01" }
```

### `GET /goals`
### `PUT /goals/{id}`
### `DELETE /goals/{id}`

---

## Progress & Analytics

### `GET /progress/stats`
Aggregated stats: total workouts, streak, weekly frequency, avg duration.

### `GET /progress/weekly`
Last 4 weeks breakdown.

### `GET /progress/exercise-history/{exercise_name}`
Reps/sets trend for a specific exercise.

---

## AI Coach

### `POST /ai/generate-plan`
Generate AI workout plan.
```json
{
  "fitness_goal": "build muscle",
  "fitness_level": "intermediate",
  "available_days": 4,
  "workout_duration_minutes": 45,
  "equipment": ["dumbbells", "pull-up bar"]
}
```

### `POST /ai/insights`
Analyze recent workout history, return insights.

### `POST /ai/adjust-plan/{plan_id}`
Recommend adjustments to an existing plan based on logged performance.
