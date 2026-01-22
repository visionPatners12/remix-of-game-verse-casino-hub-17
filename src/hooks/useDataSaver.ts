import { useState, useEffect, useCallback } from 'react';

interface DataSaverConfig {
  enabled: boolean;
  imageQuality: number;
  pollingEnabled: boolean;
  pollingInterval: number;
}

const STORAGE_KEY = 'pryzen-data-saver';

/**
 * Hook for managing data saver mode.
 * Reduces data consumption by lowering image quality and polling frequency.
 */
export function useDataSaver() {
  const [config, setConfig] = useState<DataSaverConfig>(() => {
    // Check browser's save-data hint
    const connection = (navigator as any).connection;
    const browserSaveData = connection?.saveData || false;
    
    // Check saved preference
    try {
      const savedPref = localStorage.getItem(STORAGE_KEY);
      if (savedPref) {
        const parsed = JSON.parse(savedPref);
        return buildConfig(parsed.enabled);
      }
    } catch {
      // Ignore parsing errors
    }
    
    return buildConfig(browserSaveData);
  });

  // Listen for browser save-data changes
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (!connection) return;

    const handleChange = () => {
      if (connection.saveData && !config.enabled) {
        toggleDataSaver();
      }
    };

    connection.addEventListener?.('change', handleChange);
    return () => connection.removeEventListener?.('change', handleChange);
  }, [config.enabled]);

  const toggleDataSaver = useCallback(() => {
    setConfig(prev => {
      const newEnabled = !prev.enabled;
      const newConfig = buildConfig(newEnabled);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: newEnabled }));
      } catch {
        // Ignore storage errors
      }
      
      return newConfig;
    });
  }, []);

  const setDataSaverEnabled = useCallback((enabled: boolean) => {
    const newConfig = buildConfig(enabled);
    setConfig(newConfig);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled }));
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    ...config,
    toggleDataSaver,
    setDataSaverEnabled,
  };
}

function buildConfig(enabled: boolean): DataSaverConfig {
  return {
    enabled,
    imageQuality: enabled ? 50 : 80,
    pollingEnabled: !enabled,
    pollingInterval: enabled ? 300000 : 120000, // 5min vs 2min
  };
}

/**
 * Context-free check for data saver status.
 * Useful for one-off checks outside React components.
 */
export function isDataSaverEnabled(): boolean {
  try {
    const connection = (navigator as any).connection;
    if (connection?.saveData) return true;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved).enabled;
    }
  } catch {
    // Ignore errors
  }
  return false;
}
