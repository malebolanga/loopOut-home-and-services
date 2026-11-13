import React from 'react';

const DEFAULT_CLASS_NAME = 'app-safe-content-bottom relative z-10 mx-auto -mt-7 md:-mt-10 min-h-[55svh] max-w-6xl rounded-t-[1.75rem] md:rounded-t-[2rem] bg-white px-5 sm:px-8 lg:px-12 pb-32 lg:pb-16 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] dark:bg-gray-950';

export default function ListingDetailShell({ children, className = '', ...props }) {
  return (
    <main className={`${DEFAULT_CLASS_NAME} ${className}`.trim()} {...props}>
      {children}
    </main>
  );
}
