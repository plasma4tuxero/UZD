
import { Category } from "../types";

export type Language = 'en' | 'es';

export const translations = {
  en: {
    appTitle: 'Saved',
    searchPlaceholder: 'Semantic search...',
    newItem: 'New Item',
    grid: 'My Collection',
    social: 'Friends Feed',
    insights: 'Insights',
    filters: { 
      ALL: 'All', 
      [Category.TRICKS]: 'Tricks', 
      [Category.SHOPPING]: 'Shopping', 
      [Category.MOVIES]: 'Movies', 
      [Category.FOODIE]: 'Foodie', 
      [Category.UNCATEGORIZED]: 'Unsorted' 
    },
    modal: { 
      title: 'Add Content', 
      urlLabel: 'Source URL (Instagram, TikTok, etc.)', 
      urlPlaceholder: 'https://instagram.com/p/...', 
      fileLabel: 'Screenshot / Image (Required for AI)', 
      analyzing: 'Analyzing with Gemini...', 
      save: 'Save & Analyze',
      uploadText: 'Click to upload image',
      uploadSub: 'Supports JPG, PNG',
      change: 'Click to change'
    },
    detail: { 
      openSource: 'Open Original Source', 
      analysisTitle: 'AI Analysis', 
      confidence: 'Classification Confidence', 
      tags: 'Tags', 
      move: 'Move to:', 
      noEntities: 'No specific entities detected.',
      review: 'Review',
      savedBy: 'Saved by'
    },
    emptyState: 'No items found. Add some content!',
    stats: { 
      distribution: 'Content Distribution', 
      confidence: 'AI Confidence Levels', 
      noData: 'No data available for insights.' 
    },
    badges: {
      [Category.TRICKS]: 'Tricks',
      [Category.SHOPPING]: 'Shopping',
      [Category.MOVIES]: 'Movies',
      [Category.FOODIE]: 'Foodie',
      [Category.UNCATEGORIZED]: 'Unsorted'
    },
    onboarding: {
      welcome: 'Welcome to Saved',
      desc: 'Create a profile to organize your world and share with friends.',
      label: 'Choose a username',
      placeholder: '@username',
      btn: 'Get Started',
      error: 'Username must start with @ and have at least 3 characters.'
    },
    profile: {
      title: 'Profile',
      tabs: {
        friends: 'Friends',
        folders: 'Folders',
        settings: 'Settings'
      },
      friends: 'Friends',
      myFriends: 'My Friends',
      pendingRequests: 'Pending Requests',
      sentRequests: 'Sent Requests',
      addFriend: 'Add Friend',
      addPlaceholder: 'Enter @username',
      addBtn: 'Add',
      noFriends: 'No friends yet. Add someone to see their saved items!',
      userNotFound: 'User not found.',
      alreadyAdded: 'Already in your friends list.',
      successAdd: 'added to friends!',
      foldersTitle: 'Manage Folders',
      newFolderPlaceholder: 'New Folder Name',
      newFolderDescPlaceholder: 'Folder Description (Required for AI)',
      folderDescHint: 'Describe what belongs here. E.g., "Recipes and restaurant reviews."',
      createFolder: 'Create',
      deleteFolder: 'Delete',
      settingsTitle: 'App Configuration',
      theme: 'Theme',
      language: 'Language',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      english: 'English',
      spanish: 'Spanish',
      avatarChange: 'Change Photo',
      uncategorizedTitle: 'Unclassified Folder',
      uncategorizedDesc: 'Keep a folder for items that don\'t fit anywhere else.',
      favoritesTitle: 'Favorites Folder',
      favoritesDesc: 'Quick access filter for your favorite items.',
      warningTitle: 'Disable Unclassified Folder?',
      warningDesc: 'WARNING: If you disable this, any content that the AI cannot match to your existing folders will be DISCARDED and NOT SAVED. Are you sure?',
      confirmDisable: 'Yes, Disable and Risk Data Loss',
      cancel: 'Cancel',
      itemDiscarded: 'Item discarded: No matching folder and Unclassified is disabled.',
      selectFriendPrompt: 'Select a friend to view their shared collection',
      viewingFriend: 'Viewing collection of',
      backToAll: 'Back to all friends'
    },
    folderEdit: {
      title: 'Edit Folder',
      nameLabel: 'Folder Name',
      descLabel: 'Description',
      save: 'Update',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this folder? All items inside will be unclassified.'
    }
  },
  es: {
    appTitle: 'Saved',
    searchPlaceholder: 'Búsqueda semántica...',
    newItem: 'Nuevo Ítem',
    grid: 'Mi Colección',
    social: 'Amigos',
    insights: 'Estadísticas',
    filters: { 
      ALL: 'Todos', 
      [Category.TRICKS]: 'Trucos', 
      [Category.SHOPPING]: 'Compras', 
      [Category.MOVIES]: 'Cine', 
      [Category.FOODIE]: 'Comida', 
      [Category.UNCATEGORIZED]: 'Sin clasificar' 
    },
    modal: { 
      title: 'Añadir Contenido', 
      urlLabel: 'URL de origen (Instagram, TikTok, etc.)', 
      urlPlaceholder: 'https://instagram.com/p/...', 
      fileLabel: 'Captura / Imagen (Requerido para IA)', 
      analyzing: 'Analizando con Gemini...', 
      save: 'Guardar y Analizar',
      uploadText: 'Clic para subir imagen',
      uploadSub: 'Soporta JPG, PNG',
      change: 'Clic para cambiar'
    },
    detail: { 
      openSource: 'Abrir Fuente Original', 
      analysisTitle: 'Análisis IA', 
      confidence: 'Confianza de Clasificación', 
      tags: 'Etiquetas', 
      move: 'Mover a:', 
      noEntities: 'No se detectaron entidades específicas.',
      review: 'Revisar',
      savedBy: 'Guardado por'
    },
    emptyState: 'No hay ítems. ¡Añade contenido!',
    stats: { 
      distribution: 'Distribución de Contenido', 
      confidence: 'Niveles de Confianza IA', 
      noData: 'No hay datos disponibles.' 
    },
    badges: {
      [Category.TRICKS]: 'Trucos',
      [Category.SHOPPING]: 'Compras',
      [Category.MOVIES]: 'Cine',
      [Category.FOODIE]: 'Comida', 
      [Category.UNCATEGORIZED]: 'Sin clasificar'
    },
    onboarding: {
      welcome: 'Bienvenido a Saved',
      desc: 'Crea un perfil para organizar tu mundo y compartir con amigos.',
      label: 'Elige un nombre de usuario',
      placeholder: '@usuario',
      btn: 'Comenzar',
      error: 'El usuario debe empezar con @ y tener 3 caracteres.'
    },
    profile: {
      title: 'Perfil',
      tabs: {
        friends: 'Amigos',
        folders: 'Carpetas',
        settings: 'Ajustes'
      },
      friends: 'Amigos',
      myFriends: 'Mis Amigos',
      pendingRequests: 'Solicitudes Pendientes',
      sentRequests: 'Solicitudes Enviadas',
      addFriend: 'Añadir Amigo',
      addPlaceholder: 'Escribe @usuario',
      addBtn: 'Añadir',
      noFriends: 'Sin amigos aún. ¡Añade a alguien para ver sus guardados!',
      userNotFound: 'Usuario no encontrado.',
      alreadyAdded: 'Ya está en tu lista de amigos.',
      successAdd: 'añadido a amigos!',
      foldersTitle: 'Gestionar Carpetas',
      newFolderPlaceholder: 'Nombre de la carpeta',
      newFolderDescPlaceholder: 'Descripción (Obligatoria para la IA)',
      folderDescHint: 'Describe qué debe ir aquí. Ej: "Recetas y reseñas de restaurantes."',
      createFolder: 'Crear',
      deleteFolder: 'Eliminar',
      settingsTitle: 'Configuración de App',
      theme: 'Tema',
      language: 'Idioma',
      darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro',
      english: 'Inglés',
      spanish: 'Español',
      avatarChange: 'Cambiar Foto',
      uncategorizedTitle: 'Carpeta Sin Clasificar',
      uncategorizedDesc: 'Mantiene una carpeta para contenido que no encaja en ningún otro lugar.',
      favoritesTitle: 'Carpeta Favoritos',
      favoritesDesc: 'Acceso rápido a tus ítems marcados como favoritos.',
      warningTitle: '¿Desactivar carpeta Sin Clasificar?',
      warningDesc: 'ADVERTENCIA: Si desactivas esto, cualquier contenido que la IA no pueda asignar a tus carpetas existentes será DESCARTADO y NO SE GUARDARÁ. ¿Estás seguro?',
      confirmDisable: 'Sí, desactivar y arriesgar pérdida',
      cancel: 'Cancelar',
      itemDiscarded: 'Ítem descartado: No hay carpeta coincidente y "Sin Clasificar" está desactivado.',
      selectFriendPrompt: 'Selecciona un amigo para ver su colección compartida',
      viewingFriend: 'Viendo colección de',
      backToAll: 'Volver a todos'
    },
    folderEdit: {
      title: 'Editar Carpeta',
      nameLabel: 'Nombre de Carpeta',
      descLabel: 'Descripción',
      save: 'Actualizar',
      delete: 'Eliminar',
      deleteConfirm: '¿Estás seguro de querer eliminar esta carpeta? Todos los ítems dentro quedarán sin clasificar.'
    }
  }
};
