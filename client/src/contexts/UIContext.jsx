import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext({
  isSecureMode: false,
  setSecureMode: () => {},
});

export const UIProvider = ({ children }) => {
  const [isSecureMode, setSecureMode] = useState(false);

  return (
    <UIContext.Provider value={{ isSecureMode, setSecureMode }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
