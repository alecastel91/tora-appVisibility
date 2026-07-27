import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAvatarClass, ROLE_COLOR, roleLabel } from '../../utils/roles';

// Compact profile tiles (avatar + name).
//
// variant="grid" (default — network strips): one row of three; when more
// exist the 3rd tile carries a "+N" overlay and tapping it expands the strip
// inline (drawer-style) with a "See less" collapse.
//
// variant="scroll" (recommendation strips): smaller tiles (4 per row width)
// in a single horizontally-scrollable snap row — no drawer — each tile
// carrying a role chip (two-letter localized initial in the canonical role
// color, so Artist/Agent stay distinguishable).
const ProfileMiniGrid = ({ profiles, onOpenProfile, variant = 'grid' }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const list = Array.isArray(profiles) ? profiles : [];
  if (list.length === 0) return null;

  const roleChip = (role) => (
    <span
      className="absolute top-1 left-1 rounded px-1 py-px text-[8px] font-tech font-semibold uppercase tracking-[0.08em]
                 border bg-black/70 leading-[1.4]"
      style={{ color: ROLE_COLOR[role] || '#fff', borderColor: `${ROLE_COLOR[role] || '#ffffff'}55` }}
    >
      {roleLabel(role, t).slice(0, 2).toUpperCase()}
    </span>
  );

  const renderTile = (p, overlayCount, withRoleChip) => (
    <button
      key={p.id}
      type="button"
      onClick={() => (overlayCount ? setExpanded(true) : onOpenProfile && onOpenProfile(p))}
      className={`group block p-0 bg-transparent border-none text-center cursor-pointer
                  ${variant === 'scroll' ? 'w-[calc((100%-1.5rem)/4)] flex-none snap-start' : ''}`}
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
        {withRoleChip && roleChip(p.role)}
        {overlayCount ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60
                           text-xl font-bold text-white font-space-grotesk">
            +{overlayCount}
          </span>
        ) : null}
      </span>
      <span className={`block mt-1.5 font-medium text-white truncate ${variant === 'scroll' ? 'text-[11px]' : 'text-xs'}`}>
        {p.name}
      </span>
    </button>
  );

  if (variant === 'scroll') {
    return (
      <div
        className="flex gap-2 overflow-x-auto snap-x pb-1
                   [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((p) => renderTile(p, 0, true))}
      </div>
    );
  }

  const extras = list.slice(3);

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {list.slice(0, 3).map((p, i) =>
          renderTile(p, i === 2 && extras.length > 0 && !expanded ? extras.length : 0, false)
        )}
      </div>

      {/* Inline drawer with the remaining profiles */}
      {extras.length > 0 && (
        <div className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? 'max-h-[1200px]' : 'max-h-0'}`}>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {extras.map((p) => renderTile(p, 0, false))}
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
