import { createContext } from "react";

export interface Initial {
  initial: boolean,
  setInitial?: React.Dispatch<React.SetStateAction<boolean>>
}

export const InitialAudioContext = createContext<Initial | null>(null)
