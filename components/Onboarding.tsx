import React, { useState } from 'react';
import { Bookmark, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  onComplete: (username: string) => void;
  lang: Language;
}

const Onboarding: React.FC<Props> = ({ onComplete, lang }) => {
  const [username, setUsername] = useState('@');
  const [error, setError] = useState('');
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.startsWith('@') || username.length < 3) {
      setError(t.onboarding.error);
      return;
    }
    onComplete(username);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('@')) val = '@' + val.replace(/@/g, '');
    setUsername(val);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
            <Bookmark className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">{t.onboarding.welcome}</h1>
        <p className="text-center text-slate-500 dark:text-neutral-400 mb-8">
          {t.onboarding.desc}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">{t.onboarding.label}</label>
            <input
              type="text"
              value={username}
              onChange={handleChange}
              placeholder={t.onboarding.placeholder}
              className="w-full bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
          >
            {t.onboarding.btn}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;