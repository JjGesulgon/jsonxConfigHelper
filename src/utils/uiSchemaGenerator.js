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

function getSchemaRule(name, field) {
  const hasEnum = Array.isArray(field?.enum) && field.enum.length > 0;
  const uiType = field?.__ui_type;

  if (hasEnum) {
    const isRadio = uiType === 'radio';

    return {
      widget: isRadio ? 'radio' : 'SelectWidget',
      placeholder: isRadio ? undefined : `Select ${field?.title || toTitleCase(name)}`,
      flex: 6,
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
      flex: 6,
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

function getDefaultRule(name, field) {
  return {
    placeholder: `Enter ${field?.title || toTitleCase(name)}`,
    flex: 6,
    props: 'initialFormProps',
  };
}

function resolveFieldRule(name, field) {
  return (
    getSchemaRule(name, field) ||
    getDictionaryRule(name) ||
    getPatternRule(name) ||
    getDefaultRule(name, field)
  );
}

export function buildFieldUiSchema(name, field) {
  const rule = resolveFieldRule(name, field);

  const result = {
    'ui:fieldFlexWidth': rule.flex ?? 6,
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

function buildGroupUiSchema(groupDef) {
  const groupSchema = {
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
      groupSchema[fieldName] = buildGroupUiSchema(fieldDef);
    } else {
      groupSchema[fieldName] = buildFieldUiSchema(fieldName, fieldDef);
    }
  });

  return groupSchema;
}

function buildUiSchemaFromEnrichedSchema(schema) {
  const result = {};
  const topProperties = schema?.properties || {};

  Object.entries(topProperties).forEach(([groupName, groupDef]) => {
    if (groupDef?.type === 'object' && groupDef?.properties) {
      result[groupName] = buildGroupUiSchema(groupDef);
    } else {
      result[groupName] = buildFieldUiSchema(groupName, groupDef);
    }
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