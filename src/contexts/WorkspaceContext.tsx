"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Workspace, Channel } from "@/types";

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (data: {
    name: string;
    clientName: string;
    windsorApiKey?: string;
    connectedChannels: Channel[];
  }) => Workspace;
  deleteWorkspace: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const STORAGE_KEY = "madgicx_workspaces";
const ACTIVE_KEY = "madgicx_active_workspace";

function loadWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWorkspaces(workspaces: Workspace[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveState] = useState<Workspace | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ws = loadWorkspaces();
    setWorkspaces(ws);

    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (activeId) {
      const active = ws.find((w) => w.id === activeId);
      if (active) setActiveState(active);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveWorkspaces(workspaces);
  }, [workspaces, loaded]);

  const setActiveWorkspace = useCallback(
    (id: string) => {
      const ws = workspaces.find((w) => w.id === id);
      if (ws) {
        setActiveState(ws);
        localStorage.setItem(ACTIVE_KEY, id);
      }
    },
    [workspaces]
  );

  const createWorkspace = useCallback(
    (data: {
      name: string;
      clientName: string;
      windsorApiKey?: string;
      connectedChannels: Channel[];
    }): Workspace => {
      const newWorkspace: Workspace = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      setWorkspaces((prev) => {
        const updated = [...prev, newWorkspace];
        saveWorkspaces(updated);
        return updated;
      });
      setActiveState(newWorkspace);
      localStorage.setItem(ACTIVE_KEY, newWorkspace.id);
      return newWorkspace;
    },
    []
  );

  const deleteWorkspace = useCallback(
    (id: string) => {
      setWorkspaces((prev) => {
        const updated = prev.filter((w) => w.id !== id);
        saveWorkspaces(updated);
        return updated;
      });
      if (activeWorkspace?.id === id) {
        setActiveState(null);
        localStorage.removeItem(ACTIVE_KEY);
      }
    },
    [activeWorkspace]
  );

  if (!loaded) return null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        createWorkspace,
        deleteWorkspace,
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
