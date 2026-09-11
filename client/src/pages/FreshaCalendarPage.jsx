import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "../components/ImageWithFallback";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import {
  CalendarIcon,
  FaceSmileIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  HomeIcon,
  TicketIcon,
  CheckCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

// ─────────────────────────────────────────────
// Booking type → colour mapping  (loopOut brand)
// ─────────────────────────────────────────────
const TYPE_META = {
  listing: {
    label: "Stay",
    bgClass: "bg-[#fde8d8] text-[#9a3412] border-l-4 border-[#ea580c]",
    icon: HomeIcon,
    dot: "bg-orange-400",
  },
  helper: {
    label: "Helper",
    bgClass: "bg-[#dbeafe] text-[#1e40af] border-l-4 border-[#3b82f6]",
    icon: UserIcon,
    dot: "bg-blue-400",
  },
  service: {
    label: "Service",
    bgClass: "bg-[#ede9fe] text-[#6d28d9] border-l-4 border-[#7c3aed]",
    icon: BriefcaseIcon,
    dot: "bg-violet-400",
  },
  event: {
    label: "Event",
    bgClass: "bg-[#dcfce7] text-[#166534] border-l-4 border-[#16a34a]",
    icon: TicketIcon,
    dot: "bg-emerald-400",
  },
};

function getBookingType(b) {
  if (b.helper) return "helper";
  if (b.service) return "service";
  if (b.event) return "event";
  return "listing";
}

function getBookingItem(b) {
  return b.helper || b.service || b.event || b.listing || null;
}

function getBookingTitle(b) {
  const item = getBookingItem(b);
  if (!item) return "Booking";
  return item.name || item.eventName || item.title || "Booking";
}

function getBookingAddress(b) {
  const item = getBookingItem(b);
  if (!item) return "";
  return item.address || item.location || item.venue || "";
}

function getBookingProvider(b) {
  const item = getBookingItem(b);
  if (!item) return null;
  return item.userRef || item.createdBy || null;
}

function getBookingDetailPath(booking) {
  const item = getBookingItem(booking);
  if (!item?._id) return "/upcoming-bookings";

  switch (getBookingType(booking)) {
    case "helper": return `/helper/${item._id}`;
    case "service": return `/service/${item._id}`;
    case "event": return `/event/${item._id}`;
    default: return `/listing/${item._id}`;
  }
}

// Convert a booking's startDate to grid minutes (from 7 AM = 420 min)
function toGridMinutes(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.getHours() * 60 + d.getMinutes();
}

// Format time for display: "09:30"
function fmtTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Duration in minutes between two dates, defaulting to 60
function durationMins(startStr, endStr) {
  if (!startStr || !endStr) return 60;
  const diff = new Date(endStr) - new Date(startStr);
  return Math.max(30, Math.round(diff / 60000));
}

// Hours grid  07:00 – 18:00
const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 7;
  return {
    label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "pm" : "am"}`,
    minutes: h * 60,
  };
});
const START_GRID_MINUTES = 7 * 60; // 7 AM
const HOUR_HEIGHT = 100; // px per 60 min

// Status badge colour
const STATUS_COLOR = {
  confirmed: "bg-emerald-100 text-emerald-800",
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-rose-100 text-rose-800",
  declined: "bg-rose-100 text-rose-800",
  completed: "bg-blue-100 text-blue-800",
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function FreshaCalendarPage() {
  const { currentUser } = useSelector((s) => s.user);
  const navigate = useNavigate();

  // ── State ──
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("Day");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showMobilePreview, setShowMobilePreview] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Fetch real loopOut bookings ──
  useEffect(() => {
    if (!currentUser?._id) { setLoading(false); return; }
    const controller = new AbortController();

    const loadBookings = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await authenticatedFetch(`/api/bookings/user/${currentUser._id}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403 ? "Your session has expired." : "We couldn't load your bookings.");
        }

        const data = await response.json();
        if (!controller.signal.aborted) setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setBookings([]);
          setLoadError(error.message || "We couldn't load your bookings.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadBookings();
    return () => controller.abort();
  }, [currentUser?._id, refreshKey]);

  // ── Bookings on selected day ──
  const dayBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.startDate) return false;
      if (["cancelled", "declined"].includes(b.status)) return false;
      return new Date(b.startDate).toDateString() === selectedDate.toDateString();
    });
  }, [bookings, selectedDate]);

  // ── Unique service-providers / "staff columns" for the day ──
  // Each distinct booking type on the day becomes a column
  const typeColumns = useMemo(() => {
    const seen = new Set();
    const cols = [];
    dayBookings.forEach((b) => {
      const t = getBookingType(b);
      if (!seen.has(t)) { seen.add(t); cols.push(t); }
    });
    // Ensure at least one column
    if (cols.length === 0) cols.push("helper", "service", "listing", "event");
    return cols;
  }, [dayBookings]);

  // ── Stats ──
  const activeCount = bookings.filter((b) =>
    !["cancelled", "declined", "completed"].includes(b.status)
  ).length;
  const upcomingCount = bookings.filter(
    (b) => new Date(b.startDate) > new Date() && b.status !== "cancelled"
  ).length;

  // ── Date helpers ──
  const formattedDate = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[selectedDate.getDay()]} ${selectedDate.getDate()} ${months[selectedDate.getMonth()]}`;
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d);
  };
  const handleNextDay = () => {
    const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d);
  };
  const handleToday = () => setSelectedDate(new Date());

  // ── Not logged in ──
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <CalendarIcon className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">
          <span className="text-rose-500">loop</span>Out Calendar
        </h1>
        <p className="text-white/40 text-sm mb-8">Sign in to see your bookings on the schedule.</p>
        <button
          onClick={() => navigate("/sign-in")}
          className="px-8 py-3 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col overflow-x-hidden">

      {/* ── Top banner ── */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-black">
            <span className="text-rose-500">loop</span>
            <span className="text-orange-400">Out</span>
            <span className="text-white/50 font-medium ml-2">Schedule &amp; Bookings</span>
          </span>
        </div>
        <button
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className={`hidden xl:flex px-3 py-1 rounded-lg font-semibold text-xs transition items-center gap-1.5 border ${
            showMobilePreview
              ? "bg-rose-600 border-rose-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300"
          }`}
        >
          <DevicePhoneMobileIcon className="w-4 h-4" />
          {showMobilePreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Calendar main panel ── */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-2xl">

          {/* ── Top toolbar ── */}
          <header className="min-h-16 border-b border-slate-200 px-4 py-2 sm:px-6 flex flex-wrap items-center justify-between bg-white z-10 shrink-0 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleToday} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition shadow-sm">
                Today
              </button>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                <button onClick={handlePrevDay} className="p-1.5 hover:bg-slate-100 text-slate-600 transition">
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button onClick={handleNextDay} className="p-1.5 hover:bg-slate-100 text-slate-600 transition border-l border-slate-200">
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
              <span className="font-bold text-sm text-slate-800">{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Stats pills */}
              <div className="hidden md:flex items-center gap-2">
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold text-[11px] rounded-full border border-rose-200">
                  {activeCount} Active
                </span>
                <span className="px-2.5 py-1 bg-violet-50 text-violet-700 font-bold text-[11px] rounded-full border border-violet-200">
                  {upcomingCount} Upcoming
                </span>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                title="Open dashboard"
                aria-label="Open dashboard"
              >
                <Squares2X2Icon className="h-4 w-4" />
                <span className="hidden md:inline text-xs font-semibold">Dashboard</span>
              </button>

              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Refresh"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin text-rose-500" : ""}`} />
              </button>

              {/* View selector */}
              <div className="hidden sm:block relative">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-sm"
                >
                  <option>Day</option>
                  <option>Week</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▼</div>
              </div>

              {/* Navigate to bookings */}
              <button
                onClick={() => navigate("/upcoming-bookings")}
                className="bg-slate-900 hover:bg-black text-white font-semibold text-xs px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition active:scale-95"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Book</span>
              </button>
            </div>
          </header>

          {/* ── Calendar grid ── */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-auto">
            {loading ? (
              <div className="flex-1 flex items-center justify-center flex-col gap-4">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm font-semibold">Loading your bookings…</p>
              </div>
            ) : loadError ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-sm text-center">
                  <p className="font-bold text-slate-800">Bookings are unavailable</p>
                  <p className="mt-1 text-sm text-slate-500" role="alert">{loadError}</p>
                  <button
                    onClick={() => setRefreshKey((key) => key + 1)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                  >
                    <ArrowPathIcon className="w-4 h-4" /> Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Compact agenda for phones. The time grid below needs a wider viewport. */}
                <div className="lg:hidden p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{dayBookings.length} booking{dayBookings.length === 1 ? "" : "s"} on this day</p>
                  {dayBookings.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm font-medium text-slate-500">
                      No bookings on {formattedDate}
                    </div>
                  ) : dayBookings.map((booking) => {
                    const meta = TYPE_META[getBookingType(booking)];
                    return (
                      <button
                        key={booking._id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`w-full rounded-lg p-4 text-left shadow-sm transition active:scale-[0.99] ${meta?.bgClass}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold opacity-80">{fmtTime(booking.startDate)}{booking.endDate ? ` - ${fmtTime(booking.endDate)}` : ""}</p>
                            <p className="mt-1 truncate text-sm font-extrabold">{getBookingTitle(booking)}</p>
                            {getBookingAddress(booking) && <p className="mt-1 truncate text-xs opacity-75">{getBookingAddress(booking)}</p>}
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${STATUS_COLOR[booking.status] || "bg-slate-100 text-slate-600"}`}>{booking.status}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ── Desktop time-grid ── */}
                <div className="hidden lg:flex lg:flex-col">
                <div className="sticky top-0 bg-white z-10 border-b border-slate-200 flex min-w-[600px] shadow-sm">
                  <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200 bg-slate-50/70 p-2 flex items-center justify-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Time
                  </div>
                  <div className="flex-1 grid grid-flow-col auto-cols-fr">
                    {typeColumns.map((type) => {
                      const meta = TYPE_META[type];
                      const Icon = meta?.icon || CalendarIcon;
                      const count = dayBookings.filter((b) => getBookingType(b) === type).length;
                      return (
                        <div key={type} className="p-3 border-r border-slate-200 flex flex-col items-center justify-center gap-1.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
                            type === "listing" ? "bg-orange-500"
                            : type === "helper" ? "bg-blue-500"
                            : type === "service" ? "bg-violet-600"
                            : "bg-emerald-600"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-xs text-slate-700 capitalize">{meta?.label || type}</span>
                          {count > 0 && (
                            <span className="text-[10px] font-black text-slate-400">{count} booking{count !== 1 ? "s" : ""}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Time grid ── */}
                <div className="flex min-w-[600px] min-h-[880px] relative">
                  {/* Time axis */}
                  <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col">
                    {HOURS.map((h) => (
                      <div
                        key={h.label}
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        className="border-b border-slate-100 px-2 pt-2 text-right text-[11px] font-medium text-slate-400 select-none"
                      >
                        {h.label}
                      </div>
                    ))}
                  </div>

                  {/* Booking columns */}
                  <div className="flex-1 grid grid-flow-col auto-cols-fr relative bg-white">
                    {/* Grid lines */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col">
                      {HOURS.map((h) => (
                        <div key={h.label} style={{ height: `${HOUR_HEIGHT}px` }} className="border-b border-slate-100 relative">
                          <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-100" />
                        </div>
                      ))}
                    </div>

                    {typeColumns.map((type) => {
                      const colBookings = dayBookings.filter((b) => getBookingType(b) === type);
                      const meta = TYPE_META[type];

                      return (
                        <div key={type} className="border-r border-slate-200 relative h-full">
                          {/* Clickable hour slots */}
                          {HOURS.map((h) => (
                            <div
                              key={h.minutes}
                              style={{ height: `${HOUR_HEIGHT}px` }}
                              onClick={() => navigate("/categories")}
                              className="hover:bg-rose-50/40 cursor-pointer transition group/slot flex items-center justify-center"
                            >
                              <span className="opacity-0 group-hover/slot:opacity-100 text-rose-400 text-xs font-semibold flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow border border-rose-200">
                                <PlusIcon className="w-3 h-3" /> Book
                              </span>
                            </div>
                          ))}

                          {/* Booking cards */}
                          {colBookings.map((booking) => {
                            const startMins = toGridMinutes(booking.startDate);
                            const dur = booking.endDate
                              ? durationMins(booking.startDate, booking.endDate)
                              : 60;

                            if (startMins === null) return null;

                            const topPx = ((startMins - START_GRID_MINUTES) / 60) * HOUR_HEIGHT;
                            const heightPx = (dur / 60) * HOUR_HEIGHT;
                            const title = getBookingTitle(booking);
                            const address = getBookingAddress(booking);
                            const status = STATUS_COLOR[booking.status] || "bg-slate-100 text-slate-600";

                            return (
                              <motion.div
                                key={booking._id}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                                style={{
                                  top: `${Math.max(0, topPx) + 2}px`,
                                  height: `${Math.max(40, heightPx - 4)}px`,
                                  left: "4px",
                                  right: "4px",
                                }}
                                className={`absolute rounded-xl p-2.5 shadow-md hover:shadow-lg transition cursor-pointer flex flex-col overflow-hidden z-10 ${meta?.bgClass}`}
                              >
                                <div className="text-[11px] font-bold opacity-90 mb-0.5">
                                  {fmtTime(booking.startDate)}{booking.endDate ? ` – ${fmtTime(booking.endDate)}` : ""}
                                </div>
                                <div className="font-extrabold text-xs sm:text-sm leading-snug truncate">{title}</div>
                                {address && <div className="text-[10px] opacity-75 truncate mt-0.5">{address}</div>}
                                <div className={`mt-auto self-start text-[9px] font-black px-1.5 py-0.5 rounded-full ${status}`}>
                                  {booking.status}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Empty state */}
                {dayBookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
                    <CalendarDaysIcon className="w-14 h-14 opacity-30" />
                    <p className="font-semibold text-sm">No bookings on {formattedDate}</p>
                    <button
                      onClick={() => navigate("/categories")}
                      className="px-6 py-2.5 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition shadow"
                    >
                      Browse Services &amp; Book
                    </button>
                  </div>
                )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Mobile preview panel ── */}
        {showMobilePreview && (
          <aside className="hidden xl:flex w-80 bg-slate-900 border-l border-slate-800 flex-col p-4 z-20 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between text-slate-200 mb-4 pb-2 border-b border-slate-800">
              <span className="font-bold text-sm flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-4 h-4 text-rose-400" />
                Mobile Preview
              </span>
              <button onClick={() => setShowMobilePreview(false)} className="text-slate-400 hover:text-white transition">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Phone shell */}
            <div className="bg-slate-950 rounded-[32px] p-2.5 shadow-2xl border-4 border-slate-800 max-w-xs mx-auto w-full overflow-hidden">
              {/* Notch */}
              <div className="w-20 h-4 bg-slate-900 rounded-b-xl mx-auto mb-2" />

              {/* Screen header */}
              <div className="bg-white rounded-t-2xl px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-black text-slate-900 text-xs">
                  <span className="text-rose-500">loop</span>Out
                </span>
                <div className="font-bold text-xs text-slate-600 flex items-center gap-1">
                  {selectedDate.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <BellIcon className="w-4 h-4" />
                  {currentUser?.avatar && (
                    <ImageWithFallback src={currentUser.avatar} type="avatar" alt="User" className="w-5 h-5 rounded-full" />
                  )}
                </div>
              </div>

              {/* User card */}
              <div className="bg-white px-3 py-2 border-b border-slate-100 flex items-center gap-2">
                {currentUser?.avatar && (
                  <ImageWithFallback src={currentUser.avatar} type="avatar" alt="User" className="w-8 h-8 rounded-full border-2 border-rose-500" />
                )}
                <div>
                  <div className="font-black text-xs text-slate-800 leading-tight">{currentUser?.username}</div>
                  <div className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">loopOut Member</div>
                </div>
              </div>

              {/* Booking list */}
              <div className="bg-white p-2.5 min-h-[360px] flex flex-col gap-2 text-xs">
                {loading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {!loading && dayBookings.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 py-6">
                    <CalendarIcon className="w-8 h-8 opacity-40" />
                    <p className="text-[10px] font-semibold text-center">No bookings today</p>
                    <button
                      onClick={() => navigate("/categories")}
                      className="mt-1 px-3 py-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-lg"
                    >
                      Browse &amp; Book
                    </button>
                  </div>
                )}

                {!loading && dayBookings.slice(0, 5).map((b) => {
                  const type = getBookingType(b);
                  const meta = TYPE_META[type];
                  return (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className={`${meta?.bgClass} p-2.5 rounded-xl shadow-sm cursor-pointer active:scale-95 transition`}
                    >
                      <div className="text-[10px] font-bold opacity-80">{fmtTime(b.startDate)}{b.endDate ? ` – ${fmtTime(b.endDate)}` : ""}</div>
                      <div className="font-extrabold text-xs truncate">{getBookingTitle(b)}</div>
                      <div className="text-[10px] opacity-70 truncate">{getBookingAddress(b)}</div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile bottom nav */}
              <div className="bg-white rounded-b-2xl border-t border-slate-100 px-3 py-2 flex items-center justify-around text-slate-500">
                <CalendarIcon className="w-5 h-5 text-rose-500" />
                <CurrencyDollarIcon className="w-5 h-5" />
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-base shadow-md">+</div>
                <FaceSmileIcon className="w-5 h-5" />
                <Squares2X2Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Mini stats */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Total Bookings", value: bookings.length, color: "text-white" },
                { label: "Active", value: activeCount, color: "text-rose-400" },
                { label: "Upcoming", value: upcomingCount, color: "text-violet-400" },
                { label: "Today", value: dayBookings.length, color: "text-emerald-400" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                  <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* ── Booking Detail Modal ── */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 ${STATUS_COLOR[selectedBooking.status] || "bg-slate-100 text-slate-600"}`}>
                    {selectedBooking.status}
                  </div>
                  <h3 className="font-black text-lg text-slate-900 leading-tight">{getBookingTitle(selectedBooking)}</h3>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Details */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm border border-slate-200 mb-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <ClockIcon className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold">
                    {new Date(selectedBooking.startDate).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    {selectedBooking.endDate && ` → ${new Date(selectedBooking.endDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`}
                  </span>
                </div>

                {getBookingAddress(selectedBooking) && (
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPinIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{getBookingAddress(selectedBooking)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-700">
                  <BriefcaseIcon className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-medium capitalize">{TYPE_META[getBookingType(selectedBooking)]?.label} Booking</span>
                </div>

                {selectedBooking.totalPrice != null && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <CurrencyDollarIcon className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-black text-slate-900">R{Number(selectedBooking.totalPrice).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigate(getBookingDetailPath(selectedBooking));
                    setSelectedBooking(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-black transition"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" /> View Details
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
