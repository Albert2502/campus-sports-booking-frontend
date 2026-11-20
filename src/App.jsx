import { Navigate, Route, Routes } from 'react-router';

import UserLayout from './layouts/UserLayout';
import LoginPage from './pages/LoginPage';
import NotReadyPage from './pages/NotReadyPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<UserLayout />}>
        <Route index element={null} />
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
