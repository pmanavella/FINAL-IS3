require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // mysql2/promise pool

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.sendStatus(200));

app.get("/", (req, res) => {
  const env = process.env.NODE_ENV || "local";
  res.send(`Backend funcionando - ${env.toUpperCase()}`);
});

// ======================= LIBROS =======================

async function getAllBooks(req, res) {
  try {
    const {
      q,
      sort,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      yearFrom,
      yearTo,
    } = req.query;

    let sql = "SELECT * FROM books";
    const params = [];
    const conditions = [];

    if (q) {
      conditions.push("(title LIKE ? OR author LIKE ? OR year LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    if (minPrice) {
      conditions.push("price >= ?");
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      conditions.push("price <= ?");
      params.push(Number(maxPrice));
    }

    if (minStock) {
      conditions.push("stock >= ?");
      params.push(Number(minStock));
    }

    if (maxStock) {
      conditions.push("stock <= ?");
      params.push(Number(maxStock));
    }

    if (yearFrom) {
      conditions.push("year >= ?");
      params.push(Number(yearFrom));
    }

    if (yearTo) {
      conditions.push("year <= ?");
      params.push(Number(yearTo));
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    const sortMap = {
      title_asc: "title ASC",
      title_desc: "title DESC",
      year_asc: "year ASC",
      year_desc: "year DESC",
      price_asc: "price ASC",
      price_desc: "price DESC",
      stock_asc: "stock ASC",
      stock_desc: "stock DESC",
    };

    if (sort && sortMap[sort]) {
      sql += " ORDER BY " + sortMap[sort];
    } else {
      sql += " ORDER BY id ASC";
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener libros:", err);
    res.status(500).json({ message: "Error al obtener libros" });
  }
}


async function createBook(req, res) {
  try {
    const { title, author, year, stock, price } = req.body;

    if (!title || !author || !year) {
      return res.status(400).json({ message: "Faltan datos del libro" });
    }

    const stockValue =
      stock === undefined || stock === null ? 0 : Number(stock);
    const priceValue =
      price === undefined || price === null ? 0 : Number(price);

    const [result] = await db.query(
      "INSERT INTO books (title, author, year, stock, price) VALUES (?, ?, ?, ?, ?)",
      [title, author, year, stockValue, priceValue]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      author,
      year,
      stock: stockValue,
      price: priceValue,
    });
  } catch (err) {
    console.error("Error al crear libro:", err);
    res.status(500).json({ message: "Error al crear libro" });
  }
}

async function deleteBook(req, res) {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM books WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    res.status(204).end();
  } catch (err) {
    console.error("Error al eliminar libro:", err);
    res.status(500).json({ message: "Error al eliminar libro" });
  }
}

// (opcional) editar libro, por si lo querés usar desde el frontend
async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const { title, author, year, stock, price } = req.body;

    if (!title || !author || !year) {
      return res.status(400).json({ message: "Faltan datos del libro" });
    }

    const stockValue =
      stock === undefined || stock === null ? 0 : Number(stock);
    const priceValue =
      price === undefined || price === null ? 0 : Number(price);

    const [result] = await db.query(
      "UPDATE books SET title = ?, author = ?, year = ?, stock = ?, price = ? WHERE id = ?",
      [title, author, year, stockValue, priceValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    res.json({
      id: Number(id),
      title,
      author,
      year,
      stock: stockValue,
      price: priceValue,
    });
  } catch (err) {
    console.error("Error al actualizar libro:", err);
    res.status(500).json({ message: "Error al actualizar libro" });
  }
}

// ======================= PRÉSTAMOS =======================

async function loanBook(req, res) {
  try {
    const bookId = parseInt(req.params.id, 10);
    const { borrowerName, borrowerEmail, days } = req.body;

    if (!borrowerName || !days || Number(days) <= 0) {
      return res
        .status(400)
        .json({ error: "Datos inválidos para préstamo" });
    }

    const [rows] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);
    const book = rows[0];

    if (!book) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    if (book.stock <= 0) {
      return res
        .status(409)
        .json({ error: "Sin stock disponible para préstamo" });
    }

    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + Number(days));

    const startDate = now.toISOString().slice(0, 19).replace("T", " ");
    const dueDate = due.toISOString().slice(0, 19).replace("T", " ");

    // insert en loans y update stock
    const [result] = await db.query(
      `INSERT INTO loans
       (book_id, borrower_name, borrower_email, start_date, due_date, status)
       VALUES (?, ?, ?, ?, ?, 'activo')`,
      [bookId, borrowerName, borrowerEmail || null, startDate, dueDate]
    );

    await db.query("UPDATE books SET stock = stock - 1 WHERE id = ?", [
      bookId,
    ]);

    const [loanRows] = await db.query("SELECT * FROM loans WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(loanRows[0]);
  } catch (err) {
    console.error("Error al registrar préstamo:", err);
    res.status(500).json({ error: "Error al registrar préstamo" });
  }
}

