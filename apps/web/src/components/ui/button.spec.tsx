import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './button';

// Mock Slot component
jest.mock('@radix-ui/react-slot', () => ({
  Slot: jest.fn(({ children, ...props }) => (
    <div data-testid="slot-component" {...props}>
      {children}
    </div>
  )),
}));

describe('Button', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Button>Test Button</Button>);
    expect(baseElement).toBeTruthy();
  });

  it('should render with default variant and size', () => {
    const { getByRole } = render(<Button>Test Button</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-10');
  });

  it('should render with custom variant', () => {
    const { getByRole } = render(
      <Button variant="destructive">Test Button</Button>
    );
    const button = getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('should render with custom size', () => {
    const { getByRole } = render(<Button size="sm">Test Button</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('h-9');
  });

  it('should render as child when asChild is true', () => {
    const { container } = render(
      <Button asChild>
        <a href="https://example.com">Test Link</a>
      </Button>
    );
    expect(container.querySelector('a')).toBeTruthy();
    expect(container.querySelector('button')).toBeFalsy();
  });

  it('should apply additional className', () => {
    const { getByRole } = render(
      <Button className="test-class">Test Button</Button>
    );
    const button = getByRole('button');
    expect(button).toHaveClass('test-class');
  });
});
