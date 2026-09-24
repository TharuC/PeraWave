describe('PeraWave Home Page End-to-End', () => {
  it('successfully loads the frontend and clicks the login button', () => {
    // 1. Visit the home page
    cy.visit('/');

    // 2. Assert the Navbar loaded properly
    cy.get('nav').should('be.visible');
    
    // 3. Find the "Log in" button and click it to simulate a user
    cy.contains('button', 'Log in').should('be.visible').click();
    
    // 4. Verify that the URL changed to the login page
    cy.url().should('include', '/login');
  });
});
