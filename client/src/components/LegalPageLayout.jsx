import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Mail, ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function LegalPageLayout({ eyebrow, title, intro, updated, sections, relatedTo, relatedLabel, children }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf9] text-slate-900 dark:bg-[#0c1017] dark:text-white">
      <div className="relative isolate border-b border-rose-100 bg-slate-950 px-5 pb-20 pt-5 text-white dark:border-white/10 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at 12% 0%, rgba(255,56,92,.48), transparent 34%), radial-gradient(circle at 87% 20%, rgba(255,137,51,.25), transparent 28%)' }} />
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" aria-label="Go to LoopOut home" className="rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"><BrandLogo className="h-9 w-auto" textColor="text-white" /></Link>
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"><ArrowLeft size={15} /> Home</Link>
          </div>
          <div className="mt-16 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-rose-200"><ShieldCheck size={15} /> {eyebrow}</p>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{intro}</p>
            <p className="mt-7 text-sm font-medium text-slate-400">Last updated <span className="ml-1 text-slate-200">{updated}</span></p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-12 lg:py-16">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <p className="mb-3 text-xs font-black uppercase tracking-[.18em] text-slate-400">On this page</p>
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {sections.map(({ title }, index) => <a key={title} href={`#legal-section-${index + 1}`} className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-rose-600 dark:hover:bg-white/10 dark:hover:text-rose-300">{index + 1}. {title}</a>)}
          </nav>
        </aside>

        <article className="rounded-[2rem] border border-rose-100 bg-white p-6 shadow-[0_18px_60px_rgba(72,32,34,.08)] dark:border-white/10 dark:bg-[#141a23] sm:p-10">
          <div className="divide-y divide-rose-100 dark:divide-white/10">
            {sections.map(({ title, body }, index) => <section key={title} id={`legal-section-${index + 1}`} className="scroll-mt-6 py-8 first:pt-0 last:pb-0"><div className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-xs font-black text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{String(index + 1).padStart(2, '0')}</span><div><h2 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h2><div className="mt-3 space-y-3 text-[15px] leading-7 text-slate-600 dark:text-slate-300">{body}</div></div></div></section>)}
          </div>
          {children}
        </article>
      </div>

      <footer className="border-t border-rose-100 bg-white px-5 py-10 dark:border-white/10 dark:bg-[#10161f] sm:px-8 lg:px-12"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><BrandLogo className="h-8 w-auto" /><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Questions? <a className="font-bold text-rose-600 hover:underline" href="mailto:malebolanga3@gmail.com">malebolanga3@gmail.com</a></p></div><Link to={relatedTo} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-400">{relatedLabel} <ChevronRight size={16} /></Link></div></footer>
    </main>
  );
}
