import { parseBookingMessageDetails } from '../utils/bookingMessageDetails';

/** Displays the fields the customer sent in the WhatsApp booking request. */
export default function BookingRequestDetails({ message, title = 'Booking request details', compact = false, maxEntries = 0 }) {
  const parsed = parseBookingMessageDetails(message);
  const details = maxEntries > 0 ? parsed.slice(0, maxEntries) : parsed;
  if (!details.length) return null;

  return (
    <section className={compact ? 'mt-3 rounded-2xl bg-slate-50 p-3 dark:bg-gray-800/70' : 'rounded-2xl bg-slate-50 p-4 dark:bg-gray-800/70'}>
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">📝 {title}</h3>
      <dl className={`mt-3 grid gap-x-4 gap-y-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {details.map(({ label, value }, index) => (
          <div key={`${label}-${index}`} className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-800 dark:text-gray-100">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
