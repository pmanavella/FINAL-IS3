jest.mock('../db', () => ({ query: jest.fn() }));
const db = require('../db');

const supertest = require('supertest');
const app = require('../index');
const request = supertest(app);

describe('Books API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/books devuelve lista', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, title: 'Clean Code', author: 'Robert C. Martin', year: 2008, stock: 4, price: 22000 }], []]);

    const res = await request.get('/api/books');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('Clean Code');
    expect(db.query).toHaveBeenCalled(); // con SELECT * FROM books ...
  });

  test('GET /books también funciona (ruta alternativa)', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1 }], []]);

    const res = await request.get('/books'); // 👈 sin request(app)
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /api/books filtra por q y ordena', async () => {
    db.query.mockResolvedValueOnce([[{ id: 2, title: 'Refactoring', author: 'Fowler', year: 1999, stock: 2, price: 1000 }], []]);

    const res = await request.get('/api/books?q=Refa&sort=title_desc');
    expect(res.status).toBe(200);
    expect(db.query.mock.calls[0][0]).toMatch(/where/i);
    expect(db.query.mock.calls[0][0]).toMatch(/order by/i);
    expect(res.body[0].title).toBe('Refactoring');
  });

  test('POST /api/books valida faltantes', async () => {
    const res = await request.post('/api/books').send({ title: 'X' });
    expect(res.status).toBe(400);
  });

  test('POST /api/books crea libro', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 10, affectedRows: 1 }, []]); // insert
    const body = { title: 'Libro', author: 'Autor', year: 2020, stock: 5, price: 99.5 };

    const res = await request.post('/api/books').send(body);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(10);
    expect(db.query.mock.calls[0][0]).toMatch(/insert into books/i);
  });

  test('PUT /api/books/:id actualiza', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const res = await request
      .put('/api/books/10')
      .send({ title: 'A', author: 'B', year: 2001, stock: 3, price: 5 });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(10);
  });

  test('DELETE /api/books/:id elimina', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const res = await request.delete('/api/books/5');
    expect(res.status).toBe(204);
  });

  test('DELETE /api/books/:id 404 si no existe', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
    const res = await request.delete('/api/books/999');
    expect(res.status).toBe(404);
  });
});
