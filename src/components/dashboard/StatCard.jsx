/**
 * StatCard Component
 * Displays a statistic with icon and label
 * Requirements: 6.1, 6.2, 12.1
 */

import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  variant = 'default',
  className = '' 
}) => {
  // Variant color mappings for different stat types
  const variantClasses = {
    default: 'border-gray-700 bg-gray-800',
    primary: 'border-primary-500/30 bg-primary-500/10',
    success: 'border-green-500/30 bg-green-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    danger: 'border-red-500/30 bg-red-500/10',
    info: 'border-blue-500/30 bg-blue-500/10'
  };

  const iconVariantClasses = {
    default: 'text-gray-400',
    primary: 'text-primary-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-blue-400'
  };

  const baseClasses = 'border rounded-lg p-6 transition-all duration-200 hover:shadow-lg';
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  const iconClasses = iconVariantClasses[variant];

  return (
    <div className={cardClasses}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-white mb-1">
            {value !== null && value !== undefined ? value : '—'}
          </p>
          {description && (
            <p className="text-sm text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${iconClasses} opacity-80`}>
            <Icon size={32} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
