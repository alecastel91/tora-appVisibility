import React from 'react';
import { getAvatarClass } from '../../utils/roles';

// Visual roster for AGENT profiles: 2-per-row tiles with the artist's photo
// filling the card and the name over a bottom scrim. Tapping a tile opens the
// artist's profile; `renderOverlay` lets the own-profile screen add its
// Manage pill on top.
const ArtistRosterGrid = ({ artists, onOpenArtist, renderOverlay }) => {
  const list = Array.isArray(artists) ? artists : [];
  if (list.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {list.map((artist) => (
        <div
          key={artist.profileId || artist.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpenArtist && onOpenArtist(artist)}
          onKeyDown={(e) => { if (e.key === 'Enter') onOpenArtist && onOpenArtist(artist); }}
          className="relative aspect-square rounded-2xl border border-white/10 bg-[#0a0a0e] overflow-hidden
                     cursor-pointer transition-colors hover:border-infrared/40"
        >
          {artist.avatar ? (
            <img src={artist.avatar} alt={artist.name} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-4xl font-bold text-white
                             font-space-grotesk ${getAvatarClass('ARTIST')}`}>
              {(artist.name || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 pt-8 pb-2.5 px-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
            <p className="m-0 text-sm font-semibold text-white truncate font-space-grotesk">{artist.name}</p>
            {artist.location && (
              <p className="m-0 mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/55 font-tech truncate">{artist.location}</p>
            )}
          </div>
          {renderOverlay && renderOverlay(artist)}
        </div>
      ))}
    </div>
  );
};

export default ArtistRosterGrid;
