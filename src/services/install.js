/**
 * PWA install plumbing.
 *
 * Chromium (Android + desktop) fires `beforeinstallprompt` once, EARLY — we
 * capture and stash it so a branded CTA can trigger the real native install
 * dialog on tap. iOS never fires it (install is manual via Share → Add to
 * Home Screen), so callers branch on platform. This module is imported for
 * its side effect from index.js so the listener exists before the event.
 */

let deferredPrompt = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // suppress Chrome's mini-infobar; we own the moment
    deferredPrompt = e;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
  });
}

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Native one-tap install is available (Chromium captured the prompt). */
export const canPromptInstall = () => !!deferredPrompt;

/** Trigger the native install dialog. Returns true if the user accepted. */
export async function promptInstall() {
  if (!deferredPrompt) return false;
  const evt = deferredPrompt;
  deferredPrompt = null; // single-use per page load
  evt.prompt();
  const { outcome } = await evt.userChoice;
  return outcome === 'accepted';
}

/** Subscribe to prompt-availability changes (returns unsubscribe). */
export function onInstallAvailabilityChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
