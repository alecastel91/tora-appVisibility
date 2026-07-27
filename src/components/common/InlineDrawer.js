import React from 'react';

// Shared expand/collapse container for the in-page drawers (photo gallery,
// network strips, past highlights) — one max-height cap and transition so
// the surfaces can't drift apart again.
const InlineDrawer = ({ expanded, className = '', children }) => (
  <div className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? 'max-h-[1600px]' : 'max-h-0'}`}>
    <div className={className}>{children}</div>
  </div>
);

export default InlineDrawer;
