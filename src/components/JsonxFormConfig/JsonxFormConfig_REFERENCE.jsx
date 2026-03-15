import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Copy, Download, Wand2, XCircle } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-slate-200 p-5 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => <div className={`p-5 ${className}`}>{children}</div>;

const CardTitle = ({ children, className = '' }) => (
  <div className={`font-semibold text-slate-900 ${className}`}>{children}</div>
);

const Button = ({ children, className = '', variant = 'default', ...props }) => {
  const variantClass =
    variant === 'outline'
      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${className}`}
  />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${className}`}
  />
);

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ${className}`}>
    {children}
  </span>
);

const ScrollArea = ({ children, className = '' }) => <div className={`overflow-auto ${className}`}>{children}</div>;

const TabsContext = createContext(null);

const Tabs = ({ children, defaultValue, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '' }) => (
  <div className={`flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1 ${className}`}>{children}</div>
);

const TabsTrigger = ({ children, value, className = '' }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        activeTab === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value, className = '' }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

const sampleSchemaText = `{
  "title": "Payment",
  "description": "Select a payment option from the list below to complete your transaction.",
  "type": "object",
  "required": ["billing_information"],
  "properties": {
    "billing_information": {
      "title": "Billing Information",
      "type": "object",
      "required": [
        "first_name",
        "last_name",
        "address",
        "state_province",
        "city",
        "barangay",
        "postal_code",
        "contact_number"
      ],
      "properties": {
        "first_name": {
          "title": "First Name",
          "type": "string",
          "pattern": "first_name"
        },
        "last_name": {
          "title": "Last Name",
          "type": "string",
          "pattern": "last_name"
        },
        "address": {
          "title": "Address Line",
          "type": "string",
          "maxLength": 60
        },
        "state_province": {
          "title": "Region",
          "type": "string",
          "enum": ["NCR", "Region I"]
        },
        "city": {
          "title": "City/Municipality",
          "type": "string",
          "enum": ["Quezon City", "Makati"]
        },
        "barangay": {
          "title": "Barangay",
          "type": "string",
          "enum": ["Bagumbayan", "Loyola Heights"]
        },
        "postal_code": {
          "title": "Postal Code",
          "type": "string",
          "pattern": "ph_postal_code",
          "maxLength": 4
        },
        "contact_number": {
          "title": "Phone Number",
          "type": "string",
          "pattern": "contact_number_ph"
        }
      }
    }
  }
}`;

const sampleApiResponseText = `{
  "billing_information": {
    "first_name": "John",
    "last_name": "Doe",
    "address": "123 Katipunan Ave",
    "state_province": "NCR",
    "city": "Quezon City",
    "barangay": "Bagumbayan",
    "postal_code": "1110",
    "contact_number": "09171234567"
  }
}`;

const SYSTEM_PROMPT = `You are a JSONX form config generator for a Dash-based frontend system.
Return valid JSON only.
Do not wrap the response in markdown.
The JSON must follow this shape:
{
  "uiSchema": { ... },
  "notes": ["..."]
}`;

const HYBRID_REVIEW_PROMPT = `You are reviewing an already-generated Dash JSONX uiSchema.
Return valid JSON only.
Do not wrap the response in markdown.
The JSON must follow this shape:
{
  "uiSchema": { ... },
  "notes": ["..."]
}`;

const INITIAL_FORM_PROPS_CODE = `export const initialFormProps = {
  formControl: { sx: {} },
  formLabel: { sx: cart_mapp_styling_adjustments?.midComponentLabel },
  field: { size: 'small', sx: {} },
};`;

function toTitleCase(input) {
  return String(input || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toCamelCase(input) {
  return String(input || '')
    .trim()
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toLowerCase())
    .replace(/[^A-Za-z0-9]/g, '');
}

function sanitizeExportName(input) {
  const fallback = 'generatedUiSchema';
  const cleaned = toCamelCase(input);
  if (!cleaned) return fallback;
  if (/^[0-9]/.test(cleaned)) return fallback;
  return cleaned.replace(/UiSchema$/i, '') + 'UiSchema';
}

function suggestExportNameFromSchema(schema, sourceMode = 'schema') {
  if (!schema || typeof schema !== 'object') return 'generatedUiSchema';

  if (sourceMode === 'schema' && schema.title) {
    return sanitizeExportName(schema.title);
  }

  const keys = Object.keys(schema.properties || {});
  if (keys.length === 1) return sanitizeExportName(keys[0]);
  if (keys.length > 1) return sanitizeExportName(keys[0] + ' form');

  if (schema.title) return sanitizeExportName(schema.title);

  return 'generatedUiSchema';
}

function createPlaceholder(name, field) {
  const title = field?.title || toTitleCase(name);
  if (Array.isArray(field?.enum) && field.enum.length > 0) return `Select ${title}`;
  if (name.includes('contact') || field?.pattern === 'contact_number_ph') return 'XXX-XXX-XXXX';
  return `Enter ${title}`;
}

function inferWidget(name, field) {
  if (Array.isArray(field?.enum) && field.enum.length > 0) return 'SelectWidget';
  if (field?.pattern === 'contact_number_ph' || name.includes('contact_number')) return 'CustomContactInputWidget';
  return null;
}

function buildFieldUiSchema(name, field) {
  const widget = inferWidget(name, field);
  const base = {
    'ui:placeholder': createPlaceholder(name, field),
    'ui:fieldFlexWidth': 6,
  };

  if (widget === 'SelectWidget') {
    return {
      ...base,
      'ui:widget': 'SelectWidget',
      props: 'initialFormProps',
    };
  }

  if (widget === 'CustomContactInputWidget') {
    return {
      ...base,
      'ui:options': { widget: 'CustomContactInputWidget' },
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

  return {
    ...base,
    props: 'initialFormProps',
  };
}

function inferPrimitiveSchema(key, value) {
  if (Array.isArray(value)) {
    if (value.length > 0) {
      return {
        title: toTitleCase(key),
        type: 'array',
        items: inferPrimitiveSchema(`${key}_item`, value[0]),
      };
    }
    return {
      title: toTitleCase(key),
      type: 'array',
      items: { type: 'string' },
    };
  }

  if (value !== null && typeof value === 'object') {
    return inferSchemaFromApiResponse(value, toTitleCase(key));
  }

  if (typeof value === 'number') {
    return { title: toTitleCase(key), type: Number.isInteger(value) ? 'integer' : 'number' };
  }

  if (typeof value === 'boolean') {
    return { title: toTitleCase(key), type: 'boolean' };
  }

  const schema = { title: toTitleCase(key), type: 'string' };
  if (key.includes('contact') || key.includes('phone')) schema.pattern = 'contact_number_ph';
  if (key.includes('postal')) schema.pattern = 'ph_postal_code';
  return schema;
}

function unwrapApiPayload(payload) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      return payload.data;
    }
  }
  return payload;
}

function inferRootTitleFromPayload(payload) {
  const unwrapped = unwrapApiPayload(payload);
  const keys = Object.keys(unwrapped || {});
  if (keys.length === 1) {
    return toTitleCase(keys[0]);
  }
  return 'Generated Form';
}

function inferSchemaFromApiResponse(payload, title = 'Generated Form') {
  const properties = {};
  const required = [];

  Object.entries(payload || {}).forEach(([key, value]) => {
    properties[key] = inferPrimitiveSchema(key, value);
    if (value !== null && value !== undefined && value !== '') required.push(key);
  });

  return {
    title,
    description: `Provide ${title.toLowerCase()} details.`,
    type: 'object',
    required,
    properties,
  };
}

function generateUiSchemaFromSchema(schema) {
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
    props: { sx: { display: 'none' } },
  };

  return result;
}

function objectToCode(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const nextPad = '  '.repeat(indent + 1);

  if (value === null) return 'null';
  if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[${value.map((v) => objectToCode(v, indent + 1)).join(', ')}]`;
  }
  if (typeof value !== 'object') return 'undefined';

  const entries = Object.entries(value);
  if (entries.length === 0) return '{}';

  return `{
${entries
  .map(([key, val]) => {
    const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`;
    return `${nextPad}${safeKey}: ${objectToCode(val, indent + 1)}`;
  })
  .join(',\n')}
