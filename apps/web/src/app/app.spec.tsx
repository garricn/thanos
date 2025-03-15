import { render, screen } from '@testing-library/react';

import App from './app';

// Mock the ClickableButton component
jest.mock('../components/ClickableButton', () => ({
  __esModule: true,
  default: () => <div data-testid="clickable-button">Mocked Button</div>,
}));

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have "Web App" as the title', () => {
    const { getByText } = render(<App />);
    expect(getByText('Web App')).toBeTruthy();
  });

  it('should render the ClickableButton component', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('clickable-button')).toBeTruthy();
  });

  it('should have the correct structure with heading and button section', () => {
    render(<App />);

    // Check for main container with flex styling
    const mainContainer = screen.getByText('Web App').closest('div');
    expect(mainContainer?.className).toContain('flex');
    expect(mainContainer?.className).toContain('flex-col');
    expect(mainContainer?.className).toContain('items-center');

    // Check for button demo section
    const buttonSection = screen.getByText('Button Demo').closest('div');
    expect(buttonSection?.className).toContain('bg-white');
    expect(buttonSection?.className).toContain('rounded-lg');

    // Check heading hierarchy
    const mainHeading = screen.getByText('Web App');
    expect(mainHeading.tagName).toBe('H1');

    const subHeading = screen.getByText('Button Demo');
    expect(subHeading.tagName).toBe('H2');
  });

  it('should maintain accessibility structure', () => {
    const { container } = render(<App />);

    // Check that headings are in the correct order
    const headings = Array.from(
      container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    );

    // Should have exactly one h1 and one h2
    const h1Elements = headings.filter((h) => h.tagName === 'H1');
    const h2Elements = headings.filter((h) => h.tagName === 'H2');

    expect(h1Elements.length).toBe(1);
    expect(h2Elements.length).toBe(1);

    // h1 should come before h2 in the DOM
    const h1Index = headings.indexOf(h1Elements[0]);
    const h2Index = headings.indexOf(h2Elements[0]);
    expect(h1Index).toBeLessThan(h2Index);
  });
});
