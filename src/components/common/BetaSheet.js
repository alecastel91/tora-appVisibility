import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import OverlayPortal from './OverlayPortal';
import { useAppContext } from '../../contexts/AppContext';
import apiService from '../../services/api';
import { downscaleImageToDataUrl } from '../../utils/image';
import { isStandalone } from '../../services/install';
import { BETA_TASKS_EN, BETA_TASKS_JA, BETA_UI } from '../../beta/tasks-strings';

/**
 * Beta Tasks & Feedback sheet (TORA_BETA_BRIEF Build Item 2) — the two tabs
 * behind the floating button. Beta-only; English-first (JA overrides arrive
 * with the beta i18n pass). Deliberately outside the main i18n catalog.
 *
 * YOUR LIST: grouped task rows that tick themselves from real state (the
 * list polls while open, so auto-detected work flips without a reload).
 * TELL US: type + severity + text + up to five screenshots; everything
 * else (route, screen, commit, device, last API error, Sentry event) is
 * captured silently.
 */
const GROUP_ORDER = ['Setup', 'Discovery', 'Bookings', 'Role: Artist', 'Role: Agent', 'Role: Promoter', 'Role: Venue', 'Community', 'Notifications', 'Plan', 'Break it', 'Debrief'];
// FREE/TRIAL testers meet paywalls early — their path is: hit the limits
// (T44), upgrade with the test card (T45), THEN do the premium-gated work.
const GROUP_ORDER_FREE = ['Setup', 'Plan', 'Discovery', 'Bookings', 'Role: Artist', 'Role: Agent', 'Role: Promoter', 'Role: Venue', 'Community', 'Notifications', 'Break it', 'Debrief'];
const TYPES = ['Bug', 'Confusing', 'Missing', 'Idea', 'Copy', 'Performance'];
const SEVERITY_KEYS = ['blocked', 'annoyed', 'noting'];

const taskText = (code, lang) => (lang === 'ja' && BETA_TASKS_JA[code]) || BETA_TASKS_EN[code] || { title: code, hint: '' };

const currentTab = () => {
  const container = document.querySelector('.app-container');
  const tabClass = container && Array.from(container.classList).find((c) => c.startsWith('tab-'));
  return tabClass ? tabClass.replace('tab-', '') : (window.location.pathname || '/');
};