${pad}}`;
}

function postProcessCode(code) {
  return code
    .replace(/'initialFormProps'/g, 'initialFormProps')
    .replace(/\{\n(\s*)__spreadInitialFormProps: true,([\s\S]*?)\n\1\}/g, '{\n$1  ...initialFormProps,$2\n$1}')
    .replace(/\{\n(\s*)__spreadInitialFormPropsField: true,([\s\S]*?)\n\1\}/g, '{\n$1  ...initialFormProps?.field,$2\n$1}');
}

function getExportBaseName(exportName) {
  const cleaned = sanitizeExportName(exportName || 'generatedUiSchema');
  return cleaned.replace(/UiSchema$/i, '') || 'generated';
}

function toSnakeCase(input) {
  return String(input || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function buildGeneratedConfigArtifact(schema, exportName) {
  const baseName = getExportBaseName(exportName);
  const schemaExportName = `${baseName}Schema`;
  const uiSchemaExportName = `${baseName}UiSchema`;
  const configExportName = `${toSnakeCase(baseName)}_config`;
  const title = schema?.title || 'Generated Form';
  const moduleName = toSnakeCase(baseName).replace(/_ui_schema$/i, '') || 'generated';

  return {
    schemaExportName,
    uiSchemaExportName,
    configExportName,
    configObject: {
      module: moduleName,
      main_header: title,
      schema: `__REF__${schemaExportName}`,
      uiSchema: `__REF__${uiSchemaExportName}`,
      type: 'prompt',
      prompt_size: 'fullscreen',
      navigation_buttons: [
        {
          type: 'button',
          label: 'Cancel',
          color: 'secondary',
          action: 'onClosePrompt',
        },
        {
          type: 'button',
          label: 'Save',
          action: 'onSaveDetails',
        },
      ],
    },
  };
}

function generateTypescriptModule(schema, exportName) {
  return generateTypescriptModuleFromArtifacts(schema, generateUiSchemaFromSchema(schema), exportName);
}

function generateTypescriptModuleFromArtifacts(schema, uiSchema, exportName) {
  const { schemaExportName, uiSchemaExportName, configExportName, configObject } = buildGeneratedConfigArtifact(schema, exportName);
  const rawSchemaCode = objectToCode(schema, 0);
  const rawUiSchemaCode = objectToCode(uiSchema, 0);
  const processedUiSchemaCode = postProcessCode(rawUiSchemaCode);
  const rawConfigCode = objectToCode(configObject, 0)
    .replace(new RegExp(`'__REF__${schemaExportName}'`, 'g'), schemaExportName)
    .replace(new RegExp(`'__REF__${uiSchemaExportName}'`, 'g'), uiSchemaExportName);

  return `${INITIAL_FORM_PROPS_CODE}

