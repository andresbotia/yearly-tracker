import React, { createContext, useContext } from "react";

const FontsContext = createContext(false);

export function FontsProvider({ loaded = false, children }) {
  return (
    <FontsContext.Provider value={!!loaded}>{children}</FontsContext.Provider>
  );
}

export function useFontsLoaded() {
  return useContext(FontsContext);
}
