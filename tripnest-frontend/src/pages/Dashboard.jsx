import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { tripAPI, dashboardAPI } from "../utils/api";
import PendingInvitations from "../components/PendingInvitations";
import {
  PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#06b6d4",
];

const STATUS_BADGE = {
  PLANNING:  "bg-violet-100 text-violet-700",
  UPCOMING:  "bg-blue-100 text-blue-700",
  ONGOING:   "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-600",
};

const CAT_EMOJI = {
  TRANSPORTATION: "🚗",
  HOTEL:          "🏨",
  FOOD:           "🍽️",
  SHOPPING:       "🛍️",
  ENTERTAINMENT:  "🎭",
  MISCELLANEOUS:  "📦",
};

const destinationImages = {
  Goa:       "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
  Manali:    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=85",
  Rajasthan: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85",
  Kerala:    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85",
  Ladakh:    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  Agra:      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
  Shimla:    "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=85",
  Varanasi:  "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=85",
  Pune:      "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=85",
  Delhi:     "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=85",
  Mumbai:    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=85",
  Jaipur:    "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=85",
  Singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=85",
  Dubai:     "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
  Bali:      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
  London:    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
  Paris:     "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
  Udaipur:   "https://images.unsplash.com/photo-1591797256225-7c7e0e8a3b4c?auto=format&fit=crop&w=1200&q=85",
};

