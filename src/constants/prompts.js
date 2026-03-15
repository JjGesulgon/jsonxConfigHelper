export const SYSTEM_PROMPT = `You are a JSONX form config generator for a Dash-based frontend system.
Return valid JSON only.
Do not wrap the response in markdown.
The JSON must follow this shape:
{
  "uiSchema": { ... },
  "notes": ["..."]
}`;

export const HYBRID_REVIEW_PROMPT = `You are reviewing an already-generated Dash JSONX uiSchema.
Return valid JSON only.
Do not wrap the response in markdown.
The JSON must follow this shape:
{
  "uiSchema": { ... },
  "notes": ["..."]
}`;

export const INITIAL_FORM_PROPS_CODE = `export const initialFormProps = {
  formControl: { sx: {} },
  formLabel: { sx: cart_mapp_styling_adjustments?.midComponentLabel },
  field: { size: 'small', sx: {} },
};`;