export const ${schemaExportName} = ${rawSchemaCode};

export const ${uiSchemaExportName} = ${processedUiSchemaCode};

export const ${configExportName} = ${rawConfigCode};`;
}

function buildUserPrompt(schema) {
  return `Generate a Dash-compatible JSONX uiSchema from this JSON schema.\n\nSchema:\n${JSON.stringify(schema, null, 2)}`;
}

function buildHybridPrompt(schema, baseUiSchema) {
  return `Review this Dash-compatible JSONX uiSchema and improve it conservatively.\n\nSchema:\n${JSON.stringify(schema, null, 2)}\n\nBase uiSchema:\n${JSON.stringify(baseUiSchema, null, 2)}`;
}

async function callOpenAICompatibleApi({ apiKey, baseUrl, model, schema }) {
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

async function callHybridReviewApi({ apiKey, baseUrl, model, schema, baseUiSchema }) {
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

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function runSelfTests() {
  const testSchema = JSON.parse(sampleSchemaText);
  const generated = generateUiSchemaFromSchema(testSchema);
  const inferredSchema = inferSchemaFromApiResponse(JSON.parse(sampleApiResponseText), 'Generated Form');

  return [
    {
      name: 'Generates billing_information group',
      pass: Boolean(generated.billing_information),
    },
    {
      name: 'Maps enum fields to SelectWidget',
      pass: generated.billing_information?.state_province?.['ui:widget'] === 'SelectWidget',
    },
    {
      name: 'Maps contact_number_ph to CustomContactInputWidget',
      pass: generated.billing_information?.contact_number?.['ui:options']?.widget === 'CustomContactInputWidget',
    },
    {
      name: 'Adds hidden submit_button',
      pass: generated.submit_button?.props?.sx?.display === 'none',
    },
    {
      name: 'Generates TypeScript exports',
      pass:
        generateTypescriptModule(testSchema, 'paymentUiSchema').includes('export const paymentSchema =') &&
        generateTypescriptModule(testSchema, 'paymentUiSchema').includes('export const paymentUiSchema =') &&
        generateTypescriptModule(testSchema, 'paymentUiSchema').includes('export const payment_config ='),
    },
    {
      name: 'Infers schema from API response',
      pass: inferredSchema.properties?.billing_information?.type === 'object',
    },
  ];
}

function CodeBlock({ code }) {
  return (
    <pre className="w-full text-left overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">
      <code className="block whitespace-pre">{code}</code>
    </pre>
  );
}

function PreviewCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function JsonxFormConfigPOC() {
  const [apiResponseText, setApiResponseText] = useState(sampleApiResponseText);
  const [exportName, setExportName] = useState('paymentUiSchema');
  const [isExportNameDirty, setIsExportNameDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generationMode, setGenerationMode] = useState('rules');
  const [hybridSuggestions, setHybridSuggestions] = useState([]);
  const [apiProviderLabel, setApiProviderLabel] = useState('OpenAI-compatible');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [model, setModel] = useState('gpt-4.1-mini');
  const [apiKey, setApiKey] = useState('');
  const [isGeneratingWithAi, setIsGeneratingWithAi] = useState(false);
  const [activeAiAction, setActiveAiAction] = useState('');
  const [aiGeneratedUiSchema, setAiGeneratedUiSchema] = useState(null);
  const [aiNotes, setAiNotes] = useState([]);
  const [aiError, setAiError] = useState('');

  const parsed = useMemo(() => {
    try {
      const apiPayload = JSON.parse(apiResponseText);
      const unwrappedPayload = unwrapApiPayload(apiPayload);
      return {
        data: inferSchemaFromApiResponse(unwrappedPayload, inferRootTitleFromPayload(apiPayload)),
        error: null,
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }, [apiResponseText]);

  const suggestedExportName = useMemo(
    () => suggestExportNameFromSchema(parsed?.data, 'api'),
    [parsed?.data]
  );

  useEffect(() => {
    if (!isExportNameDirty && suggestedExportName) {
      setExportName(suggestedExportName);
    }
  }, [suggestedExportName, isExportNameDirty]);

  const generatedCode = useMemo(() => {
    if (!parsed.data) return '';
    try {
      const uiSchema =
        (generationMode === 'ai' || generationMode === 'hybrid') && aiGeneratedUiSchema
          ? aiGeneratedUiSchema
          : generateUiSchemaFromSchema(parsed.data);
      return generateTypescriptModuleFromArtifacts(parsed.data, uiSchema, exportName);
    } catch (error) {
      return `// Generation error
