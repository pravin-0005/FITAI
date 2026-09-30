# FITAI — Adaptive Fitness & Workout Coach (Frontend)

FITAI is a high-performance, dark-mode fitness web application built with **React**, **Vite**, **Tailwind CSS**, **Recharts**, and **Lucide Icons**. It connects seamlessly to the FastAPI backend while providing a full offline fallback engine so it works independently even if the backend server is offline.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Execution

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The application will launch locally at `http://localhost:3000`.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS (Dark Mode Glassmorphism Theme)
- **Charts & Data Visualization**: Recharts
- **Icons**: Lucide React
- **API Client**: Service layer with FastAPI integration & localized `localStorage` offline fallback

---

## 🌟 Required Screens & Features

1. **Dashboard**
   - High-level metric counters: Current Streak, Completed Sessions, Average Duration, AI Adherence Score.
   - Active Goal progress summary widget.
   - Recommended Routine quick-start launcher.
   - Interactive Weekly Activity BarChart (Recharts).
   - AI Coach daily insight snippet.

2. **Workout Plans**
   - Grid view of workout plans with difficulty badges and exercise counts.
   - Search filter & plan type switcher (All, AI Core, Custom).
   - Interactive exercise inspector modal (`PlanDetailModal`).
   - Action triggers: Start Workout, View Details, Ask AI to Adapt Plan.

3. **Create Workout Plan**
   - Interactive plan metadata form (Name, Description, Target Difficulty).
   - Dynamic exercise builder (Exercise Name, Sets, Reps, Rest seconds).
   - Instant shortcut button to switch to the AI Coach Plan Generator.

4. **Daily Workout Logging**
   - Plan selection dropdown (or pre-selected active routine).
   - Set-by-set logger: Sets completed, Reps completed, Duration, Notes.
   - Live session log recorder.
   - "Finish & Complete Workout" celebratory state trigger & progress update.

5. **Goals**
   - Milestone progress bars (Current vs Target value, Deadline, Unit, Percentage complete).
   - Goal creation modal (Title, Description, Target, Unit, Deadline).
   - Quick progress update increment buttons (`-1`, `+1`, `+5`).

6. **Progress & Reports**
   - Aggregated adherence and volume statistics.
   - Recharts 4-Week Training Volume BarChart.
   - Searchable Exercise Progressive Overload LineChart (Date vs Reps/Sets).

7. **AI Coach Hub**
   - **Tab 1: AI Plan Generator**: Custom parameter form (Goal, Level, Days/Week, Session Mins, Equipment). Generates structured weekly schedule with safety tips. "Save to Workouts" button.
   - **Tab 2: AI Insights Feed**: Performance audit score out of 10, summary, and categorized recommendations.
   - **Tab 3: Adaptive Recommendations**: Select plan -> compute progressive overload adjustments -> display specific exercise modifications with clear reasoning.

---

## 🔄 Backend Integration & Offline Mode

- **Live FastAPI Backend**: By default, the API service layer targets `http://localhost:8000/api`.
- **Automatic Fallback / Mock Mode**: If the FastAPI server is offline, FITAI automatically switches to an in-memory & `localStorage` mock engine.
- **Manual Toggle**: Use the status toggle button at the bottom of the sidebar to manually switch between live backend calls and offline mock mode.

---

## 📽️ Recommended Demo Flow

Follow this 8-step sequence for a complete demonstration of FITAI:

1. **Dashboard** → Inspect overall metrics, current streak, active goal progress, and weekly activity bar chart.
2. **Set Goal** → Navigate to **Goals**, click **Set New Goal** (e.g. "Bench Press 100kg"), and use the increment buttons (`+5`).
3. **Generate AI Plan** → Go to **AI Coach** (`Plan Generator` tab), select goal & equipment, click **Generate AI Workout Plan**.
4. **View & Save Plan** → Inspect the generated weekly schedule and click **Save Plan to Workouts**.
5. **Log Workout** → Click **Start Session** (or navigate to **Daily Workout Logging**), select your new plan, record sets completed, and click **Finish & Complete Workout**.
6. **View Progress** → Navigate to **Progress & Reports** to see the updated training volume bar chart and exercise overload line chart.
7. **AI Coach Insights** → Return to **AI Coach** (`AI Insights Feed` tab) to inspect the performance audit score and recommendations.
8. **Adaptive Recommendation** → Switch to the `Adaptive Recs` tab, select your plan, click **Adapt Plan**, and review the suggested exercise modifications.

---

## 📁 Directory Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AppContext.jsx       # State management & navigation
    ├── services/
    │   └── api.js               # FastAPI client + mock fallback
    ├── components/
    │   ├── Sidebar.jsx          # Glassmorphic sidebar navigation
    │   ├── Header.jsx           # Screen header & quick actions
    │   ├── Toast.jsx            # Status notification toast
    │   └── PlanDetailModal.jsx  # Exercise inspector modal
    └── pages/
        ├── Dashboard.jsx        # Stats & weekly activity chart
        ├── WorkoutPlans.jsx     # Plan library
        ├── CreateWorkoutPlan.jsx# Manual plan builder
        ├── DailyLogging.jsx     # Workout session logger
        ├── Goals.jsx            # Target progress tracking
        ├── Progress.jsx         # Analytics & Recharts visualizations
        └── AICoach.jsx          # Generator, Insights & Adaptive Recs
```
