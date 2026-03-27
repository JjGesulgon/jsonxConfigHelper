// src/utils/uiSchemaGenerator.js
import { DASH_FIELD_DICTIONARY, DASH_PATTERN_RULES } from '../constants/fieldDictionary';
import { toTitleCase } from './naming';
import enrichSchemaFromApi from './schemaEnricher';

function getDictionaryRule(name) {
  return DASH_FIELD_DICTIONARY[name] || null;
}

function getPatternRule(name) {
  const match = DASH_PATTERN_RULES.find((entry) => entry.test(name));
  return match ? match.rule : null;
}

function getSchemaRule(name, field, depth = 0) {
  const hasEnum = Array.isArray(field?.enum) && field.enum.length > 0;
  const uiType = field?.__ui_type;
  const isNested = depth > 0;

  if (hasEnum) {
    const isRadio = uiType === 'radio';

    return {
      widget: isRadio ? 'radio' : 'SelectWidget',
      placeholder: isRadio ? undefined : `Select ${field?.title || toTitleCase(name)}`,
      flex: isNested ? 12 : 6,
      props: 'initialFormProps',
      options: {
        ...(isRadio ? { inline: false } : {}),
        ...(Array.isArray(field?.enumNames) ? { enumNames: field.enumNames } : {}),
      },
    };
  }

  if (
    field?.pattern === 'contact_number_ph' ||
    name === 'contact_number' ||
    name === 'phone_number' ||
    name === 'mobile_number' ||
    name === 'phone'
  ) {
    return {
      widget: 'CustomContactInputWidget',
      placeholder: 'XXX-XXX-XXXX',
      flex: isNested ? 12 : 6,
      options: {
        widget: 'CustomContactInputWidget',
      },
      props: {
        __spreadInitialFormProps: true,
        field: {
          __spreadInitialFormPropsField: true,
          sx: {
            '.MuiInputBase-root': {
              '.MuiInputAdornment-root': {
                marginRight: '0px',
              },
            },
          },
        },
      },
    };
  }

  if (field?.format === 'textarea' || field?.__ui_type === 'textarea') {
    return {
      widget: 'textarea',
      placeholder: `Enter ${field?.title || toTitleCase(name)}`,
      flex: 12,
      props: 'initialFormProps',
      options: {
        rows: 4,
      },
    };
  }

  return null;
}

function getDefaultRule(name, field, depth = 0) {
  return {
    placeholder: `Enter ${field?.title || toTitleCase(name)}`,
    flex: depth > 0 ? 12 : 6,
    props: 'initialFormProps',
  };
}

function resolveFieldRule(name, field, depth = 0) {
  return (
    getSchemaRule(name, field, depth) ||
    getDictionaryRule(name) ||
    getPatternRule(name) ||
    getDefaultRule(name, field, depth)
  );
}

export function buildFieldUiSchema(name, field, depth = 0) {
  const rule = resolveFieldRule(name, field, depth);

  const result = {
    'ui:fieldFlexWidth': rule.flex ?? (depth > 0 ? 12 : 6),
  };

  if (rule.placeholder) {
    result['ui:placeholder'] = rule.placeholder;
  }

  if (rule.widget) {
    result['ui:widget'] = rule.widget;
  }

  if (rule.options) {
    result['ui:options'] = rule.options;
  }

  result.props = rule.props ?? 'initialFormProps';

  return result;
}

// function buildArrayItemUiSchema(itemsDef, depth = 0) {
//   if (!itemsDef) return {};

//   if (itemsDef.type === 'object' && itemsDef.properties) {
//     return buildGroupUiSchema(itemsDef, depth + 1);
//   }

//   if (itemsDef.type === 'array') {
//     return buildArrayUiSchema(itemsDef, depth + 1);
//   }

//   return buildFieldUiSchema(itemsDef.title || 'item', itemsDef, depth + 1);
// }

function buildArrayUiSchema(arrayDef, depth = 0) {
  const itemsDef = arrayDef?.items;

  const arraySchema = {
    'ui:fieldFlexWidth': 12,
    'ui:options': {
      orderable: true,
      addable: true,
      removable: true,
    },
    props: 'initialFormProps',
  };

  if (!itemsDef) {
    return arraySchema;
  }

  if (itemsDef.type === 'object' && itemsDef.properties) {
    arraySchema.items = buildGroupUiSchema(itemsDef, depth + 1);
    return arraySchema;
  }

  if (itemsDef.type === 'array') {
    arraySchema.items = buildArrayUiSchema(itemsDef, depth + 1);
    return arraySchema;
  }

  arraySchema.items = buildFieldUiSchema('item', itemsDef, depth + 1);
  return arraySchema;
}

function buildGroupUiSchema(groupDef, depth = 0) {
  const groupSchema = {
    'ui:fieldFlexWidth': 12,
    title: {
      props: {
        sx: {
          fontSize: '18px',
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
  };

  Object.entries(groupDef.properties || {}).forEach(([fieldName, fieldDef]) => {
    if (fieldDef?.type === 'object' && fieldDef?.properties) {
      groupSchema[fieldName] = buildGroupUiSchema(fieldDef, depth + 1);
      return;
    }

    if (fieldDef?.type === 'array') {
      groupSchema[fieldName] = buildArrayUiSchema(fieldDef, depth + 1);
      return;
    }

    groupSchema[fieldName] = buildFieldUiSchema(fieldName, fieldDef, depth + 1);
  });

  return groupSchema;
}

function buildUiSchemaFromEnrichedSchema(schema) {
  const result = {};
  const topProperties = schema?.properties || {};

  Object.entries(topProperties).forEach(([groupName, groupDef]) => {
    if (groupDef?.type === 'object' && groupDef?.properties) {
      result[groupName] = buildGroupUiSchema(groupDef, 0);
      return;
    }

    if (groupDef?.type === 'array') {
      result[groupName] = buildArrayUiSchema(groupDef, 0);
      return;
    }

    result[groupName] = buildFieldUiSchema(groupName, groupDef, 0);
  });

  result.submit_button = {
    norender: false,
    props: {
      sx: { display: 'none' },
    },
  };

  return result;
}

export function generateUiSchemaFromSchema(schema, apiResponse = null) {
  const enrichedSchema = apiResponse ? enrichSchemaFromApi(schema, apiResponse) : schema;
  return buildUiSchemaFromEnrichedSchema(enrichedSchema);
}