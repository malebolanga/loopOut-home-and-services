import React from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, MapPin, WalletCards } from 'lucide-react';

const icons = [MapPin, ClipboardList, WalletCards];

/** A consistent, compact ordering guide used by all LoopOut booking forms. */
export default function BookingProgress({ property = false }) {
  const steps = property
    ? ['Your contact & stay dates', 'Choose room and stay options', 'Review total & confirm']
    : ['Contact, address & schedule', 'Choose service options', 'Review total & confirm'];

  return (
    <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-orange-50 p-3 dark:border-rose-500/20 dark:from-rose-950/30 dark:via-gray-900 dark:to-gray-900">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-600"><CalendarClock className="h-4 w-4" /> Your booking in 3 steps</div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-3">
        {steps.map((label, index) => {
          const Icon = icons[index];
          return <li key={label} className="flex items-center gap-2 rounded-xl bg-white/80 px-2.5 py-2 text-[11px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-100 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-[10px] text-white">{index + 1}</span><Icon className="h-3.5 w-3.5 shrink-0 text-rose-500" /><span>{label}</span></li>;
        })}
      </ol>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Your booking is saved before WhatsApp opens.</p>
    </div>
  );
}
