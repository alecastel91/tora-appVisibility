import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import BetaSheet from './BetaSheet';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const IS_BETA = import.meta.env.VITE_TORA_ENV === 'beta';
const BANNER_TEXT = 'Test environment — bookings and payments here are not real';

/**
 * Beta-only chrome: the persistent "test environment" banner and the floating
 * feedback widget. Renders nothing outside beta (VITE_TORA_ENV !== 'beta'),
 * so prod builds carry zero visual footprint.
 * Deliberately English-only — beta tooling, not product surface.
 */
const BetaTools = () => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const bannerRef = useRef(null);
  const [ticker, setTicker] = useState(false);

  // Commit SHA for silent feedback context — fetched once per session.
  useEffect(() => {
    if (!IS_BETA || window.__toraCommit) return;
    fetch(`${API_URL}/health`).then((r) => r.json())
      .then((h) => { window.__toraCommit = h.commit || null; })
      .catch(() => {});
  }, []);

  // Draggable FAB: hold and move to reposition (it was colliding with the
  // taller safe-area tab bar and the Search filters). Position persists.
  const fabRef = useRef(null);
  const dragMovedRef = useRef(false);
  const [fabPos, setFabPos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tora-beta-fab-pos')) || null; }
    catch { return null; }
  });
  const lastPosRef = useRef(null);
  const onFabPointerDown = (e) => {
    const fab = fabRef.current;
    if (!fab) return;
    dragMovedRef.current = false;
    const rect = fab.getBoundingClientRect();
    const offX = e.clientX - rect.left;
    const offY = e.clientY - rect.top;
    const onMove = (ev) => {
      const x = Math.min(Math.max(4, ev.clientX - offX), window.innerWidth - rect.width - 4);
      const y = Math.min(Math.max(4, ev.clientY - offY), window.innerHeight - rect.height - 4);
      if (Math.abs(ev.clientX - e.clientX) + Math.abs(ev.clientY - e.clientY) > 6) {
        dragMovedRef.current = true;
        lastPosRef.current = { x, y };
        setFabPos(lastPosRef.current);
      }
    };
    // pointercancel matters on touch: an incoming call / gesture interrupt
    // would otherwise leave the move listener leaked and the FAB glued.
    const onEnd = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      if (dragMovedRef.current && lastPosRef.current) {
        localStorage.setItem('tora-beta-fab-pos', JSON.stringify(lastPosRef.current));
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  };

  // Shift the sticky header/content below the fixed banner.
  useEffect(() => {
    if (!IS_BETA) return undefined;
    document.body.classList.add('beta-env');
    return () => document.body.classList.remove('beta-env');
  }, []);

  // Ticker only when the text doesn't fit on one line at this viewport width.
  useEffect(() => {
    if (!IS_BETA) return undefined;
    const check = () => {
      const el = bannerRef.current;
      const text = el && el.firstChild;
      if (el && text) setTicker(text.scrollWidth > el.clientWidth + 1);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!IS_BETA) return null;

  return (
    <>
      {/* Portaled to <body> so it pins to the true screen top, above the
          transformed #root (which is anchored 24px down — see App.css).
          When the text overflows, it becomes a seamless horizontal ticker. */}
      {createPortal(
        <div ref={bannerRef} className={`beta-banner${ticker ? ' is-ticker' : ''}`}>
          <span className="beta-banner-text">{BANNER_TEXT}</span>
          {ticker && <span className="beta-banner-text" aria-hidden="true">{BANNER_TEXT}</span>}
        </div>,
        document.body,
      )}

      <button
        type="button"
        className="beta-fab"
        ref={fabRef}
        style={fabPos ? { left: fabPos.x, top: fabPos.y, right: 'auto', bottom: 'auto' } : undefined}
        onPointerDown={onFabPointerDown}
        onClick={() => { if (!dragMovedRef.current) setOpen(true); }}
        aria-label="Beta tasks and feedback"
      >
        <span className="beta-fab-label">BETA</span>
      </button>

      <BetaSheet open={open} onClose={() => setOpen(false)} language={language} />
    </>
  );
};

export default BetaTools;
