'use client';

import { useCallback, useRef, type ReactNode } from 'react';
import type { ExternalToast } from 'sonner';
import { toast } from 'sonner';

type ToastType = 'error' | 'warning' | 'success' | 'info' | 'message';

export function useZoanToast(cooldownMs: number = 5000) {
  const lastToastAtRef = useRef<Record<string, number>>({});

  const showToast = useCallback(
    (
      key: string,
      type: ToastType,
      title: ReactNode,
      options?: ExternalToast,
    ) => {
      const now = Date.now();
      const lastShownAt = lastToastAtRef.current[key] || 0;
      if (now - lastShownAt < cooldownMs) return;
      lastToastAtRef.current[key] = now;

      switch (type) {
        case 'error':
          toast.error(title, options);
          break;
        case 'warning':
          toast.warning(title, options);
          break;
        case 'success':
          toast.success(title, options);
          break;
        case 'info':
          toast.info(title, options);
          break;
        default:
          toast.message(title, options);
          break;
      }
    },
    [cooldownMs],
  );

  return showToast;
}
