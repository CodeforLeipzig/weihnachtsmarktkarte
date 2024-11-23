import React, {
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Cross, Music } from "@components/Icons";
import classNames from "classnames";
import { FaBackward, FaForward, FaPause, FaPlay } from "react-icons/fa";
import useAudio from "@lib/hooks/useAudio";
import { useHasMobileSize } from "@lib/hooks/useHasMobileSize";
import {
  SidebarContext,
  SidebarState,
  SidebarType,
} from "@components/Sidebar/SidebarNav/SidebarContext";

export interface AudioEntry {
  author: NameAndUrl;
  website: NameAndUrl;
  music: Music;
}

export interface NameAndUrl {
  name: string;
  url: string;
}

export interface Music extends NameAndUrl {
  src: string;
}

interface MusicPlayerProps {
  tracks: Array<AudioEntry>;
}

const MusicPlayerOverlay: FC<MusicPlayerProps> = ({
  tracks,
}) => {
  const sidebarState: SidebarState | null = useContext(SidebarContext);
  const max = tracks.length;
  const [current, setCurrent] = useState(0);
  const next = () =>
    setCurrent((curr) => {
      if (curr + 1 >= max) {
        return 0;
      } else {
        return curr + 1;
      }
    });
  const prev = () =>
    setCurrent((curr) => {
      if (curr == 0) {
        return max - 1;
      } else {
        return curr - 1;
      }
    });
  const handleSongEnd = () => next();
  const [track, setTrack] = useState<AudioEntry>(tracks[0]);
  const { playing, toggle, updateAudio } = useAudio(track, handleSongEnd);

  const link = (entry: NameAndUrl) => (
    <a href={entry.url} target="_blank" rel="noopener noreferrer">
      {entry.name}
    </a>
  );

  const attribution = (track: AudioEntry) => {
    const music = link(track.music);
    const author = link(track.author);
    const website = link(track.website);
    return (
      <div>
        <div className="text-xl">{music}</div>
        <div className="text-sm">Urheber: {author}</div>
        <div className="text-sm">Quelle: {website}</div>
      </div>
    );
  };

  useEffect(() => {
    setTrack(tracks[current]);
  }, [current]);

  useEffect(() => {
    updateAudio(track);
  }, [track]);

  const isMobile = useHasMobileSize();

  function openWindows() {
    sidebarState?.setRightSidebarOpen((curr) => {
      if (curr == SidebarType.MUSIC) {
        return SidebarType.NONE;
      } else {
        if (isMobile) {
          sidebarState?.setSidebarMenuOpen(false);
        }
        return SidebarType.MUSIC;
      }
    });
  }

  return (
    <nav
      className={"fixed bottom-0 p-4 ease-in-out duration-300 z-10 right-0 top-8 h-min nav-small-height-music"}
    >
      <button
        onClick={() => openWindows()}
        aria-label="Jukebox"
        className={classNames(
          "rounded-full w-10 h-10 mt-16",
          "fixed right-4 text-center py-2 z-10",
          "bg-darkblue",
          (sidebarState?.rightSidebarOpen == SidebarType.MUSIC) &&
            "bg-gold text-darkblue",
          (sidebarState?.rightSidebarOpen != SidebarType.MUSIC) &&
            "text-gold hover:bg-gold hover:text-darkblue",
        )}
      >
        <span className="inline-block">
          <Music></Music>
        </span>
      </button>
      {(sidebarState?.rightSidebarOpen == SidebarType.MUSIC) && (
        <div
          className={classNames(
            "right-4 top-4 sm:top-20 sm:right-20",
            "rounded shadow-xl p-6 sm:p-8 w-96",
            "fixed bg-darkblue flex flex-col z-20",
          )}
          style={{ maxWidth: "calc(100% - 32px)" }}
        >
          <div
            style={{
              marginBottom: "1px",
              fontStyle: "bold",
              color: "gold",
            }}
          >
            <span>{attribution(track)}</span>
            <div style={{ marginTop: "20px", float: "left" }}>
              <button onClick={prev} style={{ paddingLeft: "20px" }}>
                <FaBackward />
              </button>
              <button onClick={toggle} style={{ paddingLeft: "20px" }}>
                {playing ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={next} style={{ paddingLeft: "20px" }}>
                <FaForward />
              </button>
            </div>
          </div>
          <div className="ml-1 mt-2">
            <img
              alt="Jukebox from the 1950s"
              src="images/fifties_jukebox.png"
            />
          </div>
          <button
            className="text-lightblue/80 top-0 right-0 mr-6 mt-6 absolute cursor-pointer z-20 border-lightblue border-2 hover:bg-gold hover:border-gold rounded-full p-0"
            onClick={() =>
              sidebarState?.setRightSidebarOpen((_) => SidebarType.NONE)}
            title="close"
          >
            <Cross />
          </button>
        </div>
      )}
    </nav>
  );
};

export default MusicPlayerOverlay;
