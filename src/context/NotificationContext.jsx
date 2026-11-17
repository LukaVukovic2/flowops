/**
 * Notification Context
 * Manages toast notifications for success/error messages
 * Requirements: 14.6, 14.7, 20.5
 */

import React, { createContext, useState, useCallback, useContext } from 'react';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  /**
   * Show success notification
   * @param {string} message - Success message
   */
  const showSuccess = useCallback((message) => {
    setNotification({
      type: 'success',
      message,
      timestamp: Date.now(),
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

  /**
   * Show error notification
   * @param {string} message - Error message
   */
  const showError = useCallback((message) => {
    setNotification({
      type: 'error',
      message,
      timestamp: Date.now(),
    });

    // Auto-dismiss after 7 seconds (errors stay longer)
    setTimeout(() => {
      setNotification(null);
    }, 7000);
  }, []);

  /**
   * Show info notification
   * @param {string} message - Info message
   */
  const showInfo = useCallback((message) => {
    setNotification({
      type: 'info',
      message,
      timestamp: Date.now(),
    });

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  /**
   * Dismiss notification
   */
  const dismiss = useCallback(() => {
    setNotification(null);
  }, []);

  const value = {
    notification,
    showSuccess,
    showError,
    showInfo,
    dismiss,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notifications
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
