import { createContext } from "react";

export enum SidebarType {
  MUSIC, WEATHER, NONE
}

export interface SidebarState {
  setSidebarMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rightSidebarOpen: SidebarType;
  setRightSidebarOpen: React.Dispatch<React.SetStateAction<SidebarType>>
}

export const SidebarContext = createContext<SidebarState | null>(null)
