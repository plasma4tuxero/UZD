
import React from 'react';
import { X, Moon, Sun, Globe, Check } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleLang: () => void;
}

const SettingsModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  lang, 
  theme, 
  onToggleTheme, 
  onToggleLang 
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">{t.profile.settingsTitle}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
           {/* Theme Toggle */}
           <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                 {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
                 <div>
                   <p className="font-medium text-slate-900 dark:text-white text-sm">{t.profile.theme}</p>
                   <p className="text-xs text-slate-500 dark:text-neutral-500">
                     {theme === 'dark' ? t.profile.darkMode : t.profile.lightMode}
                   </p>
                 </div>
              </div>
              <button 
                onClick={onToggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
           </div>

           {/* Language Toggle */}
           <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                 <Globe className="w-5 h-5 text-blue-500" />
                 <div>
                   <p className="font-medium text-slate-900 dark:text-white text-sm">{t.profile.language}</p>
                   <p className="text-xs text-slate-500 dark:text-neutral-500">
                     {lang === 'es' ? t.profile.spanish : t.profile.english}
                   </p>
                 </div>
              </div>
              <button 
                onClick={onToggleLang}
                className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-neutral-600 transition-colors"
              >
                {lang.toUpperCase()}
              </button>
           </div>

           <div className="pt-4 mt-2 border-t border-slate-100 dark:border-neutral-800 text-center">
             <p className="text-xs text-slate-400 dark:text-neutral-600">
               MindVault v1.2.0 • Powered by Gemini 2.5
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
