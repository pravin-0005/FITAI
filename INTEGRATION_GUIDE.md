"""FITAI AI Service — Integration Guide

## Overview

The FITAI AI service provides backend ML capabilities for an adaptive fitness coach:
- AI workout-plan generation
- Workout-history analysis  
- Progress statistics & tracking
- Adaptive plan recommendations
- AI-generated insights

All output is structured JSON for easy frontend integration.

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React/Vue/etc)        │
├─────────────────────────────────────────┤
│    HTTP API (ai/api.py)                 │
├─────────────────────────────────────────┤
│   FITAI Service (ai/service.py)         │
├─────────────────────────────────────────┤
│ Modules:                                 │
│ • workout_generator.py                   │
│ • history_analyzer.py                    │
│ • progress_stats.py                      │
│ • adaptive_recommender.py                │
│ • insights_generator.py                  │
│ • exercise_library.py                    │
└─────────────────────────────────────────┘
```

## Installation

No external dependencies required — uses Python 3.7+ stdlib only.

```bash
cd "fitness and workout"
python ai/test_fitai.py  # Run tests
```

## API Endpoints

### Health & Metadata

**GET /health**
```json
{"status": "ok", "service": "FITAI AI"}
```

**GET /exercises**
Returns full exercise library (26 exercises with difficulty, equipment, muscle group).

**GET /muscle-groups**
```json
{"muscle_groups": ["core", "full_body", "legs", "pull", "push"]}
```

**GET /equipment**
```json
{"equipment": ["barbell", "bodyweight", "cable", "dumbbell", "kettlebell", "machine"]}
```

**GET /difficulties**
```json
{"difficulties": ["advanced", "beginner", "intermediate"]}
```

**GET /sample-datasets**
```json
{"datasets": ["beginner", "declining", "high_completion", "increasing", "intermediate", "low_completion"]}
```

**GET /sample-users**
```json
{"users": ["advanced", "beginner", "intermediate"]}
```

### Core Endpoints

**POST /generate-plan**
Request:
```json
{
  "user_profile": {
    "goal": "muscle_gain",
    "difficulty": "intermediate",
    "equipment": ["dumbbell", "bodyweight"],
    "days_per_week": 5,
    "duration_weeks": 8,
    "name": "My Plan"
  }
}
```

Response:
```json
{
  "plan_name": "My Plan",
  "goal": "muscle_gain",
  "difficulty": "intermediate",
  "duration_weeks": 8,
  "weekly_schedule": [
    {
      "focus": "push",
      "exercises": [
        {
          "name": "Push-up",
          "sets": 3,
          "reps": 12,
          "rest_seconds": 45,
          "equipment": "bodyweight",
          "muscle_group": "push",
          "instructions": "Keep body straight, lower chest to floor."
        }
      ]
    }
  ],
  "reasoning": "Plan designed for muscle_gain at intermediate level...",
  "safety_notes": ["Warm up for 5-10 minutes before each session."]
}
```

**POST /analyze-history**
Request:
```json
{
  "workouts": [
    {
      "date": "2026-09-30",
      "completed": true,
      "exercises": [
        {"name": "Squat", "sets": 3, "reps": 8, "weight": 100}
      ],
      "duration_minutes": 45
    }
  ]
}
```

Response:
```json
{
  "total_sessions": 30,
  "completed_sessions": 26,
  "completion_rate": 0.867,
  "consistency_score": 0.655,
  "current_streak": 3,
  "longest_streak": 7,
  "volume_trend": "increasing",
  "average_session_duration": 44.2,
  "summary": "User completed 26/30 sessions (86.7%). Consistency over last 30 days: 65.5%. Volume trend: increasing."
}
```

**POST /compute-progress**
Request:
```json
{
  "history": {
    "goal": "muscle_gain",
    "workouts": [...],
    "measurements": [
      {
        "date": "2026-09-30",
        "weight_kg": 80.0,
        "body_fat_pct": 18.5,
        "resting_hr": 60
      }
    ],
    "personal_records": [
      {"exercise": "Squat", "weight": 100, "reps": 5, "date": "2026-09-25"}
    ]
  }
}
```

Response:
```json
{
  "goal": "muscle_gain",
  "total_sessions": 30,
  "completion_rate": 0.867,
  "weekly_volume": [
    {"week": "2026-W39", "volume": 450.5},
    {"week": "2026-W40", "volume": 520.2}
  ],
  "weight_trend": {
    "value": 82.5,
    "trend": "increasing",
    "change": 2.5,
    "first_value": 80.0
  },
  "body_fat_trend": {...},
  "resting_hr_trend": {...},
  "personal_records_count": 3,
  "progress_score": 78,
  "summary": "Progress score: 78/100. Completion rate: 86.7%. Weight trend: increasing (+2.50 kg). Personal records: 3."
}
```

**POST /generate-insights**
Request:
```json
{
  "history": {
    "goal": "muscle_gain",
    "workouts": [...],
    "measurements": [...],
    "personal_records": [...]
  }
}
```

Response:
```json
{
  "insights": [
    {
      "type": "strength",
      "title": "Consistency Champion",
      "description": "You've completed 26/30 workouts — outstanding consistency.",
      "metric": "completion_rate",
      "value": 0.867
    },
    {
      "type": "strength",
      "title": "Rising Volume",
      "description": "Training volume is trending upward — great for strength and muscle gains.",
      "metric": "volume_trend",
      "value": "increasing"
    }
  ],
  "summary": "3 insights generated (2 positive, 0 need attention).",
  "total_insights": 3
}
```

**POST /adapt-plan**
Request:
```json
{
  "user_profile": {...},
  "current_plan": {...},
  "history": {...}
}
```

Response:
```json
{
  "status": "progressing",
  "insights": [
    "Excellent completion rate (86.7%). User is highly committed.",
    "Volume is increasing steadily. Great progress!",
    "On track for muscle_gain goal with increasing weight trend."
  ],
  "recommended_changes": [
    {
      "type": "progression",
      "field": "difficulty",
      "from": "intermediate",
      "to": "advanced",
      "reason": "Consistent volume increase indicates readiness for progression."
    }
  ],
  "reasoning": "Based on 30 sessions, 86.7% completion, and volume trend 'increasing', user is ready to progress.",
  "analysis_snapshot": {
    "completion_rate": 0.867,
    "consistency_score": 0.655,
    "volume_trend": "increasing",
    "current_streak": 3
  }
}
```

### Demo Endpoints (for testing)

**POST /demo/generate-plan**
```json
{"user": "beginner"}
```
Generates a plan for the sample beginner user.

**POST /demo/analyze**
```json
{"dataset": "high_completion"}
```
Analyzes a pre-loaded sample dataset.

**POST /demo/progress**
```json
{"dataset": "increasing"}
```

**POST /demo/insights**
```json
{"dataset": "high_completion"}
```

**POST /demo/adapt**
```json
{"user": "beginner", "dataset": "high_completion"}
```

## Integration Examples

### Example 1: Generate a beginner workout plan

```javascript
const response = await fetch('http://localhost:8000/generate-plan', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    user_profile: {
      goal: 'general_fitness',
      difficulty: 'beginner',
      equipment: ['bodyweight'],
      days_per_week: 3
    }
  })
});
const plan = await response.json();
console.log(plan.weekly_schedule);  // Display to user
```

### Example 2: Log a workout and get adaptive recommendations

```javascript
// User completes a workout
const workouts = [
  {date: '2026-09-30', completed: true, exercises: [...], duration_minutes: 45},
  // ... more workouts
];

// Analyze history
const historyRes = await fetch('http://localhost:8000/analyze-history', {
  method: 'POST',
  body: JSON.stringify({workouts})
});
const analysis = await historyRes.json();

// Get recommendations
const recRes = await fetch('http://localhost:8000/adapt-plan', {
  method: 'POST',
  body: JSON.stringify({
    user_profile: userProfile,
    current_plan: currentPlan,
    history: {workouts, measurements: [...], personal_records: [...]}
  })
});
const recommendations = await recRes.json();

if (recommendations.status === 'progressing') {
  showMessage('Ready to increase difficulty!');
} else if (recommendations.status === 'needs_adjustment') {
  showMessage('Consider reducing intensity or frequency.');
}
```

### Example 3: Display progress insights

```javascript
const insightsRes = await fetch('http://localhost:8000/generate-insights', {
  method: 'POST',
  body: JSON.stringify({history})
});
const {insights} = await insightsRes.json();

insights.forEach(insight => {
  const icon = insight.type === 'strength' ? '✅' : '⚠️';
  console.log(`${icon} ${insight.title}: ${insight.description}`);
});
```

## Data Structures

### User Profile

```python
{
    "goal": "general_fitness | weight_loss | muscle_gain | strength | endurance | flexibility",
    "difficulty": "beginner | intermediate | advanced",
    "equipment": ["bodyweight", "dumbbell", "barbell", "cable", "kettlebell", "machine"],
    "days_per_week": int (optional, defaults by goal),
    "duration_weeks": int (optional, default 4),
    "name": str (optional),
    "age": int (optional),
    "weight_kg": float (optional)
}
```

### Workout Log Entry

```python
{
    "date": "ISO8601 string or datetime",
    "completed": bool,
    "exercises": [
        {
            "name": str,
            "sets": int,
            "reps": int,
            "weight": float (optional),
            "duration_minutes": int (optional)
        }
    ],
    "notes": str (optional),
    "duration_minutes": int (optional)
}
```

### Measurement Entry

```python
{
    "date": "ISO8601 string",
    "weight_kg": float (optional),
    "body_fat_pct": float (optional),
    "resting_hr": int (optional),
    "other_metric": value (any custom metric)
}
```

### Personal Record Entry

```python
{
    "exercise": str,
    "weight": float,
    "reps": int,
    "date": "ISO8601 string"
}
```

## Testing

Run all 12 test cases:
```bash
python ai/test_fitai.py
```

Test cases validate:
- Beginner, intermediate, and advanced plan generation
- High and low completion analysis
- Increasing and declining performance detection
- Adaptive recommendations with status classification
- Insights generation
- JSON serialization

## Performance Notes

- All computations are deterministic and fast (<100ms per request)
- No external API calls or network dependencies
- Memory usage is minimal (exercise library is static)
- Suitable for real-time recommendations

## Assumptions & Limitations

1. **No ML model training** — All recommendations are rule-based using heuristics
2. **No personalization persistence** — Each request is independent
3. **Simple volume metric** — sets × reps × weight (no advanced biomechanics)
4. **Date parsing** — Accepts ISO8601 strings or datetime objects
5. **No authentication** — Intended for trusted frontend only
6. **Hardcoded exercise library** — 26 exercises covering major muscle groups

## Future Enhancements

1. Add real ML model training on historical user data
2. Implement user preferences and history caching
3. Add nutrition recommendations based on goals
4. Integrate wearable device data (heart rate, sleep, steps)
5. Support for injury history and modifications
6. Social features (friend comparison, challenges)
7. Predictive modeling for injury risk

## Support

For bugs or enhancements, add test cases to `ai/test_fitai.py` and run the full suite.
