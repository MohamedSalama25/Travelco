import { create } from "zustand";
import { ReactNode } from "react";

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  icon?: ReactNode;
  onConfirm: () => void;
  show: (title: string, description: string, onConfirm: () => void, icon?: ReactNode) => void;
  hide: () => void;
}

export const useConfirmationStore = create<ConfirmationState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: () => {},
  show: (title, description, onConfirm, icon) =>
    set({ isOpen: true, title, description, onConfirm, icon }),
  hide: () => set({ isOpen: false, icon: undefined }),
}));