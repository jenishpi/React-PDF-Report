/**
 * Data Discovery & Introspection Utility
 * Introspects JSON payloads to automatically discover scalar keys, array sources,
 * and infer column formats for visual data binding.
 */

/**
 * Humanize a camelCase or snake_case key into a readable label
 * e.g. "invoiceNumber" -> "Invoice Number", "total_amount" -> "Total Amount"
 */
export function humanizeKey(key) {
  if (!key || typeof key !== 'string') return '';
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

/**
 * Infer formatter type based on sample value
 * Returns 'currency' | 'number' | 'date' | 'text'
 */
export function inferFieldType(value, keyName = '') {
  if (value === null || value === undefined) return 'text';

  const keyLower = String(keyName).toLowerCase();

  // Check quantity / count keywords first before currency
  if (
    keyLower.includes('qty') ||
    keyLower.includes('quantity') ||
    keyLower.includes('count') ||
    keyLower.includes('units') ||
    keyLower.includes('items') ||
    keyLower.includes('reorder')
  ) {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
    if (!isNaN(num)) return 'number';
  }

  // If key suggests currency / pricing
  if (
    keyLower.includes('price') ||
    keyLower.includes('amount') ||
    keyLower.includes('cost') ||
    keyLower.includes('total') ||
    keyLower.includes('rate') ||
    keyLower.includes('fee') ||
    keyLower.includes('vat') ||
    keyLower.includes('tax') ||
    keyLower.includes('balance') ||
    keyLower.includes('subtotal')
  ) {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
    if (!isNaN(num)) return 'currency';
  }

  // If key suggests date
  if (keyLower.includes('date') || keyLower.includes('time')) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return 'date';
  }

  // Check pure numbers
  if (typeof value === 'number') {
    return 'number';
  }

  // Check numeric strings (e.g. "123.45")
  if (typeof value === 'string') {
    const cleanStr = value.trim();
    if (/^-?\d+(\.\d+)?$/.test(cleanStr)) {
      return 'number';
    }

    // Check ISO or standard date strings (e.g. "2026-11-05", "07/06/2019")
    if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(cleanStr) || /^\d{2}[-/]\d{2}[-/]\d{4}/.test(cleanStr)) {
      const parsed = Date.parse(cleanStr);
      if (!isNaN(parsed)) return 'date';
    }
  }

  return 'text';
}

/**
 * Recursively extracts all scalar field paths (e.g. "customer.name", "invoiceNumber")
 * @param {object} obj - JSON payload
 * @param {string} prefix - Current dot-path prefix
 * @param {number} depth - Prevent circular or overly deep structures
 * @returns {Array<{ path: string, label: string, sampleValue: any, type: string }>}
 */
export function extractScalarPaths(obj, prefix = '', depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return [];

  const results = [];

  for (const [key, value] of Object.entries(obj)) {
    // Skip internal or prototype keys
    if (key.startsWith('_')) continue;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      results.push({
        path: currentPath,
        label: humanizeKey(key),
        sampleValue: '',
        type: 'text',
      });
    } else if (Array.isArray(value)) {
      // Arrays are captured separately as array sources
      continue;
    } else if (typeof value === 'object') {
      // Recurse into nested objects
      results.push(...extractScalarPaths(value, currentPath, depth + 1));
    } else {
      // Scalar primitive
      results.push({
        path: currentPath,
        label: humanizeKey(key),
        sampleValue: value,
        type: inferFieldType(value, key),
      });
    }
  }

  return results;
}

/**
 * Discovers all available array sources in a JSON payload.
 * Also checks if the root payload itself is an array.
 * @param {any} data
 * @returns {Array<{ key: string, label: string, count: number, fields: Array<{ key: string, label: string, sample: any, type: string }> }>}
 */
export function discoverArraySources(data) {
  const sources = [];

  if (!data) return sources;

  // Case 1: Root is an array (e.g. JSON_PRODUCT_DATA directly)
  if (Array.isArray(data)) {
    const fields = inspectArrayItemFields(data);
    sources.push({
      key: '', // empty key means root array
      label: 'Root Dataset',
      count: data.length,
      fields,
    });
    return sources;
  }

  // Case 2: Object containing array properties
  if (typeof data === 'object') {
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        const fields = inspectArrayItemFields(val);
        sources.push({
          key,
          label: humanizeKey(key),
          count: val.length,
          fields,
        });
      }
    }
  }

  return sources;
}

/**
 * Inspects items within an array to determine all unique property keys and types
 */
function inspectArrayItemFields(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  const fieldMap = new Map();

  // Inspect up to first 10 items to gather keys
  const sampleItems = arr.slice(0, 10);

  for (const item of sampleItems) {
    if (!item || typeof item !== 'object') continue;

    for (const [k, v] of Object.entries(item)) {
      if (!fieldMap.has(k)) {
        fieldMap.set(k, {
          key: k,
          label: humanizeKey(k),
          sample: v,
          type: inferFieldType(v, k),
        });
      }
    }
  }

  return Array.from(fieldMap.values());
}

/**
 * Automatically creates suggested table columns from an array source
 */
export function generateSuggestedColumns(fields) {
  if (!Array.isArray(fields) || fields.length === 0) return [];

  return fields.map((f, idx) => {
    let align = 'left';
    let width = '*';

    if (f.type === 'currency' || f.type === 'number') {
      align = 'right';
      width = 80;
    } else if (f.type === 'date') {
      align = 'center';
      width = 85;
    }

    return {
      id: `col_${Date.now()}_${idx}`,
      header: f.label,
      fieldKey: f.key,
      width,
      align,
      format: f.type,
    };
  });
}

