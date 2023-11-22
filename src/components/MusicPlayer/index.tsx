import React, { useState, useRef, useEffect, FC } from 'react'
import { FaPlay, FaPause, FaBackward, FaForward, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import useAudio from '@lib/hooks/useAudio'

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
  tracks: Array<AudioEntry>
}

const MusicPlayer: FC<MusicPlayerProps> = ({ tracks }) => {
  const max = tracks.length;
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((curr) => {
    if (curr + 1 >= max) {
      return 0;
    } else {
      return curr + 1;
    }
  });
  const prev = () => setCurrent((curr) => {
    if (curr == 0) {
      return max - 1;
    } else {
      return curr - 1;
    }
  });
  const handleSongEnd = () => next();
  const [track, setTrack] = useState<AudioEntry>(tracks[0]);
  const { playing, toggle, updateAudio } = useAudio(track, handleSongEnd)

  const link = (entry: NameAndUrl) => (<a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.name}</a>)

  const attribution = (track: AudioEntry) => {
    const music = link(track.music)
    const author = link(track.author)
    const website = link(track.website)
    return (<div>{music} von {author} via {website}</div>)
  }

  useEffect(() => {
    setTrack(tracks[current]);
  }, [current]);

  useEffect(() => {
    updateAudio(track);
  }, [track]);

  return (
    <div
      className="absolute z-50"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        marginRight: 'auto',
        marginLeft: 'auto',
        marginBottom: '1px',
        width: '600px',
        fontStyle: 'bold',
        color: 'gold'
      }}>
      <div style={{ float: 'left' }}>
        <button onClick={prev} style={{ paddingLeft: '20px' }}>
          <FaBackward />
        </button>
        <button onClick={toggle} style={{ paddingLeft: '20px' }}>
          {playing ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={next} style={{ paddingLeft: '20px' }}>
          <FaForward />
        </button>
      </div>
      <span style={{ float: 'left', marginLeft: '20px' }}>{attribution(track)}</span>
    </div>
  );
};

export default MusicPlayer;