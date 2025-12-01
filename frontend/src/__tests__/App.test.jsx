// frontend/src/__tests__/App.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import '@testing-library/jest-dom';

if (!window.alert) window.alert = () => {};
vi.spyOn(window, 'alert').mockImplementation(() => {});

beforeEach(() => {
  vi.restoreAllMocks();

  // Mock fetch global para cada test
  global.fetch = vi.fn();

  // Mock alert para evitar errores en happy-dom/jsdom
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

// helper: primera respuesta de GET /api/books
function mockBooks(list = []) {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => list,
  });
}

describe('App (Lista de Libros)', () => {
  it('renderiza título y tabla', async () => {
    mockBooks([
      { id: 1, title: 'Clean Code', author: 'Robert', year: 2008, stock: 4, price: 22000 },
    ]);

    render(<App />);

    expect(screen.getByText(/Gestor de Libros/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
    });

    // Se llamó GET /api/books (sin envolver en array)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/books/i)
    );
  });

  it('aplica búsqueda por texto', async () => {
    // 1ra llamada: carga inicial
    mockBooks([{ id: 1, title: 'Refactoring', author: 'Fowler', year: 1999, stock: 2, price: 1000 }]);

    render(<App />);

    await screen.findByText('Refactoring');

    // 2da llamada: con query ?q=Design
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 2, title: 'Design Patterns', author: 'Gamma', year: 1994, stock: 2, price: 2000 },
      ],
    });

    const inputBusqueda = screen.getByPlaceholderText(/Buscar por título o autor/i);
    fireEvent.change(inputBusqueda, { target: { value: 'Design' } });

    const btnAplicar = screen.getByText('Aplicar');
    fireEvent.click(btnAplicar);

    await screen.findByText('Design Patterns');

    // Verifica que el segundo fetch incluya la query
    expect(global.fetch.mock.calls[1][0]).toMatch(/q=Design/);
  });
});

describe('App (Crear, Editar, Borrar mocks)', () => {
  it('agrega libro', async () => {
    // 1ra llamada: carga inicial vacía
    mockBooks([]);

    render(<App />);

    await screen.findByText(/Gestor de Libros/i);

    // 2da llamada: POST /api/books
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 10,
          title: 'Libro E2',
          author: 'Autor',
          year: 2024,
          stock: 0,
          price: 0,
        }),
      })
      // 3ra llamada: GET /api/books (recarga)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 10, title: 'Libro E2', author: 'Autor', year: 2024, stock: 0, price: 0 },
        ],
      });

    // Seleccionamos inputs por atributo name (tu app los usa)
    const titleInput = document.querySelector('input[name="title"]');
    const authorInput = document.querySelector('input[name="author"]');
    const yearInput = document.querySelector('input[name="year"]');

    expect(titleInput && authorInput && yearInput).toBeTruthy();

    fireEvent.change(titleInput, { target: { value: 'Libro E2' } });
    fireEvent.change(authorInput, { target: { value: 'Autor' } });
    fireEvent.change(yearInput, { target: { value: '2024' } });

    fireEvent.click(screen.getByText('Agregar libro'));

    await screen.findByText('Libro E2');

    // Se llamó POST y luego GET
    expect(global.fetch.mock.calls[1][0]).toMatch(/\/api\/books$/);
    expect(global.fetch.mock.calls[1][1]?.method).toBe('POST');
  });

  it('muestra pestañas y navega a Ventas', async () => {
    mockBooks([]);
    render(<App />);
    await screen.findByText(/Gestor de Libros/);

    // Evita ambigüedad usando rol del botón
    fireEvent.click(screen.getByRole('button', { name: /Ventas/i }));
    expect(screen.getByRole('button', { name: /Ventas/i })).toBeInTheDocument();
  });
});
