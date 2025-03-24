import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders hello world', () => {
    render(<App />);
    const headingElement = screen.getByText(/hello world/i);
    expect(headingElement).toBeDefined();
    expect(headingElement.textContent?.toLowerCase()).toContain('hello world');
  });

  it('renders an h1 element', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toBeDefined();
    expect(headingElement.tagName.toLowerCase()).toBe('h1');
  });
});
