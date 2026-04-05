"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";

export function useAppToast() {
  const success = useCallback(
    (message: string, description?: string) => toast.success(message, { description }),
    []
  );
  const error = useCallback(
    (message: string, description?: string) => toast.error(message, { description }),
    []
  );
  const info = useCallback(
    (message: string, description?: string) => toast(message, { description }),
    []
  );

  return useMemo(
    () => ({
      success,
      error,
      info
    }),
    [error, info, success]
  );
}
