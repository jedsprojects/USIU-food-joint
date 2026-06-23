import { useState, useEffect, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  icon?: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], icon?: string) => void;
  removeToast: (id: string) => void;
}

let _listeners: Array<(toasts: Toast[]) => void> = [];
let _toasts: Toast[] = [];

function notify() {
  _listeners.forEach(l => l([..._toasts]));
}

export function addToast(message: string, type: Toast['type'] = 'success', icon?: string) {
  const id = `toast-${Date.now()}`;
  _toasts = [..._toasts, { id, message, type, icon }];
  notify();
  setTimeout(() => {
    _toasts = _toasts.filter(t => t.id !== id);
    notify();
  }, 3200);
}

export function useToastStore(): ToastStore {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    _listeners.push(setToasts);
    return () => {
      _listeners = _listeners.filter(l => l !== setToasts);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    _toasts = _toasts.filter(t => t.id !== id);
    notify();
  }, []);

  return { toasts, addToast, removeToast };
}
