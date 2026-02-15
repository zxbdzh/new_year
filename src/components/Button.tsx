import React from 'react';
import './Button.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * Button组件 - 基础UI组件
 * 
 * 支持4种变体：primary（主要）、secondary（次要）、ghost（幽灵）、danger（危险）
 * 支持3种尺寸：sm（小）、md（中）、lg（大）
 * 支持loading和disabled状态
 * 确保最小触摸目标44x44px（移动端）
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  ariaLabel,
  type = 'button',
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    disabled && 'btn--disabled',
    loading && 'btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <span className="btn__spinner-circle"></span>
        </span>
      )}
      {icon && !loading && <span className="btn__icon">{icon}</span>}
      {!loading && <span className="btn__text">{children}</span>}
    </button>
  );
};
