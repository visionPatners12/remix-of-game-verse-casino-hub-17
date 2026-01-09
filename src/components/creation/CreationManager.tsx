
import React, { createContext, useContext, useState } from 'react';

interface CreationContextType {
  isPostDialogOpen: boolean;
  isLiveDialogOpen: boolean;
  setPostDialogOpen: (open: boolean) => void;
  setLiveDialogOpen: (open: boolean) => void;
}

const CreationContext = createContext<CreationContextType | undefined>(undefined);

export function CreationProvider({ children }: { children: React.ReactNode }) {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isLiveDialogOpen, setIsLiveDialogOpen] = useState(false);

  const setPostDialogOpen = (open: boolean) => setIsPostDialogOpen(open);
  const setLiveDialogOpen = (open: boolean) => setIsLiveDialogOpen(open);

  // Listen to global create post events
  React.useEffect(() => {
    const handleCreatePost = () => setPostDialogOpen(true);
    window.addEventListener('floating-create-post', handleCreatePost);
    return () => window.removeEventListener('floating-create-post', handleCreatePost);
  }, []);

  return (
    <CreationContext.Provider value={{
      isPostDialogOpen,
      isLiveDialogOpen,
      setPostDialogOpen,
      setLiveDialogOpen,
    }}>
      {children}
    </CreationContext.Provider>
  );
}

export function useCreation() {
  const context = useContext(CreationContext);
  if (context === undefined) {
    throw new Error('useCreation must be used within a CreationProvider');
  }
  return context;
}
