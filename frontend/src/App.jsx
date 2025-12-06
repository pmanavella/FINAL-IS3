import { useEffect, useState } from "react";
import { API_BASE } from "./config"; // ← toma VITE_API_URL o localhost

// Endpoints base
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

      {/* … resto del render sin cambios … */}
      {/* (todo tu JSX de listas/tablas permanece igual) */}
    </div>
  );
}

export default App;
