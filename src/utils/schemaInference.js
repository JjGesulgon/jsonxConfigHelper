import { toTitleCase } from "./naming";

const EXCLUDED_FIELD_NAMES = new Set([
  "status",
  "message",
  "created_at",
  "updated_at",
  "deleted_at",
]);

function shouldExcludeField(key) {
  if (!key) return false;

  if (EXCLUDED_FIELD_NAMES.has(key)) return true;

  if (key.endsWith("_id")) return true;

  return false;
}

function isSelectableFieldDescriptor(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.options)
  );
}

function inferSelectableFieldSchema(key, value) {
  const normalizedOptions = value.options
    .filter((opt) => opt && typeof opt === "object")
    .map((opt) => ({
      label: String(opt.label ?? opt.value ?? ""),
      value: opt.value,
    }))
    .filter((opt) => opt.label && opt.value !== undefined);

  return {
    title: toTitleCase(key),
    type: "string",
    enum: normalizedOptions.map((opt) => opt.value),
    enumNames: normalizedOptions.map((opt) => opt.label),
    default: value.value ?? "",
    __ui_type: value.ui_type || "select",
  };
}

export function inferPrimitiveSchema(key, value) {
  if (isSelectableFieldDescriptor(value)) {
    return inferSelectableFieldSchema(key, value);
  }

  if (Array.isArray(value)) {
    if (value.length > 0) {
      return {
        title: toTitleCase(key),
        type: "array",
        items: inferPrimitiveSchema(`${key}_item`, value[0]),
      };
    }

    return {
      title: toTitleCase(key),
      type: "array",
      items: { type: "string" },
    };
  }

  if (value !== null && typeof value === "object") {
    return inferSchemaFromApiResponse(value, toTitleCase(key));
  }

  if (typeof value === "number") {
    return {
      title: toTitleCase(key),
      type: Number.isInteger(value) ? "integer" : "number",
    };
  }

  if (typeof value === "boolean") {
    return {
      title: toTitleCase(key),
      type: "boolean",
    };
  }

  const schema = {
    title: toTitleCase(key),
    type: "string",
  };

  if (
    key.includes("contact_number") ||
    key.includes("phone_number") ||
    key === "phone" ||
    key === "mobile_number"
  ) {
    schema.pattern = "contact_number_ph";
  }

  if (key.includes("postal")) {
    schema.pattern = "ph_postal_code";
  }

  return schema;
}

export function inferSchemaFromApiResponse(payload, title = "Generated Form") {
  const properties = {};
  const required = [];

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (shouldExcludeField(key)) return;

    properties[key] = inferPrimitiveSchema(key, value);

    if (value !== null && value !== undefined && value !== "") {
      required.push(key);
    }
  });

  return {
    title,
    description: `Provide ${title.toLowerCase()} details.`,
    type: "object",
    required,
    properties,
  };
}