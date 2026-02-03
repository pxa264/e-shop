/**
 * @fileoverview Input Validation Utilities
 * @description Provides validation functions for user inputs in ops-dashboard plugin.
 *              Includes validators for IDs, file uploads, prices, stock, and operations.
 * @module ops-dashboard/utils/validators
 */

'use strict';

/**
 * Validate an array of IDs for bulk operations.
 * Ensures all IDs are positive integers and applies deduplication.
 *
 * @param {any} ids - The IDs to validate
 * @param {number} maxLength - Maximum allowed array length (default: 100)
 * @returns {{valid: boolean, error?: string, ids?: number[]}} Validation result
 *
 * @example
 * const result = validateIds([1, 2, 3]);
 * if (result.valid) {
 *   // Use result.ids (deduplicated)
 * } else {
 *   // Handle result.error
 * }
 */
const validateIds = (ids, maxLength = 100) => {
  if (!ids || !Array.isArray(ids)) {
    return { valid: false, error: 'IDs must be an array' };
  }
  if (ids.length === 0) {
    return { valid: false, error: 'IDs array cannot be empty' };
  }
  if (ids.length > maxLength) {
    return { valid: false, error: `Cannot process more than ${maxLength} items at once` };
  }

  // Validate each ID is a positive integer
  const invalidIds = ids.filter(id => {
    const num = Number(id);
    return !Number.isInteger(num) || num <= 0;
  });

  if (invalidIds.length > 0) {
    return { valid: false, error: 'All IDs must be positive integers' };
  }

  // Return deduplicated IDs as integers
  const uniqueIds = [...new Set(ids.map(id => Number(id)))];
  return { valid: true, ids: uniqueIds };
};

/**
 * Validate file upload for CSV import
 * @param {object} file - The uploaded file object
 * @param {number} maxSize - Maximum file size in bytes (default: 5MB)
 * @returns {{ valid: boolean, error?: string }}
 */
const validateFileUpload = (file, maxSize = 5 * 1024 * 1024) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file extension or MIME type
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/csv',
    'text/plain', // Some systems may send CSV as text/plain
  ];
  const allowedExtensions = ['.csv'];

  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = file.name && allowedExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidType && !hasValidExtension) {
    return { valid: false, error: 'Only CSV files are allowed' };
  }

  return { valid: true };
};

/**
 * Validate and sanitize price value
 * @param {any} price - The price value to validate
 * @param {number} min - Minimum allowed price (default: 0)
 * @param {number} max - Maximum allowed price (default: 999999.99)
 * @returns {{ valid: boolean, error?: string, value?: number }}
 */
const validatePrice = (price, min = 0, max = 999999.99) => {
  const numPrice = parseFloat(price);

  if (isNaN(numPrice)) {
    return { valid: false, error: 'Price must be a valid number' };
  }

  if (numPrice < min) {
    return { valid: false, error: `Price cannot be less than ${min}` };
  }

  if (numPrice > max) {
    return { valid: false, error: `Price cannot exceed ${max}` };
  }

  // Round to 2 decimal places
  const sanitizedPrice = Math.round(numPrice * 100) / 100;
  return { valid: true, value: sanitizedPrice };
};

/**
 * Validate and sanitize stock value
 * @param {any} stock - The stock value to validate
 * @param {number} min - Minimum allowed stock (default: 0)
 * @param {number} max - Maximum allowed stock (default: 9999999)
 * @returns {{ valid: boolean, error?: string, value?: number }}
 */
const validateStock = (stock, min = 0, max = 9999999) => {
  const numStock = parseInt(stock, 10);

  if (isNaN(numStock)) {
    return { valid: false, error: 'Stock must be a valid integer' };
  }

  if (numStock < min) {
    return { valid: false, error: `Stock cannot be less than ${min}` };
  }

  if (numStock > max) {
    return { valid: false, error: `Stock cannot exceed ${max}` };
  }

  return { valid: true, value: numStock };
};

/**
 * Validate price operation parameters
 * @param {string} operation - The operation type (set, increase, decrease, percentage)
 * @param {any} value - The value for the operation
 * @returns {{ valid: boolean, error?: string, value?: number }}
 */
const validatePriceOperation = (operation, value) => {
  const validOperations = ['set', 'increase', 'decrease', 'percentage'];

  if (!validOperations.includes(operation)) {
    return { valid: false, error: `Invalid operation. Must be one of: ${validOperations.join(', ')}` };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { valid: false, error: 'Value must be a valid number' };
  }

  // For percentage, limit to reasonable range
  if (operation === 'percentage' && (numValue < -100 || numValue > 1000)) {
    return { valid: false, error: 'Percentage must be between -100 and 1000' };
  }

  // For set operation, ensure non-negative
  if (operation === 'set' && numValue < 0) {
    return { valid: false, error: 'Price cannot be negative' };
  }

  return { valid: true, value: numValue };
};

/**
 * Validate stock operation parameters
 * @param {string} operation - The operation type (set, increase, decrease)
 * @param {any} value - The value for the operation
 * @returns {{ valid: boolean, error?: string, value?: number }}
 */
const validateStockOperation = (operation, value) => {
  const validOperations = ['set', 'increase', 'decrease'];

  if (!validOperations.includes(operation)) {
    return { valid: false, error: `Invalid operation. Must be one of: ${validOperations.join(', ')}` };
  }

  const numValue = parseInt(value, 10);

  if (isNaN(numValue)) {
    return { valid: false, error: 'Value must be a valid integer' };
  }

  if (numValue < 0) {
    return { valid: false, error: 'Value cannot be negative' };
  }

  return { valid: true, value: numValue };
};

module.exports = {
  validateIds,
  validateFileUpload,
  validatePrice,
  validateStock,
  validatePriceOperation,
  validateStockOperation,
};
