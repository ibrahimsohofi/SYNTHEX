import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { favoritesAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

interface FavoritesContextType {
  favorites: string[];
  savedCreations: string[];
  toggleFavorite: (id: string) => void;
  toggleSaved: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('synthex-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedCreations, setSavedCreations] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('synthex-saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync with backend when user logs in
  useEffect(() => {
    const syncWithBackend = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      setIsLoading(true);
      try {
        // Fetch favorites from backend
        const favResponse = await favoritesAPI.getAll();
        setFavorites(favResponse.ids || []);

        // Fetch saved creations from backend
        const savedResponse = await favoritesAPI.getSaved();
        setSavedCreations(savedResponse.ids || []);
      } catch (error) {
        console.error('Failed to sync favorites:', error);
        // Keep local storage values on error
      } finally {
        setIsLoading(false);
      }
    };

    syncWithBackend();
  }, [isAuthenticated, user]);

  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem('synthex-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('synthex-saved', JSON.stringify(savedCreations));
  }, [savedCreations]);

  const toggleFavorite = useCallback(async (id: string) => {
    const isFav = favorites.includes(id);

    // Optimistic update
    if (isFav) {
      setFavorites(prev => prev.filter(f => f !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        if (isFav) {
          await favoritesAPI.remove(id);
        } else {
          await favoritesAPI.add(id);
        }
      } catch (error) {
        console.error('Failed to sync favorite:', error);
        toast.error('Failed to update favorite');
        // Revert on error
        if (isFav) {
          setFavorites(prev => [...prev, id]);
        } else {
          setFavorites(prev => prev.filter(f => f !== id));
        }
      }
    }
  }, [favorites, isAuthenticated, toast]);

  const toggleSaved = useCallback(async (id: string) => {
    const isSav = savedCreations.includes(id);

    // Optimistic update
    if (isSav) {
      setSavedCreations(prev => prev.filter(s => s !== id));
    } else {
      setSavedCreations(prev => [...prev, id]);
    }

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        if (isSav) {
          await favoritesAPI.unsave(id);
        } else {
          await favoritesAPI.save(id);
        }
      } catch (error) {
        console.error('Failed to sync saved:', error);
        // Revert on error
        if (isSav) {
          setSavedCreations(prev => [...prev, id]);
        } else {
          setSavedCreations(prev => prev.filter(s => s !== id));
        }
      }
    }
  }, [savedCreations, isAuthenticated]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);
  const isSaved = useCallback((id: string) => savedCreations.includes(id), [savedCreations]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      savedCreations,
      toggleFavorite,
      toggleSaved,
      isFavorite,
      isSaved,
      isLoading,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
