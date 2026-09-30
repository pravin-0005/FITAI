import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import WorkoutPlans from './pages/WorkoutPlans';
import CreateWorkoutPlan from './pages/CreateWorkoutPlan';
import DailyLogging from './pages/DailyLogging';
import Goals from './pages/Goals';
import Progress from './pages/Progress';
import AICoach from './pages/AICoach';

function MainLayout() {
  const { activeTab } = useApp();

  return (
    <div className="flex min-h-screen bg-dark-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'workout-plans' && <WorkoutPlans />}
          {activeTab === 'create-plan' && <CreateWorkoutPlan />}
          {activeTab === 'daily-logging' && <DailyLogging />}
          {activeTab === 'goals' && <Goals />}
          {activeTab === 'progress' && <Progress />}
          {activeTab === 'ai-coach' && <AICoach />}
        </main>
      </div>

      {/* Global Toast Container */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
