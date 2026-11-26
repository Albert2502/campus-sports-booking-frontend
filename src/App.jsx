import { Navigate, Route, Routes } from 'react-router';

import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './layouts/UserLayout';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotReadyPage from './pages/NotReadyPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/parola-uitata" element={<ForgotPasswordPage />} />
      {/* The path is in the reset email (backend APP_URL/resetare-parola). */}
      <Route path="/resetare-parola" element={<ResetPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        {/* TODO(CB-19): screen 03 Detalii facilitate. */}
        <Route
          path="facilitati/:facilityId"
          element={<NotReadyPage title="Detalii facilitate" />}
        />
        <Route path="profil" element={<ProfilePage />} />
        <Route path="profil/parola" element={<ChangePasswordPage />} />
        {/* TODO(CB-27): screen 06 Rezervările mele. */}
        <Route
          path="rezervari"
          element={<NotReadyPage title="Rezervările mele" />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
