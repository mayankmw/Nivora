import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  /** Desktop sidebar: expanded (true) or collapsed to icons (false). */
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Persisted so a collapsed sidebar stays collapsed across reloads. The mobile
// drawer state is transient and stays inside the Sidebar component.
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      open: true,
      setOpen: (open) => set({ open }),
    }),
    { name: 'nivora-sidebar' },
  ),
);
