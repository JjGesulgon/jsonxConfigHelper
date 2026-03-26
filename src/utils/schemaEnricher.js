// src/utils/schemaEnricher.js

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isOptionDrivenField(value) {
  return (
    isPlainObject(value) &&
    'value' in value &&
    Array.isArray(value.options)
  );
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function looksLikeEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function looksLikeDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function looksLikeDateTime(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/.test(value)
  );
}

function looksLikeLongText(value) {
  return typeof value === 'string' && value.trim().length > 80;
}

function inferTypeFromValue(value, fallback = 'string') {
  if (typeof value === 'boolean') return 'boolean';

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number';
  }

  if (typeof value === 'string') return 'string';

  if (Array.isArray(value)) return 'array';

  if (isPlainObject(value)) return 'object';

  return fallback;
}

function inferPatternFromFieldName(fieldName) {
  const name = String(fieldName || '').toLowerCase();

  if (
    name === 'contact_number' ||
    name === 'mobile_number' ||
    name === 'phone_number' ||
    name === 'phone' ||
    name === 'mobile'
  ) {
    return 'contact_number_ph';
  }

  if (name === 'postal_code' || name === 'zip_code') {
    return 'ph_postal_code';
  }

  if (name === 'first_name') return 'first_name';
  if (name === 'last_name') return 'last_name';
  if (name === 'full_name' || name === 'recipient_name') return 'full_name';

  return null;
}

function inferFormatFromField(fieldName, value) {
  const name = String(fieldName || '').toLowerCase();

  if (looksLikeEmail(value) || name.includes('email')) {
    return 'email';
  }

  if (looksLikeDateTime(value) || name.endsWith('_at') || name.includes('datetime')) {
    return 'date-time';
  }

  if (looksLikeDate(value) || name.endsWith('_date') || name.includes('birth_date')) {
    return 'date';
  }

  return null;
}

function inferUiTypeFromField(fieldName, value) {
  const name = String(fieldName || '').toLowerCase();

  if (
    name.includes('description') ||
    name.includes('instruction') ||
    name.includes('remarks') ||
    name.includes('notes') ||
    (name.includes('address') && typeof value === 'string' && value.length > 30) ||
    looksLikeLongText(value)
  ) {
    return 'textarea';
  }

  return null;
}

function enrichPrimitiveNode(enrichedNode, apiValue, fieldName) {
  if (!enrichedNode.type) {
    enrichedNode.type = inferTypeFromValue(apiValue, 'string');
  }

  const inferredFormat = inferFormatFromField(fieldName, apiValue);
  if (inferredFormat && !enrichedNode.format) {
    enrichedNode.format = inferredFormat;
  }

  const inferredPattern = inferPatternFromFieldName(fieldName);
  if (inferredPattern && !enrichedNode.pattern) {
    enrichedNode.pattern = inferredPattern;
  }

  const inferredUiType = inferUiTypeFromField(fieldName, apiValue);
  if (inferredUiType && !enrichedNode.__ui_type) {
    enrichedNode.__ui_type = inferredUiType;
  }

  if (apiValue !== undefined && enrichedNode.default === undefined) {
    enrichedNode.default = apiValue;
  }

  return enrichedNode;
}

function enrichOptionDrivenNode(enrichedNode, apiNode, fieldName) {
  const selectedValue = apiNode?.value;
  const options = Array.isArray(apiNode?.options) ? apiNode.options : [];

  if (!enrichedNode.type) {
    enrichedNode.type = inferTypeFromValue(selectedValue, 'string');
  }

  enrichedNode.enum = options.map((option) => option.value);
  enrichedNode.enumNames = options.map((option) => option.label ?? option.value);

  if (apiNode?.ui_type) {
    enrichedNode.__ui_type = apiNode.ui_type;
  }

  const inferredFormat = inferFormatFromField(fieldName, selectedValue);
  if (inferredFormat && !enrichedNode.format) {
    enrichedNode.format = inferredFormat;
  }

  const inferredPattern = inferPatternFromFieldName(fieldName);
  if (inferredPattern && !enrichedNode.pattern) {
    enrichedNode.pattern = inferredPattern;
  }

  const inferredUiType = inferUiTypeFromField(fieldName, selectedValue);
  if (inferredUiType && !enrichedNode.__ui_type) {
    enrichedNode.__ui_type = inferredUiType;
  }

  if (selectedValue !== undefined && enrichedNode.default === undefined) {
    enrichedNode.default = selectedValue;
  }

  return enrichedNode;
}

function enrichSchemaNode(schemaNode, apiNode, fieldName = '') {
  if (!isPlainObject(schemaNode)) {
    return schemaNode;
  }

  const enrichedNode = deepClone(schemaNode);

  if (enrichedNode.type === 'object' && isPlainObject(enrichedNode.properties)) {
    Object.entries(enrichedNode.properties).forEach(([key, childSchema]) => {
      const apiValue = isPlainObject(apiNode) ? apiNode[key] : undefined;
      enrichedNode.properties[key] = enrichSchemaNode(childSchema, apiValue, key);
    });

    return enrichedNode;
  }

  if (enrichedNode.type === 'array') {
    if (Array.isArray(apiNode) && enrichedNode.items && apiNode.length > 0) {
      enrichedNode.items = enrichSchemaNode(enrichedNode.items, apiNode[0], fieldName);
    }

    if (enrichedNode.default === undefined && Array.isArray(apiNode)) {
      enrichedNode.default = apiNode;
    }

    return enrichedNode;
  }

  if (isOptionDrivenField(apiNode)) {
    return enrichOptionDrivenNode(enrichedNode, apiNode, fieldName);
  }

  if (apiNode !== undefined && !isPlainObject(apiNode)) {
    return enrichPrimitiveNode(enrichedNode, apiNode, fieldName);
  }

  return enrichedNode;
}

export function enrichSchemaFromApi(schema, apiResponse) {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  const apiData =
    apiResponse?.data && typeof apiResponse.data === 'object'
      ? apiResponse.data
      : apiResponse;

  return enrichSchemaNode(schema, apiData);
}

export default enrichSchemaFromApi;