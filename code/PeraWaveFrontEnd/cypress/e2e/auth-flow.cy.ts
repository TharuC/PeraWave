describe('PeraWave Authentication Flow', () => {
  it('simulates a complete user login journey with validations', () => {
    // 1. Visit the home page
    cy.visit('/');

    // 2. Click the login button in the Navbar
    cy.contains('button', 'Log in').click();

    // 3. Verify we are on the login page
    cy.url().should('include', '/login');
    cy.contains('h2', 'Welcome Back').should('be.visible');

    // 4. Test Frontend Validation (Invalid Email)
    cy.get('input#email').type('invalid-email@gmail.com');
    cy.get('input#password').type('secret123');
    cy.contains('button', 'Log In').click();
    
    // Check that the custom university email error appears!
    cy.contains('Please enter a valid University Email Address.').should('be.visible');

    // 5. Test Successful Login using Mock Intercept
    // We intercept the network request to fake a backend response, 
    // making the test blazing fast and isolated!
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token-12345',
        user: {
          userId: 1,
          email: 'student@eng.pdn.ac.lk',
          fullName: 'Test Student',
          role: 'USER',
          faculty: 'Engineering'
        }
      }
    }).as('loginRequest');

    // Clear the bad email and type a valid university email
    cy.get('input#email').clear().type('student@eng.pdn.ac.lk');
    cy.contains('button', 'Log In').click();

    // 6. Wait for the intercepted request to fire
    cy.wait('@loginRequest');

    // 7. Verify we are successfully redirected to the Home dashboard
    cy.url().should('include', '/home');

    // 8. Verify the Navbar now shows the logged-in user's name!
    cy.contains('Test Student').should('be.visible');
  });
});
