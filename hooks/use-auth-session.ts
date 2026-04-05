"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AUTH_SESSION_CHANGED_EVENT,
  authService
} from "@/lib/services/auth-service";
import { AuthUser } from "@/types/auth";

export function useAuthSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await authService.session();
      setUser(session.authenticated ? session.user : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleAuthChange = () => {
      void refresh();
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthChange);
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    refresh,
    logout
  };
}
