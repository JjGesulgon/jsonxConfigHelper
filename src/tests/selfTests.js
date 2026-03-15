import { sampleApiResponseText, sampleSchemaText } from '../constants/samples';
import { generateTypescriptModule } from '../utils/codegen';
import { inferSchemaFromApiResponse } from '../utils/schemaInference';
import { generateUiSchemaFromSchema } from '../utils/uiSchemaGenerator';

export function runSelfTests() {
  const testSchema = JSON.parse(sampleSchemaText);
  const generated = generateUiSchemaFromSchema(testSchema);
  const inferredSchema = inferSchemaFromApiResponse(
    JSON.parse(sampleApiResponseText),
    'Generated Form'
  );

  return [
    {
      name: 'Generates billing_information group',
      pass: Boolean(generated.billing_information),
    },
    {
      name: 'Dictionary rule maps state_province to SelectWidget',
      pass: generated.billing_information?.state_province?.['ui:widget'] === 'SelectWidget',
    },
    {
      name: 'Dictionary rule maps city to SelectWidget',
      pass: generated.billing_information?.city?.['ui:widget'] === 'SelectWidget',
    },
    {
      name: 'Dictionary rule maps barangay to SelectWidget',
      pass: generated.billing_information?.barangay?.['ui:widget'] === 'SelectWidget',
    },
    {
      name: 'Dictionary rule maps contact_number to CustomContactInputWidget',
      pass:
        generated.billing_information?.contact_number?.['ui:options']?.widget ===
        'CustomContactInputWidget',
    },
    {
      name: 'Dictionary rule uses first_name placeholder',
      pass:
        generated.billing_information?.first_name?.['ui:placeholder'] === 'Enter First Name',
    },
    {
      name: 'Dictionary rule uses state_province placeholder',
      pass:
        generated.billing_information?.state_province?.['ui:placeholder'] === 'Select Region',
    },
    {
      name: 'Adds hidden submit_button',
      pass: generated.submit_button?.props?.sx?.display === 'none',
    },
    {
      name: 'Generates TypeScript exports',
      pass:
        generateTypescriptModule(testSchema, 'paymentUiSchema').includes(
          'export const paymentSchema ='
        ) &&
        generateTypescriptModule(testSchema, 'paymentUiSchema').includes(
          'export const paymentUiSchema ='
        ) &&
        generateTypescriptModule(testSchema, 'paymentUiSchema').includes(
          'export const payment_config ='
        ),
    },
    {
      name: 'Infers schema from API response',
      pass: inferredSchema.properties?.billing_information?.type === 'object',
    },
  ];
}