import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { beforeEach, describe, expect, test } from 'vitest';

import { server } from '../../test/server';
import { renderApp } from '../../test/render';
import {
  ADMIN,
  COURT,
  facility,
  OLD_HALL,
  SPORTS,
  week,
} from './facilityFixtures';

let facilities;
let requests;

function useApi() {
  requests = [];
  server.use(
    http.get('/api/v1/users/me', () => HttpResponse.json(ADMIN)),
    http.get('/api/v1/sports', () => HttpResponse.json(SPORTS)),
    http.get('/api/v1/facilities', ({ request }) => {
      requests.push(['GET', new URL(request.url).search]);
      return HttpResponse.json(facilities);
    }),
  );
}

function renderPage() {
  renderApp({ route: '/admin/facilitati', token: 'token' });
}

async function table() {
  return within(await screen.findByRole('table', { name: 'Facilități' }));
}

async function openAddDrawer() {
  await screen.findByRole('table', { name: 'Facilități' });
  const [addButton] = screen.getAllByRole('button', {
    name: '+ Adaugă facilitate',
  });
  await userEvent.click(addButton);
  return screen.findByRole('dialog', { name: 'Adaugă facilitate' });
}

beforeEach(() => {
  facilities = [facility(), COURT, OLD_HALL];
  useApi();
});

describe('list', () => {
  test('shows a row per facility with price, program and status', async () => {
    renderPage();
    const rows = await table();

    const hall = rows.getByRole('row', { name: /Sală de baschet/ });
    expect(within(hall).getByText('Baschet')).toBeInTheDocument();
    expect(within(hall).getByText('Corp A')).toBeInTheDocument();
    expect(within(hall).getByText('120 lei')).toBeInTheDocument();
    expect(within(hall).getByText('08:00–22:00')).toBeInTheDocument();
    expect(within(hall).getByText('Activă')).toBeInTheDocument();

    const court = rows.getByRole('row', { name: /Teren de tenis/ });
    expect(within(court).getByText('12,50 lei')).toBeInTheDocument();
    expect(within(court).getByText('Fără restricție')).toBeInTheDocument();
    expect(within(court).getByText('În mentenanță')).toBeInTheDocument();
    expect(within(court).getByText('Refacere zgură')).toBeInTheDocument();

    const old = rows.getByRole('row', { name: /Sală veche/ });
    expect(within(old).getByText('Gratuit')).toBeInTheDocument();
    expect(within(old).getByText('Program variabil')).toBeInTheDocument();
    expect(within(old).getByText('—')).toBeInTheDocument();
    expect(within(old).getByText('Inactivă')).toBeInTheDocument();
    expect(requests[0]).toEqual(['GET', '?status=all']);
  });

  test('phone cards show the same facilities', async () => {
    renderPage();
    const cards = within(
      await screen.findByRole('list', {
        name: 'Facilități (listă pe telefon)',
      }),
    );

    expect(cards.getAllByRole('listitem')).toHaveLength(3);
    expect(cards.getByText('Baschet · Corp A')).toBeInTheDocument();
    expect(cards.getByText('120 lei / oră · 08:00–22:00')).toBeInTheDocument();
  });

  test('shows the loading state, then the empty state', async () => {
    facilities = [];
    renderPage();

    expect(screen.getByText('Se încarcă…')).toBeInTheDocument();
    expect(
      await screen.findByText('Nu există facilități încă'),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Adaugă prima facilitate' }),
    );
    expect(
      await screen.findByRole('dialog', { name: 'Adaugă facilitate' }),
    ).toBeInTheDocument();
  });

  test('shows a server error and retries', async () => {
    let fail = true;
    server.use(
      http.get('/api/v1/facilities', () =>
        fail
          ? HttpResponse.json(
              { code: 'INTERNAL_ERROR', message: 'x' },
              { status: 500 },
            )
          : HttpResponse.json(facilities),
      ),
    );
    renderPage();

    expect(
      await screen.findByText('A apărut o eroare pe server. Încearcă din nou.'),
    ).toBeInTheDocument();
    fail = false;
    await userEvent.click(
      screen.getByRole('button', { name: 'Încearcă din nou' }),
    );
    expect(await table()).toBeTruthy();
  });
});

