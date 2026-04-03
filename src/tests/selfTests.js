import { generateTypescriptModule } from '../utils/codegen';
import { inferSchemaFromApiResponse } from '../utils/schemaInference';
import { generateUiSchemaFromSchema } from '../utils/uiSchemaGenerator';

function safeParseJson(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function createTest(name, passed, message = '') {
  return {
    name,
    passed: Boolean(passed),
    message,
  };
}

export function runSelfTests({
  schemaText = '',
  apiResponseText = '',
  exportName = 'generatedUiSchema',
} = {}) {
  const testSchema = safeParseJson(schemaText);
  const apiResponse = safeParseJson(apiResponseText);

  if (!testSchema) {
    return [
      createTest('Schema JSON is valid', false, 'Schema text could not be parsed as valid JSON.'),
    ];
  }

  if (!apiResponse) {
    return [
      createTest(
        'API response JSON is valid',
        false,
        'API response text could not be parsed as valid JSON.'
      ),
    ];
  }

  let generated = null;
  let inferredSchema = null;
  let typescriptModule = '';

  try {
    generated = generateUiSchemaFromSchema(testSchema, apiResponse);
  } catch (error) {
    return [
      createTest('Schema JSON is valid', true, 'Schema text parsed successfully.'),
      createTest('API response JSON is valid', true, 'API response text parsed successfully.'),
      createTest(
        'Generates UI schema from current inputs',
        false,
        error?.message || 'UI schema generation failed.'
      ),
    ];
  }

  try {
    inferredSchema = inferSchemaFromApiResponse(apiResponse, 'Generated Form');
  } catch (error) {
    inferredSchema = null;
  }

  try {
    typescriptModule = generateTypescriptModule(testSchema, exportName);
  } catch (error) {
    typescriptModule = '';
  }

  const rootGroupKey = Object.keys(generated || {}).find((key) => {
    if (key === 'submit_button') return false;
    const value = generated?.[key];
    return value && typeof value === 'object' && !Array.isArray(value);
  });

  const rootGroup = rootGroupKey ? generated?.[rootGroupKey] : null;

  const stateProvinceField = rootGroup?.state_province;
  const cityField = rootGroup?.city;
  const barangayField = rootGroup?.barangay;
  const contactNumberField = rootGroup?.contact_number;
  const firstNameField = rootGroup?.first_name;
  const submitButton = generated?.submit_button;

  return [
    createTest('Schema JSON is valid', true, 'Schema text parsed successfully.'),
    createTest('API response JSON is valid', true, 'API response text parsed successfully.'),
    createTest(
      'Generates at least one top-level group',
      Boolean(rootGroupKey),
      rootGroupKey
        ? `Detected top-level group: ${rootGroupKey}`
        : 'No top-level group was generated.'
    ),
    createTest(
      'Adds hidden submit_button',
      submitButton?.props?.sx?.display === 'none',
      submitButton?.props?.sx?.display === 'none'
        ? 'Hidden submit button is present.'
        : 'Hidden submit button is missing or not hidden.'
    ),
    createTest(
      'Generates TypeScript export output',
      typescriptModule.includes('export const'),
      typescriptModule.includes('export const')
        ? 'TypeScript export content was generated.'
        : 'TypeScript export content was not generated.'
    ),
    createTest(
      'Infers schema from API response',
      Boolean(
        inferredSchema &&
          inferredSchema.type === 'object' &&
          inferredSchema.properties &&
          Object.keys(inferredSchema.properties).length > 0
      ),
      inferredSchema?.properties
        ? `Inferred ${Object.keys(inferredSchema.properties).length} top-level properties.`
        : 'No inferred schema properties were produced.'
    ),
    createTest(
      'Maps state_province to SelectWidget when present',
      !stateProvinceField || stateProvinceField?.['ui:widget'] === 'SelectWidget',
      !stateProvinceField
        ? 'state_province not present in current group.'
        : `Resolved widget: ${stateProvinceField?.['ui:widget'] || 'none'}`
    ),
    createTest(
      'Maps city to SelectWidget when present',
      !cityField || cityField?.['ui:widget'] === 'SelectWidget',
      !cityField ? 'city not present in current group.' : `Resolved widget: ${cityField?.['ui:widget'] || 'none'}`
    ),
    createTest(
      'Maps barangay to SelectWidget when present',
      !barangayField || barangayField?.['ui:widget'] === 'SelectWidget',
      !barangayField
        ? 'barangay not present in current group.'
        : `Resolved widget: ${barangayField?.['ui:widget'] || 'none'}`
    ),
    createTest(
      'Maps contact_number to CustomContactInputWidget when present',
      !contactNumberField ||
        contactNumberField?.['ui:options']?.widget === 'CustomContactInputWidget',
      !contactNumberField
        ? 'contact_number not present in current group.'
        : `Resolved custom widget: ${contactNumberField?.['ui:options']?.widget || 'none'}`
    ),
    createTest(
      'Sets first_name placeholder when present',
      !firstNameField || hasValue(firstNameField?.['ui:placeholder']),
      !firstNameField
        ? 'first_name not present in current group.'
        : `Resolved placeholder: ${firstNameField?.['ui:placeholder'] || 'none'}`
    ),
    createTest(
      'Sets state_province placeholder when present',
      !stateProvinceField || hasValue(stateProvinceField?.['ui:placeholder']),
      !stateProvinceField
        ? 'state_province not present in current group.'
        : `Resolved placeholder: ${stateProvinceField?.['ui:placeholder'] || 'none'}`
    ),
  ];
}