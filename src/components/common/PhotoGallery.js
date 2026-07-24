import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';

// Profile photo gallery (venue photos / promoter flyers): a single row of two
// preview tiles. Tapping a normal tile opens the big single-photo view;
// tapping the "+N" tile opens a scrollable grid of ALL photos, from which any
// photo opens the single view (with a back arrow returning to the grid).
// Hidden entirely when empty.
const PhotoGallery = ({ photos, title }) => {
  const { t } = useLanguage();
  // null | { mode: 'grid' } | { mode: 'single', index, fromGrid }
  const [view, setView] = useState(null);

  const list = (Array.isArray(photos) ? photos : []).filter((p) => typeof p === 'string' && p);
  if (list.length === 0) return null;

  const preview = list.slice(0, 2);
  const extraCount = list.length - preview.length;
  const openSingle = (index, fromGrid = false) => setView({ mode: 'single', index, fromGrid });
  const step = (delta) => setView((v) => ({ ...v, index: (v.index + delta + list.length) % list.length }));

  const navButtonClass = `w-10 h-10 rounded-full border border-white/15 bg-black/50 flex items-center justify-center
                          text-white cursor-pointer hover:border-infrared/50 transition-colors`;

  return (
    <div className="mb-6 text-left">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-tech mb-2.5 px-1">{title}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {preview.map((src, i) => {
          const isMoreTile = i === 1 && extraCount > 0;
          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => (isMoreTile ? setView({ mode: 'grid' }) : openSingle(i))}
              className="relative block aspect-square rounded-2xl border border-white/10 bg-[#0a0a0e] overflow-hidden
                         p-0 cursor-pointer transition-colors hover:border-infrared/40"
            >
              <img src={src} alt={`${title} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
              {isMoreTile && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/60
                                 text-2xl font-bold text-white font-space-grotesk">
                  +{extraCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {view?.mode === 'grid' && createPortal(
        <div className="fixed inset-0 z-[10002] overflow-y-auto bg-black/95" onClick={() => setView(null)}>
          <div className="mx-auto max-w-md px-4 pt-16 pb-8" onClick={(e) => e.stopPropagation()}>
            <p className="m-0 mb-4 text-center text-[13px] font-semibold text-white font-space-grotesk uppercase tracking-[0.08em]">
              {title}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {list.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => openSingle(i, true)}
                  className="block aspect-square rounded-xl border border-white/10 bg-[#0a0a0e] overflow-hidden
                             p-0 cursor-pointer transition-colors hover:border-infrared/40"
                >
                  <img src={src} alt={`${title} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => setView(null)}
            className={`fixed top-4 right-4 z-10 text-xl ${navButtonClass}`}
          >
            ×
          </button>
        </div>,
        document.body
      )}

      {view?.mode === 'single' && createPortal(
        <div
          className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setView(null)}
        >
          {view.fromGrid && (
            <button
              type="button"
              aria-label={t('common.back')}
              onClick={(e) => { e.stopPropagation(); setView({ mode: 'grid' }); }}
              className={`absolute top-4 left-4 z-10 ${navButtonClass}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => setView(null)}
            className={`absolute top-4 right-4 z-10 text-xl ${navButtonClass}`}
          >
            ×
          </button>
          <img
            src={list[view.index]}
            alt={`${title} ${view.index + 1}`}
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {list.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t('common.back')}
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${navButtonClass}`}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={t('common.next')}
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${navButtonClass}`}
              >
                ›
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-tech uppercase tracking-[0.15em] text-white/60">
                {view.index + 1} / {list.length}
              </span>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default PhotoGallery;
