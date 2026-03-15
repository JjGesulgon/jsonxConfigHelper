import { INITIAL_FORM_PROPS_CODE } from "../constants/prompts";
import { buildGeneratedConfigArtifact } from "./configArtifact";
import { generateUiSchemaFromSchema } from "./uiSchemaGenerator";

export function objectToCode(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const nextPad = "  ".repeat(indent + 1);

  if (value === null) return "null";
  if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[${value.map((v) => objectToCode(v, indent + 1)).join(", ")}]`;
  }

  if (typeof value !== "object") return "undefined";

  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";

  return `{
${entries
  .map(([key, val]) => {
    const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`;
    return `${nextPad}${safeKey}: ${objectToCode(val, indent + 1)}`;
  })
  .join(",\n")}
${pad}}`;
}

export function postProcessCode(code) {
  return code
    .replace(/'initialFormProps'/g, "initialFormProps")
    .replace(/\{\n(\s*)__spreadInitialFormProps: true,([\s\S]*?)\n\1\}/g, "{\n$1  ...initialFormProps,$2\n$1}")
    .replace(/\{\n(\s*)__spreadInitialFormPropsField: true,([\s\S]*?)\n\1\}/g, "{\n$1  ...initialFormProps?.field,$2\n$1}");
}

export function generateTypescriptModuleFromArtifacts(schema, uiSchema, exportName) {
  const { schemaExportName, uiSchemaExportName, configExportName, configObject } =
    buildGeneratedConfigArtifact(schema, exportName);

  const rawSchemaCode = objectToCode(schema, 0);
  const rawUiSchemaCode = objectToCode(uiSchema, 0);
  const processedUiSchemaCode = postProcessCode(rawUiSchemaCode);
  const rawConfigCode = objectToCode(configObject, 0)
    .replace(new RegExp(`'__REF__${schemaExportName}'`, "g"), schemaExportName)
    .replace(new RegExp(`'__REF__${uiSchemaExportName}'`, "g"), uiSchemaExportName);

  return `${INITIAL_FORM_PROPS_CODE}

export const ${schemaExportName} = ${rawSchemaCode};

export const ${uiSchemaExportName} = ${processedUiSchemaCode};

export const ${configExportName} = ${rawConfigCode};`;
}

export function generateTypescriptModule(schema, exportName) {
  return generateTypescriptModuleFromArtifacts(
    schema,
    generateUiSchemaFromSchema(schema),
    exportName
  );
}