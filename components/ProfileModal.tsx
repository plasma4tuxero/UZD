

import React, { useState, useRef } from 'react';
import { X, UserPlus, Users, Search, CheckCircle, FolderPlus, Folder as FolderIcon, Trash2, Settings, Moon, Sun, Globe, Upload, AlertTriangle, ToggleLeft, ToggleRight, Edit2, Save } from 'lucide-react';
import { User, Language, Theme, Folder } from '../types';
import { translations } from '../utils/translations';
import { findMockUser } from '../utils/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAddFriend: (friend: User) => void;
  onCreateFolder: (name: string, description: string) => void;
  onDeleteFolder: (id: string) => void;
  onUpdateFolder: (id: string, name: string, description: string) => void;
  onUpdateAvatar: (file: File) => void;
  onToggleUncategorized: (enabled: boolean) => void;
  lang: Language;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleLang: () => void;
}

type Tab = 'FRIENDS' | 'FOLDERS' | 'SETTINGS';

const ProfileModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onAddFriend, 
  onCreateFolder,
  onDeleteFolder,
  onUpdateFolder,
  onUpdateAvatar,
  onToggleUncategorized,
  lang,
  theme,
  onToggleTheme,
  onToggleLang
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('FOLDERS');
  const [friendSearch, setFriendSearch] = useState('');
  
  // Create Folder State
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  const [searchMsg, setSearchMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Edit Folder State
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDesc, setEditingDesc] = useState('');

  const [showUncategorizedWarning, setShowUncategorizedWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  if (!isOpen) return null;

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendSearch) return;

    const mockUser = findMockUser(friendSearch);

    if (!mockUser) {
      setSearchMsg({ type: 'error', text: t.profile.userNotFound });
      return;
    }

    if (mockUser.id === currentUser.id) {
       setSearchMsg({ type: 'error', text: "That's you!" });
       return;
    }

    if (currentUser.friends.includes(mockUser.id)) {
      setSearchMsg({ type: 'error', text: t.profile.alreadyAdded });
      return;
    }

    onAddFriend(mockUser);
    setSearchMsg({ type: 'success', text: `${mockUser.username} ${t.profile.successAdd}` });
    setFriendSearch('');
    setTimeout(() => setSearchMsg(null), 3000);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim() && newFolderDesc.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderDesc.trim());
      setNewFolderName('');
      setNewFolderDesc('');
    }
  };

  const startEdit = (folder: Folder) => {
      setEditingFolderId(folder.id);
      setEditingName(folder.name);
      setEditingDesc(folder.description);
  };

  const saveEdit = (id: string) => {
      if (editingName.trim() && editingDesc.trim()) {
          onUpdateFolder(id, editingName.trim(), editingDesc.trim());
      }
      setEditingFolderId(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          onUpdateAvatar(e.target.files[0]);
      }
  };

  const handleUncategorizedToggle = () => {
      if (currentUser.settings.enableUncategorized) {
          setShowUncategorizedWarning(true);
      } else {
          onToggleUncategorized(true);
      }
  };

  const confirmDisableUncategorized = () => {
      onToggleUncategorized(false);
      setShowUncategorizedWarning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm text-white font-bold overflow-hidden">
                    {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        currentUser.username.substring(1, 2).toUpperCase()
                    )}
                 </div>
                 <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Upload className="w-4 h-4 text-white" />
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                 />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">{t.profile.title}</h2>
                <p className="text-xs text-slate-500 dark:text-neutral-500">{currentUser.username}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-neutral-800">
          <button 
            onClick={() => setActiveTab('FRIENDS')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'FRIENDS' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'}`}
          >
            {t.profile.tabs.friends}
          </button>
          <button 
            onClick={() => setActiveTab('FOLDERS')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'FOLDERS' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'}`}
          >
            {t.profile.tabs.folders}
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-none px-5 py-3 border-b-2 transition-colors flex items-center justify-center ${activeTab === 'SETTINGS' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'}`}
          >
             <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {/* FRIENDS TAB */}
          {activeTab === 'FRIENDS' && (
            <div className="space-y-6">
               <div className="bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  {t.profile.addFriend}
                </h4>
                <form onSubmit={handleAddFriend} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={t.profile.addPlaceholder}
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
                      value={friendSearch}
                      onChange={(e) => setFriendSearch(e.target.value)}
                    />
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  </div>
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors"
                  >
                    {t.profile.addBtn}
                  </button>
                </form>
                {searchMsg && (
                  <p className={`text-xs mt-2 ${searchMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {searchMsg.text}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t.profile.friends} ({currentUser.friends.length})
                </h4>
                <div className="space-y-2">
                  {currentUser.friends.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-neutral-500 italic text-center py-8">
                      {t.profile.noFriends}
                    </p>
                  ) : (
                    currentUser.friends.map(friendId => (
                        <div key={friendId} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-neutral-800/30 border border-slate-100 dark:border-neutral-800">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-neutral-300">
                            F
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">{friendId}</span>
                          <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                        </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FOLDERS TAB */}
          {activeTab === 'FOLDERS' && (
            <div className="space-y-6">
              
              {/* Uncategorized Toggle */}
              <div className={`p-4 rounded-xl border transition-all ${currentUser.settings.enableUncategorized ? 'bg-slate-50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'}`}>
                  <div className="flex items-start justify-between">
                     <div>
                         <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                             {t.profile.uncategorizedTitle}
                         </h4>
                         <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-[200px]">
                             {t.profile.uncategorizedDesc}
                         </p>
                     </div>
                     <button 
                        onClick={handleUncategorizedToggle}
                        className={`text-2xl transition-colors ${currentUser.settings.enableUncategorized ? 'text-blue-500' : 'text-slate-400'}`}
                     >
                         {currentUser.settings.enableUncategorized ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                     </button>
                  </div>
              </div>

              {/* Create New Folder Form */}
              <div className="bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
                 <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  {t.profile.createFolder}
                 </h4>
                 <form onSubmit={handleCreateFolder} className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder={t.profile.newFolderPlaceholder}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      required
                    />
                    <textarea
                      placeholder={t.profile.newFolderDescPlaceholder}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white h-20 resize-none"
                      value={newFolderDesc}
                      onChange={(e) => setNewFolderDesc(e.target.value)}
                      required
                    />
                    <p className="text-[10px] text-slate-500 dark:text-neutral-500 italic">
                        {t.profile.folderDescHint}
                    </p>
                    <button 
                      type="submit"
                      disabled={!newFolderName.trim() || !newFolderDesc.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                      {t.profile.createFolder}
                    </button>
                 </form>
              </div>

              {/* Folder List */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FolderIcon className="w-4 h-4" />
                  {t.profile.foldersTitle}
                </h4>
                <div className="space-y-2">
                   {currentUser.folders.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-neutral-500 italic text-center py-8">
                        No folders. All unmatched content will be processed according to Unclassified settings.
                      </p>
                   ) : (
                      currentUser.folders.map(folder => (
                        <div key={folder.id} className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-800/30 border border-slate-100 dark:border-neutral-800 group transition-all">
                           {editingFolderId === folder.id ? (
                               <div className="flex flex-col gap-2 w-full">
                                   <input 
                                     autoFocus
                                     type="text" 
                                     value={editingName} 
                                     onChange={(e) => setEditingName(e.target.value)}
                                     className="w-full text-sm bg-white dark:bg-black border border-blue-500 rounded px-2 py-1 outline-none text-slate-900 dark:text-white"
                                     placeholder="Folder Name"
                                   />
                                   <textarea 
                                     value={editingDesc} 
                                     onChange={(e) => setEditingDesc(e.target.value)}
                                     className="w-full text-sm bg-white dark:bg-black border border-blue-500 rounded px-2 py-1 outline-none text-slate-900 dark:text-white resize-none"
                                     placeholder="Folder Description"
                                     rows={2}
                                   />
                                   <div className="flex gap-2 justify-end">
                                      <button onClick={() => setEditingFolderId(null)} className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded"><X className="w-4 h-4"/></button>
                                      <button onClick={() => saveEdit(folder.id)} className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"><Save className="w-4 h-4"/></button>
                                   </div>
                               </div>
                           ) : (
                               <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <FolderIcon className="w-4 h-4 text-blue-500 shrink-0" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-neutral-200 truncate">{folder.name}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-neutral-500 pl-6 line-clamp-2">
                                        {folder.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                    <button 
                                        onClick={() => startEdit(folder)}
                                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDeleteFolder(folder.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                               </div>
                           )}
                        </div>
                      ))
                   )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-6">
               <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {t.profile.settingsTitle}
               </h4>

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
                    className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-lg shadow-sm"
                  >
                    {lang.toUpperCase()}
                  </button>
               </div>

               <div className="pt-4 mt-8 border-t border-slate-100 dark:border-neutral-800">
                 <p className="text-center text-xs text-slate-400 dark:text-neutral-600">
                   MindVault v1.1.0 • Built with Gemini
                 </p>
               </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Warning Modal */}
      {showUncategorizedWarning && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur">
              <div className="bg-white dark:bg-neutral-900 max-w-sm w-full p-6 rounded-2xl border border-red-200 dark:border-red-900 shadow-2xl">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-2">{t.profile.warningTitle}</h3>
                      <p className="text-sm text-slate-600 dark:text-neutral-400 mb-6 leading-relaxed">
                          {t.profile.warningDesc}
                      </p>
                      <div className="flex w-full gap-3">
                          <button 
                            onClick={() => setShowUncategorizedWarning(false)}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                              {t.profile.cancel}
                          </button>
                          <button 
                            onClick={confirmDisableUncategorized}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
                          >
                              {t.profile.confirmDisable}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ProfileModal;