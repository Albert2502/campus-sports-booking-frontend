import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import App from '../App';
import { AuthProvider } from '../auth/AuthContext';
import { saveToken } from '../auth/token-storage';

/**
 * Renders the whole app at `route`, signed in when `token` is given. The API
 * answers come from the MSW handlers of the test.
 * @param {{route?: string, token?: string}} options
 */
export function renderApp({ route = '/', token } = {}) {
  if (token) {
    saveToken(token);
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
