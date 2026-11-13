import { Navigate, Route, Routes, useLocation } from 'react-router';

import { homePathFor, useAuth } from './auth/AuthContext';
import { AdminLayout, UserLayout } from './components/layouts';
import { ErrorState, LoadingState } from './components/ui';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminFacilitiesPage from './pages/admin/AdminFacilitiesPage';
import BookingPage from './pages/BookingPage';
import FacilityPage from './pages/FacilityPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyBookingsPage from './pages/MyBookingsPage';

/**
 * Shows `children` to signed-in users of the right kind; the API still
 * checks every permission on its own.
 */
function RequireAuth({ admin, children }) {
  const { status, user, logout } = useAuth();
  const location = useLocation();
  if (status === 'loading') {
    return <LoadingState />;
  }
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md p-6">
        <ErrorState
          text="Serverul nu răspunde. Verifică dacă backend-ul rulează."
          onRetry={() => window.location.reload()}
        />
        <button type="button" onClick={logout} className="mt-4 underline">
          Ieșire
        </button>
      </div>
    );
  }
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (admin !== (user.role === 'admin')) {
    return <Navigate to={homePathFor(user)} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth admin={false}>
            <UserLayout />
          </RequireAuth>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="facilitati/:facilityId" element={<FacilityPage />} />
        <Route path="rezervari" element={<MyBookingsPage />} />
        <Route path="rezervari/:bookingId" element={<BookingPage />} />
      </Route>
      <Route
        path="admin"
        element={
          <RequireAuth admin>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="rezervari" replace />} />
        <Route path="rezervari" element={<AdminBookingsPage />} />
        <Route path="facilitati" element={<AdminFacilitiesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
