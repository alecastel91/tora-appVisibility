/**
 * Client-side web push. The permission prompt is only ever triggered from an
 * explicit user tap (the soft-ask card or the Settings toggle) — never on
 * load. On iOS, push only exists for the INSTALLED app (Add to Home Screen,
 * iOS 16.4+), so the UI shows install guidance instead of a broken prompt.
 */
import apiService from './api';

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

/**
 * One of: 'unsupported' | 'ios-needs-install' | 'denied' | 'subscribed' | 'ready'
 * 'ready' = supported, permission not denied, not yet subscribed → show the ask.
 */
export async function getPushState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return isIos() && !isStandalone() ? 'ios-needs-install' : 'unsupported';
  }
  if (isIos() && !isStandalone()) return 'ios-needs-install';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) return 'subscribed';
  } catch { /* no active SW yet */ }
  return 'ready';
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Must be called from a user gesture. Returns the new state. */
export async function enablePush() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'ready';
  const { key } = await apiService.getVapidPublicKey();
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });
  await apiService.subscribePush(sub.toJSON());
  // Let other surfaces (the soft-ask card) react without polling.
  window.dispatchEvent(new CustomEvent('tora:push-state', { detail: { state: 'subscribed' } }));
  return 'subscribed';
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await apiService.unsubscribePush(sub.endpoint).catch(() => {});
    await sub.unsubscribe();
  }
  return 'ready';
}
