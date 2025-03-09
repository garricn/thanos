import { getGreeting, getClickableButton } from '../support/app.po';

describe('thanos', () => {
  beforeEach(() => cy.visit('/'));

  it('should display the app title', () => {
    getGreeting().contains('Thanos App');
  });

  it('should display the button with initial text', () => {
    getClickableButton().should('be.visible');
    getClickableButton().should('contain.text', 'Click Me');
  });

  it('should change button text when clicked', () => {
    getClickableButton().click({ force: true });
    getClickableButton().should('contain.text', 'Clicked');
  });
});
