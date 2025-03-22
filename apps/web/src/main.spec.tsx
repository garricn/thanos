import { vi, describe, it, expect, afterEach } from 'vitest';
import React from 'react'; // Import React for StrictMode reference

// Define mock values at the top level
const mockElement = document.createElement('div');
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({ render: mockRender }));

// Mock document.getElementById
vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

// Mock react-dom/client and ./App
vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}));

// Mock App and store the mocked component for testing
const MockedApp = () => <div>Mocked App</div>;
vi.mock('./App', () => ({
  default: MockedApp,
}));

describe('main.tsx', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the App component in the root element', async () => {
    // Dynamically import main.tsx to ensure mocks are in place
    await import('./main');

    // Verify getElementById was called with 'root'
    expect(document.getElementById).toHaveBeenCalledWith('root');

    // Verify createRoot was called with the mocked element
    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);

    // Verify render was called with a React element containing App
    expect(mockRender).toHaveBeenCalledWith(expect.anything());
    const renderedElement = mockRender.mock.calls[0][0];
    expect(renderedElement.type).toBe(React.StrictMode); // Should render StrictMode

    // Verify the App component renders a div
    const appElement = renderedElement.props.children;
    expect(appElement.type).toBe(MockedApp); // App is the mocked component
    const renderedAppOutput = appElement.type(); // Render the App component
    expect(renderedAppOutput.type).toBe('div'); // Matches the mocked App output
  });
});
