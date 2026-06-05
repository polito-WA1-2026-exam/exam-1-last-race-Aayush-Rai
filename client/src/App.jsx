import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar          from './components/Navbar';
import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import GamePage        from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';

// Redirects to /login if not authenticated; shows nothing during session check
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/"            element={<HomePage />} />
      <Route path="/login"       element={<LoginPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/game" element={
        <ProtectedRoute><GamePage /></ProtectedRoute>
      }/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

const App = () => (
 <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
