// FITAI API Client Service Layer
// Connects to FastAPI backend at http://localhost:8000/api
// Automatically falls back to localized persistent mock data if backend is offline.

const API_BASE_URL = '/api';

// Initial Mock Data Store
const DEFAULT_MOCK_PLANS = [
  {
    id: 1,
    name: "Hypertrophy Push/Pull Core",
    description: "AI-optimized muscle building protocol focusing on high volume and active recovery.",
    difficulty: "intermediate",
    is_ai_generated: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    exercises: [
      { id: 101, name: "Incline Dumbbell Press", duration_minutes: null, repetitions: 12, sets: 4, difficulty: "intermediate", rest_seconds: 75, order: 1 },
      { id: 102, name: "Overhead Barbell Press", duration_minutes: null, repetitions: 10, sets: 3, difficulty: "intermediate", rest_seconds: 90, order: 2 },
      { id: 103, name: "Tricep Rope Pushdowns", duration_minutes: null, repetitions: 15, sets: 3, difficulty: "beginner", rest_seconds: 60, order: 3 },
      { id: 104, name: "Cable Lateral Raises", duration_minutes: null, repetitions: 15, sets: 4, difficulty: "intermediate", rest_seconds: 45, order: 4 },
    ]
  },
  {
    id: 2,
    name: "Full Body Functional Strength",
    description: "Compound strength training designed for overall athletic conditioning.",
    difficulty: "advanced",
    is_ai_generated: false,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    exercises: [
      { id: 201, name: "Barbell Back Squat", duration_minutes: null, repetitions: 8, sets: 4, difficulty: "advanced", rest_seconds: 120, order: 1 },
      { id: 202, name: "Pull-ups (Weighted)", duration_minutes: null, repetitions: 10, sets: 4, difficulty: "advanced", rest_seconds: 90, order: 2 },
      { id: 203, name: "Romanian Deadlift", duration_minutes: null, repetitions: 10, sets: 3, difficulty: "intermediate", rest_seconds: 90, order: 3 },
      { id: 204, name: "Plank Hold", duration_minutes: 2, repetitions: null, sets: 3, difficulty: "intermediate", rest_seconds: 60, order: 4 },
    ]
  }
];

