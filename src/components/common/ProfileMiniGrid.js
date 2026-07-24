import React from 'react';
import { getAvatarClass } from '../../utils/roles';

// Compact 3-per-row profile tiles (avatar + name) — smaller than the roster
// and gallery grids. Used for the artist "played with" section.
const ProfileMiniGrid = ({ profiles, onOpenProfile }) => {
  const list = Array.isArray(profiles) ? profiles : [];
  if (list.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {list.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onOpenProfile && onOpenProfile(p)}
          className="group block p-0 bg-transparent border-none text-center cursor-pointer"
        >
          <span className="block aspect-square rounded-xl border border-white/10 bg-[#0a0a0e] overflow-hidden
                           transition-colors group-hover:border-infrared/40">
            {p.avatar ? (
              <img src={p.avatar} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white
                                font-space-grotesk ${getAvatarClass(p.role)}`}>
                {(p.name || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <span className="block mt-1.5 text-xs font-medium text-white truncate">{p.name}</span>
        </button>
      ))}
    </div>
  );
};

export default ProfileMiniGrid;
