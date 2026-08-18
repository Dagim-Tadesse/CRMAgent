import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import { ActivityPage } from './pages/ActivityPage';
import { LoginPage } from './pages/LoginPage';
import { SchedulePage } from './pages/SchedulePage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';

import PipelinePage from './pages/PipelinePage';
import AITasksPage from './pages/AITasksPage';

import { useAuth } from './hooks/useAuth';
import { AppearanceProvider } from './context/AppearanceContext';
import { Loader } from './components/Loader';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give a micro-tick for localStorage state to resolve before routing
    const timer = setTimeout(() => setChecking(false), 50);
    return () => clearTimeout(timer);
  }, []);

  // Show dark full-screen loader while we confirm auth state
  if (checking) {
    return <Loader fullScreen={true} message="Authenticating..." />;
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AppearanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
          <Route path="/leads/:id" element={<ProtectedRoute><LeadDetailPage /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/pipeline" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
          <Route path="/ai-tasks" element={<ProtectedRoute><AITasksPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppearanceProvider>
  );
}

export default App;
