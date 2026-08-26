/**
 * Minimal app toast — fire-and-forget confirmations that don't deserve a
 * modal (e.g. "travel alert set"). ToastHost (mounted once in App.js)
 * listens and renders; messages are passed as i18n keys + params so callers
 * outside the LanguageContext (like AppContext) stay translation-free.
 */
export const showToast = (key, params) => {
  window.dispatchEvent(new CustomEvent('tora:toast', { detail: { key, params } }));
};
