describe('Gestor de Libros - E2E', () => {
    const baseUrl = 'http://localhost:5173';
  
    it('lista, agrega y navega', () => {
      cy.visit(baseUrl);
  
      cy.contains('Gestor de Libros').should('be.visible');
  
      cy.get('input[name="title"]').type('Libro E2E');
      cy.get('input[name="author"]').type('Autor E2E');
      cy.get('input[name="year"]').type('2024');
      cy.contains('Agregar libro').click();
  
      cy.contains('Libro E2E').should('be.visible');
  
      cy.contains('Ventas').click();
      cy.contains('Comprador').should('be.visible');
    });
  });
  