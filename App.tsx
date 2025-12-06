
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutGrid, Filter, Search, Instagram, Bookmark, Moon, Sun, Globe, User as UserIcon, Users, Folder as FolderIcon, HelpCircle } from 'lucide-react';
import { SavedItem, Category, AppState, Language, Theme, User, Folder } from './types';
import { analyzeImage } from './services/geminiService';
import { translations } from './utils/translations';
import { getMockUserItems } from './utils/mockData';
import CategoryBadge from './components/CategoryBadge';
import IngestModal from './components/IngestModal';
import DetailView from './components/DetailView';
import Stats from './components/Stats';
import Onboarding from './components/Onboarding';
import ProfileModal from './components/ProfileModal';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    items: [],
    friendsItems: [],
    filterCategory: 'ALL',
    searchQuery: '',
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [view, setView] = useState<'GRID' | 'STATS'>('GRID');
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'SOCIAL'>('PERSONAL');
  
  // Settings State
  const [lang, setLang] = useState<Language>('es');
  const [theme, setTheme] = useState<Theme>('dark');

  const t = translations[lang];

  // Load state from local storage on mount
  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem('mindvault_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    // Migration: Ensure user has settings and folders with descriptions
    if (user) {
        if (!user.folders) user.folders = [];
        if (!user.settings) user.settings = { enableUncategorized: true };
        // Migrate legacy folders to have descriptions if missing
        user.folders = user.folders.map((f: any) => ({
            ...f,
            description: f.description || `Content related to ${f.name}`
        }));
    }

    // Load Items
    const savedItems = localStorage.getItem('mindvault_items');
    let items = [];
    if (savedItems) {
      try {
        items = JSON.parse(savedItems);
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    }

    // Load Friends Items if user exists
    let friendsItems: SavedItem[] = [];
    if (user && user.friends) {
        user.friends.forEach((friendId: string) => {
            friendsItems = [...friendsItems, ...getMockUserItems(friendId)];
        });
    }

    setState(prev => ({ 
        ...prev, 
        currentUser: user,
        items,
        friendsItems
    }));
  }, []);

  // Save items to local storage on change
  useEffect(() => {
    if (state.items.length > 0) {
        localStorage.setItem('mindvault_items', JSON.stringify(state.items));
    }
  }, [state.items]);

  // Save user to local storage on change
  useEffect(() => {
      if (state.currentUser) {
          localStorage.setItem('mindvault_user', JSON.stringify(state.currentUser));
      }
  }, [state.currentUser]);

  // Handle Theme Change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Auth / Onboarding
  const handleRegister = (username: string) => {
      // Initialize with default System Folders, but making them mutable objects with DESCRIPTIONS for AI
      const defaultFolders: Folder[] = [
          { 
              id: Category.TRICKS, 
              name: 'Trucos', 
              description: 'Tutoriales, consejos técnicos, gaming, life hacks y optimización.' 
          },
          { 
              id: Category.SHOPPING, 
              name: 'Compras', 
              description: 'Productos, moda, gadgets, ropa y artículos para comprar.' 
          },
          { 
              id: Category.MOVIES, 
              name: 'Cine', 
              description: 'Trailers de películas, reseñas de series, actores y cine.' 
          },
          { 
              id: Category.FOODIE, 
              name: 'Comida', 
              description: 'Recetas de cocina, restaurantes, platos gourmet y bebidas.' 
          }
      ];

      const newUser: User = {
          id: crypto.randomUUID(),
          username,
          friends: [],
          folders: defaultFolders,
          settings: { enableUncategorized: true }
      };
      setState(prev => ({ ...prev, currentUser: newUser }));
  };

  const handleUpdateAvatar = async (file: File) => {
      try {
          const base64 = await fileToBase64(file);
          setState(prev => ({
              ...prev,
              currentUser: prev.currentUser ? { ...prev.currentUser, avatar: base64 } : null
          }));
      } catch (e) {
          console.error("Avatar upload failed", e);
      }
  };

  const handleAddFriend = (newFriend: User) => {
      if (!state.currentUser) return;
      
      const updatedUser = {
          ...state.currentUser,
          friends: [...state.currentUser.friends, newFriend.id]
      };

      // Import their items
      const newItems = getMockUserItems(newFriend.id);

      setState(prev => ({
          ...prev,
          currentUser: updatedUser,
          friendsItems: [...prev.friendsItems, ...newItems]
      }));
  };

  const handleCreateFolder = (name: string, description: string) => {
    if (!state.currentUser) return;
    const newFolder = { id: crypto.randomUUID(), name, description };
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser!,
        folders: [...prev.currentUser!.folders, newFolder]
      }
    }));
  };

  const handleUpdateFolder = (id: string, name: string, description: string) => {
      if (!state.currentUser) return;
      setState(prev => ({
          ...prev,
          currentUser: {
              ...prev.currentUser!,
              folders: prev.currentUser!.folders.map(f => f.id === id ? { ...f, name, description } : f)
          }
      }));
  };

  const handleDeleteFolder = (id: string) => {
    if (!state.currentUser) return;
    
    // 1. Remove folder from user
    const updatedFolders = state.currentUser.folders.filter(f => f.id !== id);
    
    // 2. Unassign items from this folder (effectively making them Uncategorized)
    const updatedItems = state.items.map(item => 
      item.folderId === id ? { ...item, folderId: undefined, userCategory: 'UNCATEGORIZED' } : item
    );

    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser!,
        folders: updatedFolders
      },
      items: updatedItems
    }));
  };

  const handleToggleUncategorized = (enabled: boolean) => {
      if (!state.currentUser) return;
      setState(prev => ({
          ...prev,
          currentUser: {
              ...prev.currentUser!,
              settings: { ...prev.currentUser!.settings, enableUncategorized: enabled }
          }
      }));
  };

  const handleAddItem = async (file: File, url?: string) => {
    if (!state.currentUser) return;

    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      
      // Pass the User's Current Folders to the AI Service
      const analysis = await analyzeImage(base64, state.currentUser.folders, lang);
      
      const suggestedFolderId = analysis.suggestedFolderId; 
      
      // LOGIC: Check if suggested ID is valid and exists in user folders
      let targetFolderId: string | undefined = undefined;
      let finalCategoryLabel = 'UNCATEGORIZED';

      const matchingFolder = state.currentUser.folders.find(f => f.id === suggestedFolderId);

      if (matchingFolder) {
          targetFolderId = matchingFolder.id;
          finalCategoryLabel = matchingFolder.id; // Use ID as key for internal consistency
      } else {
          // It's Uncategorized or AI returned garbage
          if (!state.currentUser.settings.enableUncategorized) {
              // REJECTION POLICY: If Uncategorized is disabled and no match found
              alert(t.profile.itemDiscarded);
              setIsProcessing(false);
              return; 
          }
          // Else: Proceed as Uncategorized (targetFolderId remains undefined)
      }

      const newItem: SavedItem = {
        id: crypto.randomUUID(),
        ownerId: state.currentUser.id,
        ownerName: state.currentUser.username,
        sourceUrl: url,
        sourcePlatform: url?.includes('instagram') ? 'instagram' : 'upload',
        imageUrl: base64,
        timestamp: Date.now(),
        analysis,
        userCategory: finalCategoryLabel, 
        folderId: targetFolderId, 
        isFavorite: false,
        status: 'analyzed'
      };

      setState(prev => ({
        ...prev,
        items: [newItem, ...prev.items]
      }));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert(lang === 'es' ? "Error al analizar. Verifique API Key." : "Failed to analyze image. Check API Key or try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCategory = (id: string, folderId: string) => {
    // Only update personal items
    if (activeTab === 'SOCIAL') return; 

    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;
        return { 
            ...item, 
            folderId: folderId,
            userCategory: folderId // Update the label/ID too
        };
      })
    }));
  };

  const filteredItems = useMemo(() => {
    const sourceItems = activeTab === 'PERSONAL' ? state.items : state.friendsItems;
    const isUncategorizedFilter = state.filterCategory === Category.UNCATEGORIZED;

    return sourceItems.filter(item => {
      let matchesCategory = false;

      if (state.filterCategory === 'ALL') {
        matchesCategory = true;
      } else if (isUncategorizedFilter) {
          // Show items that have NO folder assigned
          matchesCategory = !item.folderId;
      } else {
        // Filter by specific Folder ID
        matchesCategory = item.folderId === state.filterCategory;
      }

      const matchesSearch = state.searchQuery === '' || 
         item.analysis?.visualDescription.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
         item.analysis?.tags.some(t => t.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
         item.analysis?.detectedEntities.some(e => e.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [state.items, state.friendsItems, state.filterCategory, state.searchQuery, activeTab]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'es' : 'en');

  // RENDER ONBOARDING IF NO USER
  if (!state.currentUser) {
      return <Onboarding onComplete={handleRegister} lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-50 pb-20 sm:pb-0 transition-colors duration-200">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
              <Bookmark className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.appTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            
             {/* Desktop Search */}
             <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  className="bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-colors w-56 text-slate-800 dark:text-neutral-200 placeholder-slate-500 dark:placeholder-neutral-600"
                  value={state.searchQuery}
                  onChange={(e) => setState(s => ({...s, searchQuery: e.target.value}))}
                />
             </div>

             {/* Action Buttons */}
             <div className="flex items-center gap-1.5">
               <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors hidden sm:block">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               
               <div className="w-px h-6 bg-slate-200 dark:bg-neutral-800 mx-1"></div>

               <button onClick={() => setIsProfileOpen(true)} className="p-1 pr-3 pl-1 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-full border border-transparent hover:border-slate-200 dark:border-neutral-800 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold overflow-hidden">
                      {state.currentUser.avatar ? (
                          <img src={state.currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                          state.currentUser.username.substring(1, 2).toUpperCase()
                      )}
                  </div>
               </button>

               <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20 ml-2"
              >
                <Plus className="w-4 h-4" />
                {t.newItem}
              </button>
             </div>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="md:hidden mt-3 space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-neutral-500" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800 dark:text-neutral-200 placeholder-slate-500 dark:placeholder-neutral-600"
                  value={state.searchQuery}
                  onChange={(e) => setState(s => ({...s, searchQuery: e.target.value}))}
                />
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Feed Tab Toggle */}
        <div className="flex justify-center mb-6">
           <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-neutral-900 rounded-full border border-slate-200 dark:border-neutral-800">
               <button 
                onClick={() => setActiveTab('PERSONAL')}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all
                    ${activeTab === 'PERSONAL' 
                        ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
               >
                   <UserIcon className="w-4 h-4" />
                   {t.grid}
               </button>
               <button 
                onClick={() => setActiveTab('SOCIAL')}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all
                    ${activeTab === 'SOCIAL' 
                        ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
               >
                   <Users className="w-4 h-4" />
                   {t.social}
               </button>
           </div>
        </div>

        {/* Categories / Filter Bar */}
        {view === 'GRID' && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-slate-500 dark:text-neutral-500 mr-2 flex-shrink-0" />
            <button 
              onClick={() => setState(s => ({...s, filterCategory: 'ALL'}))}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm transition-colors border ${state.filterCategory === 'ALL' ? 'bg-slate-200 dark:bg-neutral-800 border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900/50'}`}
            >
              {t.filters.ALL}
            </button>
            
            {/* User Folders (System & Custom combined) */}
            {state.currentUser?.folders.map(folder => (
               <button
                 key={folder.id}
                 onClick={() => setState(s => ({...s, filterCategory: folder.id}))}
                 className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border ${state.filterCategory === folder.id ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'border-transparent text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900/50'}`}
               >
                 <FolderIcon className="w-3.5 h-3.5" />
                 {folder.name}
               </button>
            ))}

            {/* Uncategorized Toggle Filter */}
            {state.currentUser?.settings.enableUncategorized && (
                <>
                <div className="w-px h-6 bg-slate-300 dark:bg-neutral-700 mx-2"></div>
                <button
                    onClick={() => setState(s => ({...s, filterCategory: Category.UNCATEGORIZED}))}
                    className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border ${state.filterCategory === Category.UNCATEGORIZED ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900/50'}`}
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {t.badges.UNCATEGORIZED}
                </button>
                </>
            )}
          </div>
        )}

        {view === 'STATS' ? (
           <Stats items={activeTab === 'PERSONAL' ? state.items : state.friendsItems} lang={lang} />
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-neutral-600 transition-all hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 cursor-pointer flex flex-col h-full"
              >
                {/* Image Aspect Ratio Container */}
                <div className="relative aspect-video bg-slate-100 dark:bg-neutral-950 overflow-hidden">
                   <img 
                     src={item.imageUrl} 
                     alt="Saved content" 
                     className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                   />
                   <div className="absolute top-2 left-2">
                     <CategoryBadge 
                        category={item.userCategory as any} 
                        customLabel={item.folderId ? state.currentUser?.folders.find(f => f.id === item.folderId)?.name : undefined}
                        lang={lang} 
                     />
                   </div>
                   {activeTab === 'SOCIAL' && item.ownerName && (
                       <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                           <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                           {item.ownerName}
                       </div>
                   )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-slate-800 dark:text-neutral-100 font-medium leading-snug mb-2 line-clamp-2">
                    {item.analysis?.visualDescription || t.modal.analyzing}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800">
                     <div className="flex gap-2">
                        {item.analysis?.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] text-slate-500 dark:text-neutral-500 bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">#{tag}</span>
                        ))}
                     </div>
                     {item.sourcePlatform === 'instagram' && (
                       <Instagram className="w-4 h-4 text-pink-500" />
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-neutral-600">
                <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
                <p>{t.emptyState}</p>
            </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 text-white active:scale-95 transition-transform z-20"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modals */}
      <IngestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddItem}
        isProcessing={isProcessing}
        lang={lang}
      />

      {selectedItem && (
        <DetailView 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onUpdateCategory={updateCategory}
          folders={state.currentUser?.folders || []}
          lang={lang}
        />
      )}

      {state.currentUser && (
          <ProfileModal 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            currentUser={state.currentUser}
            onAddFriend={handleAddFriend}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onUpdateFolder={handleUpdateFolder}
            onUpdateAvatar={handleUpdateAvatar}
            onToggleUncategorized={handleToggleUncategorized}
            lang={lang}
            theme={theme}
            onToggleTheme={toggleTheme}
            onToggleLang={toggleLang}
          />
      )}

    </div>
  );
};

export default App;
