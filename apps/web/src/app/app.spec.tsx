import { render } from '@testing-library/react';

import App from './app';

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
});
