import { DASH_FIELD_DICTIONARY, DASH_PATTERN_RULES } from '../constants/fieldDictionary';
import { toTitleCase } from './naming';

function getDictionaryRule(name) {
  return DASH_FIELD_DICTIONARY[name] || null;
}

function getPatternRule(name) {
  const match = DASH_PATTERN_RULES.find((entry) => entry.test(name));
  return match ? match.rule : null;
}

function getSchemaRule(name, field) {
  if (Array.isArray(field?.enum) && field.enum.length > 0) {
    return {
      widget: 'SelectWidget',
      placeholder: `Select ${field?.title || toTitleCase(name)}`,
      flex: 6,
      props: 'initialFormProps',
    };
  }

  if (field?.pattern === 'contact_number_ph' || name.includes('contact_number')) {
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
    getDictionaryRule(name) ||
    getPatternRule(name) ||
    getSchemaRule(name, field) ||
    getDefaultRule(name, field)
  );
}

export function buildFieldUiSchema(name, field) {
  const rule = resolveFieldRule(name, field);

  const result = {
    'ui:placeholder': rule.placeholder,
    'ui:fieldFlexWidth': rule.flex ?? 6,
  };

  if (rule.widget === 'SelectWidget') {
    result['ui:widget'] = 'SelectWidget';
  }

  if (rule.options) {
    result['ui:options'] = rule.options;
  }

  result.props = rule.props ?? 'initialFormProps';

  return result;
}

export function generateUiSchemaFromSchema(schema) {
  const result = {};
  const topProperties = schema?.properties || {};

  Object.entries(topProperties).forEach(([groupName, groupDef]) => {
    if (groupDef?.type === 'object' && groupDef?.properties) {
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

      Object.entries(groupDef.properties).forEach(([fieldName, fieldDef]) => {
        groupSchema[fieldName] = buildFieldUiSchema(fieldName, fieldDef);
      });

      result[groupName] = groupSchema;
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