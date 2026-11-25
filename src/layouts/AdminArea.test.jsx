import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { describe, expect, test } from 'vitest';

import { readToken } from '../auth/token-storage';
import { server } from '../test/server';
import { renderApp } from '../test/render';

const BASE_USER = {
  status: 'active',
  blockedUntil: null,
  bookingsThisMonth: 0,
  monthlyLimit: null,
  noShowCount: 0,
};
const ADMIN = {
  ...BASE_USER,
  id: 1,
  fullName: 'Admin Campus',
  email: 'admin@campus.test',
  role: 'admin',
};
const STUDENT = {
  ...BASE_USER,
  id: 2,
  fullName: 'Ana Popescu',
  email: 'ana@campus.test',
  role: 'student',
  monthlyLimit: 1,
};

function answerMe(user) {
  server.use(http.get('/api/v1/users/me', () => HttpResponse.json(user)));
}

describe('admin area', () => {
  test('/admin opens Facilități in the admin layout', async () => {
    answerMe(ADMIN);
    renderApp({ route: '/admin', token: 'token' });

    expect(
      await screen.findByRole('heading', { name: 'Gestionare facilități' }),
    ).toBeInTheDocument();
    const [sidebar, bottomBar] = screen.getAllByRole('navigation', {
      name: 'Administrare',
    });
    expect(
      within(sidebar).getByRole('link', { name: 'Facilități' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      within(bottomBar).getByRole('link', { name: 'Facilități' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('link', { name: '‹ Înapoi la aplicație' }),
    ).toHaveAttribute('href', '/');
  });

  test('Ieșire in the admin layout signs out', async () => {
    answerMe(ADMIN);
    renderApp({ route: '/admin/facilitati', token: 'token' });

    const [logout] = await screen.findAllByRole('button', { name: 'Ieșire' });
    await userEvent.click(logout);

    expect(
      await screen.findByRole('button', { name: 'Autentificare' }),
    ).toBeInTheDocument();
    expect(readToken()).toBeNull();
  });

  test('a student sees "Acces interzis" on admin pages', async () => {
    answerMe(STUDENT);
    renderApp({ route: '/admin/facilitati', token: 'token' });

    expect(
      await screen.findByRole('heading', { name: 'Acces interzis' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Administrare' }),
    ).not.toBeInTheDocument();
  });

  test('an anonymous visitor goes to login', async () => {
    renderApp({ route: '/admin' });

    expect(
      await screen.findByRole('button', { name: 'Autentificare' }),
    ).toBeInTheDocument();
  });

  test('the user menu shows "Administrare" to the admin only', async () => {
    answerMe(ADMIN);
    const { unmount } = renderApp({ route: '/profil', token: 'token' });

    await screen.findByRole('heading', { name: 'Profil' });
    const links = screen.getAllByRole('link', { name: 'Administrare' });
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute('href', '/admin'));
    unmount();

    answerMe(STUDENT);
    renderApp({ route: '/profil', token: 'token' });
    await screen.findByRole('heading', { name: 'Profil' });
    expect(
      screen.queryByRole('link', { name: 'Administrare' }),
    ).not.toBeInTheDocument();
  });
});
