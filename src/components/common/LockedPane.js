import React from 'react';
import LockOverlay from './LockOverlay';

/**
 * Premium teaser: the real content under a heavy blur with a clickable lock
 * overlay that opens Premium. The overlay is an absolute sibling (not a
 * wrapper) so the blurred content's own buttons aren't nested in a <button>.
 * Used by Profile > Manage (dashboard) and Tour > My dates.
 */
const LockedPane = ({ message, onUnlock, children }) => (
  <div className="relative overflow-hidden rounded-xl">
    <div className="blur-[7px] select-none pointer-events-none" aria-hidden>
      {children}
    </div>
    <button
      type="button"
      onClick={() => onUnlock && onUnlock()}
      aria-label={message}
      className="absolute inset-0 z-10 w-full border-none bg-transparent p-0 cursor-pointer"
    >
      <LockOverlay message={message} />
    </button>
  </div>
);

export default LockedPane;
