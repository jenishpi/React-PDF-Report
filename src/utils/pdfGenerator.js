import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configure pdfmake virtual file system fonts
try {
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts && pdfFonts.default && pdfFonts.default.pdfMake) {
    pdfMake.vfs = pdfFonts.default.pdfMake.vfs;
  }
} catch (e) {
  console.warn('pdfmake vfs fonts initialization warning:', e);
}

/**
 * Safely access nested object property by dot notation (e.g. "customer.name")
 */
export function getNestedValue(obj, path, fallback = '') {
  if (!obj || !path) return fallback;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return fallback;
    current = current[key];
  }
  return current !== undefined && current !== null ? current : fallback;
}

/**
 * Format cell or summary value based on format type
 */
export function formatValue(value, format = 'text') {
  if (value === null || value === undefined || value === '') return '-';

  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));

  switch (format) {
    case 'currency':
      if (isNaN(num)) return String(value);
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

    case 'number':
      if (isNaN(num)) return String(value);
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);

    case 'date':
      try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      } catch {
        return String(value);
      }

    case 'text':
    default:
      return String(value);
  }
}

/**
 * Calculate column aggregation (SUM, COUNT, AVG)
 */
export function computeAggregate(rows, fieldKey, aggregateType) {
  if (!Array.isArray(rows) || rows.length === 0) return 0;

  switch (aggregateType) {
    case 'COUNT':
      return rows.length;

    case 'SUM': {
      return rows.reduce((sum, row) => {
        const raw = getNestedValue(row, fieldKey, 0);
        const val = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]+/g, '')) || 0;
        return sum + val;
      }, 0);
    }

    case 'AVG': {
      const sum = rows.reduce((acc, row) => {
        const raw = getNestedValue(row, fieldKey, 0);
        const val = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]+/g, '')) || 0;
        return acc + val;
      }, 0);
      return sum / rows.length;
    }

    case 'NONE':
    default:
      return 0;
  }
}

/**
 * Translates visual template JSON + data JSON into a pure pdfmake Document Definition
 */