// ======================= VENTAS =======================

async function sellBook(req, res) {
  try {
    const bookId = parseInt(req.params.id, 10);
    const { buyerName, quantity } = req.body;

    if (!buyerName || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({ error: "Datos inválidos para venta" });
    }

    const [rows] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);
    const book = rows[0];

    if (!book) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    if (book.stock < quantity) {
      return res.status(409).json({ error: "Stock insuficiente" });
    }

    const saleDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const price = book.price || 0;
    const totalPrice = price * Number(quantity);

    const [result] = await db.query(
      `INSERT INTO sales
       (book_id, buyer_name, quantity, total_price, sale_date)
       VALUES (?, ?, ?, ?, ?)`,
      [bookId, buyerName, quantity, totalPrice, saleDate]
    );

    await db.query("UPDATE books SET stock = stock - ? WHERE id = ?", [
      quantity,
      bookId,
    ]);

    const [saleRows] = await db.query("SELECT * FROM sales WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(saleRows[0]);
  } catch (err) {
    console.error("Error al registrar venta:", err);
    res.status(500).json({ error: "Error al registrar venta" });
  }
}

async function getLoans(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT l.id, l.book_id, b.title AS book_title,
              l.borrower_name, l.borrower_email,
              l.start_date, l.due_date, l.status
       FROM loans l
       JOIN books b ON l.book_id = b.id
       ORDER BY l.start_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener préstamos:", err);
    res.status(500).json({ error: "Error al obtener préstamos" });
  }
}

async function getSales(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.book_id, b.title AS book_title,
              s.buyer_name, s.quantity, s.total_price, s.sale_date
       FROM sales s
       JOIN books b ON s.book_id = b.id
       ORDER BY s.sale_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener ventas:", err);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
}

// ======================= PRECARGA DE DATOS TEST =======================

if (process.env.NODE_ENV === "e2e") {
  app.post("/test/seed", async (req, res) => {
    await db.query("DELETE FROM books");
    await db.query(`
      INSERT INTO books (title, author, year, stock, price)
      VALUES 
        ('Clean Code', 'Robert C. Martin', 2008, 4, 22000),
        ('Design Patterns', 'GoF', 1994, 2, 20000)
    `);
    res.json({ ok: true });
  });
}

// ======================= RUTAS =======================

const routes = ["/books", "/api/books"];

routes.forEach((base) => {
  app.get(base, getAllBooks);
  app.post(base, createBook);
  app.delete(`${base}/:id`, deleteBook);
  app.put(`${base}/:id`, updateBook);
});

// rutas específicas para préstamo y venta (las que usa tu frontend)
app.post("/api/books/:id/loan", loanBook);
app.post("/api/books/:id/sell", sellBook);
app.get("/api/loans", getLoans);
app.get("/api/sales", getSales);


if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend escuchando en http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
