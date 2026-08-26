import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import OverlayPortal from './OverlayPortal';
import { useAppContext } from '../../contexts/AppContext';
import apiService from '../../services/api';
import { downscaleImageToDataUrl } from '../../utils/image';
import { isStandalone } from '../../services/install';
import { BETA_TASKS_EN, BETA_TASKS_JA } from '../../beta/tasks-strings';

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
const TYPES = ['Bug', 'Confusing', 'Missing', 'Idea', 'Copy', 'Performance'];
const SEVERITIES = [
  { value: 'blocked', label: 'Blocked me' },
  { value: 'annoyed', label: 'Annoyed me' },
  { value: 'noting', label: 'Just noting it' },
];

const taskText = (code, lang) => (lang === 'ja' && BETA_TASKS_JA[code]) || BETA_TASKS_EN[code] || { title: code, hint: '' };

const currentTab = () => {
  const container = document.querySelector('.app-container');
  const tabClass = container && Array.from(container.classList).find((c) => c.startsWith('tab-'));
  return tabClass ? tabClass.replace('tab-', '') : (window.location.pathname || '/');
};

const BetaSheet = ({ open, onClose, language = 'en' }) => {
  const { user } = useAppContext();
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

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;
    try { setData(await apiService.betaGetTasks(user.id)); } catch { /* keep last */ }
  }, [user?.id]);

  // Poll while open: auto-detected ticks appear without a reload.
  useEffect(() => {
    if (!open || tab !== 'list') return undefined;
    loadTasks();
    const timer = setInterval(loadTasks, 15000);
    return () => clearInterval(timer);
  }, [open, tab, loadTasks]);

  if (!open) return null;

  const setStatus = async (code, status, reason) => {
    // Optimistic; server truth arrives on next poll.
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
    for (const g of GROUP_ORDER) {
      const rows = data.tasks.filter((t) => t.group === g);
      if (rows.length) groups.push([g, rows]);
    }
  }

  return (
    <OverlayPortal>
      <div className="fixed inset-0 z-[1100] flex flex-col bg-[#0a0a0a]">
        <div className="screen-header shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 34px)' }}>
          <button className="back-btn" onClick={onClose}>←</button>
          <h2>TORA Beta</h2>
          <div style={{ width: '32px' }}></div>
        </div>

        <div className="mx-4 mb-3 flex shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {[['list', 'YOUR LIST'], ['tell', 'TELL US']].map(([k, label]) => (
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
                Work through these in any order, over as many sittings as you like.
                {data ? ` ${data.done}/${data.total} done.` : ''}
              </p>
              {!data && <p className="text-white/50">Loading…</p>}
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
                              {t.counterparty && !done && (
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
                                    Show me how
                                  </button>
                                )}
                                <button type="button" className="border-0 bg-transparent p-0 text-[12px] text-white/50 underline" onClick={() => confusing(t.code)}>
                                  This was confusing
                                </button>
                                {!skipped && !t.autoDetected && (
                                  <button type="button" className="border-0 bg-transparent p-0 text-[12px] text-white/35 underline" onClick={() => { setSkipFor(t.code); setSkipReason(''); }}>
                                    Skip
                                  </button>
                                )}
                              </div>
                            )}
                            {skipFor === t.code && (
                              <div className="mt-2">
                                <input
                                  className="form-input w-full text-[13px]"
                                  placeholder="Why are you skipping it? One line is enough."
                                  value={skipReason}
                                  onChange={(e) => setSkipReason(e.target.value)}
                                />
                                <div className="mt-2 flex gap-2">
                                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setSkipFor(null)}>Cancel</button>
                                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setStatus(t.code, 'skipped', skipReason); setSkipFor(null); }}>
                                    Skip it
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
                <p className="m-0 mb-2 text-[15px] font-semibold text-white">Received — thank you.</p>
                <p className="m-0 mb-6 text-[13px] text-white/60">Every report makes TORA better. Send as many as you like.</p>
                <button className="btn btn-primary" onClick={() => setSent(false)}>Send another</button>
              </div>
            ) : (
              <>
                {taskCode && (
                  <p className="m-0 mb-3 rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-[12.5px] text-white/60">
                    About task: {taskText(taskCode, language).title}
                    <button type="button" className="ml-2 border-0 bg-transparent p-0 text-white/40 underline" onClick={() => setTaskCode(null)}>remove</button>
                  </p>
                )}
                <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">What kind of thing?</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {TYPES.map((tp) => (
                    <button key={tp} type="button" onClick={() => setType(tp)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] ${type === tp ? 'border-infrared bg-infrared/20 text-white' : 'border-white/15 text-white/60'}`}>
                      {tp}
                    </button>
                  ))}
                </div>
                <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">How bad?</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {SEVERITIES.map((sv) => (
                    <button key={sv.value} type="button" onClick={() => setSeverity(sv.value)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] ${severity === sv.value ? 'border-[#FFB800] bg-[#FFB800]/15 text-white' : 'border-white/15 text-white/60'}`}>
                      {sv.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="message-textarea-bottom w-full"
                  placeholder={'What happened? Short and blunt is perfect — "no idea what this button does" is a useful report.'}
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
                    + Add screenshot ({shots.length}/5)
                  </button>
                )}
                <p className="m-0 mb-2 mt-1 text-[11px] text-white/35">
                  Your screen, device and the last error are attached automatically — no need to describe them.
                </p>
                {error && <p className="m-0 mb-3 text-sm text-infrared">{error}</p>}
                <button className="btn btn-primary btn-full" onClick={submit} disabled={busy || !body.trim()}>
                  {busy ? '…' : 'Send'}
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
