"use client";

import { useState, useCallback } from "react";

export interface UseMessagesReturn {
  error: string | null;
  success: string | null;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearMessages: () => void;
}

export function useMessages(timeoutMs: number = 3000): UseMessagesReturn {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    setSuccess(null);
    setTimeout(clearMessages, timeoutMs);
  }, [clearMessages, timeoutMs]);

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
    setError(null);
    setTimeout(clearMessages, timeoutMs);
  }, [clearMessages, timeoutMs]);

  return {
    error,
    success,
    showError,
    showSuccess,
    clearMessages,
  };
}