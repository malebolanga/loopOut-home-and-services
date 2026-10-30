import React from 'react';

/** Shared, responsive photo header for LoopOut listing and provider detail pages. */
export default function ListingPhotoGallery({
  images = [],
  alt = 'Listing',
  onOpen = () => {},
  emptyEmoji = '📷',
  emptyTitle = 'Photos coming soon',
  emptyDescription = 'This provider has not added photos yet.',
  className = '',
}) {
  const photos = Array.isArray(images) ? images.filter(Boolean) : [];

  return (
    <section
      className={`listing-photo-gallery relative h-[45svh] min-h-[260px] max-h-[620px] w-full overflow-hidden bg-slate-100 md:h-[440px] lg:h-[520px] ${className}`.trim()}
      aria-label={`${alt} photos`}
    >
      {photos.length === 0 ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 px-6 text-center text-white">
          <span className="text-5xl" aria-hidden="true">{emptyEmoji}</span>
          <p className="mt-4 text-base font-semibold">{emptyTitle}</p>
          <p className="mt-1 max-w-sm text-sm text-white/70">{emptyDescription}</p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onOpen(0)}
            aria-label={`Open photo 1 of ${photos.length}`}
            className="group relative block h-full w-full overflow-hidden text-left md:hidden"
          >
            <img
              src={photos[0]}
              alt={alt}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden="true" />
            <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              1 / {photos.length}
            </span>
          </button>

          <div className="hidden h-full w-full grid-cols-[1.25fr_1fr] grid-rows-2 gap-2 md:grid">
            {photos.slice(0, 5).map((photo, index) => (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={() => onOpen(index)}
                aria-label={`Open photo ${index + 1} of ${photos.length}`}
                className={`group relative min-h-0 overflow-hidden bg-slate-200 text-left focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 ${index === 0 ? 'row-span-2' : ''}`}
              >
                <img
                  src={photo}
                  alt={index === 0 ? alt : `${alt} photo ${index + 1}`}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" aria-hidden="true" />
              </button>
            ))}
            {Array.from({ length: Math.max(0, 5 - photos.length) }).map((_, index) => (
              <div key={`photo-placeholder-${index}`} className="bg-slate-200" aria-hidden="true" />
            ))}
          </div>

          <button
            type="button"
            onClick={() => onOpen(0)}
            aria-label={`View all ${photos.length} photos`}
            className="absolute bottom-4 right-4 hidden rounded-lg border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 md:inline-flex"
          >
            View all {photos.length} photos
          </button>
        </>
      )}
    </section>
  );
}
