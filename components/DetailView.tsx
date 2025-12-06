
import React from 'react';
import { SavedItem, Category, Language, Folder } from '../types';
import { X, ExternalLink, Calendar, Tag, BrainCircuit, Folder as FolderIcon, Link as LinkIcon, FileText, Mic } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import { translations } from '../utils/translations';

interface Props {
  item: SavedItem;
  onClose: () => void;
  onUpdateCategory: (id: string, category: string) => void;
  folders: Folder[];
  lang: Language;
}

const DetailView: React.FC<Props> = ({ item, onClose, onUpdateCategory, folders, lang }) => {
  const t = translations[lang];

  // Determine current "Label" (folder name or category name)
  const currentFolderName = item.folderId 
    ? folders.find(f => f.id === item.folderId)?.name 
    : undefined;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-6 bg-black/60 dark:bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-5xl h-[90vh] sm:h-auto sm:max-h-[85vh] sm:rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl flex flex-col sm:flex-row overflow-hidden transition-all">
        
        {/* Left: Media or Placeholder */}
        <div className="w-full sm:w-1/2 bg-slate-100 dark:bg-black flex items-center justify-center relative group min-h-[300px]">
           {item.imageUrl ? (
               <img 
                 src={item.imageUrl} 
                 alt="Content" 
                 className="max-h-full max-w-full object-contain"
               />
           ) : (
               <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-center">
                   <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-6 shadow-xl">
                       <LinkIcon className="w-10 h-10 text-slate-600 dark:text-neutral-300" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-neutral-200 line-clamp-3">
                       {item.analysis?.visualDescription || "Link Content"}
                   </h2>
                   <p className="mt-4 text-slate-500 dark:text-neutral-400 text-sm max-w-xs break-all">
                       {item.sourceUrl}
                   </p>
               </div>
           )}
           <div className="absolute top-4 left-4">
             <button onClick={onClose} className="sm:hidden p-2 bg-black/50 backdrop-blur rounded-full text-white">
               <X className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* Right: Analysis & Meta */}
        <div className="w-full sm:w-1/2 flex flex-col h-full bg-white/95 dark:bg-neutral-900/95 border-l border-slate-100 dark:border-neutral-800">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-start bg-slate-50/50 dark:bg-black/20">
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <CategoryBadge category={item.userCategory} customLabel={currentFolderName} size="md" lang={lang} />
                 <span className="text-xs text-slate-500 dark:text-neutral-500 flex items-center gap-1">
                   <Calendar className="w-3 h-3" />
                   {new Date(item.timestamp).toLocaleDateString()}
                 </span>
               </div>
               <h2 className="text-xl font-bold text-slate-800 dark:text-neutral-100 line-clamp-2">
                 {item.analysis?.visualDescription || t.modal.analyzing}
               </h2>
               {item.ownerName && (
                   <div className="flex items-center gap-2 mt-2">
                       <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white">
                           {item.ownerName.substring(1, 2).toUpperCase()}
                       </div>
                       <span className="text-xs font-medium text-slate-600 dark:text-neutral-400">
                           {t.detail.savedBy} {item.ownerName}
                       </span>
                   </div>
               )}
             </div>
             <button onClick={onClose} className="hidden sm:block p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white transition-colors">
               <X className="w-6 h-6" />
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Quick Actions */}
            {item.sourceUrl && (
              <a 
                href={item.sourceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-700 dark:text-blue-300 transition-colors text-sm font-bold"
              >
                <ExternalLink className="w-4 h-4" />
                {t.detail.openSource}
              </a>
            )}

            {/* Extracted Text Content (e.g. Recipe/Steps) */}
            {item.analysis?.extractedTexts && item.analysis.extractedTexts.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Summary / Details
                    </h3>
                    <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-slate-100 dark:border-neutral-800 text-sm text-slate-700 dark:text-neutral-300 space-y-2">
                        {item.analysis.extractedTexts.map((text, i) => (
                            <p key={i} className="leading-relaxed border-b border-slate-200 dark:border-neutral-700 last:border-0 pb-2 last:pb-0 border-dashed">
                                • {text}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Audio Transcription */}
            {item.analysis?.transcription && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        Audio Transcription
                    </h3>
                    <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-slate-100 dark:border-neutral-800 text-sm text-slate-600 dark:text-neutral-400 italic leading-relaxed">
                        "{item.analysis.transcription}"
                    </div>
                </div>
            )}

            {/* Entities */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> 
                {t.detail.analysisTitle}
              </h3>
              <div className="grid gap-2">
                {item.analysis?.detectedEntities.map((entity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700 dark:text-neutral-200">{entity.name}</span>
                      <span className="text-xs text-slate-500 dark:text-neutral-500">{entity.type}</span>
                    </div>
                    {entity.meta && (
                      <span className="text-xs bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 px-2 py-1 rounded border border-slate-200 dark:border-neutral-700">
                        {entity.meta}
                      </span>
                    )}
                  </div>
                ))}
                {(!item.analysis?.detectedEntities || item.analysis.detectedEntities.length === 0) && (
                  <p className="text-sm text-slate-500 dark:text-neutral-500 italic">{t.detail.noEntities}</p>
                )}
              </div>
            </div>

             {/* Tags */}
             <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-neutral-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4" /> {t.detail.tags}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.analysis?.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
             </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
             <label className="text-xs text-slate-500 dark:text-neutral-500 mb-2 block">{t.detail.move}</label>
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
               {/* System Categories */}
               {Object.values(Category).filter(c => c !== Category.UNCATEGORIZED).map(cat => (
                 <button
                   key={cat}
                   onClick={() => onUpdateCategory(item.id, cat)}
                   className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                     ${item.userCategory === cat && !item.folderId
                       ? 'bg-blue-600 border-blue-500 text-white' 
                       : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-white'
                     }
                   `}
                 >
                   {t.badges[cat]}
                 </button>
               ))}
               
               {folders.length > 0 && <div className="w-px h-6 bg-slate-300 dark:bg-neutral-700 mx-1 flex-shrink-0"></div>}
               
               {/* Custom Folders */}
               {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => onUpdateCategory(item.id, folder.id)}
                    className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${item.folderId === folder.id
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <FolderIcon className="w-3 h-3" />
                    {folder.name}
                  </button>
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailView;
