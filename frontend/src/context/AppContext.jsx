import React, { createContext, useContext, useState, useEffect } from 'react';
import { fitaiApi } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState({ online: false, mode: 'checking' });
  const [plans, setPlans] = useState([]);
  const [goals, setGoals] = useState([]);
  const [dailyWorkouts, setDailyWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Selected item for deep-linking between tabs (e.g. Plan -> Log Workout, or AI Plan -> View)
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [activeDailyId, setActiveDailyId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const status = await fitaiApi.checkHealth();
      setConnectionStatus(status);

      const [plansData, goalsData, dailyData, statsData, insightsData] = await Promise.all([
        fitaiApi.getPlans(),
        fitaiApi.getGoals(),
        fitaiApi.getDailyWorkouts(),
        fitaiApi.getProgressStats(),
        fitaiApi.getAIInsights(),
      ]);

      setPlans(plansData || []);
      setGoals(goalsData || []);
      setDailyWorkouts(dailyData || []);
      setStats(statsData || null);
      setInsights(insightsData || null);
    } catch (err) {
      console.error("Failed to load initial data", err);
      showToast("Error connecting to backend - switched to local mock engine", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const toggleMockMode = async (enableMock) => {
    fitaiApi.setMockMode(enableMock);
    await refreshData();
    showToast(enableMock ? "Switched to Local Offline Mock Engine" : "Connected to FastAPI Backend Engine", "info");
  };

  const navigateTo = (tab, extra = {}) => {
    if (extra.planId) setSelectedPlanId(extra.planId);
    if (extra.dailyId) setActiveDailyId(extra.dailyId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        navigateTo,
        connectionStatus,
        toggleMockMode,
        plans,
        goals,
        dailyWorkouts,
        stats,
        insights,
        loading,
        refreshData,
        toast,
        showToast,
        selectedPlanId,
        setSelectedPlanId,
        activeDailyId,
        setActiveDailyId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
