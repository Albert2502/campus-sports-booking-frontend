import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { beforeEach, describe, expect, test } from 'vitest';

import { addDays, formatLongDay, formatTime, today } from '../lib/dates';
import { renderApp } from '../test/render';
import { server } from '../test/server';

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

const FACILITIES = [
  {
    id: 1,
    name: 'Teren fotbal sintetic',
    sport: { id: 1, name: 'Fotbal' },
    capacity: 14,
    pricePerHour: 60,
    images: [],
  },
  {
    id: 3,
    name: 'Teren tenis 1',
    sport: { id: 3, name: 'Tenis' },
    capacity: 4,
    pricePerHour: 40,
    images: [],
  },
];

const DAY = today();

let nextId = 1;
function slot(facility, hourUtc, availability) {
  const startsAt = `${DAY}T${String(hourUtc).padStart(2, '0')}:00:00.000Z`;
  return {
    id: nextId++,
    facilityId: facility.id,
    facilityName: facility.name,
    sportName: facility.sport.name,
    startsAt,
    endsAt: startsAt,
    availability,
    price: facility.pricePerHour,
    auctionClosesAt: null,
  };
}

const [FOOTBALL, TENNIS] = FACILITIES;
const free = slot(FOOTBALL, 14, 'free');
const occupied = slot(FOOTBALL, 15, 'occupied');
const closed = slot(TENNIS, 14, 'closed');

let slotRequests;
let slotsAnswer;

function answer(slots) {
  slotsAnswer = () => HttpResponse.json(slots);
}

beforeEach(() => {
  slotRequests = [];
  answer([free, occupied, closed]);
  server.use(
    http.get('/api/v1/users/me', () => HttpResponse.json(STUDENT)),
    http.get('/api/v1/sports', () =>
      HttpResponse.json([
        { id: 1, name: 'Fotbal' },
        { id: 3, name: 'Tenis' },
      ]),
    ),
    http.get('/api/v1/facilities', () => HttpResponse.json(FACILITIES)),
    http.get('/api/v1/slots', ({ request }) => {
      slotRequests.push(Object.fromEntries(new URL(request.url).searchParams));
      return slotsAnswer();
    }),
  );
});

const lastRequest = () => slotRequests.at(-1);
const slotButton = (item, state) =>
  screen.getByRole('button', {
    name: `${formatTime(item.startsAt)}, ${state}`,
  });

async function openCalendar() {
  renderApp({ route: '/calendar', token: 'token' });
  await screen.findByRole('heading', { name: 'Teren fotbal sintetic' });
}

describe('screen 02 Calendar și filtre', () => {
  test("shows today's slots by facility, with their state", async () => {
    await openCalendar();
    expect(lastRequest()).toEqual({ date: DAY });
    expect(screen.getByText('Fotbal · 14 jucători')).toBeInTheDocument();
    expect(slotButton(free, 'liber')).toBeEnabled();
    expect(slotButton(occupied, 'ocupat')).toBeDisabled();
    expect(slotButton(closed, 'închis')).toBeDisabled();
    expect(
      screen.getByText('1 interval liber · Toată ziua'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: formatLongDay(DAY) }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('reloads the slots when the day or a filter changes', async () => {
    const user = userEvent.setup();
    await openCalendar();

    const tomorrow = addDays(DAY, 1);
    await user.click(
      screen.getByRole('button', { name: formatLongDay(tomorrow) }),
    );
    await waitFor(() => expect(lastRequest()).toEqual({ date: tomorrow }));

    await user.click(screen.getByRole('button', { name: 'Tenis' }));
    await waitFor(() =>
      expect(lastRequest()).toEqual({ date: tomorrow, sportId: '3' }),
    );

    await user.click(screen.getByRole('button', { name: '16:00–20:00' }));
    await waitFor(() =>
      expect(lastRequest()).toEqual({
        date: tomorrow,
        sportId: '3',
        fromTime: '16:00',
        toTime: '20:00',
      }),
    );

    // The phone menus change the same filters.
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tip sport' }),
      '1',
    );
    await waitFor(() => expect(lastRequest().sportId).toBe('1'));

    await user.click(screen.getAllByRole('button', { name: 'Resetează' })[0]);
    await waitFor(() => expect(lastRequest()).toEqual({ date: tomorrow }));
  });

  test('a free slot shows its price and Continuă; changing the day drops it', async () => {
    const user = userEvent.setup();
    await openCalendar();

    await user.click(slotButton(free, 'liber'));
    expect(slotButton(free, 'selectat')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('60 lei / oră')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuă' })).toHaveAttribute(
      'href',
      `/facilitati/1?interval=${free.id}`,
    );

    await user.click(
      screen.getByRole('button', { name: formatLongDay(addDays(DAY, 2)) }),
    );
    expect(screen.queryByRole('link', { name: 'Continuă' })).toBeNull();
  });

  test('phones show four slots per facility, then "+N intervale"', async () => {
    const user = userEvent.setup();
    answer(
      [12, 13, 14, 15, 16, 17].map((hour) => slot(FOOTBALL, hour, 'free')),
    );
    await openCalendar();

    const card = screen
      .getByRole('heading', { name: 'Teren fotbal sintetic' })
      .closest('section');
    const hiddenItems = () =>
      within(card)
        .getAllByRole('listitem', { hidden: true })
        .filter((item) => item.classList.contains('hidden'));
    expect(hiddenItems()).toHaveLength(2);

    await user.click(
      within(card).getByRole('button', { name: '+2 intervale' }),
    );
    expect(hiddenItems()).toHaveLength(0);
    expect(
      within(card).queryByRole('button', { name: /intervale/ }),
    ).toBeNull();
  });

  test('says when a day has no slots, and offers to clear the filters', async () => {
    const user = userEvent.setup();
    answer([]);
    renderApp({ route: '/calendar', token: 'token' });
    expect(
      await screen.findByText('Nu există intervale pentru ziua aleasă.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Șterge filtrele' }),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Tenis' }));
    await user.click(
      await screen.findByRole('button', { name: 'Șterge filtrele' }),
    );
    await waitFor(() => expect(lastRequest()).toEqual({ date: DAY }));
  });

  test('shows the server error and retries', async () => {
    const user = userEvent.setup();
    slotsAnswer = () =>
      HttpResponse.json(
        { code: 'INTERNAL_ERROR', message: 'x' },
        { status: 500 },
      );
    renderApp({ route: '/calendar', token: 'token' });
    expect(
      await screen.findByText('A apărut o eroare pe server. Încearcă din nou.'),
    ).toBeInTheDocument();

    answer([free]);
    await user.click(screen.getByRole('button', { name: 'Încearcă din nou' }));
    expect(
      await screen.findByRole('heading', { name: 'Teren fotbal sintetic' }),
    ).toBeInTheDocument();
  });
});