const DEFAULT_MOCK_GOALS = [
  {
    id: 1,
    title: "Bench Press Target",
    description: "Increase 1RM Bench Press strength",
    target_value: 100,
    current_value: 82.5,
    unit: "kg",
    deadline: "2026-11-15",
    achieved: false,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 2,
    title: "Weekly Workout Volume",
    description: "Complete 4 sessions per week consistently",
    target_value: 16,
    current_value: 14,
    unit: "sessions",
    deadline: "2026-10-31",
    achieved: false,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 3,
    title: "Target Body Fat",
    description: "Reduce body fat percentage",
    target_value: 12,
    current_value: 14.2,
    unit: "%",
    deadline: "2026-12-01",
    achieved: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

const DEFAULT_MOCK_DAILY = [
  {
    id: 1,
    plan_id: 1,
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    completed: true,
    duration_minutes: 48,
    notes: "Great energy on incline press today. Pushed through 12 reps on final set!",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    logs: [
      { id: 1, exercise_id: 101, exercise_name: "Incline Dumbbell Press", sets_completed: 4, reps_completed: 12, duration_minutes: 15, notes: "32kg dumbbells felt solid" },
      { id: 2, exercise_id: 102, exercise_name: "Overhead Barbell Press", sets_completed: 3, reps_completed: 10, duration_minutes: 12, notes: "Strict form" },
    ]
  },
  {
    id: 2,
    plan_id: 2,
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    completed: true,
    duration_minutes: 55,
    notes: "Squat form felt locked in. PR on volume!",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    logs: [
      { id: 3, exercise_id: 201, exercise_name: "Barbell Back Squat", sets_completed: 4, reps_completed: 8, duration_minutes: 20, notes: "110kg working sets" },
    ]
  }
];

// Helper to manage localStorage mock state
function getStorage(key, fallback) {
  try {
    const item = localStorage.getItem(`fitai_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, data) {
  try {
    localStorage.setItem(`fitai_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage error", e);
  }
}

// Global server status state
let forceMockMode = false;
let isConnectedToBackend = false;

// Custom fetch wrapper
async function apiRequest(endpoint, options = {}) {
  if (forceMockMode) throw new Error("Mock Mode Enabled");
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    isConnectedToBackend = true;
    return await res.json();
  } catch (err) {
    isConnectedToBackend = false;
    throw err;
  }
}

export const fitaiApi = {
  // Connection Status check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/progress/stats`);
      if (res.ok) {
        isConnectedToBackend = true;
        return { online: true, mode: 'backend' };
      }
    } catch (e) {
      // Backend unavailable
    }
    isConnectedToBackend = false;
    return { online: false, mode: 'mock' };
  },

  setMockMode(enable) {
    forceMockMode = enable;
  },

  getIsConnected() {
    return isConnectedToBackend && !forceMockMode;
  },

  // --- WORKOUT PLANS ---
  async getPlans() {
    try {
      return await apiRequest('/workouts/plans');
    } catch {
      return getStorage('plans', DEFAULT_MOCK_PLANS);
    }
  },

  async getPlanById(planId) {
    try {
      return await apiRequest(`/workouts/plans/${planId}`);
    } catch {
      const plans = getStorage('plans', DEFAULT_MOCK_PLANS);
      const plan = plans.find(p => p.id === Number(planId));
      if (!plan) throw new Error("Plan not found");
      return plan;
    }
  },

  async createPlan(planData) {
    try {
      return await apiRequest('/workouts/plans', {
        method: 'POST',
        body: JSON.stringify(planData),
      });
    } catch {
      const plans = getStorage('plans', DEFAULT_MOCK_PLANS);
      const newPlan = {
        id: Date.now(),
        name: planData.name,
        description: planData.description || "",
        difficulty: planData.difficulty || "intermediate",
        is_ai_generated: !!planData.is_ai_generated,
        created_at: new Date().toISOString(),
        exercises: planData.exercises || []
      };
      plans.unshift(newPlan);
      setStorage('plans', plans);
      return newPlan;
    }
  },

  async addExerciseToPlan(planId, exerciseData) {
    try {
      return await apiRequest(`/workouts/plans/${planId}/exercises`, {
        method: 'POST',
        body: JSON.stringify(exerciseData),
      });
    } catch {
      const plans = getStorage('plans', DEFAULT_MOCK_PLANS);
      const planIndex = plans.findIndex(p => p.id === Number(planId));
      if (planIndex !== -1) {
        const newExercise = {
          id: Date.now(),
          order: plans[planIndex].exercises.length + 1,
          ...exerciseData
        };
        plans[planIndex].exercises.push(newExercise);
        setStorage('plans', plans);
        return newExercise;
      }
      throw new Error("Plan not found");
    }
  },

  async deleteExerciseFromPlan(planId, exerciseId) {
    try {
      await apiRequest(`/workouts/plans/${planId}/exercises/${exerciseId}`, {
        method: 'DELETE',
      });
      return true;
    } catch {
      const plans = getStorage('plans', DEFAULT_MOCK_PLANS);
      const planIndex = plans.findIndex(p => p.id === Number(planId));
      if (planIndex !== -1) {
        plans[planIndex].exercises = plans[planIndex].exercises.filter(e => e.id !== Number(exerciseId));
        setStorage('plans', plans);
        return true;
      }
      return false;
    }
  },

  // --- DAILY WORKOUTS & LOGS ---
  async getDailyWorkouts(days = null) {
    try {
      const query = days ? `?days=${days}` : '';
      return await apiRequest(`/workouts/daily${query}`);
    } catch {
      return getStorage('daily', DEFAULT_MOCK_DAILY);
    }
  },

  async createDailyWorkout(dailyData) {
    try {
      return await apiRequest('/workouts/daily', {
        method: 'POST',
        body: JSON.stringify(dailyData),
      });
    } catch {
      const dailies = getStorage('daily', DEFAULT_MOCK_DAILY);
      const newDaily = {
        id: Date.now(),
        plan_id: dailyData.plan_id || null,
        date: dailyData.date || new Date().toISOString().split('T')[0],
        completed: false,
        duration_minutes: 0,
        notes: dailyData.notes || "",
        created_at: new Date().toISOString(),
        logs: []
      };
      dailies.unshift(newDaily);
      setStorage('daily', dailies);
      return newDaily;
    }
  },

  async addWorkoutLog(dailyId, logData) {
    try {
      return await apiRequest(`/workouts/daily/${dailyId}/logs`, {
        method: 'POST',
        body: JSON.stringify(logData),
      });
    } catch {
      const dailies = getStorage('daily', DEFAULT_MOCK_DAILY);
      const idx = dailies.findIndex(d => d.id === Number(dailyId));
      if (idx !== -1) {
        const newLog = {
          id: Date.now(),
          ...logData
        };
        dailies[idx].logs.push(newLog);
        // update overall duration estimate
        dailies[idx].duration_minutes = dailies[idx].logs.reduce((acc, l) => acc + (l.duration_minutes || 5), 0);
        setStorage('daily', dailies);
        return newLog;
      }
      throw new Error("Daily workout session not found");
    }
  },

  async completeDailyWorkout(dailyId) {
    try {
      return await apiRequest(`/workouts/daily/${dailyId}/complete`, {
        method: 'POST',
      });
    } catch {
      const dailies = getStorage('daily', DEFAULT_MOCK_DAILY);
      const idx = dailies.findIndex(d => d.id === Number(dailyId));
      if (idx !== -1) {
        dailies[idx].completed = true;
        setStorage('daily', dailies);
        return dailies[idx];
      }
      throw new Error("Daily workout session not found");
    }
  },

  // --- GOALS ---
  async getGoals() {
    try {
      return await apiRequest('/goals');
    } catch {
      return getStorage('goals', DEFAULT_MOCK_GOALS);
    }
  },

  async createGoal(goalData) {
    try {
      return await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
      });
    } catch {
      const goals = getStorage('goals', DEFAULT_MOCK_GOALS);
      const newGoal = {
        id: Date.now(),
        title: goalData.title,
        description: goalData.description || "",
        target_value: goalData.target_value ? Number(goalData.target_value) : null,
        current_value: goalData.current_value ? Number(goalData.current_value) : 0,
        unit: goalData.unit || "",
        deadline: goalData.deadline || null,
        achieved: false,
        created_at: new Date().toISOString()
      };
      goals.unshift(newGoal);
      setStorage('goals', goals);
      return newGoal;
    }
  },

  async updateGoal(goalId, goalData) {
    try {
      return await apiRequest(`/goals/${goalId}`, {
        method: 'PATCH',
        body: JSON.stringify(goalData),
      });
    } catch {
      const goals = getStorage('goals', DEFAULT_MOCK_GOALS);
      const idx = goals.findIndex(g => g.id === Number(goalId));
      if (idx !== -1) {
        goals[idx] = { ...goals[idx], ...goalData };
        if (goals[idx].target_value && goals[idx].current_value >= goals[idx].target_value) {
          goals[idx].achieved = true;
        }
        setStorage('goals', goals);
        return goals[idx];
      }
      throw new Error("Goal not found");
    }
  },

  async deleteGoal(goalId) {
    try {
      await apiRequest(`/goals/${goalId}`, { method: 'DELETE' });
      return true;
    } catch {
      const goals = getStorage('goals', DEFAULT_MOCK_GOALS);
      const filtered = goals.filter(g => g.id !== Number(goalId));
      setStorage('goals', filtered);
      return true;
    }
  },

  // --- PROGRESS & ANALYTICS ---
  async getProgressStats() {
    try {
      return await apiRequest('/progress/stats');
    } catch {
      const dailies = getStorage('daily', DEFAULT_MOCK_DAILY);
      const completed = dailies.filter(d => d.completed);
      const totalLogs = dailies.reduce((sum, d) => sum + (d.logs ? d.logs.length : 0), 0);
      return {
        total_workouts: dailies.length,
        completed_workouts: completed.length,
        current_streak: 4,
        longest_streak: 7,
        avg_duration_minutes: 51.5,
        total_exercises_logged: totalLogs,
        this_week_workouts: 3
      };
    }
  },

  async getWeeklyBreakdown(weeks = 4) {
    try {
      return await apiRequest(`/progress/weekly?weeks=${weeks}`);
    } catch {
      const today = new Date();
      return Array.from({ length: weeks }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - i * 7);
        return {
          week_start: d.toISOString().split('T')[0],
          workouts: 3 + (i % 2),
          total_duration: 140 + i * 15,
          exercises_logged: 12 + i * 3
        };
      }).reverse();
    }
  },

  async getExerciseHistory(exerciseName) {
    try {
      return await apiRequest(`/progress/exercise/${encodeURIComponent(exerciseName)}`);
    } catch {
      return [
        { date: "2026-09-10", sets: 3, reps: 10, duration: 12 },
        { date: "2026-09-17", sets: 4, reps: 10, duration: 14 },
        { date: "2026-09-24", sets: 4, reps: 12, duration: 15 },
        { date: "2026-09-29", sets: 4, reps: 12, duration: 15 },
      ];
    }
  },

  // --- AI COACH ---
  async generateAIPlan(payload) {
    try {
      return await apiRequest('/ai/generate-plan', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // High quality fallback AI generated plan
      const { fitness_goal = "muscle_gain", fitness_level = "intermediate", available_days = 4 } = payload;
      return {
        plan_name: `AI Adaptive ${fitness_goal.replace('_', ' ').toUpperCase()} Protocol`,
        description: `Precision-engineered ${available_days}-day ${fitness_level} routine targeting maximum progressive overload and neuromuscular adaptation.`,
        difficulty: fitness_level,
        days: [
          {
            day: "Day 1",
            focus: "Chest & Triceps Power",
            exercises: [
              { name: "Incline Dumbbell Press", sets: 4, repetitions: 10, duration_minutes: null, rest_seconds: 75, difficulty: fitness_level },
              { name: "Flat Barbell Bench Press", sets: 3, repetitions: 8, duration_minutes: null, rest_seconds: 90, difficulty: fitness_level },
              { name: "Tricep Dips", sets: 3, repetitions: 12, duration_minutes: null, rest_seconds: 60, difficulty: "beginner" },
              { name: "Cable Chest Flyes", sets: 4, repetitions: 15, duration_minutes: null, rest_seconds: 45, difficulty: fitness_level },
            ]
          },
          {
            day: "Day 2",
            focus: "Back & Biceps Hypertrophy",
            exercises: [
              { name: "Lat Pulldowns", sets: 4, repetitions: 12, duration_minutes: null, rest_seconds: 60, difficulty: fitness_level },
              { name: "Single Arm Dumbbell Row", sets: 3, repetitions: 10, duration_minutes: null, rest_seconds: 75, difficulty: fitness_level },
              { name: "Incline EZ-Bar Bicep Curl", sets: 4, repetitions: 12, duration_minutes: null, rest_seconds: 60, difficulty: "beginner" },
              { name: "Face Pulls", sets: 3, repetitions: 15, duration_minutes: null, rest_seconds: 45, difficulty: "beginner" },
            ]
          },
          {
            day: "Day 3",
            focus: "Legs & Lower Body",
            exercises: [
              { name: "Barbell Back Squat", sets: 4, repetitions: 8, duration_minutes: null, rest_seconds: 120, difficulty: fitness_level },
              { name: "Romanian Deadlift", sets: 3, repetitions: 10, duration_minutes: null, rest_seconds: 90, difficulty: fitness_level },
              { name: "Walking Lunges", sets: 3, repetitions: 12, duration_minutes: null, rest_seconds: 60, difficulty: "beginner" },
              { name: "Standing Calf Raises", sets: 4, repetitions: 15, duration_minutes: null, rest_seconds: 45, difficulty: "beginner" },
            ]
          },
          {
            day: "Day 4",
            focus: "Shoulders & Core Stability",
            exercises: [
              { name: "Seated Overhead Dumbbell Press", sets: 4, repetitions: 10, duration_minutes: null, rest_seconds: 75, difficulty: fitness_level },
              { name: "Dumbbell Lateral Raise", sets: 4, repetitions: 15, duration_minutes: null, rest_seconds: 45, difficulty: "beginner" },
              { name: "Hanging Leg Raises", sets: 3, repetitions: 15, duration_minutes: null, rest_seconds: 60, difficulty: fitness_level },
              { name: "Ab Wheel Rollouts", sets: 3, repetitions: 12, duration_minutes: null, rest_seconds: 60, difficulty: "intermediate" },
            ]
          }
        ],
        tips: [
          "Ensure at least 7-8 hours of deep recovery sleep every night.",
          "Prioritize 1.6g-2.2g of protein per kg of bodyweight to optimize protein synthesis.",
          "Increase load by 2.5% whenever you successfully complete all target sets and reps."
        ]
      };
    }
  },

  async getAIInsights() {
    try {
      return await apiRequest('/ai/insights');
    } catch {
      return {
        summary: "Excellent volume consistency over the past 14 days! Upper body pushing exercises show strong progressive overload potential.",
        overall_score: 9,
        insights: [
          {
            category: "Consistency & Streak",
            finding: "Logged 4 sessions this week with a 100% plan adherence rate.",
            recommendation: "Maintain your active rest intervals. Your recovery pace is currently optimal."
          },
          {
            category: "Volume Progression",
            finding: "Incline Dumbbell Press weight selection increased by +5% over 3 sessions.",
            recommendation: "You are ready for a progressive overload step (+1 set or +2kg load) on chest days."
          },
          {
            category: "Muscle Group Balance",
            finding: "Leg day volume is currently 20% lower than pushing volume.",
            recommendation: "Add 1 set of Romanian Deadlifts or Leg Press to maintain lower body symmetry."
          }
        ]
      };
    }
  },

  async adjustAIPlan(planId) {
    try {
      return await apiRequest(`/ai/adjust-plan/${planId}`, {
        method: 'POST',
      });
    } catch {
      return {
        summary: "AI Adaptive Engine evaluated your recent 4 workout logs and identified 2 efficiency optimizations for maximum stimulus.",
        adjustments: [
          {
            exercise_name: "Incline Dumbbell Press",
            current: "3 sets x 12 reps @ 30kg",
            suggested: "4 sets x 10 reps @ 32.5kg",
            reason: "High completion rate (100%) indicates readiness for higher mechanical tension and progressive load."
          },
          {
            exercise_name: "Cable Lateral Raises",
            current: "rest_seconds: 45s",
            suggested: "rest_seconds: 60s",
            reason: "Increasing rest duration slightly will maintain peak lateral deltoid activation on final set."
          }
        ]
      };
    }
  }
};
