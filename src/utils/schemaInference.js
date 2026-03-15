import { toTitleCase } from "./naming";

export function inferPrimitiveSchema(key, value) {
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

  if (key.includes("contact") || key.includes("phone")) schema.pattern = "contact_number_ph";
  if (key.includes("postal")) schema.pattern = "ph_postal_code";

  return schema;
}

export function inferSchemaFromApiResponse(payload, title = "Generated Form") {
  const properties = {};
  const required = [];

  Object.entries(payload || {}).forEach(([key, value]) => {
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