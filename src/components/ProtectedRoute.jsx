import { Navigate, useLocation } from 'react-router';

import { errorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthContext';
import { ErrorState, LoadingState } from './ui';

/**
 * Shows `children` to signed-in users only; anonymous visitors go to /login
 * and come back here after signing in. The API still checks every request.
 */
export default function ProtectedRoute({ children }) {
  const { status, error, retry, logout } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingState />;
  }
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md p-6">
        <ErrorState text={errorMessage(error)} onRetry={retry} />
        <button type="button" onClick={logout} className="mt-4 underline">
          Ieșire
        </button>
      </div>
    );
  }
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
