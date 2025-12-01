import { useEffect, useState } from "react";

// Base de URL según dónde corra el frontend
const API_BASE = window.location.hostname.includes("books-frontend-qa.onrender.com")
  ? "https://books-backend-qa.onrender.com"
  : window.location.hostname.includes("books-api-frontend-prod.onrender.com")
  ? "https://books-api-backend-prod.onrender.com"
  : "http://localhost:4000"; // desarrollo local

const BOOKS_URL = `${API_BASE}/api/books`;
const LOANS_URL = `${API_BASE}/api/loans`;
const SALES_URL = `${API_BASE}/api/sales`;

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    author: "",
    year: "",
    stock: "",
    price: "",
  });

  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loans, setLoans] = useState([]);
  const [sales, setSales] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);

  const [search, setSearch] = useState("");
  const [minStockFilter, setMinStockFilter] = useState("");
  const [sort, setSort] = useState("");

  // "books" | "loans" | "sales"
  const [view, setView] = useState("books");

  // =================== HELPERS CARGA LIBROS ===================

  const buildBooksUrl = () => {
    const params = new URLSearchParams();

    if (search) params.append("q", search);
    if (minStockFilter) params.append("minStock", minStockFilter);
    if (sort) params.append("sort", sort);

    const qs = params.toString();
    return qs ? `${BOOKS_URL}?${qs}` : BOOKS_URL;
  };

  const loadBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await fetch(buildBooksUrl());
      const data = await res.json();
      setBooks(data);
    } catch {
      alert("Error al cargar libros");
    } finally {
      setLoadingBooks(false);
    }
  };

  const loadLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await fetch(LOANS_URL);
      const data = await res.json();
      setLoans(data);
    } catch {
      alert("Error al cargar préstamos");
    } finally {
      setLoadingLoans(false);
    }
  };

  const loadSales = async () => {
    setLoadingSales(true);
    try {
      const res = await fetch(SALES_URL);
      const data = await res.json();
      setSales(data);
    } catch {
      alert("Error al cargar ventas");
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // =================== HANDLERS FORM ===================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      author: "",
      year: "",
      stock: "",
      price: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.year) return;

    const payload = {
      title: form.title,
      author: form.author,
      year: Number(form.year),
      stock: form.stock === "" ? 0 : Number(form.stock),
      price: form.price === "" ? 0 : Number(form.price),
    };

    try {
      if (form.id === null) {
        const res = await fetch(BOOKS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Error al crear libro");
          return;
        }

        const newBook = await res.json();
        setBooks((prev) => [newBook, ...prev]);
      } else {
        const res = await fetch(`${BOOKS_URL}/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Error al editar libro");
          return;
        }

        const updated = await res.json();
        setBooks((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
      }

      resetForm();
    } catch {
      alert("Error al guardar libro");
    }
  };

  const handleEdit = (book) => {
    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      year: book.year?.toString() || "",
      stock: book.stock?.toString() || "",
      price: book.price?.toString() || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este libro?")) return;

    try {
      const res = await fetch(`${BOOKS_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Error al eliminar libro");
        return;
      }
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Error al eliminar libro");
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  // =================== PRESTAR / VENDER ===================

  const handleLoan = async (book) => {
    const borrowerName = prompt(
      `Nombre del prestatario para "${book.title}":`
    );
    if (!borrowerName) return;

    const daysStr = prompt("¿Cuántos días de préstamo? (ej: 7)");
    if (!daysStr) return;
    const days = Number(daysStr);
    if (Number.isNaN(days) || days <= 0) {
      alert("Cantidad de días inválida");
      return;
    }

    const borrowerEmail = prompt(
      "Email del prestatario (opcional, dejar vacío si no):"
    );

    try {
      const res = await fetch(`${API_BASE}/api/books/${book.id}/loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName,
          borrowerEmail: borrowerEmail || undefined,
          days,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Error al registrar préstamo");
        return;
      }

      await res.json();
      alert("Préstamo registrado correctamente");
      loadBooks();
    } catch {
      alert("Error de red al registrar préstamo");
    }
  };

  const handleSell = async (book) => {
    const buyerName = prompt(`Nombre del comprador para "${book.title}":`);
    if (!buyerName) return;

    const qtyStr = prompt("Cantidad a vender:");
    if (!qtyStr) return;
    const quantity = Number(qtyStr);
    if (Number.isNaN(quantity) || quantity <= 0) {
      alert("Cantidad inválida");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/books/${book.id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerName, quantity }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Error al registrar venta");
        return;
      }

      await res.json();
      alert("Venta registrada correctamente");
      loadBooks();
    } catch {
      alert("Error de red al registrar venta");
    }
  };

  // =================== RENDER ===================

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* HEADER + BOTONES DE VISTA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            display: "inline-block",
          }}
        >
          Gestor de Libros
        </h1>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => {
              setView("books");
              loadBooks();
            }}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: view === "books" ? "#1d4ed8" : "#2563eb",
              color: "white",
              fontSize: "0.9rem",
            }}
          >
            Libros
          </button>

          <button
            type="button"
            onClick={() => {
              setView("loans");
              loadLoans();
            }}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: view === "loans" ? "#1d4ed8" : "#2563eb",
              color: "white",
              fontSize: "0.9rem",
            }}
          >
            Préstamos
          </button>

          <button
            type="button"
            onClick={() => {
              setView("sales");
              loadSales();
            }}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: view === "sales" ? "#1d4ed8" : "#2563eb",
              color: "white",
              fontSize: "0.9rem",
            }}
          >
            Ventas
          </button>
        </div>
      </div>

      {/* ========== VISTA LIBROS ========== */}
      {view === "books" && (
        <>
          {/* BARRA DE BÚSQUEDA / FILTRO / ORDEN */}
          <div
            style={{
              marginBottom: "1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.85)",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
            }}
          >
            <input
              placeholder="Buscar por título o autor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadBooks();
              }}
              style={{
                flex: 2,
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "rgba(255,255,255,0.95)",
              }}
            />

            <input
              type="number"
              min="0"
              placeholder="Stock mínimo"
              value={minStockFilter}
              onChange={(e) => setMinStockFilter(e.target.value)}
              style={{
                width: "140px",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "rgba(255,255,255,0.95)",
              }}
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                width: "170px",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "rgba(255,255,255,0.95)",
              }}
            >
              <option value="">Sin orden</option>
              <option value="title_asc">Título A → Z</option>
              <option value="title_desc">Título Z → A</option>
              <option value="year_asc">Año ascendente</option>
              <option value="year_desc">Año descendente</option>
              <option value="price_asc">Precio ascendente</option>
              <option value="price_desc">Precio descendente</option>
              <option value="stock_asc">Stock ascendente</option>
              <option value="stock_desc">Stock descendente</option>
            </select>

            <button
              type="button"
              onClick={loadBooks}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#2563eb",
                color: "white",
                fontSize: "0.9rem",
              }}
            >
              Aplicar
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setMinStockFilter("");
                setSort("");
                loadBooks();
              }}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                cursor: "pointer",
                backgroundColor: "white",
                fontSize: "0.9rem",
              }}
            >
              Limpiar
            </button>
          </div>

          {/* FORMULARIO */}
          <form
            onSubmit={handleSubmit}
            style={{
              marginBottom: "2rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 120px 100px 120px",
              columnGap: "0.75rem",
              rowGap: "1.5rem",
              alignItems: "end",
              backgroundColor: "rgba(255,255,255,0.85)",
              padding: "2rem",
              borderRadius: "0.75rem",
            }}
          >
            <div>
              <label
                htmlFor="title"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Título
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="author"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Autor
              </label>
              <input
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="year"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Año
              </label>
              <input
                id="year"
                name="year"
                type="number"
                value={form.year}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="price"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Precio
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem" }}>
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: "6px",
                }}
              >
                {form.id === null ? "Agregar libro" : "Guardar cambios"}
              </button>

              {form.id !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    backgroundColor: "white",
                    borderRadius: "6px",
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* TABLA LIBROS */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              overflow: "hidden",
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(4px)",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 2fr 2fr 80px 80px 260px",
                padding: "0.75rem",
                backgroundColor: "rgba(255,255,255,0.95)",
                fontWeight: 600,
              }}
            >
              <div>ID</div>
              <div>Título</div>
              <div>Autor</div>
              <div>Año</div>
              <div>Stock</div>
              <div>Acciones</div>
            </div>

            {loadingBooks ? (
              <div style={{ padding: "0.75rem" }}>Cargando...</div>
            ) : books.length === 0 ? (
              <div style={{ padding: "0.75rem" }}>No hay libros cargados.</div>
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 2fr 2fr 80px 80px 260px",
                    padding: "0.75rem",
                    borderTop: "1px solid #e5e7eb",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.75)",
                  }}
                >
                  <div>{book.id}</div>
                  <div>{book.title}</div>
                  <div>{book.author}</div>
                  <div>{book.year}</div>
                  <div>{book.stock}</div>

                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => handleEdit(book)}
                      style={{
                        padding: "0.25rem 0.75rem",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        backgroundColor: "white",
                        borderRadius: "6px",
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(book.id)}
                      style={{
                        padding: "0.25rem 0.75rem",
                        border: "1px solid #fee2e2",
                        cursor: "pointer",
                        backgroundColor: "#fee2e2",
                        borderRadius: "6px",
                      }}
                    >
                      Borrar
                    </button>

                    <button
                      onClick={() => handleLoan(book)}
                      style={{
                        padding: "0.25rem 0.75rem",
                        border: "1px solid #e0f2fe",
                        cursor: "pointer",
                        backgroundColor: "#e0f2fe",
                        borderRadius: "6px",
                      }}
                    >
                      Prestar
                    </button>

                    <button
                      onClick={() => handleSell(book)}
                      style={{
                        padding: "0.25rem 0.75rem",
                        border: "1px solid #dcfce7",
                        cursor: "pointer",
                        backgroundColor: "#dcfce7",
                        borderRadius: "6px",
                      }}
                    >
                      Vender
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ========== VISTA PRÉSTAMOS ========== */}
      {view === "loans" && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.85)",
          }}
        >
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "rgba(37,99,235,0.1)",
              fontWeight: 600,
            }}
          >
            Préstamos
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 2fr 2fr 2fr 140px 120px",
              padding: "0.75rem",
              backgroundColor: "rgba(255,255,255,0.95)",
              fontWeight: 600,
            }}
          >
            <div>ID</div>
            <div>Libro</div>
            <div>Prestatario</div>
            <div>Email</div>
            <div>Periodo</div>
            <div>Estado</div>
          </div>
          {loadingLoans ? (
            <div style={{ padding: "0.75rem" }}>Cargando préstamos...</div>
          ) : loans.length === 0 ? (
            <div style={{ padding: "0.75rem" }}>No hay préstamos registrados.</div>
          ) : (
            loans.map((loan) => (
              <div
                key={loan.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 2fr 2fr 2fr 140px 120px",
                  padding: "0.75rem",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  fontSize: "0.9rem",
                }}
              >
                <div>{loan.id}</div>
                <div>{loan.book_title}</div>
                <div>{loan.borrower_name}</div>
                <div>{loan.borrower_email || "-"}</div>
                <div>
                  {new Date(loan.start_date).toLocaleDateString()}{" "}
                  {"→"} {new Date(loan.due_date).toLocaleDateString()}
                </div>
                <div>{loan.status}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== VISTA VENTAS ========== */}
      {view === "sales" && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.85)",
          }}
        >
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "rgba(16,185,129,0.1)",
              fontWeight: 600,
            }}
          >
            Ventas
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 2fr 2fr 80px 120px 140px",
              padding: "0.75rem",
              backgroundColor: "rgba(255,255,255,0.95)",
              fontWeight: 600,
            }}
          >
            <div>ID</div>
            <div>Libro</div>
            <div>Comprador</div>
            <div>Cantidad</div>
            <div>Total</div>
            <div>Fecha</div>
          </div>
          {loadingSales ? (
            <div style={{ padding: "0.75rem" }}>Cargando ventas...</div>
          ) : sales.length === 0 ? (
            <div style={{ padding: "0.75rem" }}>No hay ventas registradas.</div>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 2fr 2fr 80px 120px 140px",
                  padding: "0.75rem",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  fontSize: "0.9rem",
                }}
              >
                <div>{sale.id}</div>
                <div>{sale.book_title}</div>
                <div>{sale.buyer_name}</div>
                <div>{sale.quantity}</div>
                <div>${sale.total_price}</div>
                <div>
                  {new Date(sale.sale_date).toLocaleDateString()}{" "}
                  {new Date(sale.sale_date).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;
