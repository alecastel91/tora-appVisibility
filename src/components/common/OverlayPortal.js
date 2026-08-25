import { createPortal } from 'react-dom';

/**
 * Render overlay/modal children at <body> level.
 *
 * Any transformed ancestor (the beta banner shifts #root with translateZ(0);
 * animated screens can do the same) becomes the containing block for
 * position:fixed, which re-anchors a "fullscreen" overlay to the content box
 * and leaves it clipped under the header/tab bar on iOS. Portaling escapes
 * every such ancestor — React context still flows to the children.
 */
const OverlayPortal = ({ children }) => createPortal(children, document.body);

export default OverlayPortal;
