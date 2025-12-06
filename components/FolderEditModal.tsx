
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Folder as FolderIcon } from 'lucide-react';
import { Folder, Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null;
  onUpdate: (id: string, name: string, description: string) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

const FolderEditModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  folder, 
  onUpdate, 
  onDelete, 
  lang 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const t = translations[lang];

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setDescription(folder.description);
    }
  }, [folder]);

  if (!isOpen || !folder) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onUpdate(folder.id, name.trim(), description.trim());
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm(t.folderEdit.deleteConfirm)) {
      onDelete(folder.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">{t.folderEdit.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-neutral-500 mb-1">{t.folderEdit.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-neutral-500 mb-1">{t.folderEdit.descLabel}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 py-2.5 rounded-xl font-medium text-sm transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
            >
              <Trash2 className="w-4 h-4" />
              {t.folderEdit.delete}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !description.trim()}
              className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              {t.folderEdit.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderEditModal;
