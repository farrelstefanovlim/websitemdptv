import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  isHiding?: boolean;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, type = "info", duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().hideToast(id);
    }, duration);
  },
  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, isHiding: true } : t))
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 300);
  },
  removeToast: (id) => {
    get().hideToast(id);
  },
  success: (message) => get().addToast(message, "success"),
  error: (message) => get().addToast(message, "error", 4500),
  info: (message) => get().addToast(message, "info"),
  warning: (message) => get().addToast(message, "warning", 4000),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().success(message),
  error: (message: string) => useToastStore.getState().error(message),
  info: (message: string) => useToastStore.getState().info(message),
  warning: (message: string) => useToastStore.getState().warning(message),
};
