import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CadetRecord } from "@/types";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";

export type UserType = "cadet" | "admin";

interface AppShellValue {
  /* auth */
  isLoggedIn: boolean;
  currentUserType: UserType | null;
  currentUser: any | null;
  signIn: (type: UserType, user: any) => void;
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

const SESSION_KEY = "ncc_session_user";

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState("");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [printableRecord, setPrintableRecord] = useState<CadetRecord | null>(null);

  // Restore the session after hydration (sessionStorage is browser-only).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw && EnterpriseDataPlatform.getAuthToken()) {
        const parsed = JSON.parse(raw);
        setCurrentUserType(parsed.userType);
        setCurrentUser(parsed.user ?? null);
      }
    } catch {
      /* ignore malformed session payloads */
    }
  }, []);

  const signIn = useCallback((type: UserType, user: any) => {
    setCurrentUserType(type);
    setCurrentUser(user ?? null);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userType: type, user }));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const signOut = useCallback(async () => {
    await EnterpriseDataPlatform.logout();
    setCurrentUserType(null);
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
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
