import { Navigate, Route, Routes } from 'react-router';

import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NotReadyPage from './pages/NotReadyPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        {/* TODO(CB-17): screen 02 Calendar și filtre. */}
        <Route
          path="calendar"
          element={<NotReadyPage title="Calendar și filtre" />}
        />
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
