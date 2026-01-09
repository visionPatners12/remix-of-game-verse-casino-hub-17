import { createContext, useContext, useState, ReactNode } from 'react';
import type { OddsFormat } from '@/types/oddsFormat';

const STORAGE_KEY = 'pryzen-odds-format';
const DEFAULT: OddsFormat = 'decimal';

interface OddsFormatContextType {
  format: OddsFormat;
  setFormat: (f: OddsFormat) => void;
}

const OddsFormatContext = createContext<OddsFormatContextType>({ 
  format: DEFAULT, 
  setFormat: () => {} 
});

export function OddsFormatProvider({ children }: { children: ReactNode }) {
  const [format, setFormatState] = useState<OddsFormat>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    return (localStorage.getItem(STORAGE_KEY) as OddsFormat) || DEFAULT;
  });

  const setFormat = (f: OddsFormat) => {
    setFormatState(f);
    localStorage.setItem(STORAGE_KEY, f);
  };

  return (
    <OddsFormatContext.Provider value={{ format, setFormat }}>
      {children}
    </OddsFormatContext.Provider>
  );
}

export const useOddsFormat = () => useContext(OddsFormatContext);
