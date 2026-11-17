/**
 * Notification Component
 * Toast notification for success/error messages
 * Requirements: 14.6, 14.7, 20.5
 */

import React from 'react';
import { useNotification } from '../../context/NotificationContext.jsx';

const Notification = () => {
  const { notification, dismiss } = useNotification();

  if (!notification) return null;

  const { type, message } = notification;

  const typeClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const iconPaths = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md ${typeClasses[type]}`}
      >
        {/* Icon */}
        <svg
          className="w-6 h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={iconPaths[type]}
          />
        </svg>

        {/* Message */}
        <p className="flex-1 text-sm font-medium">{message}</p>

        {/* Close button */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Zatvori"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;
