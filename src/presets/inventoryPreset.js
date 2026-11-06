/**
 * Inventory Stock Valuation & Reorder Report Preset
 */
export const inventoryPreset = {
  id: 'inventory',
  name: 'Inventory Stock & Valuation Report',
  description: 'Warehouse inventory sheet with stock quantities, unit valuation, reorder status, and asset totals.',
  template: {
    version: '1.0',
    name: 'Inventory Stock Valuation Report',
    page: {
      pageSize: 'A4',
      pageOrientation: 'landscape', // wider view for inventory columns
      pageMargins: [30, 36, 30, 36],
      accentColor: '#1e293b', // slate
      fontFamily: 'Roboto',
      baseFontSize: 8.5,
    },
    sections: {
      header: {
        id: 'header',
        name: 'Header',
        enabled: true,
        title: 'INVENTORY AUDIT & STOCK REPORT',
        subtitle: 'Warehouse Operations & Asset Accounting',
        logoUrl: '',
        fields: [
          { label: 'Report Code', key: 'reportCode', value: 'INV-AUD-2026-Q4' },
          { label: 'Audit Date', key: 'auditDate', value: '2026-11-05' },
          { label: 'Auditor', key: 'auditorName', value: 'Marcus Vance' },
          { label: 'Status', key: 'auditStatus', value: 'VERIFIED' },
        ],
      },
      metadata: {
        id: 'metadata',
        name: 'Facility Details',
        enabled: true,
        columnsCount: 2,
        blocks: [
          {
            title: 'Facility Location',
            fields: [
              { label: 'Facility', key: 'warehouse.name', value: 'Central Fulfillment Hub #4' },
              { label: 'Zone / Bay', key: 'warehouse.zone', value: 'North Sector A & B' },
              { label: 'City / State', key: 'warehouse.location', value: 'Chicago, IL, USA' },
            ],
          },
          {
            title: 'Audit Scope',
            fields: [
              { label: 'Department', key: 'scope.department', value: 'Electronics & Component Hardware' },
              { label: 'Costing Method', key: 'scope.costing', value: 'FIFO (First-In, First-Out)' },
              { label: 'Next Cycle Count', key: 'scope.nextDate', value: '2026-12-05' },
            ],
          },
        ],
      },
      table: {
        id: 'table',
        name: 'Inventory Records',
        enabled: true,
        title: 'Stock Item Details',
        dataKey: 'inventory',
        columns: [
          { id: 'col_sku', header: 'SKU Code', fieldKey: 'sku', width: 75, align: 'left', format: 'text' },
          { id: 'col_name', header: 'Item Name', fieldKey: 'itemName', width: '*', align: 'left', format: 'text' },
          { id: 'col_cat', header: 'Category', fieldKey: 'category', width: 90, align: 'left', format: 'text' },
          { id: 'col_bin', header: 'Bin Location', fieldKey: 'binLocation', width: 70, align: 'center', format: 'text' },
          { id: 'col_qty', header: 'In Stock', fieldKey: 'quantity', width: 55, align: 'right', format: 'number' },
          { id: 'col_reorder', header: 'Reorder Point', fieldKey: 'reorderPoint', width: 65, align: 'right', format: 'number' },
          { id: 'col_cost', header: 'Unit Cost', fieldKey: 'unitCost', width: 65, align: 'right', format: 'currency' },
          { id: 'col_val', header: 'Total Asset Value', fieldKey: 'totalValue', width: 85, align: 'right', format: 'currency' },
        ],
        style: {
          headerBg: '#1e293b',
          headerColor: '#ffffff',
          striped: true,
          stripedBg: '#f8fafc',
          borderStyle: 'lightHorizontalLines',
          fontSize: 8,
        },
      },
      summary: {
        id: 'summary',
        name: 'Valuation Totals',
        enabled: true,
        alignment: 'right',
        width: '40%',
        rows: [
          { id: 'sum_items', label: 'Total Stock Quantity', type: 'aggregate', aggregate: 'SUM', targetColumn: 'quantity', format: 'number' },
          { id: 'sum_val', label: 'Total Inventory Valuation', type: 'aggregate', aggregate: 'SUM', targetColumn: 'totalValue', format: 'currency', isBold: true },
        ],
      },
      footer: {
        id: 'footer',
        name: 'Footer & Signatures',
        enabled: true,
        notes: 'Notes: Discrepancies within +/- 0.5% tolerance threshold. Items below reorder point are flagged for PO generation.',
        terms: 'Certified true and accurate according to company physical audit standards.',
        showPageNumbers: true,
        customText: 'Central Warehouse System — Confidential Internal Document',
      },
    },
  },
  sampleData: {
    reportCode: 'INV-AUD-2026-Q4',
    auditDate: '2026-11-05',
    auditorName: 'Marcus Vance',
    auditStatus: 'VERIFIED',
    warehouse: {
      name: 'Central Fulfillment Hub #4',
      zone: 'North Sector A & B',
      location: 'Chicago, IL, USA',
    },
    scope: {
      department: 'Electronics & Component Hardware',
      costing: 'FIFO (First-In, First-Out)',
      nextDate: '2026-12-05',
    },
    inventory: [
      { sku: 'HW-ARM-C99', itemName: 'Industrial ARM Cortex M7 Module', category: 'Microcontrollers', binLocation: 'B-12-04', quantity: 420, reorderPoint: 100, unitCost: 18.5, totalValue: 7770.0 },
      { sku: 'HW-MEM-DDR4', itemName: '8GB DDR4 ECC SO-DIMM 3200MHz', category: 'Memory', binLocation: 'B-12-08', quantity: 180, reorderPoint: 50, unitCost: 32.0, totalValue: 5760.0 },
      { sku: 'PWR-SMPS-65W', itemName: '65W Medical Grade Open Frame Power Supply', category: 'Power', binLocation: 'C-04-01', quantity: 95, reorderPoint: 100, unitCost: 24.75, totalValue: 2351.25 },
      { sku: 'SEN-TEMP-PRO', itemName: 'High-Precision RTD Thermal Sensor Probe', category: 'Sensors', binLocation: 'S-01-15', quantity: 640, reorderPoint: 200, unitCost: 8.2, totalValue: 5248.0 },
      { sku: 'CAB-ETH-CAT6', itemName: 'Shielded Industrial Cat6A Patch Cable 5m', category: 'Cabling', binLocation: 'C-08-03', quantity: 1200, reorderPoint: 300, unitCost: 3.1, totalValue: 3720.0 },
      { sku: 'ENC-ALUM-DIN', itemName: 'Rugged Extruded Aluminum DIN-Rail Enclosure', category: 'Enclosures', binLocation: 'E-03-11', quantity: 80, reorderPoint: 40, unitCost: 45.0, totalValue: 3600.0 },
    ],
  },
};

