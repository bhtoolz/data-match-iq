'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface EnvironmentContextType {
  isLiveMode: boolean;
  toggleEnvironment: () => void;
  setEnvironment: (isLive: boolean) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType>({
  isLiveMode: true,
  toggleEnvironment: () => {},
  setEnvironment: () => {},
});

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);

  // Sync mode with localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('stripoo_mode');
    if (saved !== null) {
      setIsLiveMode(saved === 'live');
    }
  }, []);

  const toggleEnvironment = () => {
    setIsLiveMode((prev) => {
      const next = !prev;
      localStorage.setItem('stripoo_mode', next ? 'live' : 'test');
      return next;
    });
  };

  const setEnvironment = (isLive: boolean) => {
    setIsLiveMode(isLive);
    localStorage.setItem('stripoo_mode', isLive ? 'live' : 'test');
  };

  return (
    <EnvironmentContext.Provider value={{ isLiveMode, toggleEnvironment, setEnvironment }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  return useContext(EnvironmentContext);
}
