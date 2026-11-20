import { AudioEntry } from "@components/MusicPlayer";
import { useState, useEffect, useMemo, useContext, useRef } from "react";
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

  // pause when the audio element changes or the component unmounts,
  // so music does not keep playing after navigating away (e.g. to the
  // Adventskalender page)
  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

  // Never autoplay on (re)mount. This effect also runs on mount, and after
  // client-side navigation (e.g. back from the Adventskalender) the
  // navigation click counts as user activation, so audio.play() would
  // succeed and the music would start unexpectedly. Only register the
  // autoplay listener when the track src actually changed (next/prev
  // button or song end). Comparing against the previous src (instead of a
  // boolean ref) is robust against StrictMode double-invoking effects and
  // against page remounts.
  const prevSrcRef = useRef(track.music.src);
  useEffect(() => {
    if (prevSrcRef.current === track.music.src) {
      // mount / remount (or StrictMode re-run) -> no autoplay
      if (initialState?.initial && initialState.setInitial) {
        initialState.setInitial(false);
      }
      return;
    }
    prevSrcRef.current = track.music.src;
    const eventListener = () => {
      audio.play().then(() => setPlaying(true));
    }
    audio.removeEventListener("loadeddata", eventListener);
    audio.addEventListener("loadeddata", eventListener);
  }, [track.music.src]);
  return { playing, toggle, updateAudio };
};