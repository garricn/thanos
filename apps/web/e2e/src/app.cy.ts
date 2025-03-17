describe('App', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display hello world heading', () => {
    cy.get('h1').should('contain', 'Hello World');
  });
});
