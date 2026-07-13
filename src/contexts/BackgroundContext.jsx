"use client";

import { createContext, useContext, useState } from "react";

const BackgroundContext = createContext({
  variant: "light",
  setVariant: () => {},
});

export function BackgroundProvider({ children }) {
  const [variant, setVariant] = useState("light");

  return (
    <BackgroundContext.Provider value={{ variant, setVariant }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  return useContext(BackgroundContext);
}