describe('filters', () => {
  test('search ignores case and diacritics, in name and location', async () => {
    renderPage();
    await table();

    await userEvent.type(screen.getByLabelText('Caută facilitate'), 'SALA');
    let rows = await table();
    expect(rows.getByText('Sală de baschet')).toBeInTheDocument();
    expect(rows.getByText('Sală veche')).toBeInTheDocument();
    expect(rows.queryByText('Teren de tenis')).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Caută facilitate'));
    await userEvent.type(screen.getByLabelText('Caută facilitate'), 'parc');
    rows = await table();
    expect(rows.getByText('Teren de tenis')).toBeInTheDocument();
    expect(rows.queryByText('Sală veche')).not.toBeInTheDocument();
  });

  test('filters by sport and status; no match offers to clear', async () => {
    renderPage();
    await table();

    await userEvent.selectOptions(await screen.findByLabelText('Tip'), 'Tenis');
    let rows = await table();
    expect(rows.getByText('Teren de tenis')).toBeInTheDocument();
    expect(rows.queryByText('Sală veche')).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Stare'), 'Activă');
    expect(
      screen.getByText('Nicio facilitate nu corespunde căutării.'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Șterge filtrele' }),
    );
    rows = await table();
    expect(rows.getByText('Sală veche')).toBeInTheDocument();
    expect(screen.getByLabelText('Tip')).toHaveValue('');
  });
});

describe('add drawer', () => {
  async function fillRequired(dialog) {
    await userEvent.type(dialog.getByLabelText('Denumire'), ' Teren nou ');
    await userEvent.selectOptions(dialog.getByLabelText('Tip sport'), 'Tenis');
    await userEvent.type(
      dialog.getByLabelText('Capacitate (nr. persoane)'),
      '8',
    );
  }

  test('creates a facility with the exact body, toasts and refetches', async () => {
    let body;
    server.use(
      http.post('/api/v1/facilities', async ({ request }) => {
        body = await request.json();
        facilities = [...facilities, facility({ id: 13, name: 'Teren nou' })];
        return HttpResponse.json(facilities.at(-1), { status: 201 });
      }),
    );
    renderPage();
    const dialog = within(await openAddDrawer());
    expect(dialog.getByLabelText('Denumire')).toHaveFocus();

    await fillRequired(dialog);
    await userEvent.type(dialog.getByLabelText('Descriere'), 'Acoperit');
    await userEvent.click(dialog.getByRole('button', { name: 'Nocturnă' }));
    await userEvent.click(dialog.getByRole('radio', { name: 'Inactivă' }));
    await userEvent.click(dialog.getByRole('switch', { name: 'Luni închis' }));
    await userEvent.click(
      dialog.getByRole('button', { name: 'Salvează facilitatea' }),
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      '✓ Facilitatea a fost salvată',
    );
    expect(body).toEqual({
      sportId: 2,
      name: 'Teren nou',
      location: null,
      capacity: 8,
      description: 'Acoperit',
      pricePerHour: 0,
      hours: week({ 0: { closed: true, opensAt: null, closesAt: null } }),
      minBookingMinutes: 60,
      amenities: ['nocturna'],
      status: 'inactive',
    });
    expect(body).not.toHaveProperty('maintenanceNote');
    expect(
      screen.getByRole('dialog', { name: 'Editează facilitate' }),
    ).toBeInTheDocument();
    expect(
      (await table()).getByRole('row', { name: /Teren nou/ }),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(2);
  });

  test('"Program pe zile" off sends hours null', async () => {
    let body;
    server.use(
      http.post('/api/v1/facilities', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(facility(), { status: 201 });
      }),
    );
    renderPage();
    const dialog = within(await openAddDrawer());

    await fillRequired(dialog);
    await userEvent.click(
      dialog.getByRole('switch', { name: 'Program pe zile' }),
    );
    expect(dialog.queryByLabelText('Luni: deschide')).not.toBeInTheDocument();
    await userEvent.click(
      dialog.getByRole('button', { name: 'Salvează facilitatea' }),
    );

    await waitFor(() => expect(body).toBeDefined());
    expect(body.hours).toBeNull();
  });

  test('client validation blocks the request', async () => {
    let posted = false;
    server.use(
      http.post('/api/v1/facilities', () => {
        posted = true;
        return HttpResponse.json(facility(), { status: 201 });
      }),
    );
    renderPage();
    const dialog = within(await openAddDrawer());

    await userEvent.type(dialog.getByLabelText('Preț / oră (lei)'), '1');
    fireEvent.change(dialog.getByLabelText('Preț / oră (lei)'), {
      target: { value: '1.234' },
    });
    fireEvent.change(dialog.getByLabelText('Marți: închide'), {
      target: { value: '07:00' },
    });
    await userEvent.click(
      dialog.getByRole('button', { name: 'Salvează facilitatea' }),
    );

    expect(await dialog.findByText('Introdu denumirea.')).toBeInTheDocument();
    expect(dialog.getByText('Alege sportul.')).toBeInTheDocument();
    expect(
      dialog.getByText('Capacitatea este un număr întreg de cel puțin 1.'),
    ).toBeInTheDocument();
    expect(
      dialog.getByText('Prețul este un număr pozitiv, cu cel mult 2 zecimale.'),
    ).toBeInTheDocument();
    expect(
      dialog.getByText('Ora de închidere este după cea de deschidere.'),
    ).toBeInTheDocument();
    expect(posted).toBe(false);
  });

  test('shows server field errors under the fields, drawer stays open', async () => {
    server.use(
      http.post('/api/v1/facilities', () =>
        HttpResponse.json(
          {
            code: 'VALIDATION_ERROR',
            message: 'x',
            details: {
              fields: {
                name: 'Există deja o facilitate cu acest nume.',
                'hours.2.closesAt': 'Ora nu este validă.',
              },
            },
          },
          { status: 400 },
        ),
      ),
    );
    renderPage();
    const dialog = within(await openAddDrawer());

    await fillRequired(dialog);
    await userEvent.click(
      dialog.getByRole('button', { name: 'Salvează facilitatea' }),
    );

    expect(
      await dialog.findByText('Există deja o facilitate cu acest nume.'),
    ).toBeInTheDocument();
    expect(dialog.getByText('Ora nu este validă.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('another error is shown inside the drawer', async () => {
    server.use(
      http.post('/api/v1/facilities', () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'x' },
          { status: 500 },
        ),
      ),
    );
    renderPage();
    const dialog = within(await openAddDrawer());

    await fillRequired(dialog);
    await userEvent.click(
      dialog.getByRole('button', { name: 'Salvează facilitatea' }),
    );

    expect(await dialog.findByRole('alert')).toHaveTextContent(
      'A apărut o eroare pe server.',
    );
  });

  test('Escape, × and Anulează close the drawer', async () => {
    renderPage();
    await openAddDrawer();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await openAddDrawer();
    await userEvent.click(screen.getByRole('button', { name: 'Închide' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await openAddDrawer();
    await userEvent.click(screen.getByRole('button', { name: 'Anulează' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('edit drawer', () => {
  test('is prefilled; status maintenance with a note is patched', async () => {
    let patched;
    server.use(
      http.patch('/api/v1/facilities/10', async ({ request }) => {
        patched = await request.json();
        return HttpResponse.json(facility());
      }),
    );
    renderPage();
    const rows = await table();
    await userEvent.click(
      within(rows.getByRole('row', { name: /Sală de baschet/ })).getByRole(
        'button',
        { name: 'Editează' },
      ),
    );
    const dialog = within(
      await screen.findByRole('dialog', { name: 'Editează facilitate' }),
    );

    expect(dialog.getByLabelText('Denumire')).toHaveValue('Sală de baschet');
    expect(dialog.getByLabelText('Tip sport')).toHaveValue('1');
    expect(dialog.getByLabelText('Locație / clădire')).toHaveValue('Corp A');
    expect(dialog.getByLabelText('Capacitate (nr. persoane)')).toHaveValue(20);
    expect(dialog.getByLabelText('Preț / oră (lei)')).toHaveValue(120);
    expect(dialog.getByRole('button', { name: 'Duș' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(dialog.getByRole('radio', { name: 'Activă' })).toBeChecked();
    expect(
      dialog.queryByLabelText('Motiv / perioadă mentenanță'),
    ).not.toBeInTheDocument();

    await userEvent.click(dialog.getByRole('radio', { name: 'În mentenanță' }));
    await userEvent.type(
      dialog.getByLabelText('Motiv / perioadă mentenanță'),
      'Podea nouă',
    );
    await userEvent.click(
      dialog.getByRole('button', { name: 'Salvează facilitatea' }),
    );

    await waitFor(() => expect(patched).toBeDefined());
    expect(patched).toEqual({
      sportId: 1,
      name: 'Sală de baschet',
      location: 'Corp A',
      capacity: 20,
      description: null,
      pricePerHour: 120,
      hours: week(),
      minBookingMinutes: 60,
      amenities: ['dus'],
      status: 'maintenance',
      maintenanceNote: 'Podea nouă',
    });
  });

  test('a facility without a schedule starts with the switch off', async () => {
    renderPage();
    const rows = await table();
    await userEvent.click(
      within(rows.getByRole('row', { name: /Teren de tenis/ })).getByRole(
        'button',
        { name: 'Editează' },
      ),
    );
    const dialog = within(await screen.findByRole('dialog'));

    expect(
      dialog.getByRole('switch', { name: 'Program pe zile' }),
    ).toHaveAttribute('aria-checked', 'false');
    expect(dialog.getByLabelText('Motiv / perioadă mentenanță')).toHaveValue(
      'Refacere zgură',
    );
    await userEvent.click(
      dialog.getByRole('switch', { name: 'Program pe zile' }),
    );
    expect(dialog.getByLabelText('Luni: deschide')).toHaveValue('08:00');
    expect(dialog.getByLabelText('Duminică: închide')).toHaveValue('22:00');
  });
});

describe('deactivate and reactivate', () => {
  test('deactivating asks first, then patches the status', async () => {
    let patched;
    server.use(
      http.patch('/api/v1/facilities/10', async ({ request }) => {
        patched = await request.json();
        return HttpResponse.json(facility({ status: 'inactive' }));
      }),
    );
    renderPage();
    const rows = await table();
    await userEvent.click(
      within(rows.getByRole('row', { name: /Sală de baschet/ })).getByRole(
        'button',
        { name: 'Dezactivează' },
      ),
    );

    const dialog = within(
      await screen.findByRole('alertdialog', {
        name: 'Dezactivezi facilitatea „Sală de baschet”?',
      }),
    );
    expect(
      dialog.getByText(
        'Nu va mai apărea utilizatorilor. O poți reactiva oricând.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', { name: 'Dezactivează' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      '✓ Facilitatea a fost salvată',
    );
    expect(patched).toEqual({ status: 'inactive' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('Renunță leaves the facility alone', async () => {
    renderPage();
    const rows = await table();
    await userEvent.click(
      within(rows.getByRole('row', { name: /Sală de baschet/ })).getByRole(
        'button',
        { name: 'Dezactivează' },
      ),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Renunță' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('reactivating an inactive facility patches status active', async () => {
    let patched;
    server.use(
      http.patch('/api/v1/facilities/12', async ({ request }) => {
        patched = await request.json();
        return HttpResponse.json(facility({ id: 12 }));
      }),
    );
    renderPage();
    const rows = await table();
    await userEvent.click(
      within(rows.getByRole('row', { name: /Sală veche/ })).getByRole(
        'button',
        { name: 'Reactivează' },
      ),
    );

    const dialog = within(
      await screen.findByRole('alertdialog', {
        name: 'Reactivezi facilitatea „Sală veche”?',
      }),
    );
    await userEvent.click(dialog.getByRole('button', { name: 'Reactivează' }));

    await waitFor(() => expect(patched).toEqual({ status: 'active' }));
  });

  test('an error stays in the dialog', async () => {
    server.use(
      http.patch('/api/v1/facilities/10', () =>
        HttpResponse.json({ code: 'NOT_FOUND', message: 'x' }, { status: 404 }),
      ),
    );
    renderPage();
    const rows = await table();
    await userEvent.click(
      within(rows.getByRole('row', { name: /Sală de baschet/ })).getByRole(
        'button',
        { name: 'Dezactivează' },
      ),
    );
    const dialog = within(await screen.findByRole('alertdialog'));
    await userEvent.click(dialog.getByRole('button', { name: 'Dezactivează' }));

    expect(await dialog.findByRole('alert')).toHaveTextContent(
      'Nu am găsit ce ai căutat.',
    );
  });
});
