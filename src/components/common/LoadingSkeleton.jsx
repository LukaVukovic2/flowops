/**
 * LoadingSkeleton Component
 * Reusable loading skeleton for better perceived performance
 * Requirements: 15.8
 */

import React from 'react';

const LoadingSkeleton = ({ 
  variant = 'default',
  width = 'w-full',
  height = 'h-4',
  className = '',
  count = 1
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const baseClasses = 'animate-pulse bg-gray-700 rounded';
  const classes = `${baseClasses} ${width} ${height} ${className}`;

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {skeletons.map((i) => (
          <div key={i} className={classes} />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'ticket-detail') {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-8 w-3/4 bg-gray-700 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-700 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-3">
          <div className="h-6 w-32 bg-gray-700 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* History Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-3">
          <div className="h-6 w-32 bg-gray-700 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Comments Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-3">
          <div className="h-6 w-32 bg-gray-700 rounded animate-pulse" />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="space-y-4">
        {skeletons.map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return <div className={classes} />;
};

export default LoadingSkeleton;
