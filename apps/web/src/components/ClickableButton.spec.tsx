import { render, fireEvent } from '@testing-library/react';
import ClickableButton, { createHandleClick } from './ClickableButton';
import React from 'react';

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

    // Initial state
    expect(button).toHaveTextContent('Click Me');

    // User interaction
    fireEvent.click(button);

    // Verify state change through UI
    expect(button).toHaveTextContent('Clicked');
  });

  it('should change text to custom clicked text when provided and clicked', () => {
    const { getByTestId } = render(
      <ClickableButton clickedText="Button Clicked!" />
    );
    const button = getByTestId('clickable-button');

    // Initial state
    expect(button).toHaveTextContent('Click Me');

    // User interaction
    fireEvent.click(button);

    // Verify state change through UI
    expect(button).toHaveTextContent('Button Clicked!');
  });

  // Test all combinations of props and states
  it('should handle all prop combinations correctly', () => {
    const { getByTestId, rerender } = render(<ClickableButton />);
    const button = getByTestId('clickable-button');

    // Default props
    expect(button).toHaveTextContent('Click Me');

    // Custom initialText only
    rerender(<ClickableButton initialText="Custom Initial" />);
    expect(button).toHaveTextContent('Custom Initial');

    // Custom clickedText only
    rerender(<ClickableButton clickedText="Custom Clicked" />);
    expect(button).toHaveTextContent('Click Me');

    // Click to change state
    fireEvent.click(button);
    expect(button).toHaveTextContent('Custom Clicked');

    // Both custom props
    rerender(<ClickableButton initialText="Initial" clickedText="Clicked!" />);
    // After clicking, it should show the clicked text
    expect(button).toHaveTextContent('Clicked!');
  });

  // Test the internal click handler behavior
  it('should handle click events correctly', () => {
    const { getByTestId } = render(<ClickableButton />);
    const button = getByTestId('clickable-button');

    // Initial state
    expect(button).toHaveTextContent('Click Me');

    // Click the button
    fireEvent.click(button);

    // Verify the text changed
    expect(button).toHaveTextContent('Clicked');
  });

  // Test that multiple clicks don't change the state after the first click
  it('should remain in clicked state after multiple clicks', () => {
    const { getByTestId } = render(<ClickableButton />);
    const button = getByTestId('clickable-button');

    // First click
    fireEvent.click(button);
    expect(button).toHaveTextContent('Clicked');

    // Second click
    fireEvent.click(button);
    expect(button).toHaveTextContent('Clicked');

    // Third click
    fireEvent.click(button);
    expect(button).toHaveTextContent('Clicked');
  });

  // Test the onClickHandler prop
  it('should call the onClickHandler when provided and button is clicked', () => {
    const mockOnClickHandler = jest.fn();
    const { getByTestId } = render(
      <ClickableButton onClickHandler={mockOnClickHandler} />
    );
    const button = getByTestId('clickable-button');

    // Click the button
    fireEvent.click(button);

    // Verify the onClickHandler was called
    expect(mockOnClickHandler).toHaveBeenCalledTimes(1);
  });

  // Test that onClickHandler is not called if not provided
  it('should not throw an error when onClickHandler is not provided', () => {
    const { getByTestId } = render(<ClickableButton />);
    const button = getByTestId('clickable-button');

    // This should not throw an error
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });

  // Direct tests for the createHandleClick function
  describe('createHandleClick', () => {
    it('should call setIsClicked with true', () => {
      const mockSetIsClicked = jest.fn();
      const handleClick = createHandleClick(mockSetIsClicked);

      // Directly invoke the returned function
      handleClick();

      expect(mockSetIsClicked).toHaveBeenCalledWith(true);
    });

    it('should call onClickHandler if provided', () => {
      const mockSetIsClicked = jest.fn();
      const mockOnClickHandler = jest.fn();
      const handleClick = createHandleClick(
        mockSetIsClicked,
        mockOnClickHandler
      );

      // Directly invoke the returned function
      handleClick();

      expect(mockSetIsClicked).toHaveBeenCalledWith(true);
      expect(mockOnClickHandler).toHaveBeenCalledTimes(1);
    });

    it('should not call onClickHandler if not provided', () => {
      const mockSetIsClicked = jest.fn();
      const handleClick = createHandleClick(mockSetIsClicked);

      // Directly invoke the returned function
      handleClick();

      expect(mockSetIsClicked).toHaveBeenCalledWith(true);
    });

    // Add a more explicit test for the inner function
    it('should return a function that updates state and calls handler', () => {
      // Setup
      const mockSetIsClicked = jest.fn();
      const mockOnClickHandler = jest.fn();

      // Get the inner function
      const innerFunction = createHandleClick(
        mockSetIsClicked,
        mockOnClickHandler
      );

      // Verify it's a function
      expect(typeof innerFunction).toBe('function');

      // Call the inner function directly
      innerFunction();

      // Verify both functions were called
      expect(mockSetIsClicked).toHaveBeenCalledWith(true);
      expect(mockOnClickHandler).toHaveBeenCalledTimes(1);
    });
  });

  // Test the component with mocked createHandleClick
  it('should use createHandleClick correctly in the component', () => {
    // Instead of mocking, we'll verify the behavior directly
    const mockOnClickHandler = jest.fn();
    const { getByTestId } = render(
      <ClickableButton onClickHandler={mockOnClickHandler} />
    );
    const button = getByTestId('clickable-button');

    // Initial state - button should show initial text
    expect(button).toHaveTextContent('Click Me');

    // Click the button
    fireEvent.click(button);

    // Verify the expected behavior:
    // 1. Text should change to clicked state
    expect(button).toHaveTextContent('Clicked');

    // 2. onClickHandler should be called
    expect(mockOnClickHandler).toHaveBeenCalledTimes(1);

    // 3. Clicking again shouldn't change anything
    fireEvent.click(button);
    expect(button).toHaveTextContent('Clicked');
    expect(mockOnClickHandler).toHaveBeenCalledTimes(2);
  });

  // Test the conditional rendering more thoroughly
  it('should render different text based on isClicked state', () => {
    const { getByTestId } = render(
      <ClickableButton initialText="Initial" clickedText="Clicked" />
    );
    const button = getByTestId('clickable-button');

    // Initial state
    expect(button).toHaveTextContent('Initial');

    // After click
    fireEvent.click(button);
    expect(button).toHaveTextContent('Clicked');
  });

  // Test with multiple rerenders to ensure state changes are tracked
  it('should maintain state across rerenders', () => {
    const { getByTestId, rerender } = render(<ClickableButton />);
    const button = getByTestId('clickable-button');

    // Initial state
    expect(button).toHaveTextContent('Click Me');

    // Click to change state
    fireEvent.click(button);
    expect(button).toHaveTextContent('Clicked');

    // Rerender with different props
    rerender(
      <ClickableButton initialText="New Initial" clickedText="New Clicked" />
    );

    // Should still show clicked state
    expect(button).toHaveTextContent('New Clicked');
  });
});
