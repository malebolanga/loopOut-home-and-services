import React from 'react';

/**
 * InfoBadge – reusable component to display an icon with accompanying text.
 * Props:
 *   - icon: JSX element (e.g., <FaClock />) to render before the text.
 *   - children: text/content to display.
 */
export default function InfoBadge({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 bg-airbnb-red/10 text-airbnb-red rounded-full px-2 py-1 text-sm font-medium">
      {React.cloneElement(icon, { className: 'h-4 w-4' })}
      {children}
    </span>
  );
}
