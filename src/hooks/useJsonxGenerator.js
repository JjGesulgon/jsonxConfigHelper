import { useEffect, useMemo, useState } from 'react';
import { sampleApiResponseText } from '../constants/samples';
import { unwrapApiPayload, inferRootTitleFromPayload } from '../utils/payload';
import { inferSchemaFromApiResponse } from '../utils/schemaInference';
import { suggestExportNameFromSchema, sanitizeExportName } from '../utils/naming';
import { generateUiSchemaFromSchema } from '../utils/uiSchemaGenerator';
import { generateTypescriptModuleFromArtifacts } from '../utils/codegen';
import { callOpenAICompatibleApi, callHybridReviewApi } from '../services/aiClient';
import { runSelfTests } from '../tests/selfTests';

export function useJsonxGenerator() {
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
        data: inferSchemaFromApiResponse(
          unwrappedPayload,
          inferRootTitleFromPayload(apiPayload)
        ),
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

  const generatedCode = useMemo(() => {
    if (!parsed.data) return '';
    try {
      const uiSchema =
        (generationMode === 'ai' || generationMode === 'hybrid') && aiGeneratedUiSchema
          ? aiGeneratedUiSchema
          : generateUiSchemaFromSchema(parsed.data);

      return generateTypescriptModuleFromArtifacts(parsed.data, uiSchema, exportName);
    } catch (error) {
      return `// Generation error\n// ${error.message}`;
    }
  }, [aiGeneratedUiSchema, exportName, generationMode, parsed.data]);

  const fieldCount = useMemo(() => {
    if (!parsed.data?.properties) return 0;
    return Object.values(parsed.data.properties).reduce((acc, value) => {
      if (value?.type === 'object' && value?.properties) {
        return acc + Object.keys(value.properties).length;
      }
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
      const result = await callOpenAICompatibleApi({
        apiKey,
        baseUrl,
        model,
        schema: parsed.data,
      });
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
      const result = await callHybridReviewApi({
        apiKey,
        baseUrl,
        model,
        schema: parsed.data,
        baseUiSchema,
      });
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

  function handleProviderChange(provider) {
    setApiProviderLabel(provider);

    if (provider === 'OpenAI') {
      setBaseUrl('https://api.openai.com/v1');
      setModel('gpt-4.1-mini');
    } else if (provider === 'Groq') {
      setBaseUrl('https://api.groq.com/openai/v1');
      setModel('llama-3.1-70b-versatile');
    } else if (provider === 'OpenRouter') {
      setBaseUrl('https://openrouter.ai/api/v1');
      setModel('openai/gpt-4o-mini');
    } else if (provider === 'Ollama (local)') {
      setBaseUrl('http://localhost:11434/v1');
      setModel('llama3');
    }
  }

  return {
    state: {
      apiResponseText,
      exportName,
      copied,
      generationMode,
      hybridSuggestions,
      apiProviderLabel,
      baseUrl,
      model,
      apiKey,
      isGeneratingWithAi,
      activeAiAction,
      aiNotes,
      aiError,
      suggestedExportName,
    },
    derived: {
      parsed,
      generatedCode,
      generatedUiSchemaPreview,
      fieldCount,
      selfTests,
      passedTests,
    },
    actions: {
      setApiResponseText,
      setExportName: (value) => {
        setExportName(sanitizeExportName(value));
        setIsExportNameDirty(true);
      },
      resetExportName: () => {
        setExportName(suggestedExportName);
        setIsExportNameDirty(false);
      },
      setGenerationMode,
      setModel,
      setApiKey,
      handleProviderChange,
      handleCopy,
      handleAiGenerate,
      handleHybridGenerate,
    },
  };
}