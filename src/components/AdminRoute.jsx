import { useAuth } from '../auth/AuthContext';
import ForbiddenPage from '../pages/ForbiddenPage';

/**
 * Shows `children` to the admin only; must sit inside ProtectedRoute. The API
 * refuses admin requests from other roles anyway.
 */
export default function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user.role !== 'admin') {
    return <ForbiddenPage />;
  }
  return children;
}
