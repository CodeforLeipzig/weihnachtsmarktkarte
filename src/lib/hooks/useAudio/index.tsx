import { AudioEntry } from "@components/MusicPlayer";
import { useState, useEffect, useMemo } from "react";

export default (track: AudioEntry, handleSongEnd: () => void) => {
  const [playing, setPlaying] = useState(false);
  const toggle = () => setPlaying(!playing);
  const createAudio = (url: string) => {
    const audio = new Audio(url)
    audio.addEventListener("loadeddata", function () {
      audio.play().then(() => setPlaying(true));
    });
    audio.load();
    return audio;
  }
  const audio = useMemo(() => createAudio(track.music.src), []);
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
  return { playing, toggle, updateAudio };
};