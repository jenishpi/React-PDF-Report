import { JSON_PRODUCT_DATA } from 'assets/constant/Constant';

/**
 * Product Sales & VAT Ledger Preset
 * Backwards-compatible preset designed directly around the repository's existing JSON_PRODUCT_DATA.
 */
export const productDataPreset = {
  id: 'product_sales',
  name: 'Sales & VAT Transaction Ledger',
  description: 'Original repository sales and VAT ledger preset based on JSON_PRODUCT_DATA.',
  template: {
    version: '1.0',
    name: 'Sales & VAT Transaction Ledger',
    page: {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [36, 40, 36, 40],
      accentColor: '#3b82f6',
      fontFamily: 'Roboto',
      baseFontSize: 8.5,
    },
    sections: {
      header: {
        id: 'header',
        name: 'Header',
        enabled: true,
        title: 'SALES & VAT TRANSACTION LEDGER',
        subtitle: 'Comprehensive Transaction History Report',
        logoUrl: '',
        fields: [
          { label: 'Ledger Code', key: 'reportId', value: 'TX-VAT-2019' },
          { label: 'Report Generated', key: 'generatedDate', value: '2026-11-05' },
          { label: 'Source System', key: 'system', value: 'Light Bootstrap ERP' },
        ],
      },
      metadata: {
        id: 'metadata',
        name: 'Ledger Scope',
        enabled: true,
        columnsCount: 2,
        blocks: [
          {
            title: 'Account Information',
            fields: [
              { label: 'Entity', key: 'entityName', value: 'Apex Enterprise Operations' },
              { label: 'Fiscal Period', key: 'fiscalPeriod', value: 'FY 2019-2020' },
              { label: 'Currency', key: 'currency', value: 'USD ($)' },
            ],
          },
          {
            title: 'Tax Jurisdiction',
            fields: [
              { label: 'Tax Authority', key: 'taxAuthority', value: 'Internal Revenue Service' },
              { label: 'VAT Rate Tier', key: 'vatTier', value: 'Standard Enterprise (18.8%)' },
              { label: 'Filing Status', key: 'filingStatus', value: 'Quarterly Reconciled' },
            ],
          },
        ],
      },
      table: {
        id: 'table',
        name: 'Ledger Transactions',
        enabled: true,
        title: 'Transaction Breakdown',
        dataKey: 'records',
        columns: [
          { id: 'col_date', header: 'Date', fieldKey: 'Date', width: 85, align: 'center', format: 'text' },
          { id: 'col_qty', header: 'Total Qty', fieldKey: 'TotalQty', width: 65, align: 'right', format: 'number' },
          { id: 'col_rate', header: 'Avg Rate', fieldKey: 'AverageRate', width: 85, align: 'right', format: 'currency' },
          { id: 'col_vat', header: 'Total VAT', fieldKey: 'totalvat', width: 95, align: 'right', format: 'currency' },
          { id: 'col_amt', header: 'Total Amount', fieldKey: 'totalamount', width: '*', align: 'right', format: 'currency' },
        ],
        style: {
          headerBg: '#2563eb',
          headerColor: '#ffffff',
          striped: true,
          stripedBg: '#eff6ff',
          borderStyle: 'lightHorizontalLines',
          fontSize: 8,
        },
      },
      summary: {
        id: 'summary',
        name: 'Ledger Summary',
        enabled: true,
        alignment: 'right',
        width: '45%',
        rows: [
          { id: 'sum_vat', label: 'Accumulated VAT', type: 'aggregate', aggregate: 'SUM', targetColumn: 'totalvat', format: 'currency' },
          { id: 'sum_total', label: 'Gross Total Amount', type: 'aggregate', aggregate: 'SUM', targetColumn: 'totalamount', format: 'currency', isBold: true },
        ],
      },
      footer: {
        id: 'footer',
        name: 'Ledger Footer',
        enabled: true,
        notes: 'Notice: Values derived from registered general ledger transactions.',
        terms: 'Audited and verified in accordance with standard corporate accounting guidelines.',
        showPageNumbers: true,
        customText: 'React-PDF-Report System — Automated Financial Ledger',
      },
    },
  },
  sampleData: {
    reportId: 'TX-VAT-2019',
    generatedDate: '2026-11-05',
    system: 'Light Bootstrap ERP',
    entityName: 'Apex Enterprise Operations',
    fiscalPeriod: 'FY 2019-2020',
    currency: 'USD ($)',
    taxAuthority: 'Internal Revenue Service',
    vatTier: 'Standard Enterprise (18.8%)',
    filingStatus: 'Quarterly Reconciled',
    // We take the first 25 rows for responsive live preview, but users can switch to full
    records: JSON_PRODUCT_DATA.slice(0, 25),
  },
};
