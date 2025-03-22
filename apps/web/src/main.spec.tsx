import React from 'react';
import ReactDOM from 'react-dom/client';
import { vi } from 'vitest';
// App is used in the imported main.tsx, so we need to import it for mocking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import App from './App';

// Mock React and ReactDOM
vi.mock('react', () => ({
  ...vi.importActual('react'),
  StrictMode: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// Mock document.getElementById
const originalGetElementById = document.getElementById;
const mockGetElementById = vi.fn(() => document.createElement('div'));

describe('main.tsx', () => {
  beforeAll(() => {
    document.getElementById = mockGetElementById;
  });

  afterAll(() => {
    document.getElementById = originalGetElementById;
  });

  it('renders the App component in the root element', () => {
    // Import main to execute it
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./main');

    // Verify getElementById was called with 'root'
    expect(mockGetElementById).toHaveBeenCalledWith('root');

    // Verify createRoot was called
    expect(ReactDOM.createRoot).toHaveBeenCalled();
  });
});
