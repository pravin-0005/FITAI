# FITAI — Adaptive Fitness & Workout Coach

## 1. Project Overview

**FITAI** is an AI-powered Fitness and Workout Tracking Platform that helps users create personalized workout plans, record daily workouts, monitor fitness progress, set fitness goals, and receive adaptive AI-powered recommendations.

The platform combines deterministic fitness analytics with AI-generated workout plans and personalized coaching insights.

### Core concept

```text
User Goal
    ↓
Personalized Workout Plan
    ↓
Daily Workout
    ↓
Workout Logging
    ↓
Progress Analytics
    ↓
AI Coach
    ↓
Adaptive Recommendation
    ↓
Updated Workout Plan
```

The system must provide a complete feedback loop rather than functioning only as a static workout tracker.

---

# 2. Problem Statement

Build a Fitness and Workout Tracking Platform where users can:

* Create personalized workout plans.
* Monitor physical activities.
* Track fitness progress.
* Maintain consistent exercise routines.
* Set fitness goals.
* View progress through dashboards and reports.

The solution should demonstrate a meaningful use of AI to improve personalization and decision support.

---

# 3. Target User

Primary users:

* Beginners starting a fitness routine.
* Intermediate users tracking workout consistency.
* Users working toward fitness goals.
* Users who want personalized workout recommendations.

The MVP focuses on individual users.

---

# 4. Core User Problems

Users commonly need to:

1. Create a workout plan appropriate for their goal and fitness level.
2. Remember and follow their planned workouts.
3. Record completed workouts.
4. Understand whether their consistency is improving.
5. Determine whether they are progressing toward their goals.
6. Know how their workout routine should change based on their progress.

FITAI addresses these through workout management, analytics, and an adaptive AI coach.

---

# 5. Mandatory Functional Requirements

The implementation MUST satisfy all requirements from the hackathon problem statement.

## 5.1 Personalized Workout Plans

Users must be able to create or generate workout plans containing:

* Exercise name
* Duration
* Repetitions
* Sets where applicable
* Difficulty level

Users should be able to view their current workout plan.

---

## 5.2 Daily Workout Tracking

Users must be able to record daily workouts.

A workout log should support:

* Date
* Exercise
* Duration
* Sets
* Repetitions
* Difficulty
* Completion status

The system must store workout history.

---

## 5.3 Fitness Goals

Users must be able to define fitness goals.

Examples:

* Weight loss
* Muscle gain
* General fitness
* Endurance
* Strength
* Workout consistency

A goal may contain:

* Goal type
* Target value where applicable
* Current value
* Deadline
* Progress percentage

---

## 5.4 Dashboard and Reports

The dashboard should provide useful fitness statistics.

Minimum statistics:

* Total workouts
* Weekly workouts
* Workout streak
* Completion rate
* Total workout duration
* Goal progress
* Recent workout activity

Use charts and visual indicators where useful.

---

# 6. AI Differentiator

The primary innovation is:

## Adaptive AI Fitness Coach

FITAI should not only record workouts.

It should analyze the user's workout history and provide personalized recommendations.

The AI layer should support:

### A. AI Workout Generation

Generate a workout plan based on:

* Fitness goal
* Fitness level
* Number of workout days
* Desired workout duration
* Available equipment
* Preferred difficulty

Example input:

```text
Goal: Muscle Gain
Fitness Level: Beginner
Days Per Week: 4
Duration: 45 minutes
Equipment: Dumbbells
```

Example output:

```text
Monday
Chest + Triceps

Push-ups
3 sets × 10 reps

Dumbbell Press
3 sets × 12 reps

Tricep Extension
3 sets × 12 reps
```

---

### B. AI Progress Analysis

The system should analyze:

* Workout frequency
* Completion rate
* Workout consistency
* Workout volume
* Recent performance
* Goal progress
* Difficulty trends

The system should identify meaningful patterns.

---

### C. Adaptive Recommendations

Based on the user's actual history, the AI may recommend changes such as:

* Increase repetitions.
* Reduce repetitions.
* Increase or reduce workout volume.
* Change difficulty.
* Modify workout duration.
* Recommend recovery.
* Maintain the current plan.
* Focus on consistency.

Recommendations must be based on available workout data.

The AI must not invent workout history.

---

### D. AI Fitness Insights

The AI should convert quantitative statistics into understandable insights.

Example:

```text
Your workout consistency has improved this week.
You completed 5 of 6 planned workouts.

Your recent workload is increasing gradually.
Consider maintaining the current difficulty while
improving consistency.
```

---

# 7. AI Architecture Principle

The system should use a hybrid approach.

## Deterministic Analytics

The backend should calculate reliable numerical statistics such as:

* Workout count
* Completion rate
* Workout streak
* Total duration
* Weekly volume
* Goal progress
* Trend information

These calculations should NOT depend on an LLM.

## AI Layer

The LLM should primarily handle:

