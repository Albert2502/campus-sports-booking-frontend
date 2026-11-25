import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { beforeEach, describe, expect, test } from 'vitest';

import { server } from '../../test/server';
import { renderApp } from '../../test/render';
import { ADMIN, facility, SPORTS } from './facilityFixtures';

const IMAGES = [
  { id: 1, url: '/uploads/facilities/10/a.jpg', position: 1 },
  { id: 2, url: '/uploads/facilities/10/b.jpg', position: 2 },
];

let facilities;
let listGets;

function png(name) {
  return new File(['x'], name, { type: 'image/png' });
}

beforeEach(() => {
  facilities = [facility({ images: IMAGES })];
  listGets = 0;
  server.use(
    http.get('/api/v1/users/me', () => HttpResponse.json(ADMIN)),
    http.get('/api/v1/sports', () => HttpResponse.json(SPORTS)),
    http.get('/api/v1/facilities', () => {
      listGets += 1;
      return HttpResponse.json(facilities);
    }),
  );
});

async function openEditDrawer() {
  renderApp({ route: '/admin/facilitati', token: 'token' });
  const rows = within(await screen.findByRole('table', { name: 'Facilități' }));
  await userEvent.click(rows.getByRole('button', { name: 'Editează' }));
  return within(
    await screen.findByRole('dialog', { name: 'Editează facilitate' }),
  );
}

describe('add mode', () => {
  test('only says to save first; after creating, images are available', async () => {
    server.use(
      http.post('/api/v1/facilities', () =>
        HttpResponse.json(facility({ id: 13, name: 'Teren nou' }), {
          status: 201,
        }),
      ),
    );
    renderApp({ route: '/admin/facilitati', token: 'token' });
    await screen.findByRole('table', { name: 'Facilități' });
    const [addButton] = screen.getAllByRole('button', {
      name: '+ Adaugă facilitate',
    });
    await userEvent.click(addButton);
    const dialog = within(
      await screen.findByRole('dialog', { name: 'Adaugă facilitate' }),
    );

    expect(
      dialog.getByText('Salvează facilitatea ca să adaugi imagini.'),
    ).toBeInTheDocument();
    expect(dialog.queryByLabelText('Adaugă imagini')).not.toBeInTheDocument();

    await userEvent.type(dialog.getByLabelText('Denumire'), 'Teren nou');
    await userEvent.selectOptions(dialog.getByLabelText('Tip sport'), 'Tenis');
    await userEvent.type(
      dialog.getByLabelText('Capacitate (nr. persoane)'),
      '8',
    );
    await userEvent.click(
      dialog.getByRole('button', { name: 'Salvează facilitatea' }),
    );

    const edit = within(
      await screen.findByRole('dialog', { name: 'Editează facilitate' }),
    );
    expect(edit.getByLabelText('Adaugă imagini')).toBeInTheDocument();
    expect(edit.getByLabelText('Denumire')).toHaveValue('Teren nou');
    expect(await screen.findByRole('status')).toHaveTextContent(
      '✓ Facilitatea a fost salvată',
    );
  });
});

