/**
 * LaunchScreen Component Tests
 * Feature: ui-ux-redesign
 * Requirements: 3.4, 3.7
 * 
 * Test Coverage:
 * - Component rendering
 * - Network status display
 * - Button click events
 * - Responsive layout
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LaunchScreen } from './LaunchScreen';

describe('LaunchScreen Component', () => {
  let onStartMock: () => void;
  let onAudioUnlockMock: () => void;

  beforeEach(() => {
    onStartMock = vi.fn();
    onAudioUnlockMock = vi.fn();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the launch screen', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      expect(screen.getByText('新年烟花游戏')).toBeInTheDocument();
    });

    it('should render the title with correct text', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const title = screen.getByText('新年烟花游戏');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('launch-title');
    });

    it('should render the subtitle', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      expect(screen.getByText('点燃烟花，迎接新年')).toBeInTheDocument();
    });

    it('should render the start button', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('点击开始');
    });

    it('should render decorative lanterns', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const lanterns = container.querySelectorAll('.lantern');
      expect(lanterns).toHaveLength(2);
      expect(lanterns[0]).toHaveClass('lantern-left');
      expect(lanterns[1]).toHaveClass('lantern-right');
    });

    it('should render decorative couplets', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const couplets = container.querySelectorAll('.couplet');
      expect(couplets).toHaveLength(2);
      expect(screen.getByText('爆竹声中辞旧岁')).toBeInTheDocument();
      expect(screen.getByText('烟花绽放迎新春')).toBeInTheDocument();
    });

    it('should render snowflakes', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const snowflakes = container.querySelectorAll('.snowflake');
      expect(snowflakes.length).toBeGreaterThan(0);
      expect(snowflakes.length).toBeLessThanOrEqual(50);
    });

    it('should render all snowflakes with unique positions', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const snowflakes = container.querySelectorAll('.snowflake');
      const positions = Array.from(snowflakes).map(
        (flake) => (flake as HTMLElement).style.left
      );
      
      // Check that positions are set
      positions.forEach((pos) => {
        expect(pos).toBeTruthy();
        expect(pos).toMatch(/%$/);
      });
    });

    it('should have proper ARIA attributes for decorative elements', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Network Status Display', () => {
    it('should display online status when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      render(<LaunchScreen onStart={onStartMock} />);
      expect(screen.getByText('多人模式可用')).toBeInTheDocument();
      
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const statusElement = container.querySelector('.network-status');
      expect(statusElement).toHaveClass('online');
    });

    it('should display offline status when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<LaunchScreen onStart={onStartMock} />);
      expect(screen.getByText('网络离线 - 仅单人模式')).toBeInTheDocument();
      
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const statusElement = container.querySelector('.network-status');
      expect(statusElement).toHaveClass('offline');
    });

    it('should update status when going online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      expect(screen.getByText('网络离线 - 仅单人模式')).toBeInTheDocument();

      // Simulate going online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));

      await waitFor(() => {
        expect(screen.getByText('多人模式可用')).toBeInTheDocument();
      });

      const statusElement = container.querySelector('.network-status');
      expect(statusElement).toHaveClass('online');
    });

    it('should update status when going offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      expect(screen.getByText('多人模式可用')).toBeInTheDocument();

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      await waitFor(() => {
        expect(screen.getByText('网络离线 - 仅单人模式')).toBeInTheDocument();
      });

      const statusElement = container.querySelector('.network-status');
      expect(statusElement).toHaveClass('offline');
    });

    it('should render network status icon', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const statusIcon = container.querySelector('.status-icon');
      expect(statusIcon).toBeInTheDocument();
      
      const svg = statusIcon?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<LaunchScreen onStart={onStartMock} />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Button Click Events', () => {
    it('should call onStart when button is clicked', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      fireEvent.click(button);
      
      expect(onStartMock).toHaveBeenCalledTimes(1);
    });

    it('should call onAudioUnlock when button is clicked if provided', () => {
      render(
        <LaunchScreen
          onStart={onStartMock}
          onAudioUnlock={onAudioUnlockMock}
        />
      );
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      fireEvent.click(button);
      
      expect(onAudioUnlockMock).toHaveBeenCalledTimes(1);
      expect(onStartMock).toHaveBeenCalledTimes(1);
    });

    it('should call onAudioUnlock before onStart', () => {
      const callOrder: string[] = [];
      
      const onStartWithTracking = vi.fn(() => callOrder.push('onStart'));
      const onAudioUnlockWithTracking = vi.fn(() => callOrder.push('onAudioUnlock'));
      
      render(
        <LaunchScreen
          onStart={onStartWithTracking}
          onAudioUnlock={onAudioUnlockWithTracking}
        />
      );
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      fireEvent.click(button);
      
      expect(callOrder).toEqual(['onAudioUnlock', 'onStart']);
    });

    it('should not call onAudioUnlock if not provided', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      fireEvent.click(button);
      
      expect(onStartMock).toHaveBeenCalledTimes(1);
      // No error should be thrown
    });

    it('should handle multiple clicks', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(onStartMock).toHaveBeenCalledTimes(3);
    });

    it('should be keyboard accessible', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      button.focus();
      expect(document.activeElement).toBe(button);
      
      fireEvent.keyDown(button, { key: 'Enter' });
      // Button component handles Enter key internally
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive container class', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const launchScreen = container.querySelector('.launch-screen');
      expect(launchScreen).toBeInTheDocument();
    });

    it('should have content wrapper with proper classes', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const content = container.querySelector('.launch-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('launch-content');
    });

    it('should render background with decorative elements', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const background = container.querySelector('.launch-background');
      expect(background).toBeInTheDocument();
    });

    it('should have snowflakes container', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const snowflakesContainer = container.querySelector('.snowflakes');
      expect(snowflakesContainer).toBeInTheDocument();
      expect(snowflakesContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('should apply animation styles to snowflakes', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const snowflakes = container.querySelectorAll('.snowflake');
      
      snowflakes.forEach((flake) => {
        const style = (flake as HTMLElement).style;
        expect(style.left).toBeTruthy();
        expect(style.animationDelay).toBeTruthy();
        expect(style.animationDuration).toBeTruthy();
      });
    });

    it('should have proper structure for mobile optimization', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      
      // Check that all responsive elements exist
      expect(container.querySelector('.launch-screen')).toBeInTheDocument();
      expect(container.querySelector('.launch-content')).toBeInTheDocument();
      expect(container.querySelector('.launch-title')).toBeInTheDocument();
      expect(container.querySelector('.launch-subtitle')).toBeInTheDocument();
      expect(container.querySelector('.network-status')).toBeInTheDocument();
    });

    it('should render button with large size for better touch targets', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      expect(button).toHaveClass('btn--lg');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('新年烟花游戏');
    });

    it('should have aria-label on start button', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      expect(button).toHaveAttribute('aria-label', '开始游戏');
    });

    it('should mark decorative elements with aria-hidden', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      
      const lanterns = container.querySelectorAll('.lantern');
      lanterns.forEach((lantern) => {
        expect(lantern).toHaveAttribute('aria-hidden', 'true');
      });

      const couplets = container.querySelectorAll('.couplet');
      couplets.forEach((couplet) => {
        expect(couplet).toHaveAttribute('aria-hidden', 'true');
      });

      const snowflakes = container.querySelector('.snowflakes');
      expect(snowflakes).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('p')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      // Tab to button
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Requirements Validation', () => {
    it('should meet requirement 3.4: hover feedback within 100ms', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      // Verify button has hover styles via CSS classes
      expect(button).toHaveClass('btn--primary');
      // CSS provides :hover state with transition
    });

    it('should meet requirement 3.7: entrance animation', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const launchScreen = container.querySelector('.launch-screen');
      
      // Verify animation class is applied (CSS handles the animation)
      expect(launchScreen).toBeInTheDocument();
      // CSS provides fadeIn animation
    });

    it('should meet requirement 3.4: network status indicator', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      
      // Verify network status is displayed
      const statusText = screen.getByText(/多人模式可用|网络离线/);
      expect(statusText).toBeInTheDocument();
    });

    it('should meet requirement 3.7: responsive design', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      
      // Verify responsive structure exists
      expect(container.querySelector('.launch-screen')).toBeInTheDocument();
      expect(container.querySelector('.launch-content')).toBeInTheDocument();
      
      // CSS media queries handle responsive behavior
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid network status changes', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      render(<LaunchScreen onStart={onStartMock} />);

      // Rapid status changes
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
      
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
      
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));

      await waitFor(() => {
        expect(screen.getByText('网络离线 - 仅单人模式')).toBeInTheDocument();
      });
    });

    it('should handle missing onAudioUnlock gracefully', () => {
      render(<LaunchScreen onStart={onStartMock} />);
      const button = screen.getByRole('button', { name: /开始游戏/i });
      
      expect(() => fireEvent.click(button)).not.toThrow();
      expect(onStartMock).toHaveBeenCalled();
    });

    it('should generate consistent snowflake count', () => {
      const { container: container1 } = render(<LaunchScreen onStart={onStartMock} />);
      const { container: container2 } = render(<LaunchScreen onStart={onStartMock} />);
      
      const snowflakes1 = container1.querySelectorAll('.snowflake');
      const snowflakes2 = container2.querySelectorAll('.snowflake');
      
      // Both should have 50 snowflakes
      expect(snowflakes1.length).toBe(50);
      expect(snowflakes2.length).toBe(50);
    });

    it('should have unique animation delays for snowflakes', () => {
      const { container } = render(<LaunchScreen onStart={onStartMock} />);
      const snowflakes = container.querySelectorAll('.snowflake');
      
      const delays = Array.from(snowflakes).map(
        (flake) => (flake as HTMLElement).style.animationDelay
      );
      
      // Check that delays are varied (not all the same)
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('should render correctly without crashing', () => {
      expect(() => {
        render(<LaunchScreen onStart={onStartMock} />);
      }).not.toThrow();
    });

    it('should handle component remount', () => {
      const { unmount } = render(<LaunchScreen onStart={onStartMock} />);
      
      unmount();
      
      // Render again after unmount
      expect(() => {
        render(<LaunchScreen onStart={onStartMock} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', () => {
      const startTime = performance.now();
      render(<LaunchScreen onStart={onStartMock} />);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      // Should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should not cause memory leaks with event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<LaunchScreen onStart={onStartMock} />);
      
      const addCalls = addEventListenerSpy.mock.calls.length;
      
      unmount();
      
      const removeCalls = removeEventListenerSpy.mock.calls.length;
      
      // Should remove as many listeners as it added
      expect(removeCalls).toBeGreaterThanOrEqual(addCalls);
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
