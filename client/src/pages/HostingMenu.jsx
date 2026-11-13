import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, ArrowRight, BookOpen, CircleHelp, Globe2, Home, ListPlus,
  Settings2, Share2, UserRoundPlus,
} from 'lucide-react';

const MENU_LINKS = [
  { title: 'Account settings', description: 'Update your profile and account preferences.', to: '/settings', icon: Settings2 },
  { title: 'Languages & currency', description: 'Choose your preferred language and currency.', to: '/settings?tab=customize', icon: Globe2 },
  { title: 'Hosting resources', description: 'Read practical guidance for listing and hosting.', to: '/hosting-resources', icon: BookOpen },
  { title: 'Get help', description: 'Visit the LoopOut help centre.', to: '/help-center', icon: CircleHelp },
];

function MenuLink({ item }) {
  const Icon = item.icon;
  return (
    <Link to={item.to} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-rose-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-rose-900 sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 dark:bg-gray-800 dark:text-slate-200"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900 dark:text-white">{item.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</span></span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" aria-hidden="true" />
    </Link>
  );
}

export default function HostingMenu() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [inviteMessage, setInviteMessage] = useState('');
  const listingPath = currentUser?._id ? `/${currentUser._id}/create-listing` : '/sign-in';

  const shareHostInvite = async () => {
    const invite = { title: 'Join LoopOut', text: 'List your property, services, food business, or items on LoopOut.', url: window.location.origin };
    try {
      if (navigator.share) {
        await navigator.share(invite);
        setInviteMessage('LoopOut invitation shared.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(invite.url);
        setInviteMessage('LoopOut link copied. You can send it to your host.');
      } else {
        setInviteMessage('Sharing is not available in this browser. Copy the LoopOut address from the address bar.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') setInviteMessage('Could not share the link. Try copying LoopOut’s address from the browser.');
    }
  };

  return (
    <main className="app-safe-top min-h-screen bg-[#f7f7f7] pb-36 text-slate-900 dark:bg-gray-950 dark:text-white md:pb-20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <button type="button" onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/host-dashboard')} className="mb-7 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-gray-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </button>

        <section className="mb-8 flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">LoopOut hosting</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your hosting menu</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{currentUser?.username ? `Welcome, ${currentUser.username}.` : 'Welcome.'} Manage your account, find guidance, or start a new listing.</p>
          </div>
          <Link to="/become" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">Get started <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </section>

        <section aria-labelledby="hosting-menu-heading" className="mb-8">
          <div className="mb-4"><h2 id="hosting-menu-heading" className="text-lg font-semibold">Manage your account</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Settings, tools and support for your LoopOut account.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">{MENU_LINKS.map((item) => <MenuLink key={item.title} item={item} />)}</div>
        </section>

        <section aria-labelledby="hosting-actions-heading">
          <div className="mb-4"><h2 id="hosting-actions-heading" className="text-lg font-semibold">Hosting actions</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tools to grow your presence on LoopOut.</p></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link to={listingPath} className="group flex min-h-32 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-rose-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-rose-900"><ListPlus className="h-5 w-5 text-rose-500" aria-hidden="true" /><span><span className="block text-sm font-semibold">Create a new listing</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">Add a property, service, helper listing, event or item.</span></span></Link>
            <div className="flex min-h-32 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><UserRoundPlus className="h-5 w-5 text-slate-500" aria-hidden="true" /><span><span className="block text-sm font-semibold">Find a co-host</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">Co-host matching is not available yet.</span></span><span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-gray-800 dark:text-slate-300">Coming soon</span></div>
            <button type="button" onClick={shareHostInvite} className="flex min-h-32 flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-rose-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-rose-900"><Share2 className="h-5 w-5 text-slate-500" aria-hidden="true" /><span><span className="block text-sm font-semibold">Refer a host</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">Share LoopOut with someone who may want to list.</span></span></button>
          </div>
          {inviteMessage && <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">{inviteMessage}</p>}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="flex items-start gap-3"><Home className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" /><div><h2 className="text-sm font-semibold">New to LoopOut hosting?</h2><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Explore practical tips and guidance to help you prepare your first listing.</p><Link to="/hosting-resources" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400">Explore hosting resources <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
        </section>
      </div>
    </main>
  );
}
