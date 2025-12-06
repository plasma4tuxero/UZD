
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, LayoutGrid, Filter, Search, Instagram, Bookmark, User as UserIcon, Users, Folder as FolderIcon, HelpCircle, Settings as SettingsIcon, Heart, Share2, Menu, ArrowLeft, Send, Check, X as XIcon, Trash2 } from 'lucide-react';
import { SavedItem, Category, AppState, Language, Theme, User, Folder } from './types';
import { analyzeImage } from './services/geminiService';
import { translations } from './utils/translations';
import { getMockUserItems, MOCK_USERS, MOCK_FRIEND_ITEMS } from './utils/mockData';
import CategoryBadge from './components/CategoryBadge';
import IngestModal from './components/IngestModal';
import DetailView from './components/DetailView';
import Stats from './components/Stats';
import Onboarding from './components/Onboarding';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import FolderEditModal from './components/FolderEditModal';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [view, setView] = useState<'GRID' | 'STATS'>('GRID');
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'SOCIAL'>('PERSONAL');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  
  // Folder Context Menu State
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        if (!user.settings) user.settings = { enableUncategorized: true, enableFavorites: true };
        else if (user.settings.enableFavorites === undefined) user.settings.enableFavorites = true;

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
             // In a real app, this would fetch from DB. Here we use mocks.
             // We filter MOCK_FRIEND_ITEMS based on the user's friend list
             const friendContent = MOCK_FRIEND_ITEMS.filter(item => item.ownerId === friendId);
             friendsItems = [...friendsItems, ...friendContent];
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

  const handleRegister = (username: string) => {
    // Initialize default system folders as user folders so they can be edited
    const defaultFolders: Folder[] = [
        { id: Category.TRICKS, name: translations[lang].badges[Category.TRICKS], description: "Programming tips, software tricks, gaming guides, and productivity hacks." },
        { id: Category.SHOPPING, name: translations[lang].badges[Category.SHOPPING], description: "Products I want to buy, price comparisons, gadgets, and wishlists." },
        { id: Category.MOVIES, name: translations[lang].badges[Category.MOVIES], description: "Movie trailers, film reviews, series recommendations, and cinema news." },
        { id: Category.FOODIE, name: translations[lang].badges[Category.FOODIE], description: "Recipes, restaurant reviews, cooking tips, and food spots." },
    ];

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      friends: [],
      incomingRequests: [], // Initialize empty
      outgoingRequests: [], // Initialize empty
      folders: defaultFolders,
      settings: { enableUncategorized: true, enableFavorites: true }
    };
    setState(prev => ({ ...prev, currentUser: newUser }));
  };

  const handleAddItem = async (file: File, url?: string) => {
    setIsProcessing(true);
    setIsModalOpen(false);

    try {
      const base64 = await fileToBase64(file);
      const userFolders = state.currentUser?.folders || [];
      
      const analysis = await analyzeImage(base64, userFolders, lang);
      
      let finalCategory = analysis.suggestedFolderId;

      // Handle Uncategorized Logic
      const isValidFolder = userFolders.some(f => f.id === finalCategory);
      if (!isValidFolder) {
          if (state.currentUser?.settings.enableUncategorized) {
              finalCategory = Category.UNCATEGORIZED;
          } else {
              // Reject item if uncategorized is disabled and no match found
              alert(translations[lang].profile.itemDiscarded);
              setIsProcessing(false);
              return;
          }
      }

      const newItem: SavedItem = {
        id: crypto.randomUUID(),
        ownerId: state.currentUser?.id || 'unknown',
        ownerName: state.currentUser?.username,
        sourceUrl: url,
        sourcePlatform: url?.includes('instagram') ? 'instagram' : 'upload',
        imageUrl: base64,
        timestamp: Date.now(),
        analysis,
        userCategory: finalCategory,
        folderId: isValidFolder ? finalCategory : undefined,
        isFavorite: false,
        status: 'analyzed',
      };

      setState(prev => ({
        ...prev,
        items: [newItem, ...prev.items],
      }));
    } catch (error) {
      console.error("Error processing item:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCategory = (itemId: string, category: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, userCategory: category, folderId: category === Category.UNCATEGORIZED ? undefined : category } 
          : item
      ),
    }));
  };

  const handleToggleFavorite = (itemId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      ),
      friendsItems: prev.friendsItems.map(item =>
        item.id === itemId
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      )
    }));
  };

  // --- Folder Management ---

  const handleCreateFolder = (name: string, description: string) => {
    if (!state.currentUser) return;
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      description
    };
    const updatedUser = {
      ...state.currentUser,
      folders: [...state.currentUser.folders, newFolder]
    };
    setState(prev => ({ ...prev, currentUser: updatedUser }));
  };

  const handleUpdateFolder = (id: string, name: string, description: string) => {
      if (!state.currentUser) return;
      const updatedFolders = state.currentUser.folders.map(f => 
          f.id === id ? { ...f, name, description } : f
      );
      const updatedUser = { ...state.currentUser, folders: updatedFolders };
      setState(prev => ({ ...prev, currentUser: updatedUser }));
  };

  const handleDeleteFolder = (id: string) => {
      if (!state.currentUser) return;
      const updatedFolders = state.currentUser.folders.filter(f => f.id !== id);
      const updatedUser = { ...state.currentUser, folders: updatedFolders };
      
      // Move items to Uncategorized
      const updatedItems = state.items.map(item => 
          item.folderId === id 
            ? { ...item, folderId: undefined, userCategory: Category.UNCATEGORIZED } 
            : item
      );

      setState(prev => ({ 
          ...prev, 
          currentUser: updatedUser,
          items: updatedItems,
          filterCategory: prev.filterCategory === id ? 'ALL' : prev.filterCategory
      }));
  };

  const handleToggleUncategorized = (enabled: boolean) => {
      if (!state.currentUser) return;
      const updatedUser = {
          ...state.currentUser,
          settings: { ...state.currentUser.settings, enableUncategorized: enabled }
      };
      setState(prev => ({ ...prev, currentUser: updatedUser }));
  };

  const handleToggleFavoritesVisibility = (enabled: boolean) => {
    if (!state.currentUser) return;
    const updatedUser = {
        ...state.currentUser,
        settings: { ...state.currentUser.settings, enableFavorites: enabled }
    };
    setState(prev => ({ 
        ...prev, 
        currentUser: updatedUser,
        filterCategory: (prev.filterCategory === 'FAVORITES' && !enabled) ? 'ALL' : prev.filterCategory
    }));
  };

  // --- Friend Request Logic ---

  const sendFriendRequest = (targetUser: User) => {
      if (!state.currentUser) return;
      const updatedUser = {
          ...state.currentUser,
          outgoingRequests: [...(state.currentUser.outgoingRequests || []), targetUser.id]
      };
      setState(prev => ({ ...prev, currentUser: updatedUser }));
  };

  const acceptFriendRequest = (requesterId: string) => {
      if (!state.currentUser) return;
      
      const updatedUser = {
          ...state.currentUser,
          friends: [...state.currentUser.friends, requesterId],
          incomingRequests: (state.currentUser.incomingRequests || []).filter(id => id !== requesterId)
      };

      // Add mock items for this new friend
      const newFriendItems = getMockUserItems(requesterId);

      setState(prev => ({ 
          ...prev, 
          currentUser: updatedUser,
          friendsItems: [...prev.friendsItems, ...newFriendItems]
      }));
  };

  const declineFriendRequest = (requesterId: string) => {
      if (!state.currentUser) return;
      const updatedUser = {
          ...state.currentUser,
          incomingRequests: (state.currentUser.incomingRequests || []).filter(id => id !== requesterId)
      };
      setState(prev => ({ ...prev, currentUser: updatedUser }));
  };

  const cancelFriendRequest = (targetId: string) => {
      if (!state.currentUser) return;
      const updatedUser = {
          ...state.currentUser,
          outgoingRequests: (state.currentUser.outgoingRequests || []).filter(id => id !== targetId)
      };
      setState(prev => ({ ...prev, currentUser: updatedUser }));
  };

  const handleRemoveFriend = (friendId: string) => {
      if (!state.currentUser) return;
      const updatedUser = {
          ...state.currentUser,
          friends: state.currentUser.friends.filter(id => id !== friendId)
      };
      // Remove friend's items
      const updatedFriendItems = state.friendsItems.filter(item => item.ownerId !== friendId);
      
      setState(prev => ({
          ...prev,
          currentUser: updatedUser,
          friendsItems: updatedFriendItems,
      }));

      // Update separate state for selectedFriendId
      if (selectedFriendId === friendId) {
        setSelectedFriendId(null);
      }
  };

  const handleAddFriend = (friend: User) => {
      sendFriendRequest(friend);
  };
  
  const handleUpdateAvatar = (file: File) => {
      fileToBase64(file).then(base64 => {
          if (!state.currentUser) return;
          const updatedUser = { ...state.currentUser, avatar: base64 };
          setState(prev => ({ ...prev, currentUser: updatedUser }));
      });
  };

  // --- Folder Context Interactions ---

  const handleFolderLongPress = (folder: Folder) => {
      longPressTimer.current = setTimeout(() => {
          setFolderToEdit(folder);
      }, 500); // 500ms long press
  };

  const handleFolderPressEnd = () => {
      if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
      }
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folder: Folder) => {
      e.preventDefault();
      setFolderToEdit(folder);
  };

  // --- Filtering ---

  const filteredItems = useMemo(() => {
    // Determine source
    // If activeTab is SOCIAL, we only show friends items.
    // If a friend is selected, we filter by that friend.
    let source = [];
    if (activeTab === 'PERSONAL') {
        source = state.items;
    } else {
        source = state.friendsItems;
        if (selectedFriendId) {
            source = source.filter(i => i.ownerId === selectedFriendId);
        }
    }
    
    // Filter by Category/Folder (Only applies to PERSONAL view)
    if (activeTab === 'PERSONAL' && state.filterCategory !== 'ALL') {
        if (state.filterCategory === 'FAVORITES') {
             source = source.filter(i => i.isFavorite);
        } else {
             source = source.filter(i => 
               i.folderId === state.filterCategory || i.userCategory === state.filterCategory
             );
        }
    }
    
    // Filter by Search (Applies to both)
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      source = source.filter(i => 
        i.analysis?.visualDescription.toLowerCase().includes(q) ||
        i.analysis?.detectedEntities.some(e => e.name.toLowerCase().includes(q)) ||
        i.analysis?.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return source.sort((a, b) => b.timestamp - a.timestamp);
  }, [state.items, state.friendsItems, state.filterCategory, state.searchQuery, activeTab, selectedFriendId]);

  if (!state.currentUser) {
    return <Onboarding onComplete={handleRegister} lang={lang} />;
  }

  // --- Render ---

  return (
    <div className="min-h-screen pb-20 sm:pb-0 bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-50 font-sans transition-colors duration-200">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                 <Bookmark className="w-5 h-5 text-white dark:text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                {t.appTitle}
              </span>
            </div>

            {/* Desktop Search */}
            <div className="hidden sm:flex flex-1 max-w-md mx-8 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
               {/* Settings Button */}
               <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
               >
                  <SettingsIcon className="w-6 h-6" />
               </button>

               {/* Profile Button */}
               <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
               >
                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-transparent hover:border-slate-200 dark:hover:border-neutral-700 shadow-sm">
                    {state.currentUser.avatar ? (
                        <img src={state.currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        state.currentUser.username.substring(1, 2).toUpperCase()
                    )}
                 </div>
               </button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="sm:hidden pb-3">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                />
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab Switcher */}
        <div className="flex gap-6 mb-6 border-b border-slate-200 dark:border-neutral-800">
           <button 
             onClick={() => setActiveTab('PERSONAL')}
             className={`pb-3 font-semibold text-sm transition-all ${activeTab === 'PERSONAL' ? 'text-slate-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'}`}
           >
             {t.grid}
           </button>
           <button 
             onClick={() => setActiveTab('SOCIAL')}
             className={`pb-3 font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'SOCIAL' ? 'text-slate-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'}`}
           >
             {t.social}
             {state.currentUser.incomingRequests && state.currentUser.incomingRequests.length > 0 && (
                 <span className="w-2 h-2 bg-red-500 rounded-full"></span>
             )}
           </button>
        </div>

        {/* --- PERSONAL TAB CONTENT --- */}
        {activeTab === 'PERSONAL' && (
            <div className="animate-in fade-in duration-300">
                {/* Folder Filters */}
                <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setState(prev => ({ ...prev, filterCategory: 'ALL' }))}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${state.filterCategory === 'ALL' 
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black' 
                            : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800'
                        }`}
                    >
                        {t.filters.ALL}
                    </button>
                    
                    {state.currentUser.settings.enableFavorites && (
                        <button
                            onClick={() => setState(prev => ({ ...prev, filterCategory: 'FAVORITES' }))}
                            className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5
                            ${state.filterCategory === 'FAVORITES' 
                                ? 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-900/50 border' 
                                : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${state.filterCategory === 'FAVORITES' ? 'fill-current' : ''}`} />
                            {translations[lang].profile.favoritesTitle.replace('Carpeta ', '').replace('Folder', '')}
                        </button>
                    )}

                    {state.currentUser.folders.map(folder => {
                        return (
                        <button
                            key={folder.id}
                            onClick={() => setState(prev => ({ ...prev, filterCategory: folder.id }))}
                            onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                            onTouchStart={() => handleFolderLongPress(folder)}
                            onTouchEnd={handleFolderPressEnd}
                            onMouseDown={() => handleFolderLongPress(folder)}
                            onMouseUp={handleFolderPressEnd}
                            onMouseLeave={handleFolderPressEnd}
                            className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all select-none
                            ${state.filterCategory === folder.id 
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md' 
                                : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800'
                            }`}
                        >
                            {folder.name}
                        </button>
                        );
                    })}
                    
                    {state.currentUser.settings.enableUncategorized && (
                        <button
                            onClick={() => setState(prev => ({ ...prev, filterCategory: Category.UNCATEGORIZED }))}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${state.filterCategory === Category.UNCATEGORIZED 
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md' 
                                : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800'
                            }`}
                        >
                            {t.filters[Category.UNCATEGORIZED]}
                        </button>
                    )}
                </div>

                {/* Personal Grid */}
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <LayoutGrid className="w-16 h-16 mb-4 text-slate-300 dark:text-neutral-700" />
                    <p className="text-lg text-slate-400 dark:text-neutral-600">{t.emptyState}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                      <div 
                        key={item.id} 
                        className="group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200 dark:border-neutral-800 cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="aspect-[4/5] relative bg-slate-100 dark:bg-neutral-950">
                          <img 
                            src={item.imageUrl} 
                            alt="Content" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute top-2 left-2">
                            <CategoryBadge 
                                category={item.userCategory} 
                                customLabel={state.currentUser?.folders.find(f => f.id === item.folderId)?.name}
                            />
                          </div>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item.id); }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 backdrop-blur-sm hover:bg-red-500/20 transition-colors"
                          >
                              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                          </button>
                        </div>
                        
                        <div className="p-3">
                          <p className="text-sm font-medium text-slate-800 dark:text-neutral-200 line-clamp-2 leading-snug">
                            {item.analysis?.visualDescription || t.modal.analyzing}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        )}

        {/* --- SOCIAL TAB CONTENT --- */}
        {activeTab === 'SOCIAL' && (
            <div className="animate-in fade-in duration-300">
                {selectedFriendId ? (
                    // Viewing Specific Friend's Content
                    <div className="mb-6">
                        <button 
                          onClick={() => setSelectedFriendId(null)}
                          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t.profile.backToAll}
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                             {(() => {
                                 const friend = Object.values(MOCK_USERS).find(u => u.id === selectedFriendId) || { username: 'Unknown', avatar: '' };
                                 return (
                                     <>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center overflow-hidden">
                                                {friend.avatar ? (
                                                     <img src={friend.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-slate-700 dark:text-neutral-200">{friend.username?.substring(1, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{friend.username}</h2>
                                            <p className="text-sm text-slate-500 dark:text-neutral-400">{t.profile.viewingFriend}</p>
                                        </div>
                                     </>
                                 );
                             })()}
                        </div>
                    </div>
                ) : (
                    // Social Dashboard (Lists)
                    <div className="space-y-10 mb-8">
                        
                        {/* 1. Pending Requests (Visible if > 0) */}
                        {(state.currentUser.incomingRequests?.length || 0) > 0 && (
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 text-orange-500">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                    {t.profile.pendingRequests}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {state.currentUser.incomingRequests?.map(id => {
                                        const user = Object.values(MOCK_USERS).find(u => u.id === id) || { username: 'Unknown', avatar: undefined };
                                        return (
                                            <div key={id} className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-4 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-[2px]">
                                                        <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                                                            {user.avatar ? (
                                                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="font-bold text-sm text-slate-700 dark:text-neutral-200">
                                                                    {user.username.substring(1, 2).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                            {user.username.replace('@', '')}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-neutral-500">
                                                            {user.username}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => acceptFriendRequest(id)} 
                                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        title="Accept"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => declineFriendRequest(id)} 
                                                        className="p-2 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                                                        title="Decline"
                                                    >
                                                        <XIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* 2. Sent Requests (Visible if > 0) */}
                        {(state.currentUser.outgoingRequests?.length || 0) > 0 && (
                             <section>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-500">
                                    <Send className="w-4 h-4" />
                                    {t.profile.sentRequests}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {state.currentUser.outgoingRequests?.map(id => {
                                        const user = Object.values(MOCK_USERS).find(u => u.id === id) || { username: 'Unknown', avatar: undefined };
                                        return (
                                            <div key={id} className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-4 shadow-sm opacity-90">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-sm text-slate-500 dark:text-neutral-400">
                                                                {user.username.substring(1, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                            {user.username.replace('@', '')}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-neutral-500">
                                                            {user.username}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => cancelFriendRequest(id)} 
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Cancel Request"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                             </section>
                        )}
                        
                        {/* 3. My Friends */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {t.profile.myFriends} ({state.currentUser.friends.length})
                            </h3>
                            {state.currentUser.friends.length === 0 ? (
                                <div className="p-8 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-dashed border-slate-300 dark:border-neutral-800 text-center flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                        <Users className="w-6 h-6 text-slate-400 dark:text-neutral-600" />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-neutral-500">
                                        {t.profile.noFriends}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {state.currentUser.friends.map(id => {
                                        const friend = Object.values(MOCK_USERS).find(u => u.id === id) || { username: id, avatar: '' };
                                        return (
                                            <div 
                                                key={id} 
                                                onClick={() => setSelectedFriendId(id)}
                                                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group relative"
                                            >
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center overflow-hidden">
                                                        {friend.avatar ? (
                                                            <img src={friend.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-xl text-slate-700 dark:text-neutral-200">
                                                                {friend.username.substring(1, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white truncate w-full text-center">
                                                    {friend.username}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <div className="border-t border-slate-200 dark:border-neutral-800 pt-8">
                           <p className="text-center text-slate-500 dark:text-neutral-500 text-sm italic">
                               {t.profile.selectFriendPrompt}
                           </p>
                        </div>
                    </div>
                )}

                {/* Social Grid (Filtered by Selected Friend) */}
                {selectedFriendId && (
                     filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800">
                            <LayoutGrid className="w-16 h-16 mb-4 text-slate-300 dark:text-neutral-700" />
                            <p className="text-lg text-slate-400 dark:text-neutral-600">No items shared by this friend yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                            {filteredItems.map(item => (
                            <div 
                                key={item.id} 
                                className="group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200 dark:border-neutral-800 cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="aspect-[4/5] relative bg-slate-100 dark:bg-neutral-950">
                                <img 
                                    src={item.imageUrl} 
                                    alt="Content" 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                {/* Owner Avatar Overlay */}
                                {item.ownerName && (
                                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                                            {item.ownerName.substring(1, 2).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-medium text-white shadow-black drop-shadow-md">
                                            {item.ownerName}
                                        </span>
                                    </div>
                                )}
                                </div>
                                
                                <div className="p-3">
                                <p className="text-sm font-medium text-slate-800 dark:text-neutral-200 line-clamp-2 leading-snug">
                                    {item.analysis?.visualDescription || t.modal.analyzing}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        )}

      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-90 z-40"
      >
        <Plus className="w-8 h-8" />
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
          onUpdateCategory={handleUpdateCategory}
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
          onToggleFavoritesVisibility={handleToggleFavoritesVisibility}
          onRemoveFriend={handleRemoveFriend}
          lang={lang}
        />
      )}

      <SettingsModal 
         isOpen={isSettingsOpen}
         onClose={() => setIsSettingsOpen(false)}
         lang={lang}
         theme={theme}
         onToggleLang={() => setLang(prev => prev === 'en' ? 'es' : 'en')}
         onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />

      <FolderEditModal
         isOpen={!!folderToEdit}
         onClose={() => setFolderToEdit(null)}
         folder={folderToEdit}
         onUpdate={handleUpdateFolder}
         onDelete={handleDeleteFolder}
         lang={lang}
      />

    </div>
  );
};

export default App;
