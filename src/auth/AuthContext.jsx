import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { getMe, login as loginRequest } from '../api/endpoints';
import { errorCode } from '../api/errors';
import { clearToken, readToken, saveToken } from './token-storage';

const AuthContext = createContext(null);

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

  // A stored token the server rejects (expired, database reset) means
  // signed out; other errors keep the session and show up on the pages.
  const rejected = errorCode(me.error) === 'UNAUTHORIZED';
  let status = 'anonymous';
  if (token !== null && !rejected) {
    status = me.data ? 'authenticated' : 'loading';
  }
  if (token !== null && me.isError && !rejected) {
    status = 'error';
  }

  const value = useMemo(
    () => ({
      status,
      user: status === 'authenticated' ? me.data : null,
      login,
      logout,
    }),
    [status, me.data, login, logout],
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

/** Where a user lands after signing in. */
export function homePathFor(user) {
  return user.role === 'admin' ? '/admin/rezervari' : '/';
}
