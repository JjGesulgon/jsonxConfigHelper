import { buildGeneratedConfigArtifact } from './configArtifact';

export function buildGeneratedFormConfig(schema, uiSchema, exportName) {
  if (!schema || !uiSchema) return null;

  const { configObject } = buildGeneratedConfigArtifact(schema, exportName);

  return {
    ...configObject,
    schema,
    uiSchema,
  };
}
