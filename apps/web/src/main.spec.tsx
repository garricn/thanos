import * as ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import App from './app/app';

// Mock ReactDOM
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

// Mock App component
jest.mock('./app/app', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-app">Mock App</div>,
}));

describe('Main', () => {
  let originalCreateElement: typeof document.createElement;
  let mockRoot: HTMLElement;

  beforeEach(() => {
    // Mock document.getElementById
    mockRoot = document.createElement('div');
    mockRoot.id = 'root';
    document.body.appendChild(mockRoot);

    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'root') return mockRoot;
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.removeChild(mockRoot);
  });

  it('should render App component in StrictMode', () => {
    // Import the main module to trigger the rendering
    require('./main');

    // Check that createRoot was called with the root element
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(mockRoot);

    // Get the render function from the created root
    const renderMock = (ReactDOM.createRoot as jest.Mock).mock.results[0].value
      .render;

    // Check that render was called with App wrapped in StrictMode
    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: StrictMode,
        props: expect.objectContaining({
          children: expect.anything(),
        }),
      })
    );
  });
});
