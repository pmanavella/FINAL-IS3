// frontend/src/__tests__/services.api.test.js
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { API } from '../api';

global.fetch = vi.fn();

beforeEach(() => fetch.mockReset());

const ok = (data, status = 200) =>
  Promise.resolve({ ok: true, status, json: () => Promise.resolve(data) });

const ko = (status = 422, message = 'error') =>
  Promise.resolve({ ok: false, status, json: () => Promise.resolve({ message }) });

describe('API client', () => {
  // OKs
  test('list OK', async () => {
    fetch.mockImplementationOnce(() => ok([{ id: 1 }]));
    const res = await API.list();
    expect(res.length).toBe(1);
  });

  test('create OK', async () => {
    fetch.mockImplementationOnce(() => ok({ id: 2 }));
    const res = await API.create({ title: 'A' });
    expect(res.id).toBe(2);
  });

  test('update OK', async () => {
    fetch.mockImplementationOnce(() => ok({ updated: true }));
    const res = await API.update(1, { title: 'B' });
    expect(res.updated).toBe(true);
  });

  test('remove OK', async () => {
    fetch.mockImplementationOnce(() => ok({ deleted: true }));
    const res = await API.remove(1);
    expect(res.deleted).toBe(true);
  });

  // KOs (rechaza con {status, message})
  test('create 422', async () => {
    fetch.mockImplementationOnce(() => ko(422, 'error'));
    await expect(API.create({})).rejects.toMatchObject({ status: 422 });
  });

  test('update 404', async () => {
    fetch.mockImplementationOnce(() => ko(404, 'not found'));
    await expect(API.update(9, {})).rejects.toMatchObject({ status: 404 });
  });

  test('remove 409', async () => {
    fetch.mockImplementationOnce(() => ko(409, 'conflict'));
    await expect(API.remove(1)).rejects.toMatchObject({ status: 409 });
  });

  // Firma de llamada (url + method)
  test.each([
    ['GET',    '/api/books',   () => API.list()],
    ['POST',   '/api/books',   () => API.create({ t: 'a' })],
    ['PUT',    '/api/books/1', () => API.update(1, {})],
    ['DELETE', '/api/books/1', () => API.remove(1)],
  ])('headers básicos %s %s', async (method, url, run) => {
    fetch.mockImplementationOnce((u, opts = {}) => {
      expect(u).toBe(url);
      if (method !== 'GET') expect(opts.method).toBe(method);
      return ok({});
    });
    await run();
  });
});
