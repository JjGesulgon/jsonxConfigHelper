import React from 'react';
import { X } from 'lucide-react';
import JsonxMuiFormPreview from './JsonxMuiFormPreview';

export default function GeneratedFormPreviewModal({
  isOpen,
  onClose,
  config,
  apiResponse,
}) {
  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 text-left">
          <div className="flex-1 text-left">
            <h2 className="m-0 text-xl font-semibold text-slate-900">JSONX Form Preview</h2>
            <p className="mt-1 text-sm text-slate-600">
              Generated from the current schema, uiSchema, and config artifact.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close form preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-auto bg-slate-50 p-4 text-left">
          <JsonxMuiFormPreview config={config} apiResponse={apiResponse} />
        </div>
      </div>
    </div>
  );
}