/**
 * Report Template Schema Definition & Validation
 * Standardized schema for visual tabular reports rendered with pdfmake.
 */

export const PAGE_SIZES = ['A4', 'LETTER', 'LEGAL'];
export const PAGE_ORIENTATIONS = ['portrait', 'landscape'];
export const COLUMN_FORMATS = ['text', 'number', 'currency', 'date'];
export const COLUMN_ALIGNS = ['left', 'center', 'right'];
export const TABLE_BORDER_STYLES = ['lightHorizontalLines', 'headerLineOnly', 'noBorders'];
export const AGGREGATE_TYPES = ['SUM', 'COUNT', 'AVG', 'NONE'];

/**
 * Returns a clean, default template structure
 */
export function getDefaultTemplate() {
  return {
    version: '1.0',
    name: 'Untitled Report',
    page: {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [36, 40, 36, 40], // [left, top, right, bottom]
      accentColor: '#1d4ed8',
      fontFamily: 'Roboto',
      baseFontSize: 9,
    },
    sections: {
      header: {
        id: 'header',
        name: 'Header',
        enabled: true,
        title: 'Report Title',
        subtitle: 'Official Report Document',
        logoUrl: '',
        fields: [
          { label: 'Doc No', key: 'invoiceNumber', value: 'DOC-0001' },
          { label: 'Date', key: 'issueDate', value: '2026-11-05' },
        ],
      },
      metadata: {
        id: 'metadata',
        name: 'Metadata Grid',
        enabled: true,
        columnsCount: 2,
        blocks: [
          {
            title: 'Issued To',
            fields: [
              { label: 'Name', key: 'customer.name', value: 'ACME Corporation' },
              { label: 'Address', key: 'customer.address', value: '123 Enterprise Blvd' },
              { label: 'Email', key: 'customer.email', value: 'contact@acme.com' },
            ],
          },
          {
            title: 'Issued By',
            fields: [
              { label: 'Company', key: 'company.name', value: 'Global Tech Ltd' },
              { label: 'Tax ID', key: 'company.taxId', value: 'TAX-8899201' },
              { label: 'Phone', key: 'company.phone', value: '+1 (555) 019-2834' },
            ],
          },
        ],
      },
      table: {
        id: 'table',
        name: 'Data Table',
        enabled: true,
        title: 'Transaction Details',
        dataKey: 'items', // path to array in payload data, empty string or '.' for root array
        columns: [
          { id: 'col_1', header: '#', fieldKey: 'id', width: 30, align: 'center', format: 'text' },
          { id: 'col_2', header: 'Description', fieldKey: 'description', width: '*', align: 'left', format: 'text' },
          { id: 'col_3', header: 'Qty', fieldKey: 'qty', width: 45, align: 'right', format: 'number' },
          { id: 'col_4', header: 'Unit Price', fieldKey: 'rate', width: 75, align: 'right', format: 'currency' },
          { id: 'col_5', header: 'Amount', fieldKey: 'amount', width: 85, align: 'right', format: 'currency' },
        ],
        style: {
          headerBg: '#1d4ed8',
          headerColor: '#ffffff',
          striped: true,
          stripedBg: '#f8fafc',
          borderStyle: 'lightHorizontalLines',
          fontSize: 8.5,
        },
      },
      summary: {
        id: 'summary',
        name: 'Summary & Totals',
        enabled: true,
        alignment: 'right',
        width: '45%',
        rows: [
          { id: 'sum_1', label: 'Subtotal', type: 'aggregate', aggregate: 'SUM', targetColumn: 'amount', format: 'currency' },
          { id: 'sum_2', label: 'Tax (10%)', type: 'binding', dataKey: 'taxAmount', value: 0, format: 'currency' },
          { id: 'sum_3', label: 'Grand Total', type: 'binding', dataKey: 'grandTotal', value: 0, format: 'currency', isBold: true },
        ],
      },
      footer: {
        id: 'footer',
        name: 'Footer',
        enabled: true,
        notes: 'Thank you for your business. Please remit payment within 30 days.',
        terms: 'All accounts are subject to our terms of service.',
        showPageNumbers: true,
        customText: 'Confidential & Proprietary',
      },
    },
  };
}

/**
 * Validates a report template against required fields and constraints.
 * @param {object} template
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTemplate(template) {
  const errors = [];

  if (!template || typeof template !== 'object') {
    return { valid: false, errors: ['Template must be an object'] };
  }

  if (!template.page) {
    errors.push('Missing page configuration');
  } else {
    if (!PAGE_SIZES.includes(template.page.pageSize)) {
      errors.push(`Invalid pageSize "${template.page.pageSize}". Allowed: ${PAGE_SIZES.join(', ')}`);
    }
    if (!PAGE_ORIENTATIONS.includes(template.page.pageOrientation)) {
      errors.push(`Invalid pageOrientation "${template.page.pageOrientation}". Allowed: ${PAGE_ORIENTATIONS.join(', ')}`);
    }
  }

  if (!template.sections) {
    errors.push('Missing sections definition');
  } else {
    const { table, summary } = template.sections;

    // Validate table section if enabled
    if (table && table.enabled) {
      if (table.style && table.style.borderStyle && !TABLE_BORDER_STYLES.includes(table.style.borderStyle)) {
        errors.push(`Table has invalid borderStyle "${table.style.borderStyle}". Allowed: ${TABLE_BORDER_STYLES.join(', ')}`);
      }
      if (!Array.isArray(table.columns) || table.columns.length === 0) {
        errors.push('Table section is enabled but contains no columns');
      } else {
        table.columns.forEach((col, idx) => {
          if (!col.header) errors.push(`Column at index ${idx} is missing a header label`);
          if (!col.fieldKey) errors.push(`Column at index ${idx} is missing a fieldKey binding`);
          if (col.align && !COLUMN_ALIGNS.includes(col.align)) {
            errors.push(`Column "${col.header || idx}" has invalid align "${col.align}"`);
          }
          if (col.format && !COLUMN_FORMATS.includes(col.format)) {
            errors.push(`Column "${col.header || idx}" has invalid format "${col.format}"`);
          }
        });
      }
    }

    // Validate summary section if enabled
    if (summary && summary.enabled && Array.isArray(summary.rows)) {
      summary.rows.forEach((row, idx) => {
        if (!row.label) errors.push(`Summary row at index ${idx} is missing a label`);
        if (row.type === 'aggregate' && row.aggregate && !AGGREGATE_TYPES.includes(row.aggregate)) {
          errors.push(`Summary row "${row.label}" has invalid aggregate "${row.aggregate}"`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