export function buildPdfDocDefinition(template, data) {
  const page = template.page || {};
  const sections = template.sections || {};
  const accentColor = page.accentColor || '#1d4ed8';

  const docDefinition = {
    pageSize: page.pageSize || 'A4',
    pageOrientation: page.pageOrientation || 'portrait',
    pageMargins: page.pageMargins || [36, 40, 36, 40],
    content: [],
    styles: {
      reportHeaderTitle: {
        fontSize: 18,
        bold: true,
        color: accentColor,
        margin: [0, 0, 0, 2],
      },
      reportHeaderSubtitle: {
        fontSize: 10,
        color: '#64748b',
        margin: [0, 0, 0, 8],
      },
      metaLabel: {
        fontSize: 8,
        bold: true,
        color: '#475569',
      },
      metaValue: {
        fontSize: 8.5,
        color: '#1e293b',
      },
      blockTitle: {
        fontSize: 9,
        bold: true,
        color: accentColor,
        margin: [0, 4, 0, 4],
      },
      sectionTitle: {
        fontSize: 11,
        bold: true,
        color: '#1e293b',
        margin: [0, 10, 0, 4],
      },
      tableHeader: {
        bold: true,
        color: '#ffffff',
        margin: [3, 4, 3, 4],
      },
      tableCell: {
        margin: [3, 3, 3, 3],
      },
      summaryLabel: {
        fontSize: 8.5,
        color: '#475569',
      },
      summaryValue: {
        fontSize: 8.5,
        color: '#0f172a',
      },
      footerText: {
        fontSize: 7.5,
        color: '#64748b',
        lineHeight: 1.2,
      },
    },
    defaultStyle: {
      fontSize: page.baseFontSize || 8.5,
      font: 'Roboto',
      color: '#1e293b',
    },
  };

  // 1. Header Section
  if (sections.header && sections.header.enabled) {
    const hdr = sections.header;
    const headerCols = [];

    // Left title block
    headerCols.push({
      width: '*',
      stack: [
        { text: hdr.title || 'REPORT', style: 'reportHeaderTitle' },
        { text: hdr.subtitle || '', style: 'reportHeaderSubtitle' },
      ],
    });

    // Right metadata fields (e.g. Doc #, Date, Status)
    if (Array.isArray(hdr.fields) && hdr.fields.length > 0) {
      const fieldRows = hdr.fields.map((f) => {
        const val = f.key ? getNestedValue(data, f.key, f.value) : f.value;
        return [
          { text: `${f.label}:`, style: 'metaLabel', alignment: 'right', margin: [0, 1, 4, 1] },
          { text: String(val || '-'), style: 'metaValue', bold: true, alignment: 'left', margin: [0, 1, 0, 1] },
        ];
      });

      headerCols.push({
        width: 'auto',
        table: {
          widths: ['auto', 'auto'],
          body: fieldRows,
        },
        layout: 'noBorders',
      });
    }

    docDefinition.content.push({
      columns: headerCols,
      margin: [0, 0, 0, 12],
    });
  }

  // 2. Metadata / Info Grid Section
  if (sections.metadata && sections.metadata.enabled && Array.isArray(sections.metadata.blocks)) {
    const blocks = sections.metadata.blocks;
    const cols = blocks.map((block) => {
      const fieldLines = (block.fields || []).map((f) => {
        const val = f.key ? getNestedValue(data, f.key, f.value) : f.value;
        return {
          text: [
            { text: `${f.label}: `, bold: true, color: '#475569', fontSize: 8 },
            { text: String(val || '-'), color: '#1e293b', fontSize: 8 },
          ],
          margin: [0, 1, 0, 1],
        };
      });

      return {
        width: `${Math.floor(100 / blocks.length)}%`,
        stack: [
          { text: block.title ? block.title.toUpperCase() : 'INFO', style: 'blockTitle' },
          ...fieldLines,
        ],
      };
    });

    docDefinition.content.push({
      columns: cols,
      margin: [0, 0, 0, 14],
    });
  }

  // Extract tabular rows from data payload
  let tableRows = [];
  if (sections.table && sections.table.enabled) {
    const dataKey = sections.table.dataKey;
    if (dataKey) {
      tableRows = getNestedValue(data, dataKey, []);
    } else if (Array.isArray(data)) {
      tableRows = data;
    }

    if (!Array.isArray(tableRows)) {
      tableRows = [];
    }
  }

  // 3. Table Section
  if (
    sections.table &&
    sections.table.enabled &&
    Array.isArray(sections.table.columns) &&
    sections.table.columns.length > 0
  ) {
    const tbl = sections.table;
    const style = tbl.style || {};
    const cols = tbl.columns;

    if (tbl.title) {
      docDefinition.content.push({ text: tbl.title, style: 'sectionTitle' });
    }

    // Header row
    const headerRow = cols.map((col) => ({
      text: col.header,
      style: 'tableHeader',
      fillColor: style.headerBg || accentColor,
      color: style.headerColor || '#ffffff',
      alignment: col.align || 'left',
      fontSize: style.fontSize || 8.5,
    }));

    // Data rows
    const bodyRows = tableRows.map((rowItem, rowIndex) => {
      const isStriped = style.striped && rowIndex % 2 === 1;
      const rowFillColor = isStriped ? (style.stripedBg || '#f8fafc') : null;

      return cols.map((col) => {
        const rawVal = getNestedValue(rowItem, col.fieldKey, '');
        const formattedVal = formatValue(rawVal, col.format);

        return {
          text: formattedVal,
          style: 'tableCell',
          alignment: col.align || 'left',
          fontSize: style.fontSize || 8,
          fillColor: rowFillColor,
        };
      });
    });

    const widths = cols.map((c) => (c.width === '*' ? '*' : c.width === 'auto' ? 'auto' : Number(c.width) || 'auto'));

    docDefinition.content.push({
      table: {
        headerRows: 1,
        widths,
        body: [headerRow, ...bodyRows],
      },
      layout: style.borderStyle || 'lightHorizontalLines',
      margin: [0, 4, 0, 12],
    });
  }

  // 4. Summary / Totals Section
  if (sections.summary && sections.summary.enabled && Array.isArray(sections.summary.rows)) {
    const sum = sections.summary;
    const summaryRows = sum.rows.map((r) => {
      let finalVal = 0;
      if (r.type === 'aggregate') {
        finalVal = computeAggregate(tableRows, r.targetColumn, r.aggregate);
      } else if (r.type === 'binding' && r.dataKey) {
        finalVal = getNestedValue(data, r.dataKey, r.value || 0);
      } else {
        finalVal = r.value || 0;
      }

      return [
        { text: r.label, style: 'summaryLabel', bold: !!r.isBold, alignment: 'left', margin: [4, 2, 8, 2] },
        { text: formatValue(finalVal, r.format || 'currency'), style: 'summaryValue', bold: !!r.isBold, alignment: 'right', margin: [4, 2, 4, 2] },
      ];
    });

    const summaryBlock = {
      table: {
        widths: ['*', 'auto'],
        body: summaryRows,
      },
      layout: 'lightHorizontalLines',
    };

    if (sum.alignment === 'right') {
      docDefinition.content.push({
        columns: [
          { width: '*', text: '' }, // empty spacer pushing table to right
          { width: sum.width || '45%', ...summaryBlock },
        ],
        margin: [0, 4, 0, 14],
      });
    } else {
      docDefinition.content.push({
        width: sum.width || '45%',
        ...summaryBlock,
        margin: [0, 4, 0, 14],
      });
    }
  }

  // 5. Footer Section
  if (sections.footer && sections.footer.enabled) {
    const ftr = sections.footer;
    const notesStack = [];

    if (ftr.notes) {
      notesStack.push({ text: `Notes: ${ftr.notes}`, style: 'footerText', bold: false });
    }
    if (ftr.terms) {
      notesStack.push({ text: `Terms: ${ftr.terms}`, style: 'footerText', italics: true, margin: [0, 2, 0, 0] });
    }

    if (notesStack.length > 0) {
      docDefinition.content.push({
        stack: notesStack,
        margin: [0, 6, 0, 0],
      });
    }

    if (ftr.showPageNumbers || ftr.customText) {
      docDefinition.footer = function (currentPage, pageCount) {
        const footerCols = [];
        if (ftr.customText) {
          footerCols.push({ text: ftr.customText, alignment: 'left', fontSize: 7, color: '#94a3b8' });
        }
        if (ftr.showPageNumbers) {
          footerCols.push({ text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', fontSize: 7, color: '#94a3b8' });
        }
        return {
          columns: footerCols,
          margin: [page.pageMargins ? page.pageMargins[0] : 36, 12, page.pageMargins ? page.pageMargins[2] : 36, 0],
        };
      };
    }
  }

  return docDefinition;
}

/**
 * Downloads a generated PDF directly in the browser
 */
export function downloadPdf(template, data, filename = 'report.pdf') {
  try {
    const docDef = buildPdfDocDefinition(template, data);
    const pdf = pdfMake.createPdf(docDef);
    pdf.download(filename);
    return true;
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
    throw error;
  }
}

/**
 * Generates a data URL for iframe preview
 */
export function getPdfDataUrl(template, data) {
  return new Promise((resolve, reject) => {
    try {
      const docDef = buildPdfDocDefinition(template, data);
      const pdf = pdfMake.createPdf(docDef);
      pdf.getDataUrl((url) => {
        resolve(url);
      });
    } catch (error) {
      console.error('Error creating PDF preview URL:', error);
      reject(error);
    }
  });
}

