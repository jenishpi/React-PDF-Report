/**
 * Standard Commercial Invoice Preset
 */
export const invoicePreset = {
  id: 'invoice',
  name: 'Commercial Invoice',
  description: 'Professional invoice with Bill To/Ship To metadata, itemized table, and tax/total calculations.',
  template: {
    version: '1.0',
    name: 'Standard Commercial Invoice',
    page: {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [36, 40, 36, 40],
      accentColor: '#0f766e', // teal accent
      fontFamily: 'Roboto',
      baseFontSize: 9,
    },
    sections: {
      header: {
        id: 'header',
        name: 'Header',
        enabled: true,
        title: 'TAX INVOICE',
        subtitle: 'Original for Recipient',
        logoUrl: '',
        fields: [
          { label: 'Invoice No', key: 'invoiceNumber', value: 'INV-2026-0891' },
          { label: 'Invoice Date', key: 'issueDate', value: '2026-11-05' },
          { label: 'Due Date', key: 'dueDate', value: '2026-12-05' },
          { label: 'Payment Status', key: 'status', value: 'PENDING' },
        ],
      },
      metadata: {
        id: 'metadata',
        name: 'Customer & Vendor Info',
        enabled: true,
        columnsCount: 2,
        blocks: [
          {
            title: 'Bill To',
            fields: [
              { label: 'Client', key: 'customer.name', value: 'Apex Innovations Inc' },
              { label: 'Contact', key: 'customer.contact', value: 'Jane Doe (CFO)' },
              { label: 'Address', key: 'customer.address', value: '742 Evergreen Terrace, Springfield' },
              { label: 'VAT / Tax No', key: 'customer.taxNo', value: 'US-TAX-992014' },
            ],
          },
          {
            title: 'Billed By',
            fields: [
              { label: 'Company', key: 'vendor.company', value: 'Nexus Cloud Technologies Ltd' },
              { label: 'Reg No', key: 'vendor.regNo', value: 'REG-2021-9988' },
              { label: 'Address', key: 'vendor.address', value: '100 Silicon Way, Suite 400, San Jose, CA' },
              { label: 'Support', key: 'vendor.email', value: 'billing@nexuscloud.io' },
            ],
          },
        ],
      },
      table: {
        id: 'table',
        name: 'Line Items',
        enabled: true,
        title: 'Billed Services & Products',
        dataKey: 'items',
        columns: [
          { id: 'col_sku', header: 'Item / SKU', fieldKey: 'sku', width: 70, align: 'left', format: 'text' },
          { id: 'col_desc', header: 'Description', fieldKey: 'description', width: '*', align: 'left', format: 'text' },
          { id: 'col_qty', header: 'Qty', fieldKey: 'qty', width: 45, align: 'right', format: 'number' },
          { id: 'col_rate', header: 'Unit Price', fieldKey: 'unitPrice', width: 75, align: 'right', format: 'currency' },
          { id: 'col_disc', header: 'Discount', fieldKey: 'discount', width: 60, align: 'right', format: 'currency' },
          { id: 'col_total', header: 'Line Total', fieldKey: 'lineTotal', width: 85, align: 'right', format: 'currency' },
        ],
        style: {
          headerBg: '#0f766e',
          headerColor: '#ffffff',
          striped: true,
          stripedBg: '#f0fdfa',
          borderStyle: 'lightHorizontalLines',
          fontSize: 8.5,
        },
      },
      summary: {
        id: 'summary',
        name: 'Summary & Payment',
        enabled: true,
        alignment: 'right',
        width: '45%',
        rows: [
          { id: 'sum_sub', label: 'Subtotal', type: 'aggregate', aggregate: 'SUM', targetColumn: 'lineTotal', format: 'currency' },
          { id: 'sum_vat', label: 'VAT / Sales Tax (10%)', type: 'binding', dataKey: 'taxAmount', value: 345.0, format: 'currency' },
          { id: 'sum_ship', label: 'Shipping & Handling', type: 'binding', dataKey: 'shippingFee', value: 50.0, format: 'currency' },
          { id: 'sum_grand', label: 'Grand Total', type: 'binding', dataKey: 'grandTotal', value: 3845.0, format: 'currency', isBold: true },
        ],
      },
      footer: {
        id: 'footer',
        name: 'Terms & Notes',
        enabled: true,
        notes: 'Payment Instructions: Direct deposit to Wire routing #122000049, Account #889210491. Reference invoice INV-2026-0891.',
        terms: 'Payment is due within 30 days of invoice date. 1.5% late fee per month applies on overdue balances.',
        showPageNumbers: true,
        customText: 'Nexus Cloud Technologies — Thank you for your partnership!',
      },
    },
  },
  sampleData: {
    invoiceNumber: 'INV-2026-0891',
    issueDate: '2026-11-05',
    dueDate: '2026-12-05',
    status: 'PENDING',
    customer: {
      name: 'Apex Innovations Inc',
      contact: 'Jane Doe (CFO)',
      address: '742 Evergreen Terrace, Springfield',
      taxNo: 'US-TAX-992014',
    },
    vendor: {
      company: 'Nexus Cloud Technologies Ltd',
      regNo: 'REG-2021-9988',
      address: '100 Silicon Way, Suite 400, San Jose, CA',
      email: 'billing@nexuscloud.io',
    },
    items: [
      { sku: 'SRV-CLOUD-01', description: 'Enterprise Cloud Hosting - Primary Cluster (Monthly)', qty: 1, unitPrice: 1200.0, discount: 0, lineTotal: 1200.0 },
      { sku: 'SRV-DB-HA', description: 'Managed High-Availability PostgreSQL Database', qty: 2, unitPrice: 450.0, discount: 50.0, lineTotal: 850.0 },
      { sku: 'LIC-SEC-PRO', description: 'Advanced Threat Protection & WAF License (50 seats)', qty: 50, unitPrice: 15.0, discount: 50.0, lineTotal: 700.0 },
      { sku: 'CON-DEV-OPS', description: 'DevOps Architecture Consulting & Deployment Hours', qty: 7, unitPrice: 100.0, discount: 0, lineTotal: 700.0 },
    ],
    taxAmount: 345.0,
    shippingFee: 50.0,
    grandTotal: 3845.0,
  },
};

