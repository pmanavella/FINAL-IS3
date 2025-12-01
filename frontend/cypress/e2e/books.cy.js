// frontend/cypress/e2e/books.cy.js
describe("Gestor de Libros – E2E", () => {
  const baseUrl = "http://localhost:5173";

  beforeEach(() => {
    cy.visit(baseUrl);

    // Esperar a que se cargue la tabla inicial (primer GET /api/books)
    cy.contains("Gestor de Libros").should("be.visible");
  });

  it("muestra la lista inicial de libros", () => {
    // Aquí solo verificamos que cargó la tabla
    cy.contains("Gestor de Libros").should("be.visible");
  });

  it("permite agregar un libro nuevo", () => {
    cy.get('input[name="title"]').type("Libro E2E");
    cy.get('input[name="author"]').type("Autor E2E");
    cy.get('input[name="year"]').type("2024");

    cy.contains("button", "Agregar libro").click();

    cy.contains("Libro E2E").should("be.visible");
    cy.contains("Autor E2E").should("be.visible");
  });

  it("permite editar y borrar un libro", () => {
    // Crear libro para edición
    cy.get('input[name="title"]').type("Libro Cypress");
    cy.get('input[name="author"]').type("Autor Cypress");
    cy.get('input[name="year"]').type("2025");
    cy.contains("button", "Agregar libro").click();

    // Editar libro
    cy.contains("Libro Cypress")
      .parent("div, tr")
      .within(() => cy.contains("Editar").click());

    cy.get('input[name="title"]').clear().type("Libro Editado");
    cy.contains("button", "Guardar cambios").click();

    cy.contains("Libro Editado").should("be.visible");

    // Borrar libro
    cy.contains("Libro Editado")
      .parent("div, tr")
      .within(() => cy.contains("Borrar").click());

    // Confirmación automática
    cy.on("window:confirm", () => true);

    cy.contains("Libro Editado").should("not.exist");
  });
});
