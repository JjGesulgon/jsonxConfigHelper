import { getExportBaseName, toSnakeCase } from "./naming";

export function buildGeneratedConfigArtifact(schema, exportName) {
  const baseName = getExportBaseName(exportName);
  const schemaExportName = `${baseName}Schema`;
  const uiSchemaExportName = `${baseName}UiSchema`;
  const configExportName = `${toSnakeCase(baseName)}_config`;
  const title = schema?.title || "Generated Form";
  const moduleName = toSnakeCase(baseName).replace(/_ui_schema$/i, "") || "generated";

  return {
    schemaExportName,
    uiSchemaExportName,
    configExportName,
    configObject: {
      module: moduleName,
      main_header: title,
      schema: `__REF__${schemaExportName}`,
      uiSchema: `__REF__${uiSchemaExportName}`,
      type: "prompt",
      prompt_size: "fullscreen",
      navigation_buttons: [
        {
          type: "button",
          label: "Cancel",
          color: "secondary",
          action: "onClosePrompt",
        },
        {
          type: "button",
          label: "Save",
          action: "onSaveDetails",
        },
      ],
    },
  };
}