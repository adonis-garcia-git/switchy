"use client";

import { createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface GlossaryContextType {
  getTerm: (term: string) => { term: string; definition: string; category: string } | null;
  isLoaded: boolean;
}

const GlossaryContext = createContext<GlossaryContextType>({
  getTerm: () => null,
  isLoaded: false,
});

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const terms = useQuery(api.glossary.list, {});

  const getTerm = (termName: string) => {
    if (!terms) return null;
    return terms.find(
      (t: any) => t.term.toLowerCase() === termName.toLowerCase()
    ) ?? null;
  };

  return (
    <GlossaryContext.Provider value={{ getTerm, isLoaded: !!terms }}>
      {children}
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  return useContext(GlossaryContext);
}
