import { HandHeart, House, Scissors, ShoppingBag, UtensilsCrossed, Wrench } from 'lucide-react';

const leftCards = [
  { label: 'Find a place to stay', Icon: House, tone: 'text-sky-700 bg-sky-100' },
  { label: 'Book a local service', Icon: Wrench, tone: 'text-rose-700 bg-rose-100' },
  { label: 'Find a barber', Icon: Scissors, tone: 'text-violet-700 bg-violet-100' },
];

const rightCards = [
  { label: 'Meet local helpers', Icon: HandHeart, tone: 'text-purple-700 bg-purple-100' },
  { label: 'Order local food', Icon: UtensilsCrossed, tone: 'text-amber-700 bg-amber-100' },
  { label: 'Shop nearby goods', Icon: ShoppingBag, tone: 'text-emerald-700 bg-emerald-100' },
];

function SideCard({ label, Icon, tone }) {
  return (
    <div className="flex w-40 items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-lg shadow-indigo-950/10 backdrop-blur-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-xs font-bold leading-4 text-slate-700">{label}</span>
    </div>
  );
}

export default function AuthSideIllustration() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
      <div className="absolute left-[calc(50%_-_31rem)] top-[calc(50%_-_12rem)] flex flex-col gap-5">
        {leftCards.map((card) => <SideCard key={card.label} {...card} />)}
      </div>
      <div className="absolute left-[calc(50%_+_21rem)] top-[calc(50%_-_9rem)] flex flex-col gap-5">
        {rightCards.map((card) => <SideCard key={card.label} {...card} />)}
      </div>
    </div>
  );
}
