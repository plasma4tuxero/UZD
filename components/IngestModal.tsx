
import React, { useState } from 'react';
import { X, Link as LinkIcon, Loader2, Save } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File | null, url: string) => void;
  isProcessing: boolean;
  lang: Language;
}

const IngestModal: React.FC<Props> = ({ isOpen, onClose, onSave, isProcessing, lang }) => {
  const [url, setUrl] = useState('');
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(null, url.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">{t.modal.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Source URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-neutral-400">{t.modal.urlLabel}</label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-neutral-800 rounded-lg px-3 py-2 border border-slate-200 dark:border-neutral-700 focus-within:border-blue-500">
              <LinkIcon className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
              <input
                type="url"
                placeholder={t.modal.urlPlaceholder}
                className="bg-transparent border-none outline-none text-slate-900 dark:text-neutral-200 w-full placeholder-slate-400 dark:placeholder-neutral-600 text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-500">
                Supports Instagram, TikTok, YouTube links.
            </p>
          </div>

          <button
            type="submit"
            disabled={!url.trim() || isProcessing}
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
              ${!url.trim() || isProcessing 
                ? 'bg-slate-200 dark:bg-neutral-800 text-slate-400 dark:text-neutral-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
              }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.modal.analyzing}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t.modal.save}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IngestModal;
