jest.mock('../db', () => ({ query: jest.fn() }));
const db = require('../db');

const supertest = require('supertest');
const app = require('../index');            // exporta el app de Express
const request = supertest(app);             // request queda listo

describe('Loans & Sales', () => {
  beforeEach(() => jest.clearAllMocks());

  test('POST /api/books/:id/loan falla si sin stock', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, stock: 0, price: 100 }], []]); // select book

    const res = await request
      .post('/api/books/1/loan')
      .send({ borrowerName: 'Pili', borrowerEmail: 'p@p.com', days: 2 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Sin stock/i);
  });

  test('POST /api/books/:id/loan OK', async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1, stock: 2, price: 100 }], []])               // select book
      .mockResolvedValueOnce([{ insertId: 7, affectedRows: 1 }, []])                // insert loan
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])                              // update stock
      .mockResolvedValueOnce([[{ id: 7, book_id: 1, status: 'activo' }], []]);      // select loan

    const res = await request
      .post('/api/books/1/loan')
      .send({ borrowerName: 'Pili', borrowerEmail: 'p@p.com', days: 3 });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(7);
    expect(res.body.status).toBe('activo');
  });

  test('POST /api/books/:id/sell stock insuficiente', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, stock: 1, price: 50 }], []]); // select book

    const res = await request
      .post('/api/books/1/sell')
      .send({ buyerName: 'Jose', quantity: 3 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/insuficiente/i);
  });

  test('POST /api/books/:id/sell OK', async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1, stock: 5, price: 10 }], []])                // select book
      .mockResolvedValueOnce([{ insertId: 9, affectedRows: 1 }, []])                // insert sale
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])                              // update stock
      .mockResolvedValueOnce([[{ id: 9, book_id: 1, quantity: 2, total_price: 20 }], []]); // select sale

    const res = await request
      .post('/api/books/1/sell')
      .send({ buyerName: 'Ana', quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.total_price).toBe(20);
  });

  test('GET /api/loans y /api/sales listan', async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1 }], []]) // loans
      .mockResolvedValueOnce([[{ id: 2 }], []]); // sales

    const r1 = await request.get('/api/loans');
    const r2 = await request.get('/api/sales');
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });
});
