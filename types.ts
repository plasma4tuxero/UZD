
export enum Category {
  TRICKS = 'TRICKS',
  SHOPPING = 'SHOPPING',
  MOVIES = 'MOVIES',
  FOODIE = 'FOODIE',
  UNCATEGORIZED = 'UNCATEGORIZED',
}

export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';

export interface Folder {
  id: string; 
  name: string;
  description: string; // Used for AI Context
  icon?: string;
}

export interface UserSettings {
  enableUncategorized: boolean;
}

export interface User {
  id: string;
  username: string; // Must start with @
  avatar?: string;
  friends: string[]; // List of user IDs
  folders: Folder[]; // All folders (system defaults + custom)
  settings: UserSettings;
}

export interface Entity {
  name: string;
  type: string; // e.g., 'Product', 'Place', 'Actor', 'Tech'
  meta?: string; // e.g., price, address
}

export interface AIAnalysis {
  visualDescription: string;
  extractedTexts: string[];
  detectedEntities: Entity[];
  confidenceScores: Record<string, number>; // FolderID -> Score
  suggestedFolderId: string | 'UNCATEGORIZED';
  tags: string[];
}

export interface SavedItem {
  id: string;
  ownerId: string; // ID of the user who saved it
  ownerName?: string; // Display name/username for UI
  sourceUrl?: string;
  sourcePlatform: 'instagram' | 'direct' | 'upload';
  imageUrl: string; // Base64 or URL
  timestamp: number;
  analysis: AIAnalysis | null;
  userCategory: string; // Use the folder ID or 'UNCATEGORIZED'
  folderId?: string; // The actual folder it lives in (if matched)
  isFavorite: boolean;
  status: 'processing' | 'analyzed' | 'error';
}

export interface AppState {
  currentUser: User | null;
  items: SavedItem[];
  friendsItems: SavedItem[]; // Items from friends
  filterCategory: string; // Folder ID or 'ALL'
  searchQuery: string;
}
