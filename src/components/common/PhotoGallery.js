import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';

// Profile photo gallery (venue photos / promoter flyers): 2-per-row grid with
// a portal lightbox on tap. Hidden entirely when there is nothing to show.
const PhotoGallery = ({ photos, title }) => {
  const { t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const list = (Array.isArray(photos) ? photos : []).filter((p) => typeof p === 'string' && p);
  if (list.length === 0) return null;

  const open = lightboxIndex !== null;
  const step = (delta) => setLightboxIndex((i) => (i + delta + list.length) % list.length);

  return (
    <div className="mb-6 text-left">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-tech mb-2.5 px-1">{title}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {list.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="block aspect-square rounded-2xl border border-white/10 bg-[#0a0a0e] overflow-hidden
                       p-0 cursor-pointer transition-colors hover:border-infrared/40"
          >
            <img src={src} alt={`${title} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full border border-white/15 bg-black/50
                       flex items-center justify-center text-white text-xl cursor-pointer hover:border-infrared/50 transition-colors"
          >
            ×
          </button>
          <img
            src={list[lightboxIndex]}
            alt={`${title} ${lightboxIndex + 1}`}
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {list.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t('common.back')}
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/15 bg-black/50
                           flex items-center justify-center text-white cursor-pointer hover:border-infrared/50 transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={t('common.next')}
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/15 bg-black/50
                           flex items-center justify-center text-white cursor-pointer hover:border-infrared/50 transition-colors"
              >
                ›
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-tech uppercase tracking-[0.15em] text-white/60">
                {lightboxIndex + 1} / {list.length}
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
