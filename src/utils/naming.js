export function toTitleCase(input) {
  return String(input || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function toCamelCase(input) {
  return String(input || '')
    .trim()
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toLowerCase())
    .replace(/[^A-Za-z0-9]/g, '');
}

export function sanitizeExportName(input) {
  const fallback = 'generatedUiSchema';
  const cleaned = toCamelCase(input);
  if (!cleaned) return fallback;
  if (/^[0-9]/.test(cleaned)) return fallback;
  return cleaned.replace(/UiSchema$/i, '') + 'UiSchema';
}

export function suggestExportNameFromSchema(schema, sourceMode = 'schema') {
  if (!schema || typeof schema !== 'object') return 'generatedUiSchema';

  if (sourceMode === 'schema' && schema.title) {
    return sanitizeExportName(schema.title);
  }

  const keys = Object.keys(schema.properties || {});
  if (keys.length === 1) return sanitizeExportName(keys[0]);
  if (keys.length > 1) return sanitizeExportName(keys[0] + ' form');

  if (schema.title) return sanitizeExportName(schema.title);

  return 'generatedUiSchema';
}

export function getExportBaseName(exportName) {
  const cleaned = sanitizeExportName(exportName || 'generatedUiSchema');
  return cleaned.replace(/UiSchema$/i, '') || 'generated';
}

export function toSnakeCase(input) {
  return String(input || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}