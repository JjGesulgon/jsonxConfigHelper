import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Download, Eye, Wand2, XCircle } from 'lucide-react';
import { useJsonxGenerator } from '../../hooks/useJsonxGenerator';
import GeneratedFormPreviewModal from './GeneratedFormPreviewModal';
import Editor from '@monaco-editor/react';
import enrichSchemaFromApi from '../../utils/schemaEnricher';

const Card = ({ children, className = '' }) => (
  <div className={`border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
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

const Badge = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ${className}`}
  >
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

function CodeBlock({ code, showCursor = false }) {
  return (
    <pre className="w-full overflow-x-auto rounded-2xl bg-slate-950 p-5 text-left text-sm leading-6 text-slate-100">
      <code className="block whitespace-pre">
        {code}
        {showCursor ? <span className="animate-pulse">|</span> : null}
      </code>
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

export default function JsonxFormConfigPage() {
  const { state, derived, actions } = useJsonxGenerator();
  const [isFormPreviewOpen, setIsFormPreviewOpen] = useState(false);
  const [typedGeneratedCode, setTypedGeneratedCode] = useState('');
  const [isTypingGeneratedCode, setIsTypingGeneratedCode] = useState(false);
  const typingIntervalRef = useRef(null);

  const parsedApiResponse = useMemo(() => {
    try {
      return JSON.parse(state.apiResponseText);
    } catch {
      return null;
    }
  }, [state.apiResponseText]);

  const previewConfig = useMemo(() => {
    if (!derived.generatedFormConfig) return null;

    return {
      ...derived.generatedFormConfig,
      schema: enrichSchemaFromApi(derived.generatedFormConfig.schema, parsedApiResponse),
    };
  }, [derived.generatedFormConfig, parsedApiResponse]);

  const simulateTyping = (fullText, setter, speed = 1) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setter('');

    if (!fullText) {
      setIsTypingGeneratedCode(false);
      return;
    }

    setIsTypingGeneratedCode(true);

    let index = 0;

    typingIntervalRef.current = setInterval(() => {
      setter(fullText.slice(0, index + 1));
      index += 1;

      if (index >= fullText.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setIsTypingGeneratedCode(false);
      }
    }, speed);
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isFormPreviewOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isFormPreviewOpen]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(state.apiResponseText);
      const formatted = JSON.stringify(parsed, null, 2);

      if (formatted !== state.apiResponseText) {
        actions.setApiResponseText(formatted);
      }
    } catch {
      // ignore invalid JSON
    }
  }, [state.apiResponseText, actions]);

  useEffect(() => {
    if (!derived.generatedCode) {
      setTypedGeneratedCode('// Waiting for valid API response input');
      setIsTypingGeneratedCode(false);
      return;
    }

    simulateTyping(derived.generatedCode, setTypedGeneratedCode, 1);
  }, [derived.generatedCode]);

  return (
    <div className="min-h-screen bg-slate-100 py-4 md:py-6">
      <div className="w-full max-w-none space-y-6">
        <div className="px-2 md:px-3 xl:px-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full px-3 py-1">POC</Badge>
                  <Badge className="rounded-full px-3 py-1">API Response → 3 Exports</Badge>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    API Response → JSONX Config Helper
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Paste an API response payload. The tool infers the schema and generates schema,
                    uiSchema, and config exports.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[420px]">
                <PreviewCard
                  label="Groups"
                  value={String(Object.keys(derived.parsed.data?.properties || {}).length)}
                />
                <PreviewCard label="Fields" value={String(derived.fieldCount)} />
                <PreviewCard label="Tests" value={`${derived.passedTests}/${derived.selfTests.length}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 md:px-3 xl:px-4">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg">Generation Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => actions.setGenerationMode('rules')}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    state.generationMode === 'rules'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-1 text-sm font-semibold text-slate-900">Rule-based</div>
                  <div className="text-sm leading-6 text-slate-600">
                    Deterministic mapping based on widget, placeholder, and layout rules.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => actions.setGenerationMode('ai')}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    state.generationMode === 'ai'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-1 text-sm font-semibold text-slate-900">AI-assisted</div>
                  <div className="text-sm leading-6 text-slate-600">
                    Uses an OpenAI-compatible chat completions API to generate a JSON uiSchema.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => actions.setGenerationMode('hybrid')}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    state.generationMode === 'hybrid'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-1 text-sm font-semibold text-slate-900">Hybrid</div>
                  <div className="text-sm leading-6 text-slate-600">
                    Generate a rules scaffold, then let AI refine it conservatively.
                  </div>
                </button>
              </div>

              {state.generationMode !== 'rules' && (
                <div className="flex flex-col items-center gap-4">
                  <Card className="w-full max-w-md rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-lg">AI Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Provider</label>
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          value={state.apiProviderLabel}
                          onChange={(e) => actions.handleProviderChange(e.target.value)}
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
                          value={state.model}
                          onChange={(e) => actions.setModel(e.target.value)}
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
                        <Input
                          value={state.apiKey}
                          onChange={(e) => actions.setApiKey(e.target.value)}
                          type="password"
                          placeholder="Paste API key"
                        />
                      </div>

                      <div className="flex justify-center">
                        {state.generationMode === 'ai' && (
                          <Button
                            onClick={actions.handleAiGenerate}
                            disabled={state.isGeneratingWithAi || !derived.parsed.data}
                          >
                            <Wand2 className="h-4 w-4" />
                            {state.isGeneratingWithAi && state.activeAiAction === 'ai'
                              ? 'Generating…'
                              : 'AI Generate'}
                          </Button>
                        )}

                        {state.generationMode === 'hybrid' && (
                          <Button
                            variant="outline"
                            onClick={actions.handleHybridGenerate}
                            disabled={state.isGeneratingWithAi || !derived.parsed.data}
                          >
                            <Wand2 className="h-4 w-4" />
                            {state.isGeneratingWithAi && state.activeAiAction === 'hybrid'
                              ? 'Reviewing…'
                              : 'Hybrid Generate'}
                          </Button>
                        )}
                      </div>

                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                        This POC expects an OpenAI-compatible <code>{'/chat/completions'}</code> endpoint that returns JSON.
                      </div>

                      {state.aiError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          {state.aiError}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {(state.aiNotes.length > 0 ||
                    (state.hybridSuggestions.length > 0 && state.generationMode === 'hybrid')) && (
                    <Card className="w-full rounded-3xl border-slate-200 bg-slate-50 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-base">AI Notes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {state.aiNotes.length > 0 && (
                          <ul className="space-y-2 text-sm leading-6 text-slate-700">
                            {state.aiNotes.map((note, index) => (
                              <li key={`${note}-${index}`}>• {note}</li>
                            ))}
                          </ul>
                        )}

                        {state.hybridSuggestions.length > 0 && state.generationMode === 'hybrid' && (
                          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-800">
                            {state.hybridSuggestions.map((note, index) => (
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
        </div>

        <div className="px-2 md:px-3 xl:px-4">
          <div className="grid gap-4 xl:gap-6 xl:grid-cols-[0.7fr_1.9fr] 2xl:grid-cols-[0.65fr_2fr] xl:items-start">
            <Card className="min-w-0 h-full rounded-3xl">
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wand2 className="h-5 w-5" /> Input
                  </CardTitle>

                  <div className="text-sm leading-6 text-slate-600">
                    Paste an API response payload. If a top-level <code>{'data'}</code> object exists, it will be used
                    as the form source.
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Export Name</label>
                    <Input
                      value={state.exportName}
                      onChange={(e) => actions.setExportName(e.target.value)}
                      placeholder="auto-generated"
                    />
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-500">
                        Suggested: <span className="font-medium text-slate-700">{state.suggestedExportName}</span>
                      </span>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
                        onClick={actions.resetExportName}
                      >
                        Reset to suggested name
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-300">
                  <Editor
                    height="560px"
                    defaultLanguage="json"
                    value={state.apiResponseText}
                    onChange={(value) => actions.setApiResponseText(value || '')}
                    options={{
                      lineNumbers: 'on',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      formatOnPaste: true,
                      formatOnType: true,
                      automaticLayout: true,
                      tabSize: 2,
                      fontSize: 14,
                      stickyScroll: {
                        enabled: false,
                      },
                    }}
                  />
                </div>

                {derived.parsed.error && (
                  <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <span>Invalid JSON: {derived.parsed.error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0 h-full rounded-3xl">
              <CardHeader>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <CardTitle className="text-lg">Generated Output</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={actions.handleCopy} disabled={!derived.generatedCode}>
                      <Copy className="h-4 w-4" /> {state.copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      onClick={() => {
                        const blob = new Blob([derived.generatedCode], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${state.exportName}.ts`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      disabled={!derived.generatedCode}
                    >
                      <Download className="h-4 w-4" /> Export
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsFormPreviewOpen(true)}
                      disabled={!previewConfig}
                    >
                      <Eye className="h-4 w-4" /> Generate Form
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
                    <ScrollArea className="h-[640px] rounded-2xl border border-slate-200 bg-slate-900 p-0">
                      <CodeBlock
                        code={typedGeneratedCode || '// Waiting for valid API response input'}
                        showCursor={isTypingGeneratedCode}
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="preview">
                    <ScrollArea className="h-[640px] rounded-2xl border border-slate-200 bg-slate-900 p-0">
                      <CodeBlock
                        code={
                          derived.generatedUiSchemaPreview
                            ? JSON.stringify(derived.generatedUiSchemaPreview, null, 2)
                            : '{}'
                        }
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="inferred-schema">
                    <ScrollArea className="h-[640px] rounded-2xl border border-slate-200 bg-slate-900 p-0">
                      <CodeBlock
                        code={
                          previewConfig?.schema
                            ? JSON.stringify(previewConfig.schema, null, 2)
                            : derived.parsed.data
                              ? JSON.stringify(derived.parsed.data, null, 2)
                              : '{}'
                        }
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="tests">
                    <ScrollArea className="h-[640px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="space-y-3">
                        {derived.selfTests.map((test) => (
                          <div
                            key={test.name}
                            className={`rounded-2xl border p-4 ${
                              test.passed
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {test.passed ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                              ) : (
                                <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-slate-900">{test.name}</div>
                                <div className="mt-1 text-sm text-slate-700">{test.message}</div>
                              </div>
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

        <GeneratedFormPreviewModal
          isOpen={isFormPreviewOpen}
          onClose={() => setIsFormPreviewOpen(false)}
          config={previewConfig}
          apiResponse={parsedApiResponse}
        />
      </div>
    </div>
  );
}