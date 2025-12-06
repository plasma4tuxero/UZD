import React, { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon, Loader2, Image as ImageIcon } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File, url?: string) => void;
  isProcessing: boolean;
  lang: Language;
}

const IngestModal: React.FC<Props> = ({ isOpen, onClose, onSave, isProcessing, lang }) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSave(file, url);
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
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-neutral-400">{t.modal.fileLabel}</label>
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group
                ${preview 
                    ? 'border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950' 
                    : 'border-slate-300 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              
              {preview ? (
                <div className="relative w-full h-48">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                    <p className="text-white font-medium">{t.modal.change}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                  </div>
                  <p className="text-slate-600 dark:text-neutral-300 font-medium">{t.modal.uploadText}</p>
                  <p className="text-slate-400 dark:text-neutral-500 text-xs mt-1">{t.modal.uploadSub}</p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || isProcessing}
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
              ${!file || isProcessing 
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
                <ImageIcon className="w-5 h-5" />
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