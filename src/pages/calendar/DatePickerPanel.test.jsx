import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { renderApp } from '../../test/render';
import { server } from '../../test/server';
// The calendar loads the panel lazily; importing it here first keeps that
// first load out of the tests' time limits.
import './DatePickerPanel';

const STUDENT = {
  id: 2,
  fullName: 'Ana Popescu',
  email: 'ana@campus.test',
  role: 'student',
  status: 'active',
  blockedUntil: null,
  bookingsThisMonth: 0,
  monthlyLimit: 1,
  noShowCount: 0,
};

// A free slot on 12 November, the day that gets a dot.
const FREE_SLOT = {
  id: 7,
  facilityId: 1,
  facilityName: 'Teren fotbal sintetic',
  sportName: 'Fotbal',
  startsAt: '2026-11-12T14:00:00.000Z',
  endsAt: '2026-11-12T15:00:00.000Z',
  availability: 'free',
  price: 60,
  auctionClosesAt: null,
};

let dayRequests;
let rangeRequests;

beforeEach(() => {
  // Only Date is faked: Tuesday 10 November 2026, 12:00 in Romania.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-10T10:00:00Z'));
  dayRequests = [];
  rangeRequests = [];
  server.use(
    http.get('/api/v1/users/me', () => HttpResponse.json(STUDENT)),
    http.get('/api/v1/sports', () => HttpResponse.json([])),
    http.get('/api/v1/facilities', () => HttpResponse.json([])),
    http.get('/api/v1/slots', ({ request }) => {
      const params = Object.fromEntries(new URL(request.url).searchParams);
      if (params.date) {
        dayRequests.push(params.date);
        return HttpResponse.json([]);
      }
      rangeRequests.push(params);
      return HttpResponse.json([FREE_SLOT]);
    }),
  );
});
afterEach(() => vi.useRealTimers());

async function openPanel(user) {
  renderApp({ route: '/calendar', token: 'token' });
  await user.click(await screen.findByRole('button', { name: 'Alege data' }));
  return screen.findByRole('dialog', { name: 'Alege data' });
}

const dayButton = (panel, name) =>
  within(panel).getByRole('button', { name: new RegExp(name) });

describe('panel 02a Alege data', () => {
  test('shows the month with past days disabled and dots on free days', async () => {
    const user = userEvent.setup();
    const panel = await openPanel(user);

    expect(within(panel).getByText('Data selectată')).toBeInTheDocument();
    expect(
      within(panel).getByText('Marți, 10 noiembrie 2026'),
    ).toBeInTheDocument();
    expect(dayButton(panel, '^luni, 9 noiembrie 2026')).toBeDisabled();
    expect(dayButton(panel, '^Astăzi, marți, 10 noiembrie 2026')).toBeEnabled();

    // One request for the month's free slots, within the API's 31 days.
    await waitFor(() => expect(rangeRequests).toHaveLength(1));
    const { from, to, available } = rangeRequests[0];
    expect(available).toBe('true');
    expect(new Date(to) - new Date(from)).toBeLessThanOrEqual(31 * 86400000);
    await waitFor(() =>
      expect(
        dayButton(panel, '^joi, 12 noiembrie 2026').closest('td'),
      ).toHaveClass('rdp-has-free'),
    );
    expect(
      dayButton(panel, '^vineri, 13 noiembrie 2026').closest('td'),
    ).not.toHaveClass('rdp-has-free');
  });

  test('a day outside the strip starts a new week there and loads it', async () => {
    const user = userEvent.setup();
    const panel = await openPanel(user);

    await user.click(dayButton(panel, '^vineri, 20 noiembrie 2026'));
    expect(
      within(panel).getByText('Vineri, 20 noiembrie 2026'),
    ).toBeInTheDocument();
    await user.click(within(panel).getByRole('button', { name: 'Alege data' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(dayRequests.at(-1)).toBe('2026-11-20'));
    expect(
      screen.getByRole('button', { name: 'Vineri, 20 noiembrie 2026' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Joi, 26 noiembrie 2026' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Marți, 10 noiembrie 2026' }),
    ).toBeNull();
  });

  test('a day inside the strip only moves the selection', async () => {
    const user = userEvent.setup();
    const panel = await openPanel(user);

    await user.click(dayButton(panel, '^joi, 12 noiembrie 2026'));
    await user.click(within(panel).getByRole('button', { name: 'Alege data' }));

    await waitFor(() => expect(dayRequests.at(-1)).toBe('2026-11-12'));
    // The week still starts today.
    expect(
      screen.getByRole('button', { name: 'Marți, 10 noiembrie 2026' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  test('closes without a change with ×, Escape or a click outside', async () => {
    const user = userEvent.setup();
    let panel = await openPanel(user);
    await user.click(dayButton(panel, '^vineri, 20 noiembrie 2026'));
    await user.click(within(panel).getByRole('button', { name: 'Închide' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Alege data' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Alege data' }));
    panel = await screen.findByRole('dialog');
    await user.click(panel.parentElement);
    expect(screen.queryByRole('dialog')).toBeNull();

    // Still today, as before the panel opened.
    expect(dayRequests.every((day) => day === '2026-11-10')).toBe(true);
  });
});
