// src/utils/schemaEnricher.js

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isOptionDrivenField(value) {
  return (
    isPlainObject(value) &&
    'value' in value &&
    Array.isArray(value.options) &&
    typeof value.ui_type === 'string'
  );
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function enrichSchemaNode(schemaNode, apiNode) {
  if (!isPlainObject(schemaNode)) {
    return schemaNode;
  }

  const enrichedNode = deepClone(schemaNode);

  if (enrichedNode.type === 'object' && isPlainObject(enrichedNode.properties)) {
    Object.entries(enrichedNode.properties).forEach(([key, childSchema]) => {
      const apiValue = isPlainObject(apiNode) ? apiNode[key] : undefined;
      enrichedNode.properties[key] = enrichSchemaNode(childSchema, apiValue);
    });

    return enrichedNode;
  }

  if (isOptionDrivenField(apiNode)) {
    enrichedNode.enum = apiNode.options.map((option) => option.value);
    enrichedNode.enumNames = apiNode.options.map((option) => option.label);
    enrichedNode.__ui_type = apiNode.ui_type;

    if (apiNode.value !== undefined && enrichedNode.default === undefined) {
      enrichedNode.default = apiNode.value;
    }

    return enrichedNode;
  }

  if (apiNode !== undefined && !isPlainObject(apiNode) && enrichedNode.default === undefined) {
    enrichedNode.default = apiNode;
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