const defaultTripImage =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85";

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse rounded-xl ${className}`} />
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg">
      {label && <p className="text-xs text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || "#3b82f6" }}>
          {p.name}: ₹{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const getTripImage = (destination) => {
  if (!destination) return defaultTripImage;
  const name = destination.trim();
  if (destinationImages[name]) return destinationImages[name];
  const key = Object.keys(destinationImages).find(
    (k) =>
      name.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(name.toLowerCase())
  );
  return key ? destinationImages[key] : defaultTripImage;
};

const getStatusStyle = (status) => {
  switch (status) {
    case "ONGOING":   return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "UPCOMING":  return "border-blue-200 bg-blue-50 text-blue-700";
    case "PLANNING":  return "border-violet-200 bg-violet-50 text-violet-700";
    case "COMPLETED": return "border-slate-200 bg-slate-100 text-slate-600";
    default:          return "border-slate-200 bg-slate-100 text-slate-600";
  }
};

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

const Dashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  // trips (for hero cards)
  const [trips,        setTrips]        = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  // analytics
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const heroImage =
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=85";

  useEffect(() => {
    let active = true;

    // fetch trips
    (async () => {
      try {
        const res  = await tripAPI.getAll();
        const raw  = res?.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.trips)
            ? raw.trips
            : Array.isArray(raw?.content)
              ? raw.content
              : [];
        if (active) setTrips(list);
      } catch { /* ignore */ }
      finally   { if (active) setTripsLoading(false); }
    })();

    // fetch analytics
    (async () => {
      try {
        const res = await dashboardAPI.getTravelerDashboard();
        if (active) setData(res.data);
      } catch { /* ignore */ }
      finally   { if (active) setLoading(false); }
    })();

    return () => { active = false; };
  }, []);

  // derived
  const upcoming  = trips.filter((t) => t.status === "UPCOMING" || t.status === "PLANNING");
  const ongoing   = trips.filter((t) => t.status === "ONGOING");
  const completed = trips.filter((t) => t.status === "COMPLETED");
  const getTripId = (t)  => t.id ?? t._id;
  const openTrip  = (t)  => { const id = getTripId(t); if (id != null) navigate(`/trips/${id}`); };

  const expPieData = data
    ? Object.entries(data.expensesByCategory || {})
             .filter(([, v]) => v > 0)
             .map(([name, value]) => ({ name, value }))
    : [];

  const monthlySpendData = data
    ? Object.entries(data.monthlySpending || {})
             .map(([month, amount]) => ({ month, amount }))
    : [];

  const firstName = user?.name ? user.name.split(" ")[0] : "Traveler";

  // ── Loading state ──────────────────────
  if (tripsLoading && loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-[400px] rounded-3xl mb-10" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </main>
    </div>
  );

  // ── Main render ────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-8">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="relative mb-10 min-h-[400px] overflow-hidden rounded-[2rem] shadow-xl shadow-slate-300/30 sm:min-h-[430px]">
          <img
            src={heroImage}
            alt="Travel"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-900/10" />
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative z-10 flex min-h-[400px] items-center px-6 py-12 sm:min-h-[430px] sm:px-10 lg:px-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                YOUR TRAVEL DASHBOARD
              </div>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Welcome back,
                <span className="block bg-gradient-to-r from-blue-300 via-cyan-200 to-white bg-clip-text text-transparent">
                  {firstName}! 👋
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
                Your next adventure is just a few clicks away. Manage your trips,
                discover new destinations and keep your travel plans organized in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/trips/create")}
                  className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:-translate-y-1 hover:bg-blue-50"
                >
                  ＋ Create New Trip
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button
                  onClick={() => navigate("/destinations")}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  🌍 Explore Destinations
                </button>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-xs text-white/80 sm:gap-6">
                <span>🗺️ {trips.length} total trips</span>
                <span>📅 {upcoming.length} upcoming</span>
                <span>🌎 Travel smarter</span>
              </div>
            </div>

            {/* Inspiration card */}
            <div className="absolute bottom-8 right-8 hidden w-60 overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl lg:block xl:w-64">
              <div className="relative h-36">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=85"
                  alt="Beach"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Inspiration</p>
                  <p className="mt-1 text-sm font-bold text-white">Somewhere beautiful</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-white/80">Where next?</span>
                <span className="text-lg">✈️</span>
              </div>
            </div>
          </div>
        </section>

        {/* PENDING INVITATIONS */}
        <section className="mb-8">
          <PendingInvitations />
        </section>

        {/* ══════════════════════════════════════
            STATS (trip counts)
        ══════════════════════════════════════ */}
        <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Trips",  value: trips.length,      description: "All your journeys",       icon: "✈️",  iconBg: "bg-blue-50"   },
            { label: "Upcoming",     value: upcoming.length,   description: "Trips ahead",             icon: "📅",  iconBg: "bg-amber-50"  },
            { label: "Ongoing",      value: ongoing.length,    description: "Currently travelling",    icon: "🧭",  iconBg: "bg-emerald-50"},
            { label: "Completed",    value: completed.length,  description: "Memories made",           icon: "❤️",  iconBg: "bg-violet-50" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {tripsLoading ? "—" : stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{stat.description}</p>
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg} text-xl transition-transform group-hover:scale-110`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ══════════════════════════════════════
            QUICK ACTIONS
        ══════════════════════════════════════ */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">What do you want to do?</h2>
            <p className="mt-1 text-sm text-slate-500">Jump straight into your next travel task</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { icon: "✈️", title: "My Trips",       description: "View and manage your journeys",  path: "/trips",         gradient: "from-blue-500 to-indigo-600",   bg: "bg-blue-50",    color: "text-blue-600"   },
              { icon: "🌍", title: "Destinations",   description: "Discover amazing places",         path: "/destinations",  gradient: "from-emerald-500 to-teal-600",  bg: "bg-emerald-50", color: "text-emerald-600" },
              { icon: "✨", title: "Create Trip",    description: "Plan your next adventure",        path: "/trips/create",  gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50",  color: "text-violet-600"  },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${item.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} text-2xl transition-transform duration-300 group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 ${item.color} transition group-hover:bg-slate-900 group-hover:text-white`}>↗</span>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-700">
                    Open <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            RECENT TRIPS (hero cards)
        ══════════════════════════════════════ */}
        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Your recent trips</h2>
              <p className="mt-1 text-sm text-slate-500">Continue planning your adventures</p>
            </div>
            {trips.length > 0 && (
              <button
                onClick={() => navigate("/trips")}
                className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                View all →
              </button>
            )}
          </div>

          {tripsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-48 animate-pulse bg-slate-200 sm:h-56" />
                  <div className="animate-pulse space-y-4 p-5">
                    <div className="h-5 w-2/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 rounded-xl bg-slate-200" />
                      <div className="h-16 rounded-xl bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:py-16">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-purple-100/60 blur-3xl" />
              <div className="relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 text-4xl">🗺️</div>
                <h3 className="mt-6 text-2xl font-black text-slate-900">Your journey starts here</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                  You haven't created any trips yet. Pick a destination, create your itinerary and start planning.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <button onClick={() => navigate("/trips/create")} className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
                    + Create Your First Trip
                  </button>
                  <button onClick={() => navigate("/destinations")} className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                    Explore Destinations
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {trips.slice(0, 6).map((trip) => {
                const tripId = getTripId(trip);
                const status = trip.status || "PLANNING";
                return (
                  <article
                    key={tripId ?? `${trip.title}-${trip.destination}`}
                    onClick={() => openTrip(trip)}
                    role="link"
                    tabIndex={tripId != null ? 0 : -1}
                    className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="relative h-48 overflow-hidden sm:h-56">
                      <img
                        src={getTripImage(trip.destination)}
                        alt={trip.destination || "Travel"}
                        loading="lazy"
                        onError={(e) => { if (!e.currentTarget.dataset.fallbackApplied) { e.currentTarget.dataset.fallbackApplied = "true"; e.currentTarget.src = defaultTripImage; }}}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                      <div className="absolute bottom-4 left-5 right-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">Destination</p>
                        <h3 className="mt-1 truncate text-2xl font-extrabold text-white">{trip.destination || "Destination not set"}</h3>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">{trip.title || "Untitled Trip"}</h4>
                          <p className="mt-1 text-sm text-slate-500">Your travel itinerary</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold ${getStatusStyle(status)}`}>
                          {status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="min-w-0 rounded-2xl bg-slate-50 p-3.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">📍 Location</p>
                          <p className="mt-2 truncate text-sm font-semibold text-slate-700">{trip.destination || "Not specified"}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">🗓️ Duration</p>
                          <p className="mt-2 text-sm font-semibold text-slate-700">{trip.totalDays ?? "—"} days</p>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <span className="truncate text-xs font-medium text-slate-400">Trip #{tripId ?? "—"}</span>
                        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-blue-600 transition-all group-hover:gap-3">
                          Open trip <span>→</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════
            TRAVELER ANALYTICS SECTION
            (shown only when analytics data is available)
        ══════════════════════════════════════ */}
        {!loading && data && (
          <>
            {/* ── Budget Overview ── */}
            <section className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">
                Traveler Analytics 📊
              </h2>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Budget Overview 🎯</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Total Budget", value: `₹${(data.totalBudget || 0).toLocaleString()}`,   color: "text-slate-800" },
                    { label: "Spent",        value: `₹${(data.totalSpent || 0).toLocaleString()}`,    color: "text-red-600"   },
                    { label: "Remaining",    value: `₹${(data.totalRemaining || 0).toLocaleString()}`,color: "text-green-600" },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className={`text-lg font-bold mt-1 ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      (data.spentPercentage || 0) >= 90 ? "bg-red-500"
                      : (data.spentPercentage || 0) >= 70 ? "bg-yellow-500"
                      : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(data.spentPercentage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {data.spentPercentage || 0}% of total budget used
                </p>
              </div>
            </section>

            {/* ── Charts Row ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Spending Pie */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Spending by Category 💰</h3>
                {expPieData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie data={expPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {expPieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {expPieData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-xs text-slate-600">{CAT_EMOJI[item.name] || "📦"} {item.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-800">₹{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400">
                    <div className="text-center"><div className="text-3xl mb-2">💰</div><p className="text-sm">No expenses yet</p></div>
                  </div>
                )}
              </div>

              {/* Monthly Spending */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Monthly Spending 📈</h3>
                {monthlySpendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlySpendData}>
                      <defs>
                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} fill="url(#spendGrad)" name="Spending" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No spending data yet</div>
                )}
              </div>
            </section>

            {/* ── Bottom Row: Recent Expenses + Destinations ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

              {/* Recent Expenses */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Recent Expenses 🧾</h3>
                {!data.recentExpenses?.length ? (
                  <div className="text-center py-6 text-slate-400 text-sm">No expenses yet</div>
                ) : (
                  <div className="space-y-3">
                    {data.recentExpenses.map((exp, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{CAT_EMOJI[exp.category] || "📦"}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{exp.description}</p>
                            <p className="text-xs text-slate-400">{exp.category} • {exp.date}</p>
                          </div>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">₹{exp.amount?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Favorite Destinations + Quick Stats */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Favorite Destinations 🌍</h3>
                  {!data.favoriteDestinations?.length ? (
                    <p className="text-sm text-slate-400 text-center py-4">No destinations yet</p>
                  ) : (
                    <div className="space-y-2">
                      {data.favoriteDestinations.map((dest, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📍</span>
                            <span className="text-sm font-medium text-slate-700">{dest.destination}</span>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {dest.tripCount} trip{dest.tripCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { emoji: "🗓️", label: "Activities", value: data.totalActivities || 0 },
                    { emoji: "👥", label: "Groups",     value: data.totalGroups      || 0 },
                    { emoji: "📂", label: "Documents",  value: data.totalDocuments   || 0 },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xl font-bold text-slate-900">{item.value}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ══════════════════════════════════════
            BOTTOM CTA
        ══════════════════════════════════════ */}
        {!tripsLoading && trips.length > 0 && (
          <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 shadow-xl sm:px-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wider text-blue-300">
                  ✈️ KEEP EXPLORING
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Where will you go next?</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Discover a new destination and turn your travel idea into your next unforgettable trip.
                </p>
              </div>
              <button
                onClick={() => navigate("/destinations")}
                className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Explore Destinations
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
