/**
 * Input Component
 * Reusable input field with validation error display
 * Requirements: 12.6, 15.2, 20.1
 */

import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-200 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`
          w-full px-4 py-2 rounded-lg
          bg-gray-800 border border-gray-700
          text-gray-100 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