const BetaSheet = ({ open, onClose, language = 'en' }) => {
  const { user } = useAppContext();
  const ui = language === 'ja' ? BETA_UI.ja : BETA_UI.en;
  const [tab, setTab] = useState('list');
  const [data, setData] = useState(null);
  const [openHint, setOpenHint] = useState(null);
  const [skipFor, setSkipFor] = useState(null);
  const [skipReason, setSkipReason] = useState('');

  // Feedback state
  const [type, setType] = useState('Bug');
  const [severity, setSeverity] = useState('annoyed');
  const [body, setBody] = useState('');
  const [taskCode, setTaskCode] = useState(null);
  const [shots, setShots] = useState([]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const shotInputRef = useRef(null);

  const mutationSeq = useRef(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const loadTasks = useCallback(async (fresh = false) => {
    if (!user?.id) return;
    const seq = mutationSeq.current;
    try {
      const d = await apiService.betaGetTasks(user.id, fresh);
      // A poll that started BEFORE a tick/skip must not clobber the
      // optimistic update with pre-mutation server state.
      if (seq === mutationSeq.current) { setData(d); setLoadFailed(false); }
    } catch {
      setLoadFailed(true); // keep last data; only first-load shows the error
    }
  }, [user?.id]);

  // Poll while open: auto-detected ticks appear without a reload.
  useEffect(() => {
    if (!open || tab !== 'list') return undefined;
    loadTasks(true); // opening = actively checking: evaluate NOW, no debounce
    const timer = setInterval(() => loadTasks(false), 15000);
    return () => clearInterval(timer);
  }, [open, tab, loadTasks]);

  if (!open) return null;

  const setStatus = async (code, status, reason) => {
    // Optimistic; server truth arrives on next poll. Bump the sequence so
    // in-flight stale polls are discarded.
    mutationSeq.current += 1;
    setData((d) => d && { ...d, tasks: d.tasks.map((t) => (t.code === code ? { ...t, status } : t)) });
    try { await apiService.betaUpdateTask(code, { profileId: user.id, status, skipReason: reason }); } catch { /* next poll corrects */ }
    loadTasks();
  };

  const openHintFor = (code) => {
    setOpenHint(openHint === code ? null : code);
    if (openHint !== code) apiService.betaUpdateTask(code, { profileId: user.id, hintOpened: true }).catch(() => {});
  };

  const confusing = (code) => {
    setTab('tell');
    setType('Confusing');
    setTaskCode(code);
    setBody('');
    setSent(false);
  };

  const pickShots = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - shots.length);
    e.target.value = '';
    setError('');
    for (const f of files) {
      try {
        const dataUrl = await downscaleImageToDataUrl(f, { maxDimension: 1280, quality: 0.8 });
        setShots((s) => (s.length < 5 ? [...s, dataUrl] : s));
      } catch {
        setError('Could not read that image — try a JPEG or PNG.');
      }
    }
  };

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await apiService.betaSendFeedback({
        profileId: user?.id || null,
        taskCode,
        type,
        severity,
        body: body.trim(),
        attachments: shots,
        route: window.location.pathname + window.location.search,
        screen: currentTab(),
        commit: window.__toraCommit || null,
        device: {
          ua: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          standalone: isStandalone(),
          lang: navigator.language,
        },
        sentryEventId: (Sentry.lastEventId && Sentry.lastEventId()) || null,
        lastApiError: window.__toraLastApiError || null,
      });
      setSent(true);
      setBody(''); setShots([]); setTaskCode(null);
    } catch (e2) {
      setError(e2.message || 'Could not send — try again.');
    } finally {
      setBusy(false);
    }
  };

  const groups = [];
  if (data?.tasks) {
    const order = ['FREE', 'TRIAL'].includes(user?.subscriptionTier) || !user?.subscriptionTier
      ? GROUP_ORDER_FREE : GROUP_ORDER;
    for (const g of order) {
      const rows = data.tasks.filter((t) => t.group === g);
      if (rows.length) groups.push([g, rows]);
    }
  }

  return (
    <OverlayPortal>
      <div className="fixed inset-0 z-[1100] flex flex-col bg-[#0a0a0a]">
        {/* Same header structure as the Premium page: back arrow left,
            centered title, symmetric spacer. */}
        <div className="premium-header shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 34px)' }}>
          <button className="back-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1>BETA TEST</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        <div
          className="mx-4 flex shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-1"
          style={{ marginTop: 22, marginBottom: 16 }}
        >
          {[['list', ui.yourList], ['tell', ui.tellUs]].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => { setTab(k); setSent(false); }}
              className={`flex-1 rounded-full py-2 text-[12px] font-semibold tracking-wider ${tab === k ? 'bg-infrared text-white' : 'text-white/60'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
          {tab === 'list' && (
            <>
              <p className="m-0 mb-4 text-[13px] text-white/60">
                {ui.intro}
                {data ? ` ${data.done}/${data.total}` : ''}
              </p>
              {!data && !loadFailed && <p className="text-white/50">{ui.loading}</p>}
              {!data && loadFailed && (
                <p className="text-white/50">
                  {ui.loadError}{' '}
                  <button type="button" className="border-0 bg-transparent p-0 text-white/70 underline" onClick={loadTasks}>{ui.retry}</button>
                </p>
              )}
              {groups.map(([g, rows]) => (
                <div key={g} className="mb-5">
                  <h3 className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">{g}</h3>
                  {rows.map((t) => {
                    const s = taskText(t.code, language);
                    const done = t.status === 'done';
                    const skipped = t.status === 'skipped';
                    return (
                      <div key={t.code} className="mb-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            aria-label={done ? 'Done' : 'Mark done'}
                            onClick={() => { if (!t.autoDetected) setStatus(t.code, done ? 'todo' : 'done'); }}
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${done ? 'border-[#43E97B]/70 bg-[#43E97B]/20 text-[#43E97B]' : skipped ? 'border-white/20 text-white/30' : 'border-white/25 text-transparent'} ${t.autoDetected ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {done ? '✓' : skipped ? '–' : '·'}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`m-0 text-[13.5px] leading-snug ${done ? 'text-white/40 line-through' : 'text-white/90'}`}>
                              {s.title}
                              {t.counterparty && !['None', 'n/a'].includes(t.counterparty) && !done && (
                                <span className="ml-1 text-white/40">· {t.counterparty}</span>
                              )}
                            </p>
                            {openHint === t.code && s.hint && (
                              <p className="m-0 mt-2 rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-[12.5px] leading-relaxed text-white/70">{s.hint}</p>
                            )}
                            {!done && (
                              <div className="mt-1.5 flex flex-wrap gap-3">
                                {s.hint && (
                                  <button type="button" className="border-0 bg-transparent p-0 text-[12px] text-white/50 underline" onClick={() => openHintFor(t.code)}>
                                    {ui.showMeHow}
                                  </button>
                                )}
                                <button type="button" className="border-0 bg-transparent p-0 text-[12px] text-white/50 underline" onClick={() => confusing(t.code)}>
                                  {ui.confusing}
                                </button>
                                {!skipped && !t.autoDetected && (
                                  <button type="button" className="border-0 bg-transparent p-0 text-[12px] text-white/35 underline" onClick={() => { setSkipFor(t.code); setSkipReason(''); }}>
                                    {ui.skip}
                                  </button>
                                )}
                              </div>
                            )}
                            {skipFor === t.code && (
                              <div className="mt-2">
                                <input
                                  className="form-input w-full text-[13px]"
                                  placeholder={ui.skipWhy}
                                  value={skipReason}
                                  onChange={(e) => setSkipReason(e.target.value)}
                                />
                                <div className="mt-2 flex gap-2">
                                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setSkipFor(null)}>{ui.cancel}</button>
                                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setStatus(t.code, 'skipped', skipReason); setSkipFor(null); }}>
                                    {ui.skipIt}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}

          {tab === 'tell' && (
            sent ? (
              <div className="pt-10 text-center">
                <p className="m-0 mb-2 text-[15px] font-semibold text-white">{ui.received}</p>
                <p className="m-0 mb-6 text-[13px] text-white/60">{ui.receivedSub}</p>
                <button className="btn btn-primary" onClick={() => setSent(false)}>{ui.sendAnother}</button>
              </div>
            ) : (
              <>
                {taskCode && (
                  <p className="m-0 mb-3 rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-[12.5px] text-white/60">
                    {ui.aboutTask}: {taskText(taskCode, language).title}
                    <button type="button" className="ml-2 border-0 bg-transparent p-0 text-white/40 underline" onClick={() => setTaskCode(null)}>{ui.remove}</button>
                  </p>
                )}
                <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">{ui.typeQ}</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {TYPES.map((tp) => (
                    <button key={tp} type="button" onClick={() => setType(tp)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] ${type === tp ? 'border-infrared bg-infrared/20 text-white' : 'border-white/15 text-white/60'}`}>
                      {tp}
                    </button>
                  ))}
                </div>
                <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">{ui.howBad}</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {SEVERITY_KEYS.map((sv) => (
                    <button key={sv} type="button" onClick={() => setSeverity(sv)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] ${severity === sv ? 'border-[#FFB800] bg-[#FFB800]/15 text-white' : 'border-white/15 text-white/60'}`}>
                      {ui.severities[sv]}
                    </button>
                  ))}
                </div>
                <textarea
                  className="message-textarea-bottom w-full"
                  placeholder={ui.placeholder}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={5000}
                  rows={5}
                />
                <input ref={shotInputRef} type="file" accept="image/*" multiple className="hidden" onChange={pickShots} />
                {shots.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {shots.map((s, i) => (
                      <div key={i} className="relative">
                        <img src={s} alt="" className="h-16 w-16 rounded-lg object-cover" />
                        <button type="button" className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white" onClick={() => setShots(shots.filter((_, j) => j !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {shots.length < 5 && (
                  <button type="button" className="btn btn-outline beta-shot-attach" onClick={() => shotInputRef.current?.click()}>
                    + {ui.addShot} ({shots.length}/5)
                  </button>
                )}
                <p className="m-0 mb-2 mt-1 text-[11px] text-white/35">
                  {ui.autoNote}
                </p>
                {error && <p className="m-0 mb-3 text-sm text-infrared">{error}</p>}
                <button className="btn btn-primary btn-full" onClick={submit} disabled={busy || !body.trim()}>
                  {busy ? '…' : ui.send}
                </button>
              </>
            )
          )}
        </div>
      </div>
    </OverlayPortal>
  );
};

export default BetaSheet;
