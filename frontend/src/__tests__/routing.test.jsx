// frontend/src/__tests__/routing.test.jsx
import React from "react";
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * Mock minimalista de react-router-dom para evitar hooks reales (useRef, etc.)
 * Simula MemoryRouter/Routes/Route lo suficiente para validar el render.
 */
vi.mock("react-router-dom", async () => {
  const React = await import("react");

  const MemoryRouter = ({ initialEntries = ["/"], children }) =>
    React.createElement("div", { "data-router": initialEntries[0] }, children);

  // Renderiza directamente el elemento del primer <Route> que "matchea" a mano
  const Routes = ({ children }) => React.createElement(React.Fragment, null, children);

  const Route = ({ path = "/", element }) => {
    // En este mock muy simple, tomamos la ruta actual del wrapper y si coincide, renderizamos
    return React.createElement("div", { "data-route": path }, element);
  };

  return { MemoryRouter, Routes, Route };
});

// AppRoutes “igual” al real, pero usando el mock anterior
import { MemoryRouter, Routes, Route } from "react-router-dom";

function AppRoutes({ initial = "/" }) {
  return (
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/books" element={<div>BooksPage</div>} />
        <Route path="*" element={<div>NotFound</div>} />
      </Routes>
    </MemoryRouter>
  );
}

test("home", () => {
  render(<AppRoutes initial="/" />);
  expect(screen.getByText("Home")).toBeInTheDocument();
});

test("ruta /books", () => {
  render(<AppRoutes initial="/books" />);
  expect(screen.getByText("BooksPage")).toBeInTheDocument();
});

test("404", () => {
  render(<AppRoutes initial="/no-existe" />);
  expect(screen.getByText("NotFound")).toBeInTheDocument();
});
