import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CadetRecord } from "@/types";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";

export type UserType = "cadet" | "admin";

interface AppShellValue {
  /* auth */
  isLoggedIn: boolean;
  currentUserType: UserType | null;
  currentUser: Record<string, unknown> | null;
  signIn: (type: UserType, user: Record<string, unknown> | null) => void;
  signOut: () => Promise<void>;
  /* shell surfaces */
  statusModalOpen: boolean;
  statusQuery: string;
  openStatusModal: (query?: string) => void;
  closeStatusModal: () => void;
  aiAssistantOpen: boolean;
  openAiAssistant: () => void;
  closeAiAssistant: () => void;
  printableRecord: CadetRecord | null;
  setPrintableRecord: (record: CadetRecord | null) => void;
}

const AppShellContext = createContext<AppShellValue | null>(null);

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState("");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [printableRecord, setPrintableRecord] = useState<CadetRecord | null>(null);

  // Verify session via HttpOnly cookie upon mount.
  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.success && payload?.data) {
          setCurrentUserType(payload.data.userType);
          setCurrentUser(payload.data.user);
        }
      })
      .catch(() => {
        /* unauthenticated */
      });
  }, []);

  const signIn = useCallback((type: UserType, user: Record<string, unknown> | null) => {
    setCurrentUserType(type);
    setCurrentUser(user ?? null);
  }, []);

  const signOut = useCallback(async () => {
    await EnterpriseDataPlatform.logout();
    setCurrentUserType(null);
    setCurrentUser(null);
  }, []);

  const value = useMemo<AppShellValue>(
    () => ({
      isLoggedIn: currentUserType !== null,
      currentUserType,
      currentUser,
      signIn,
      signOut,
      statusModalOpen,
      statusQuery,
      openStatusModal: (query?: string) => {
        setStatusQuery(query ?? "");
        setStatusModalOpen(true);
      },
      closeStatusModal: () => setStatusModalOpen(false),
      aiAssistantOpen,
      openAiAssistant: () => setAiAssistantOpen(true),
      closeAiAssistant: () => setAiAssistantOpen(false),
      printableRecord,
      setPrintableRecord,
    }),
    [
      currentUserType,
      currentUser,
      signIn,
      signOut,
      statusModalOpen,
      statusQuery,
      aiAssistantOpen,
      printableRecord,
    ],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell(): AppShellValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used inside AppShellProvider");
  return ctx;
}
