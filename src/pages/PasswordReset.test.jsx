import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { beforeEach, describe, expect, test } from 'vitest';

import { renderApp } from '../test/render';
import { server } from '../test/server';

let requests;

function answer(path, resolver) {
  server.use(
    http.post(path, async ({ request }) => {
      requests.push(await request.json());
      return resolver();
    }),
  );
}

beforeEach(() => {
  requests = [];
});

describe('Ai uitat parola?', () => {
  test('opens from the login screen', async () => {
    renderApp({ route: '/login' });
    await userEvent.click(
      await screen.findByRole('link', { name: 'Ai uitat parola?' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Ai uitat parola?' }),
    ).toBeInTheDocument();
  });

  test('shows the same confirmation whatever the email', async () => {
    answer(
      '/api/v1/auth/password-reset',
      () => new HttpResponse(null, { status: 202 }),
    );
    renderApp({ route: '/parola-uitata' });
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText('Email instituțional'),
      ' ana@campus.test ',
    );
    await user.click(screen.getByRole('button', { name: 'Trimite linkul' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Dacă adresa are un cont, am trimis un email',
    );
    expect(requests).toEqual([{ email: 'ana@campus.test' }]);
  });

  test('checks the email before sending', async () => {
    renderApp({ route: '/parola-uitata' });
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText('Email instituțional'),
      'nu-e-email',
    );
    await user.click(screen.getByRole('button', { name: 'Trimite linkul' }));

    expect(
      screen.getByLabelText('Email instituțional'),
    ).toHaveAccessibleDescription('Introdu o adresă de email validă.');
    expect(requests).toHaveLength(0);
  });

  test('shows a server error', async () => {
    answer('/api/v1/auth/password-reset', () =>
      HttpResponse.json(
        { code: 'INTERNAL_ERROR', message: 'x' },
        { status: 500 },
      ),
    );
    renderApp({ route: '/parola-uitata' });
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText('Email instituțional'),
      'ana@campus.test',
    );
    await user.click(screen.getByRole('button', { name: 'Trimite linkul' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A apărut o eroare pe server.',
    );
  });
});

describe('Parolă nouă (link from the email)', () => {
  async function submit(next, repeat = next) {
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText('Parola nouă', { exact: true }),
      next,
    );
    await user.type(screen.getByLabelText('Repetă parola nouă'), repeat);
    await user.click(screen.getByRole('button', { name: 'Salvează parola' }));
  }

  test('sets the password and returns to login with a notice', async () => {
    answer(
      '/api/v1/auth/password-reset/confirm',
      () => new HttpResponse(null, { status: 204 }),
    );
    renderApp({ route: '/resetare-parola?token=abc.def%2Bghi' });

    await submit('parola-noua');

    expect(
      await screen.findByRole('heading', { name: 'Autentificare' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Parola a fost schimbată.',
    );
    expect(requests).toEqual([
      { token: 'abc.def+ghi', newPassword: 'parola-noua' },
    ]);
  });

  test('explains an expired or used link and offers a new one', async () => {
    answer('/api/v1/auth/password-reset/confirm', () =>
      HttpResponse.json(
        { code: 'RESET_TOKEN_INVALID', message: 'x' },
        { status: 410 },
      ),
    );
    renderApp({ route: '/resetare-parola?token=vechi' });

    await submit('parola-noua');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Linkul de resetare a expirat sau a fost deja folosit.',
    );
    expect(
      screen.getByRole('link', { name: 'Cere un link nou' }),
    ).toHaveAttribute('href', '/parola-uitata');
    expect(
      screen.queryByRole('button', { name: 'Salvează parola' }),
    ).not.toBeInTheDocument();
  });

  test('without a token shows no form', async () => {
    renderApp({ route: '/resetare-parola' });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Linkul nu este complet.',
    );
    expect(
      screen.queryByRole('button', { name: 'Salvează parola' }),
    ).not.toBeInTheDocument();
  });

  test('checks the repeated password before sending', async () => {
    renderApp({ route: '/resetare-parola?token=t' });

    await submit('parola-noua', 'alta-parola');

    expect(await screen.findByText('Parolele nu coincid.')).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  test('shows the server rule for the new password under the field', async () => {
    answer('/api/v1/auth/password-reset/confirm', () =>
      HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Date invalide',
          details: {
            fields: {
              newPassword:
                'Parola nouă e prea lungă (cel mult 72 de caractere).',
            },
          },
        },
        { status: 400 },
      ),
    );
    renderApp({ route: '/resetare-parola?token=t' });

    await submit('ă'.repeat(40));

    expect(
      await screen.findByLabelText('Parola nouă', { exact: true }),
    ).toHaveAccessibleDescription(
      'Parola nouă e prea lungă (cel mult 72 de caractere).',
    );
  });
});
