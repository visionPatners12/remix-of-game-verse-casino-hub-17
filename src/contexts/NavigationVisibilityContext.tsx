import React, { createContext, useContext, useState } from 'react';

interface NavigationVisibilityContextType {
  hideNavigation: boolean;
  setHideNavigation: (hide: boolean) => void;
}

const NavigationVisibilityContext = createContext<NavigationVisibilityContextType>({
  hideNavigation: false,
  setHideNavigation: () => {},
});

export const NavigationVisibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [hideNavigation, setHideNavigation] = useState(false);
  
  return (
    <NavigationVisibilityContext.Provider value={{ hideNavigation, setHideNavigation }}>
      {children}
    </NavigationVisibilityContext.Provider>
  );
};

export const useNavigationVisibility = () => useContext(NavigationVisibilityContext);
