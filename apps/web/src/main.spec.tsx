import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Mock React and ReactDOM
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  StrictMode: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

// Mock document.getElementById
const originalGetElementById = document.getElementById;
const mockGetElementById = jest.fn(() => document.createElement('div'));

describe('main.tsx', () => {
  beforeAll(() => {
    document.getElementById = mockGetElementById;
  });

  afterAll(() => {
    document.getElementById = originalGetElementById;
  });

  it('renders the App component in the root element', () => {
    // Import main to execute it
    require('./main');

    // Verify getElementById was called with 'root'
    expect(mockGetElementById).toHaveBeenCalledWith('root');

    // Verify createRoot was called
    expect(ReactDOM.createRoot).toHaveBeenCalled();
  });
});
