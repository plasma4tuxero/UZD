import { SavedItem, Category, User } from "../types";

// Mock Users
export const MOCK_USERS: Record<string, User> = {
  'user_1': { 
    id: 'user_1', 
    username: '@alex_tech', 
    friends: [], 
    folders: [],
    settings: { enableUncategorized: true }
  },
  'user_2': { 
    id: 'user_2', 
    username: '@maria_eats', 
    friends: [], 
    folders: [],
    settings: { enableUncategorized: true }
  },
  'user_3': { 
    id: 'user_3', 
    username: '@cinephile_joe', 
    friends: [], 
    folders: [],
    settings: { enableUncategorized: true }
  },
};

// Mock Items for those users
export const MOCK_FRIEND_ITEMS: SavedItem[] = [
  {
    id: 'item_f1',
    ownerId: 'user_1',
    ownerName: '@alex_tech',
    sourcePlatform: 'instagram',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    timestamp: Date.now() - 10000000,
    userCategory: Category.TRICKS,
    isFavorite: false,
    status: 'analyzed',
    analysis: {
      visualDescription: 'Setup minimalista de programación con monitor ultrawide y teclado mecánico.',
      extractedTexts: ['VS Code', 'React'],
      detectedEntities: [{ name: 'Keychron K2', type: 'Product' }, { name: 'Dell Ultrasharp', type: 'Product' }],
      confidenceScores: { TRICKS: 0.9, SHOPPING: 0.4, MOVIES: 0, FOODIE: 0, UNCATEGORIZED: 0 },
      suggestedFolderId: Category.TRICKS,
      tags: ['setup', 'developer', 'desk']
    }
  },
  {
    id: 'item_f2',
    ownerId: 'user_2',
    ownerName: '@maria_eats',
    sourcePlatform: 'upload',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
    timestamp: Date.now() - 5000000,
    userCategory: Category.FOODIE,
    isFavorite: true,
    status: 'analyzed',
    analysis: {
      visualDescription: 'Plato gourmet de salmón con espárragos y reducción de balsámico.',
      extractedTexts: [],
      detectedEntities: [{ name: 'Salmon', type: 'Food' }],
      confidenceScores: { TRICKS: 0, SHOPPING: 0, MOVIES: 0, FOODIE: 0.95, UNCATEGORIZED: 0 },
      suggestedFolderId: Category.FOODIE,
      tags: ['food', 'gourmet', 'dinner']
    }
  }
];

export const findMockUser = (username: string): User | null => {
  const user = Object.values(MOCK_USERS).find(u => u.username.toLowerCase() === username.toLowerCase());
  return user || null;
};

export const getMockUserItems = (userId: string): SavedItem[] => {
  return MOCK_FRIEND_ITEMS.filter(i => i.ownerId === userId);
};