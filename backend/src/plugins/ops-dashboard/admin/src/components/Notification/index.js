/**
 * @fileoverview Notification Component
 * @description Provides a reusable notification component and custom hook
 *              for displaying success/error messages in the admin panel.
 * @module ops-dashboard/admin/components/Notification
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Flex, IconButton } from '@strapi/design-system';
import { Cross } from '@strapi/icons';

/**
 * Notification component for displaying success/error messages
 */
export const Notification = ({ type = 'success', message, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message || !isVisible) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'success100' : 'danger100';
  const textColor = isSuccess ? 'success600' : 'danger600';

  return (
    <Box
      position="fixed"
      style={{
        top: '16px',
        right: '16px',
        zIndex: 9999,
        minWidth: '300px',
        maxWidth: '500px',
      }}
      padding={4}
      background={bgColor}
      hasRadius
      shadow="filterShadow"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Typography textColor={textColor} fontWeight="semiBold">
          {message}
        </Typography>
        {onClose && (
          <IconButton
            label="Close"
            icon={<Cross />}
            noBorder
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
          />
        )}
      </Flex>
    </Box>
  );
};

/**
 * Custom hook for managing notifications
 * @returns {{ notification: object|null, showNotification: function, hideNotification: function }}
 */
export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((type, message, duration = 3000) => {
    setNotification({ type, message, duration });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Helper methods
  const showSuccess = useCallback((message, duration) => {
    showNotification('success', message, duration);
  }, [showNotification]);

  const showError = useCallback((message, duration) => {
    showNotification('error', message, duration);
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
  };
};

export default Notification;
