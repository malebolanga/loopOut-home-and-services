import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, BookOpen, CalendarDays, CircleHelp, ClipboardList, MessageSquareText, Plus, Store } from 'lucide-react';
import { getCreationRoute } from '../utils/offeringPermissions';

const categories = [
  { emoji: '🏡', title: 'Property host', text: 'Describe the space, location, house rules, availability and price. Use clear photos of the actual property.' },
  { emoji: '🛠️', title: 'Service provider', text: 'Explain the work you do, the areas you serve, your availability and how your pricing works.' },
  { emoji: '🍱', title: 'Food business', text: 'Prepare your shop details, pickup information, menu items, prices and opening hours.' },
  { emoji: '🛍️', title: 'Goods seller', text: 'Show the actual item, describe its condition honestly, set a clear price and explain pickup.' },
];

const gettingStarted = [
  { number: '01', title: 'Choose what you offer', text: 'Select the LoopOut category that best fits your space, service, food business or item.' },
  { number: '02', title: 'Add accurate details', text: 'Use a clear description, real photos, correct prices and information customers need before they contact you.' },
  { number: '03', title: 'Manage requests', text: 'Check your bookings and messages regularly, then keep availability and listing details up to date.' },
];

function QuickLink({ to, icon: Icon, title, description }) {
  return (
    <Link to={to} className="group flex min-h-28 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-rose-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-rose-900">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900 dark:text-white">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</span></span>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" aria-hidden="true" />
    </Link>
  );
}

export default function HostingResources() {
  const { currentUser } = useSelector((state) => state.user);
  const createListingPath = getCreationRoute(currentUser) || '/become';
  const listingsPath = currentUser?._id ? `/${currentUser._id}/list` : '/sign-in';

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-36 text-slate-900 dark:bg-gray-950 dark:text-white md:pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">LoopOut hosting resources</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">A clear start for your listing</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Practical guidance for property hosts, service providers, food businesses and sellers. Prepare accurate details, publish your listing and manage customer requests in LoopOut.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={createListingPath} className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">Create a listing <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/become" className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-gray-700 dark:text-slate-200 dark:hover:border-gray-500">Choose a category</Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="resources-quick-links" className="mb-12">
          <div className="mb-4"><h2 id="resources-quick-links" className="text-xl font-semibold tracking-tight">Useful links</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Go directly to the tools you use to run your LoopOut account.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink to={createListingPath} icon={Plus} title="Create a listing" description="Add a property, service, helper listing, event or item." />
            <QuickLink to="/dashboard" icon={CalendarDays} title="Bookings" description="Review booking requests and their current status." />
            <QuickLink to={listingsPath} icon={Store} title="Your listings" description="View and manage listings associated with your account." />
            <QuickLink to="/help-center" icon={CircleHelp} title="Help centre" description="Browse LoopOut help articles and support information." />
          </div>
        </section>

        <section aria-labelledby="getting-started-heading" className="mb-12">
          <div className="mb-4"><h2 id="getting-started-heading" className="text-xl font-semibold tracking-tight">Getting started</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Three useful steps to prepare and manage your listing.</p></div>
          <div className="grid gap-3 md:grid-cols-3">
            {gettingStarted.map((step) => <article key={step.number} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><span className="text-xs font-semibold tracking-wider text-rose-600 dark:text-rose-400">{step.number}</span><h3 className="mt-3 text-base font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.text}</p></article>)}
          </div>
        </section>

        <section aria-labelledby="category-guides-heading" className="mb-12">
          <div className="mb-4"><h2 id="category-guides-heading" className="text-xl font-semibold tracking-tight">Prepare for your category</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The details customers need depend on what you are offering.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => <article key={category.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="flex items-center gap-3"><span className="text-2xl" aria-hidden="true">{category.emoji}</span><h3 className="text-base font-semibold">{category.title}</h3></div><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{category.text}</p></article>)}
          </div>
        </section>

        <section aria-labelledby="hosting-faq-heading" className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-7">
          <div className="mb-4 flex items-center gap-3"><ClipboardList className="h-5 w-5 text-rose-500" aria-hidden="true" /><div><h2 id="hosting-faq-heading" className="text-lg font-semibold">Common questions</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quick answers for getting started.</p></div></div>
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            <details className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">Can I still browse and book after choosing a provider category?<span className="text-lg font-normal text-slate-400 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Yes. Choosing a provider category adds the relevant listing tools to your account; browsing and booking remain available.</p></details>
            <details className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">Where can I get help with a LoopOut feature?<span className="text-lg font-normal text-slate-400 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Visit the <Link to="/help-center" className="font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400">Help Centre</Link> to browse support articles.</p></details>
            <details className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">How do I choose a different listing category?<span className="text-lg font-normal text-slate-400 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Open <Link to="/become" className="font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400">category selection</Link> to review the available options.</p></details>
          </div>
        </section>

        <p className="mt-5 flex items-start gap-2 px-1 text-xs leading-5 text-slate-500 dark:text-slate-400"><MessageSquareText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Listing requirements and available tools may differ by category. Use the listing flow and Help Centre for the latest account-specific guidance.</p>
      </div>
    </main>
  );
}
