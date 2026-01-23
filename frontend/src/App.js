import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './api/auth';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import EventsPage from './components/EventsPage';
import SeatsPage from './components/SeatsPage';

// Protected Route Component
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

// Public Route Component (redirect to events if already authenticated)
function PublicRoute({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/events" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/seats"
          element={
            <ProtectedRoute>
              <SeatsPage />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/events" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;