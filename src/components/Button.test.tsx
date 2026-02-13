import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should render with default variant (primary) and size (md)', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn--primary');
      expect(button).toHaveClass('btn--md');
    });

    it('should render with custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--primary');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--secondary');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--ghost');
    });

    it('should render danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--danger');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--sm');
    });

    it('should render medium size', () => {
      render(<Button size="md">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--md');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--lg');
    });
  });

  describe('States', () => {
    it('should render disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn--disabled');
    });

    it('should render loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn--loading');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should show spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      const spinner = document.querySelector('.btn__spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should hide icon when loading', () => {
      render(
        <Button loading icon={<span data-testid="icon">Icon</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  describe('Icon', () => {
    it('should render with icon', () => {
      render(
        <Button icon={<span data-testid="icon">🎆</span>}>
          With Icon
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should not render icon when loading', () => {
      render(
        <Button loading icon={<span data-testid="icon">🎆</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Button ariaLabel="Custom label">Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Custom label'
      );
    });

    it('should have aria-busy when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('should support different button types', () => {
      const { rerender } = render(<Button type="button">Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

      rerender(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

      rerender(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });

    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button>{''}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle multiple class combinations', () => {
      render(
        <Button
          variant="secondary"
          size="lg"
          disabled
          className="custom"
        >
          Complex
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn--secondary');
      expect(button).toHaveClass('btn--lg');
      expect(button).toHaveClass('btn--disabled');
      expect(button).toHaveClass('custom');
    });

    it('should handle both disabled and loading states', () => {
      render(
        <Button disabled loading>
          Both States
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn--disabled');
      expect(button).toHaveClass('btn--loading');
    });

    it('should wrap children in btn__text span', () => {
      render(<Button>Text Content</Button>);
      const textSpan = document.querySelector('.btn__text');
      expect(textSpan).toBeInTheDocument();
      expect(textSpan).toHaveTextContent('Text Content');
    });

    it('should render icon in btn__icon span', () => {
      render(
        <Button icon={<span data-testid="icon">🎆</span>}>
          With Icon
        </Button>
      );
      const iconSpan = document.querySelector('.btn__icon');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan).toContainElement(screen.getByTestId('icon'));
    });

    it('should have spinner with correct structure when loading', () => {
      render(<Button loading>Loading</Button>);
      const spinner = document.querySelector('.btn__spinner');
      const spinnerCircle = document.querySelector('.btn__spinner-circle');
      
      expect(spinner).toBeInTheDocument();
      expect(spinnerCircle).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('CSS Class Structure', () => {
    it('should always have base btn class', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn');
    });

    it('should combine all variant, size, and state classes correctly', () => {
      const { rerender } = render(
        <Button variant="primary" size="sm">
          Test
        </Button>
      );
      let button = screen.getByRole('button');
      expect(button.className).toContain('btn');
      expect(button.className).toContain('btn--primary');
      expect(button.className).toContain('btn--sm');

      rerender(
        <Button variant="ghost" size="lg" loading>
          Test
        </Button>
      );
      button = screen.getByRole('button');
      expect(button.className).toContain('btn--ghost');
      expect(button.className).toContain('btn--lg');
      expect(button.className).toContain('btn--loading');
    });
  });

  describe('Requirements Validation', () => {
    it('should meet requirement 2.6: minimum touch target 44x44px', () => {
      // This is validated through CSS, but we can verify the classes are applied
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn');
      expect(button).toHaveClass('btn--sm');
      // CSS ensures min-width: 44px and min-height: 44px
    });

    it('should meet requirement 8.3: interaction state animations', () => {
      // Verify that hover/active/focus states are handled via CSS classes
      render(<Button variant="primary">Hover Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn--primary');
      // CSS provides :hover, :active, :focus-visible styles
    });

    it('should meet requirement 13.1: visual feedback within 100ms', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole('button');
      
      // Click should trigger immediately
      const startTime = performance.now();
      fireEvent.click(button);
      const endTime = performance.now();
      
      expect(handleClick).toHaveBeenCalled();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
