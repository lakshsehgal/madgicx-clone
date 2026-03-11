"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ClientSpace, Channel, MetaCredentials, GoogleAdsCredentials, ShopifyCredentials } from "@/types";

interface CreateClientSpaceData {
  name: string;
  metaCredentials?: MetaCredentials;
  googleCredentials?: GoogleAdsCredentials;
  shopifyCredentials?: ShopifyCredentials;
}

interface WorkspaceContextType {
  clientSpaces: ClientSpace[];
  activeClientSpace: ClientSpace | null;
  setActiveClientSpace: (id: string) => void;
  createClientSpace: (data: CreateClientSpaceData) => ClientSpace;
  deleteClientSpace: (id: string) => void;
  updateClientSpace: (id: string, data: Partial<ClientSpace>) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const STORAGE_KEY = "neuroid_client_spaces";
const ACTIVE_KEY = "neuroid_active_client_space";

function loadClientSpaces(): ClientSpace[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveClientSpaces(spaces: ClientSpace[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [clientSpaces, setClientSpaces] = useState<ClientSpace[]>([]);
  const [activeClientSpace, setActiveState] = useState<ClientSpace | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const spaces = loadClientSpaces();
    setClientSpaces(spaces);

    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (activeId) {
      const active = spaces.find((s) => s.id === activeId);
      if (active) setActiveState(active);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveClientSpaces(clientSpaces);
  }, [clientSpaces, loaded]);

  const setActiveClientSpace = useCallback(
    (id: string) => {
      const space = clientSpaces.find((s) => s.id === id);
      if (space) {
        setActiveState(space);
        localStorage.setItem(ACTIVE_KEY, id);
      }
    },
    [clientSpaces]
  );

  const createClientSpace = useCallback(
    (data: CreateClientSpaceData): ClientSpace => {
      const connectedChannels: Channel[] = [];
      if (data.metaCredentials) connectedChannels.push("meta");
      if (data.googleCredentials) connectedChannels.push("google");
      if (data.shopifyCredentials) connectedChannels.push("shopify");

      const newSpace: ClientSpace = {
        id: crypto.randomUUID(),
        name: data.name,
        metaCredentials: data.metaCredentials,
        googleCredentials: data.googleCredentials,
        shopifyCredentials: data.shopifyCredentials,
        connectedChannels,
        createdAt: new Date().toISOString(),
      };
      setClientSpaces((prev) => {
        const updated = [...prev, newSpace];
        saveClientSpaces(updated);
        return updated;
      });
      setActiveState(newSpace);
      localStorage.setItem(ACTIVE_KEY, newSpace.id);
      return newSpace;
    },
    []
  );

  const deleteClientSpace = useCallback(
    (id: string) => {
      setClientSpaces((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        saveClientSpaces(updated);
        return updated;
      });
      if (activeClientSpace?.id === id) {
        setActiveState(null);
        localStorage.removeItem(ACTIVE_KEY);
      }
    },
    [activeClientSpace]
  );

  const updateClientSpace = useCallback(
    (id: string, data: Partial<ClientSpace>) => {
      setClientSpaces((prev) => {
        const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
        saveClientSpaces(updated);
        if (activeClientSpace?.id === id) {
          const updatedSpace = updated.find((s) => s.id === id);
          if (updatedSpace) setActiveState(updatedSpace);
        }
        return updated;
      });
    },
    [activeClientSpace]
  );

  if (!loaded) return null;

  return (
    <WorkspaceContext.Provider
      value={{
        clientSpaces,
        activeClientSpace,
        setActiveClientSpace,
        createClientSpace,
        deleteClientSpace,
        updateClientSpace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
