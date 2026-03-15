import { SYSTEM_PROMPT, HYBRID_REVIEW_PROMPT } from '../constants/prompts';

function buildUserPrompt(schema) {
  return `Generate a Dash-compatible JSONX uiSchema from this JSON schema.\n\nSchema:\n${JSON.stringify(schema, null, 2)}`;
}

function buildHybridPrompt(schema, baseUiSchema) {
  return `Review this Dash-compatible JSONX uiSchema and improve it conservatively.\n\nSchema:\n${JSON.stringify(schema, null, 2)}\n\nBase uiSchema:\n${JSON.stringify(baseUiSchema, null, 2)}`;
}

export async function callOpenAICompatibleApi({ apiKey, baseUrl, model, schema }) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(schema) },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content returned by API.');

  const parsed = JSON.parse(content);
  if (!parsed?.uiSchema || typeof parsed.uiSchema !== 'object') {
    throw new Error('Response JSON does not contain a valid uiSchema object.');
  }

  return parsed;
}

export async function callHybridReviewApi({ apiKey, baseUrl, model, schema, baseUiSchema }) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: HYBRID_REVIEW_PROMPT },
        { role: 'user', content: buildHybridPrompt(schema, baseUiSchema) },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content returned by API.');

  const parsed = JSON.parse(content);
  if (!parsed?.uiSchema || typeof parsed.uiSchema !== 'object') {
    throw new Error('Response JSON does not contain a valid uiSchema object.');
  }

  return parsed;
}