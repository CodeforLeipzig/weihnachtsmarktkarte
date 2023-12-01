import { AudioEntry } from "@components/MusicPlayer";
import { useState, useEffect, useMemo, useContext } from "react";
import { InitialAudioContext, Initial } from "@lib/hooks/useAudio/InitialAudioContext"

export default (track: AudioEntry, handleSongEnd: () => void) => {
  const initialState: Initial | null = useContext(InitialAudioContext);
  const [playing, setPlaying] = useState(false);
  const toggle = () => setPlaying(!playing);
  const createAudio = (url: string) => {
    const audio = new Audio(url)
    audio.load();
    return audio;
  }
  const audio = useMemo(() => createAudio(track.music.src), [initialState?.initial]);
  const updateAudio = (track: AudioEntry) => {
    audio.pause()
    audio.setAttribute('src', track.music.src);
    audio.load();
  }
  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing]);
  useEffect(() => {
    audio.addEventListener('ended', () => handleSongEnd());
  }, []);
  useEffect(() => {
    if (initialState?.initial) {
      if (initialState && initialState.setInitial) {
        initialState.setInitial(false);
      }
    } else {
      const eventListener = () => {
        audio.play().then(() => setPlaying(true));
      }
      audio.removeEventListener("loadeddata", eventListener);
      audio.addEventListener("loadeddata", eventListener);
    }
  }, [track.music.src]);
  return { playing, toggle, updateAudio };
};