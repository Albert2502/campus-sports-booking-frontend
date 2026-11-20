import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { login as loginRequest } from '../api/auth';
import { errorCode } from '../api/errors';
import { getMe } from '../api/users';
import { clearToken, readToken, saveToken } from './token-storage';

const AuthContext = createContext(null);

/**
 * Keeps the token and the signed-in user. `status` is `anonymous`,
 * `loading`, `authenticated` or `error` (the server did not answer).
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(readToken);

  const me = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: token !== null,
    retry: false,
  });

  const login = useCallback(
    async (email, password) => {
      const result = await loginRequest(email, password);
      saveToken(result.token);
      queryClient.setQueryData(['me'], result.user);
      setToken(result.token);
      return result.user;
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  // A stored token the server rejects (expired, account gone) means signed
  // out; any other error keeps the session and is shown as an error.
  const rejected = errorCode(me.error) === 'UNAUTHORIZED';
  let status = 'anonymous';
  if (token !== null && !rejected) {
    if (me.data) {
      status = 'authenticated';
    } else {
      status = me.isError ? 'error' : 'loading';
    }
  }

  const value = useMemo(
    () => ({
      status,
      user: status === 'authenticated' ? me.data : null,
      login,
      logout,
      retry: me.refetch,
    }),
    [status, me.data, me.refetch, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
}
