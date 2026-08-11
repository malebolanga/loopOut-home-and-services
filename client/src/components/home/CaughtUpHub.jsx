import PropTypes from 'prop-types';
import { ArrowRight, Building2, MapPin, ShieldCheck } from 'lucide-react';

const CaughtUpHub = ({ navigate }) => {
  return (
    <section className="mt-16 mb-24 space-y-8" aria-label="Find or list with loopOut">
      <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-8 sm:p-12 text-white shadow-2xl">
        <div className="max-w-3xl space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-200">
            <MapPin className="h-3.5 w-3.5" /> Your local marketplace
          </span>
          <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Find places, services, and local help in one place.
          </h2>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
            Browse available listings near you, or add your business, service, event, or space to loopOut.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 transition-all hover:bg-slate-100 active:scale-95"
            >
              Explore listings <ArrowRight className="h-4 w-4 text-rose-600" />
            </button>
            <button
              onClick={() => navigate('/become')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/20 active:scale-95"
            >
              List with loopOut <Building2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Browse with confidence', 'Review the listing details before you book.', ShieldCheck],
          ['Keep it local', 'Search for the places and professionals that fit your needs.', MapPin],
          ['Grow your business', 'Create a listing and reach people looking for your service.', Building2]
        ].map(([title, description, Icon]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Icon className="mb-4 h-5 w-5 text-rose-600" />
            <h3 className="text-sm font-black text-slate-900">{title}</h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-800 transition-all hover:bg-slate-200"
        >
          Back to top
        </button>
      </div>
    </section>
  );
};

CaughtUpHub.propTypes = {
  navigate: PropTypes.func.isRequired
};

export default CaughtUpHub;
