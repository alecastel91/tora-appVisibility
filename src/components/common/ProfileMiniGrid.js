import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAvatarClass } from '../../utils/roles';

// Compact profile tiles (avatar + name) for the network strips: one row of
// three; when more exist the 3rd tile carries a "+N" overlay and tapping it
// expands the strip inline (drawer-style) to the full grid, with a "See
// less" collapse. Tapping a normal tile opens that profile.
const ProfileMiniGrid = ({ profiles, onOpenProfile }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const list = Array.isArray(profiles) ? profiles : [];
  if (list.length === 0) return null;

  const extras = list.slice(3);

  const renderTile = (p, overlayCount) => (
    <button
      key={p.id}
      type="button"
      onClick={() => (overlayCount ? setExpanded(true) : onOpenProfile && onOpenProfile(p))}
      className="group block p-0 bg-transparent border-none text-center cursor-pointer"
    >
      <span className="relative block aspect-square rounded-xl border border-white/10 bg-[#0a0a0e] overflow-hidden
                       transition-colors group-hover:border-infrared/40">
        {p.avatar ? (
          <img src={p.avatar} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <span className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white
                            font-space-grotesk ${getAvatarClass(p.role)}`}>
            {(p.name || '?').charAt(0).toUpperCase()}
          </span>
        )}
        {overlayCount ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60
                           text-xl font-bold text-white font-space-grotesk">
            +{overlayCount}
          </span>
        ) : null}
      </span>
      <span className="block mt-1.5 text-xs font-medium text-white truncate">{p.name}</span>
    </button>
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {list.slice(0, 3).map((p, i) =>
          renderTile(p, i === 2 && extras.length > 0 && !expanded ? extras.length : 0)
        )}
      </div>

      {/* Inline drawer with the remaining profiles */}
      {extras.length > 0 && (
        <div className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? 'max-h-[1200px]' : 'max-h-0'}`}>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {extras.map((p) => renderTile(p, 0))}
          </div>
        </div>
      )}
      {expanded && (
        <button
          type="button"
          className="mt-2 bg-transparent border-none p-0 text-infrared text-xs cursor-pointer hover:underline"
          onClick={() => setExpanded(false)}
        >
          {t('profile.seeLess')}
        </button>
      )}
    </div>
  );
};

export default ProfileMiniGrid;
