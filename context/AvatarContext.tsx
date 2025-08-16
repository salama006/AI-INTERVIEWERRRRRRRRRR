"use client";

import React, { createContext, useContext, useState } from "react";

type AvatarContextType = {
  selectedAvatarId: string | null;
  setSelectedAvatarId: (id: string) => void;
};

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  return (
    <AvatarContext.Provider value={{ selectedAvatarId, setSelectedAvatarId }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
}