// ${error.message}`;
    }
  }, [aiGeneratedUiSchema, exportName, generationMode, parsed.data]);

  const generatedUiSchemaPreview = useMemo(() => {
    if (!parsed.data) return null;
    try {
      if ((generationMode === 'ai' || generationMode === 'hybrid') && aiGeneratedUiSchema) {
        return aiGeneratedUiSchema;
      }
      return generateUiSchemaFromSchema(parsed.data);
    } catch {
      return null;
    }
  }, [aiGeneratedUiSchema, generationMode, parsed.data]);

  const fieldCount = useMemo(() => {
    if (!parsed.data?.properties) return 0;
    return Object.values(parsed.data.properties).reduce((acc, value) => {
      if (value?.type === 'object' && value?.properties) return acc + Object.keys(value.properties).length;
      return acc + 1;
    }, 0);
  }, [parsed.data]);

  const selfTests = useMemo(() => runSelfTests(), []);
  const passedTests = selfTests.filter((test) => test.pass).length;

  async function handleCopy() {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function handleAiGenerate() {
    if (!parsed.data) {
      setAiError('Please provide a valid API response first.');
      return;
    }
    if (!apiKey.trim()) {
      setAiError('API key is required for AI generation.');
      return;
    }

    setIsGeneratingWithAi(true);
    setActiveAiAction('ai');
    setAiError('');

    try {
      const result = await callOpenAICompatibleApi({ apiKey, baseUrl, model, schema: parsed.data });
      setAiGeneratedUiSchema(result.uiSchema);
      setAiNotes(Array.isArray(result.notes) ? result.notes : []);
      setHybridSuggestions([]);
      setGenerationMode('ai');
    } catch (error) {
      setAiError(error.message || 'Failed to generate with AI.');
    } finally {
      setIsGeneratingWithAi(false);
      setActiveAiAction('');
    }
  }

  async function handleHybridGenerate() {
    if (!parsed.data) {
      setAiError('Please provide a valid API response first.');
      return;
    }
    if (!apiKey.trim()) {
      setAiError('API key is required for hybrid generation.');
      return;
    }

    setIsGeneratingWithAi(true);
    setActiveAiAction('hybrid');
    setAiError('');

    try {
      const baseUiSchema = generateUiSchemaFromSchema(parsed.data);
      const result = await callHybridReviewApi({ apiKey, baseUrl, model, schema: parsed.data, baseUiSchema });
      setAiGeneratedUiSchema(result.uiSchema);
      setAiNotes(Array.isArray(result.notes) ? result.notes : []);
      setHybridSuggestions(Array.isArray(result.notes) ? result.notes : []);
      setGenerationMode('hybrid');
    } catch (error) {
      setAiError(error.message || 'Failed to generate with Hybrid mode.');
    } finally {
      setIsGeneratingWithAi(false);
      setActiveAiAction('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full px-3 py-1">POC</Badge>
                <Badge className="rounded-full px-3 py-1">API Response → 3 Exports</Badge>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">API Response → JSONX Config Helper</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Paste an API response payload. The tool infers the schema and generates schema, uiSchema, and config exports.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[420px]">
              <PreviewCard label="Groups" value={String(Object.keys(parsed.data?.properties || {}).length)} />
              <PreviewCard label="Fields" value={String(fieldCount)} />
              <PreviewCard label="Tests" value={`${passedTests}/${selfTests.length}`} />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generation Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => setGenerationMode('rules')}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  generationMode === 'rules' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="mb-1 text-sm font-semibold text-slate-900">Rule-based</div>
                <div className="text-sm leading-6 text-slate-600">Deterministic mapping based on widget, placeholder, and layout rules.</div>
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('ai')}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  generationMode === 'ai' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="mb-1 text-sm font-semibold text-slate-900">AI-assisted</div>
                <div className="text-sm leading-6 text-slate-600">Uses an OpenAI-compatible chat completions API to generate a JSON uiSchema.</div>
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('hybrid')}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  generationMode === 'hybrid' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="mb-1 text-sm font-semibold text-slate-900">Hybrid</div>
                <div className="text-sm leading-6 text-slate-600">Generate a rules scaffold, then let AI refine it conservatively.</div>
              </button>
            </div>

            {generationMode !== 'rules' && (
              <div className="flex flex-col items-center gap-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Provider</label>
                      <select
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={apiProviderLabel}
                        onChange={(e) => {
                          const p = e.target.value;
                          setApiProviderLabel(p);
                          if (p === 'OpenAI') {
                            setBaseUrl('https://api.openai.com/v1');
                            setModel('gpt-4.1-mini');
                          }
                          if (p === 'Groq') {
                            setBaseUrl('https://api.groq.com/openai/v1');
                            setModel('llama-3.1-70b-versatile');
                          }
                          if (p === 'OpenRouter') {
                            setBaseUrl('https://openrouter.ai/api/v1');
                            setModel('openai/gpt-4o-mini');
                          }
                          if (p === 'Ollama (local)') {
                            setBaseUrl('http://localhost:11434/v1');
                            setModel('llama3');
                          }
                        }}
                      >
                        <option>OpenAI</option>
                        <option>Groq</option>
                        <option>OpenRouter</option>
                        <option>Ollama (local)</option>
                        <option>Custom</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Model</label>
                      <select
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      >
                        <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                        <option value="gpt-4.1">gpt-4.1</option>
                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                        <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile</option>
                        <option value="llama3">llama3</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">API Key</label>
                      <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder="Paste API key" />
                    </div>
                    <div className="flex justify-center">
                      {generationMode === 'ai' && (
                        <div className="flex justify-center">
                        <Button onClick={handleAiGenerate} disabled={isGeneratingWithAi || !parsed.data}>
                          <Wand2 className="h-4 w-4" />
                          {isGeneratingWithAi && activeAiAction === 'ai' ? 'Generating…' : 'AI Generate'}
                        </Button>
                        </div>
                      )}

                      {generationMode === 'hybrid' && (
                        <div className="flex justify-center">
                        <Button variant="outline" onClick={handleHybridGenerate} disabled={isGeneratingWithAi || !parsed.data}>
                          <Wand2 className="h-4 w-4" />
                          {isGeneratingWithAi && activeAiAction === 'hybrid' ? 'Reviewing…' : 'Hybrid Generate'}
                        </Button>
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                      This POC expects an OpenAI-compatible <code>{'/chat/completions'}</code> endpoint that returns JSON.
                    </div>
                    {aiError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{aiError}</div>
                    )}
                  </CardContent>
                </Card>

                {(aiNotes.length > 0 || (hybridSuggestions.length > 0 && generationMode === 'hybrid')) && (
                  <Card className="w-full border-slate-200 bg-slate-50 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base">AI Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {aiNotes.length > 0 && (
                        <ul className="space-y-2 text-sm leading-6 text-slate-700">
                          {aiNotes.map((note, index) => (
                            <li key={`${note}-${index}`}>• {note}</li>
                          ))}
                        </ul>
                      )}
                      {hybridSuggestions.length > 0 && generationMode === 'hybrid' && (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-800">
                          {hybridSuggestions.map((note, index) => (
                            <div key={`${note}-${index}`}>• {note}</div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="min-w-0">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wand2 className="h-5 w-5" /> Input
                </CardTitle>
                <div className="text-sm leading-6 text-slate-600">
                  Paste an API response payload. If the response contains a top-level <code>{'data'}</code> object, the generator will use that as the actual form source and ignore wrapper fields like <code>{'status'}</code> and <code>{'message'}</code>.
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Export Name</label>
                  <Input
                    value={exportName}
                    onChange={(e) => {
                      setExportName(sanitizeExportName(e.target.value));
                      setIsExportNameDirty(true);
                    }}
                    placeholder="auto-generated"
                  />
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">
                      Suggested: <span className="font-medium text-slate-700">{suggestedExportName}</span>
                    </span>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setExportName(suggestedExportName);
                        setIsExportNameDirty(false);
                      }}
                    >
                      Reset to suggested name
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={apiResponseText} onChange={(e) => setApiResponseText(e.target.value)} className="min-h-[620px]" />
              {parsed.error && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <span>Invalid JSON: {parsed.error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">Generated Output</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleCopy} disabled={!generatedCode}>
                    <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button onClick={() => downloadTextFile(`${exportName}.ts`, generatedCode)} disabled={!generatedCode}>
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="typescript" className="w-full">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="typescript">JSONX Form Config</TabsTrigger>
                  <TabsTrigger value="preview">UI Schema</TabsTrigger>
                  <TabsTrigger value="inferred-schema">Resolved Schema</TabsTrigger>
                  <TabsTrigger value="tests">Self Tests</TabsTrigger>
                </TabsList>

                <TabsContent value="typescript">
                  <ScrollArea className="h-[700px] rounded-2xl border border-slate-200 bg-slate-900 p-0">
                    <CodeBlock code={generatedCode || '// Waiting for valid API response input'} />
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="preview">
                  <ScrollArea className="h-[700px] rounded-2xl border border-slate-200 bg-slate-900 p-0">
                    <CodeBlock code={generatedUiSchemaPreview ? JSON.stringify(generatedUiSchemaPreview, null, 2) : '{}'} />
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="inferred-schema">
                  <ScrollArea className="h-[700px] rounded-2xl border border-slate-200 bg-slate-900 p-0">
                    <CodeBlock code={parsed.data ? JSON.stringify(parsed.data, null, 2) : '{}'} />
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="tests">
                  <ScrollArea className="h-[700px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="space-y-3">
                      {selfTests.map((test) => (
                        <div key={test.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="pr-4 text-sm leading-6 text-slate-800">{test.name}</div>
                          <div className={`flex items-center gap-2 text-sm font-medium ${test.pass ? 'text-green-700' : 'text-red-700'}`}>
                            {test.pass ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            {test.pass ? 'Pass' : 'Fail'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}       