import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders hello world', () => {
    render(<App />);
    const headingElement = screen.getByText(/hello world/i);
    expect(headingElement).toBeInTheDocument();
  });

  it('renders an h1 element', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toBeInTheDocument();
  });
});
