import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { ActivityPage } from './pages/ActivityPage';
import { LoginPage } from './pages/LoginPage';
import PipelinePage from './pages/PipelinePage';
import AITasksPage from './pages/AITasksPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
        <Route path="/pipeline" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
        <Route path="/ai-tasks" element={<ProtectedRoute><AITasksPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