* Workout plan generation
* Natural-language interpretation
* Personalized insights
* Adaptive recommendations

Architecture:

```text
Workout Database
      ↓
Deterministic Analytics
      ↓
Structured Fitness Statistics
      ↓
AI Coach
      ↓
Personalized Explanation
      ↓
Recommendation
```

This makes the AI component more reliable and explainable.

---

# 8. Technical Architecture

## Frontend

Use:

* React
* Vite
* Tailwind CSS
* Recharts or another lightweight chart library

The frontend should provide a professional fitness dashboard.

---

## Backend

Use:

* Python
* FastAPI
* Pydantic

The backend should expose REST APIs.

---

## Database

Preferred:

* PostgreSQL

Fallback for fast local development:

* SQLite

The database must persist:

* Users
* Workout plans
* Exercises
* Workout logs
* Fitness goals

---

## AI

Use an available LLM API for:

* Workout generation
* Fitness insights
* Adaptive recommendations

The AI response should preferably use structured JSON.

---

# 9. Suggested Database Model

## users

```text
id
name
email
created_at
```

## workout_plans

```text
id
user_id
name
goal
difficulty
duration
created_at
```

## exercises

```text
id
plan_id
name
sets
repetitions
duration
difficulty
```

## workout_logs

```text
id
user_id
exercise_id
date
sets_completed
repetitions_completed
duration
difficulty
completed
```

## fitness_goals

```text
id
user_id
goal_type
target
current_value
deadline
created_at
```

Do not create unnecessary tables unless required by implementation.

---

# 10. Main API Areas

The backend should provide APIs for:

```text
/users
/workout-plans
/exercises
/workout-logs
/goals
/progress
/ai/workout-plan
/ai/coach
/ai/insights
```

The exact endpoint structure must be documented in `API_CONTRACT.md`.

Frontend developers must use the API contract rather than inventing endpoints.

---

# 11. Main Application Screens

The MVP should contain:

## Dashboard

Show:

* Today's workout
* Weekly workout count
* Workout streak
* Completion rate
* Goal progress
* Recent activity
* AI insight

---

## Workout Plans

Show:

* Existing plans
* Exercises
* Sets
* Repetitions
* Duration
* Difficulty

Actions:

* View
* Create
* Edit where practical
* Generate with AI

---

## Create Workout Plan

Allow users to enter:

```text
Goal
Fitness level
Days per week
Workout duration
Equipment
Difficulty
```

Provide:

```text
Generate AI Plan
```

---

## Daily Workout

Allow users to:

* Start workout
* Mark exercises complete
* Record repetitions
* Record duration
* Record difficulty
* Save workout

---

## Goals

Allow users to:

* Create goal
* View current progress
* View target
* View deadline

---

## Progress / Reports

Display:

* Workout history
* Weekly activity
* Completion rate
* Streak
* Duration trends
* Goal progress
* AI insights

Use charts where they improve understanding.

---

## AI Coach

Display:

* Current fitness summary
* Recent progress
* AI insights
* Recommended changes
* Reasoning behind recommendations

---

# 12. Primary Demo Flow

The entire application should support this flow:

```text
Dashboard
    ↓
Set Fitness Goal
    ↓
Generate AI Workout Plan
    ↓
Review Workout Plan
    ↓
Complete Workout
    ↓
Log Workout
    ↓
View Updated Progress
    ↓
Open AI Coach
    ↓
AI Analyzes Workout History
    ↓
Adaptive Recommendation
```

This should be the primary hackathon demonstration.

---

# 13. Example Demo Scenario

Use a seeded/demo user.

### Initial goal

```text
Goal:
Build Muscle

Fitness Level:
Beginner

Days:
4 per week

Duration:
45 minutes

Equipment:
Dumbbells
```

AI generates a personalized plan.

Then use several existing workout records to simulate history.

Dashboard might show:

```text
Weekly Workouts: 5
Workout Streak: 6 days
Completion Rate: 82%
Goal Progress: 64%
```

AI Coach analyzes the history.

Example recommendation:

```text
Your workout consistency has improved.

Recent workload is increasing gradually.
Maintain the current difficulty and increase
selected exercises by a small number of repetitions.
```

The exact numerical values must come from the actual demo data.

---

# 14. UI/UX Requirements

The application should look like a real fitness product.

Prioritize:

* Clean dashboard
* Clear statistics
* Progress cards
* Workout cards
* Charts
* Progress bars
* AI insight cards
* Clear primary actions
* Responsive layout
* Loading states
* Empty states
* Error states

Avoid:

* Excessive animations
* Unnecessary pages
* Generic chatbot appearance
* Overly complicated navigation

The AI Coach should be integrated into the product rather than being the entire product.

---

# 15. Innovation

The key differentiator is:

## Closed-loop adaptive fitness

Traditional tracker:

```text
Track
 ↓
Display
```

FITAI:

```text
Track
 ↓
Analyze
 ↓
Understand
 ↓
Generate insight
 ↓
Adapt
 ↓
Track again
```

The system continuously uses workout history to improve personalization.

---

# 16. Success Metrics

The prototype should measure metrics that can actually be demonstrated.

Possible metrics:

### Product metrics

* Workout completion rate
* Workout consistency
* Workout streak
* Goal progress
* Weekly workout volume

### AI/system metrics

* AI plan generation time
* AI response time
* Valid structured AI responses
* Recommendation consistency
* Successful API requests

Do NOT fabricate accuracy or improvement percentages.

Only report metrics actually measured by the prototype.

---

# 17. Safety and AI Reliability

The application is a fitness tracking prototype, not a medical diagnosis system.

The AI must:

* Avoid medical diagnoses.
* Avoid claiming certainty about health conditions.
* Avoid recommending exercise through significant pain or injury.
* Encourage professional advice when appropriate.
* Clearly distinguish recommendations from medical advice.

The system should also validate AI-generated structured output before displaying it.

---

# 18. MVP Priority

## MUST HAVE

```text
1. Dashboard
2. Workout plans
3. Exercise details
4. Daily workout logging
5. Fitness goals
6. Progress statistics
7. AI workout generation
8. AI progress analysis
9. Adaptive AI recommendation
10. Working end-to-end demo
```

## SHOULD HAVE

```text
1. Interactive charts
2. Workout streak
3. AI insights
4. Seed/demo data
5. Loading and error states
6. Professional UI
```

## ONLY IF TIME REMAINS

```text
1. Advanced filtering
2. Export reports
3. Additional visualizations
4. Workout plan editing improvements
```

## DO NOT BUILD FOR THE MVP

```text
1. Social network
2. Payments
3. Nutrition marketplace
4. Wearable integrations
5. Complex authentication
6. Admin dashboard
7. Real-time multiplayer
8. Microservices
9. Custom deep-learning model
10. Mobile application
11. Computer-vision exercise detection
```

---

# 19. Five-Hour Hackathon Constraint

The project must remain achievable within approximately five hours.

Development priority:

```text
Working MVP
    >
AI functionality
    >
Reliability
    >
Demo quality
    >
Visual polish
    >
Extra features
```

The team must achieve an end-to-end workflow as early as possible.

Target:

```text
Hour 0–0.5
Problem + architecture

Hour 0.5–2
Parallel implementation

Hour 2–3
Integration

Hour 3–3.5
Testing

Hour 3.5–4
Bug fixing + polish

Hour 4–5
PPT + demo + rehearsal
```

Do not sacrifice a working core feature for an additional feature.

---

# 20. Agent Development Rules

All AI coding agents must read this document before modifying the project.

## Rules

1. Do not rewrite working functionality without a technical reason.
2. Do not add unnecessary dependencies.
3. Do not over-engineer.
4. Do not invent API endpoints.
5. Follow `API_CONTRACT.md`.
6. Follow the database schema.
7. Preserve existing tests.
8. Test important functionality after changes.
9. Do not fabricate metrics.
10. Do not claim features that are not implemented.
11. Keep the application runnable locally.
12. Prefer simple implementations.
13. Keep frontend and backend contracts synchronized.
14. Do not modify another agent's area unless integration requires it.
15. Document significant architectural changes.

---

# 21. Agent Responsibilities

## Claude Code / OmniRoute

Primary responsibilities:

* Backend
* FastAPI
* Database
* API integration
* AI service integration
* Backend testing
* System integration
* Debugging

---

## OpenCode

Primary responsibilities:

* AI logic
* Analytics
* AI evaluation
* Test cases
* Sample/demo data
* AI reliability checks

Do not unnecessarily rewrite the backend or frontend.

---

## Antigravity

Primary responsibilities:

* React frontend
* Tailwind UI
* Dashboard
* Charts
* Workout screens
* Goals
* Progress visualization
* AI Coach interface

Follow `API_CONTRACT.md`.

Do not invent backend APIs.

---

# 22. Definition of Done

The MVP is considered complete when a judge can perform this workflow successfully:

```text
1. Open FITAI
2. View dashboard
3. Create/set a fitness goal
4. Generate an AI workout plan
5. View exercises and workout details
6. Record a completed workout
7. View updated statistics
8. View goal progress
9. Open AI Coach
10. Receive an adaptive recommendation
```

The application must work end-to-end without manual database manipulation during the demo.

---

# 23. Final Product Statement

FITAI is an AI-powered adaptive fitness platform that goes beyond tracking workouts.

It combines:

```text
Workout Planning
+
Daily Activity Tracking
+
Fitness Analytics
+
Goal Tracking
+
AI Personalization
+
Adaptive Recommendations
```

The core value proposition is:

> **FITAI doesn't just track what users did. It learns from their workout patterns and helps determine what they should do next.**
