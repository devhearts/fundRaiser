import { create } from "zustand";

type AuthTab = "login" | "signup";

interface UiState {
  authDialogOpen: boolean;
  authDialogTab: AuthTab;
  setAuthDialogOpen: (open: boolean) => void;
  openAuthDialog: (tab?: AuthTab) => void;
  closeAuthDialog: () => void;
  setAuthDialogTab: (tab: AuthTab) => void;
}

export const useUiStore = create<UiState>((set) => ({
  authDialogOpen: false,
  authDialogTab: "login",
  setAuthDialogOpen: (open) => set({ authDialogOpen: open }),
  openAuthDialog: (tab = "login") => set({ authDialogOpen: true, authDialogTab: tab }),
  closeAuthDialog: () => set({ authDialogOpen: false }),
  setAuthDialogTab: (tab) => set({ authDialogTab: tab }),
}));
