import { render, fireEvent } from '@testing-library/react';
import ClickableButton from './ClickableButton';

describe('ClickableButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ClickableButton />);
    expect(baseElement).toBeTruthy();
  });

  it('should display initial text by default', () => {
    const { getByTestId } = render(<ClickableButton />);
    expect(getByTestId('clickable-button')).toHaveTextContent('Click Me');
  });

  it('should display custom initial text when provided', () => {
    const { getByTestId } = render(
      <ClickableButton initialText="Test Button" />
    );
    expect(getByTestId('clickable-button')).toHaveTextContent('Test Button');
  });

  it('should change text to "Clicked" when clicked', () => {
    const { getByTestId } = render(<ClickableButton />);
    const button = getByTestId('clickable-button');

    fireEvent.click(button);

    expect(button).toHaveTextContent('Clicked');
  });

  it('should change text to custom clicked text when provided and clicked', () => {
    const { getByTestId } = render(
      <ClickableButton clickedText="Button Clicked!" />
    );
    const button = getByTestId('clickable-button');

    fireEvent.click(button);

    expect(button).toHaveTextContent('Button Clicked!');
  });
});
