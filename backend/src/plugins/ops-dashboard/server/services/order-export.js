'use strict';

const ExcelJS = require('exceljs');

module.exports = ({ strapi }) => ({
  /**
   * Export orders to CSV format
   */
  async exportToCsv(orders, fields) {
    const columns = this.getColumnHeaders(fields);
    const rows = orders.map(order => this.formatOrderRow(order, fields));

    // Build CSV content
    const header = columns.map(col => `"${col.header}"`).join(',');
    const dataRows = rows.map(row => {
      return columns.map(col => {
        const value = row[col.key] || '';
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    // Add BOM for UTF-8 encoding support in Excel
    const bom = '\uFEFF';
    return bom + [header, ...dataRows].join('\n');
  },

  /**
   * Export orders to Excel format (legacy)
   */
  async exportToExcel(orders, fields) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Define columns based on selected fields
    const columns = this.getColumns(fields);
    worksheet.columns = columns;

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFf97316' }, // Orange theme
    };

    // Add data rows
    orders.forEach((order) => {
      const row = this.formatOrderRow(order, fields);
      worksheet.addRow(row);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },

  /**
   * Get column definitions based on selected fields
   */
  getColumns(fields) {
    return this.getColumnHeaders(fields);
  },

  /**
   * Get column header definitions
   */
  getColumnHeaders(fields) {
    const allColumns = {
      orderNumber: { header: 'Order Number', key: 'orderNumber' },
      customerName: { header: 'Customer Name', key: 'customerName' },
      customerEmail: { header: 'Customer Email', key: 'customerEmail' },
      status: { header: 'Status', key: 'status' },
      totalAmount: { header: 'Total Amount', key: 'totalAmount' },
      createdAt: { header: 'Created At', key: 'createdAt' },
      shippingAddress: { header: 'Shipping Address', key: 'shippingAddress' },
      paymentMethod: { header: 'Payment Method', key: 'paymentMethod' },
    };

    if (!fields || fields.length === 0) {
      return Object.values(allColumns);
    }

    return fields.map((field) => allColumns[field]).filter(Boolean);
  },

  /**
   * Format order data for export row
   */
  formatOrderRow(order, fields) {
    const row = {};

    const fieldFormatters = {
      orderNumber: () => order.orderNumber || '-',
      customerName: () => order.user?.username || order.user?.email || '-',
      customerEmail: () => order.user?.email || '-',
      status: () => order.status || '-',
      totalAmount: () => `$${(order.totalAmount || 0).toFixed(2)}`,
      createdAt: () => new Date(order.createdAt).toLocaleString(),
      shippingAddress: () => this.formatAddress(order.shippingAddress),
      paymentMethod: () => order.paymentMethod || '-',
    };

    const fieldsToExport = fields && fields.length > 0
      ? fields
      : Object.keys(fieldFormatters);

    fieldsToExport.forEach((field) => {
      if (fieldFormatters[field]) {
        row[field] = fieldFormatters[field]();
      }
    });

    return row;
  },

  /**
   * Format address object to string
   */
  formatAddress(address) {
    if (!address) return '-';

    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.join(', ') || '-';
  },
});