describe('edit mode', () => {
  test('shows a preview per image, the first one marked as thumbnail', async () => {
    const dialog = await openEditDrawer();

    expect(
      dialog.getByAltText('Imaginea 1 a facilității Sală de baschet'),
    ).toHaveAttribute('src', IMAGES[0].url);
    expect(
      dialog.getByAltText('Imaginea 2 a facilității Sală de baschet'),
    ).toHaveAttribute('src', IMAGES[1].url);
    expect(dialog.getAllByText('Miniatură')).toHaveLength(1);
    expect(
      dialog.getByRole('button', { name: 'Șterge imaginea 2' }),
    ).toBeInTheDocument();
  });

  test('saving an edit still closes the drawer', async () => {
    server.use(
      http.patch('/api/v1/facilities/10', () =>
        HttpResponse.json(facility({ images: IMAGES })),
      ),
    );
    const dialog = await openEditDrawer();
    await userEvent.click(
      dialog.getByRole('button', { name: 'Salvează facilitatea' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  test('uploads picked files one after another and appends previews', async () => {
    const names = [];
    server.use(
      http.post('/api/v1/facilities/10/images', async ({ request }) => {
        const form = await request.formData();
        names.push(form.get('image').name);
        const id = 100 + names.length;
        return HttpResponse.json(
          { id, url: `/uploads/facilities/10/${id}.png`, position: id },
          { status: 201 },
        );
      }),
    );
    const dialog = await openEditDrawer();
    const gets = listGets;

    await userEvent.upload(dialog.getByLabelText('Adaugă imagini'), [
      png('teren.png'),
      png('vestiar.png'),
    ]);

    expect(
      await dialog.findByAltText('Imaginea 4 a facilității Sală de baschet'),
    ).toBeInTheDocument();
    expect(names).toEqual(['teren.png', 'vestiar.png']);
    await waitFor(() => expect(listGets).toBeGreaterThan(gets));
  });

  test('shows each failure with the file name and keeps uploading', async () => {
    server.use(
      http.post('/api/v1/facilities/10/images', async ({ request }) => {
        const name = (await request.formData()).get('image').name;
        if (name === 'a.png') {
          return HttpResponse.json(
            {
              code: 'IMAGE_LIMIT_REACHED',
              message: 'Ai atins limita de 5 imagini.',
            },
            { status: 422 },
          );
        }
        if (name === 'b.png') {
          return HttpResponse.json(
            {
              code: 'VALIDATION_ERROR',
              message: 'x',
              details: { fields: { image: 'Fișierul depășește 5 MB.' } },
            },
            { status: 400 },
          );
        }
        return HttpResponse.json(
          { id: 200, url: '/uploads/facilities/10/c.png', position: 3 },
          { status: 201 },
        );
      }),
    );
    const dialog = await openEditDrawer();

    await userEvent.upload(dialog.getByLabelText('Adaugă imagini'), [
      png('a.png'),
      png('b.png'),
      png('c.png'),
    ]);

    const alert = await dialog.findByRole('alert');
    await waitFor(() =>
      expect(alert).toHaveTextContent('a.png: Ai atins limita de 5 imagini.'),
    );
    expect(alert).toHaveTextContent('b.png: Fișierul depășește 5 MB.');
    expect(
      await dialog.findByAltText('Imaginea 3 a facilității Sală de baschet'),
    ).toBeInTheDocument();
  });

  test('dropping files uploads them', async () => {
    let name;
    server.use(
      http.post('/api/v1/facilities/10/images', async ({ request }) => {
        name = (await request.formData()).get('image').name;
        return HttpResponse.json(
          { id: 300, url: '/uploads/facilities/10/d.png', position: 3 },
          { status: 201 },
        );
      }),
    );
    const dialog = await openEditDrawer();
    const zone = dialog.getByLabelText('Adaugă imagini').closest('label');

    fireEvent.drop(zone, { dataTransfer: { files: [png('dropped.png')] } });

    expect(
      await dialog.findByAltText('Imaginea 3 a facilității Sală de baschet'),
    ).toBeInTheDocument();
    expect(name).toBe('dropped.png');
  });

  test('deletes an image at once and removes its preview', async () => {
    let deleted;
    server.use(
      http.delete('/api/v1/facilities/10/images/:imageId', ({ params }) => {
        deleted = params.imageId;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const dialog = await openEditDrawer();

    await userEvent.click(
      dialog.getByRole('button', { name: 'Șterge imaginea 1' }),
    );

    await waitFor(() =>
      expect(
        dialog.queryByAltText('Imaginea 2 a facilității Sală de baschet'),
      ).not.toBeInTheDocument(),
    );
    expect(deleted).toBe('1');
  });

  test('a failed delete shows the message and keeps the preview', async () => {
    server.use(
      http.delete('/api/v1/facilities/10/images/:imageId', () =>
        HttpResponse.json({ code: 'NOT_FOUND', message: 'x' }, { status: 404 }),
      ),
    );
    const dialog = await openEditDrawer();

    await userEvent.click(
      dialog.getByRole('button', { name: 'Șterge imaginea 1' }),
    );

    expect(await dialog.findByRole('alert')).toHaveTextContent(
      'Nu am găsit ce ai căutat.',
    );
    expect(
      dialog.getByAltText('Imaginea 2 a facilității Sală de baschet'),
    ).toBeInTheDocument();
    expect(
      dialog.getByRole('button', { name: 'Șterge imaginea 1' }),
    ).toBeEnabled();
  });
});
