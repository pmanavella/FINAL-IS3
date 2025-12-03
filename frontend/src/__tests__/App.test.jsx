// frontend/src/__tests__/App.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

beforeEach(() => {
  // mock limpio antes de cada test (evita conexiones reales)
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  });
  // aseguramos que alert exista como mock (sin spyOn)
  global.alert = vi.fn();
});

describe('App', () => {
  it('renderiza título y tabla con datos', async () => {
    // 1ª llamada: GET /api/books con datos
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, title: 'Clean Code', author: 'Robert', year: 2008, stock: 4, price: 22000 },
      ],
    });

    render(<App />);

    await screen.findByText('Clean Code');
    expect(fetch.mock.calls[0][0]).toMatch(/api\/books$/);
  });

  it('aplica búsqueda por texto', async () => {
    // GET inicial
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, title: 'Refactoring', author: 'Fowler', year: 1999, stock: 2, price: 1000 }],
    });

    render(<App />);
    await screen.findByText('Refactoring');

    // respuesta de la búsqueda
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 2, title: 'Design Patterns', author: 'Gamma', year: 1994, stock: 2, price: 2000 }],
    });

    const input = screen.getByPlaceholderText(/buscar por título o autor/i);
    fireEvent.change(input, { target: { value: 'Design' } });
    fireEvent.click(screen.getByText(/aplicar/i));

    await screen.findByText('Design Patterns');
    // la 2ª llamada incluye el query
    expect(fetch.mock.calls[1][0]).toMatch(/q=Design/);
  });
});

describe('App (crear)', () => {
  it('agrega libro (verifica POST con payload correcto)', async () => {
    // 1) GET inicial vacío
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<App />);
    await screen.findByText(/gestor de libros/i);

    // Preparamos que el POST responda con el creado (tu app NO refetchea)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 10, title: 'Libro E2', author: 'Autor', year: 2024, stock: 0, price: 0,
      }),
    });

    // Carga de formulario por etiquetas accesibles
    fireEvent.change(screen.getByLabelText(/^título/i), { target: { value: 'Libro E2' } });
    fireEvent.change(screen.getByLabelText(/^autor/i),  { target: { value: 'Autor' } });
    fireEvent.change(screen.getByLabelText(/^año/i),    { target: { value: '2024' } });

    fireEvent.click(screen.getByText(/agregar libro/i));

    // Esperamos a que se dispare el POST
    await waitFor(() => {
      // Debe haber 2 llamadas en total: GET inicial y POST
      expect(fetch).toHaveBeenCalledTimes(2);

      // La 2ª es el POST a /api/books
      const [url, opts] = fetch.mock.calls[1];
      expect(url).toMatch(/\/api\/books$/);
      expect(opts?.method).toBe('POST');

      // Validamos el payload enviado
      const sent = JSON.parse(opts?.body ?? '{}');
      expect(sent).toMatchObject({ title: 'Libro E2', author: 'Autor' });
      // año puede ser string o número según el form; permitimos ambas
      expect(String(sent.year)).toBe('2024');
    });

    // (Opcional): si querés, confirmar que se limpió el formulario o se mostró algún alert
    // expect(global.alert).not.toHaveBeenCalled(); // o lo que corresponda en tu app
  });
});
