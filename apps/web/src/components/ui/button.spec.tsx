import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button, buttonVariants } from './button';
import { Slot } from '@radix-ui/react-slot';

// Mock Slot component
jest.mock('@radix-ui/react-slot', () => ({
  Slot: jest.fn(({ children, ...props }) => (
    <div data-testid="slot-component" {...props}>
      {children}
    </div>
  )),
}));

describe('Button Component', () => {
  it('renders a button with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-10');
  });

  it('applies variant and size classes correctly', () => {
    render(
      <Button variant="destructive" size="sm">
        Danger
      </Button>
    );

    const button = screen.getByRole('button', { name: /danger/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-destructive');
    expect(button).toHaveClass('h-9');
  });

  it('renders as a Slot component when asChild is true', () => {
    render(<Button asChild>Child Content</Button>);

    expect(Slot).toHaveBeenCalled();
    const slotComponent = screen.getByTestId('slot-component');
    expect(slotComponent).toBeInTheDocument();
    expect(slotComponent).toHaveTextContent('Child Content');
  });

  it('passes additional props to the button element', () => {
    render(
      <Button disabled aria-label="Test Button">
        Test
      </Button>
    );

    const button = screen.getByRole('button', { name: /test/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });

  it('applies custom className along with variant classes', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-primary');
  });
});
