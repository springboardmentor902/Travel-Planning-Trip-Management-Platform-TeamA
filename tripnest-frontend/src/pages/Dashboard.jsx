import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { tripAPI } from "../utils/api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // TRAVEL IMAGES
  // ============================================================
  const heroImage =
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=90";

  const defaultTripImage =
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85";

  const destinationImages = {
    Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",

    Manali:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=85",

    Rajasthan:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85",

    Kerala:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85",

    Ladakh:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",

    Agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",

    Shimla:
      "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=85",

    Varanasi:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=85",
  };

  // ============================================================
  // FETCH TRIPS
  // ============================================================
  useEffect(() => {
    tripAPI
      .getAll()
      .then((res) => setTrips(res.data))
      .catch((err) => console.error("Trips load failed:", err))
      .finally(() => setLoading(false));
  }, []);

  // ============================================================
  // FILTER TRIPS
  // ============================================================
  const upcoming = trips.filter(
    (trip) => trip.status === "UPCOMING" || trip.status === "PLANNING",
  );

  const ongoing = trips.filter((trip) => trip.status === "ONGOING");

  const completed = trips.filter((trip) => trip.status === "COMPLETED");

  // ============================================================
  // STATUS STYLES
  // ============================================================
  const getStatusStyle = (status) => {
    switch (status) {
      case "ONGOING":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "UPCOMING":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "PLANNING":
        return "bg-violet-50 text-violet-700 border-violet-200";

      case "COMPLETED":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // ============================================================
  // DESTINATION IMAGE
  // ============================================================
  const getTripImage = (destination) => {
    if (!destination) return defaultTripImage;

    const destinationName = destination.trim();

    const exactMatch = destinationImages[destinationName];

    if (exactMatch) return exactMatch;

    const matchingKey = Object.keys(destinationImages).find((key) =>
      destinationName.toLowerCase().includes(key.toLowerCase()),
    );

    return matchingKey ? destinationImages[matchingKey] : defaultTripImage;
  };

  const handleImageError = (e) => {
    if (e.currentTarget.src !== defaultTripImage) {
      e.currentTarget.src = defaultTripImage;
    }
  };

  // ============================================================
  // QUICK ACTIONS
  // ============================================================
  const quickActions = [
    {
      icon: "✈️",
      title: "My Trips",
      description: "View and manage your journeys",
      path: "/trips",
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      icon: "🌍",
      title: "Destinations",
      description: "Discover amazing places",
      path: "/destinations",
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      icon: "✨",
      title: "Create Trip",
      description: "Plan your next adventure",
      path: "/trips/create",
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      color: "text-violet-600",
    },
  ];

  // ============================================================
  // USER NAME
  // ============================================================
  const firstName = user?.name ? user.name.split(" ")[0] : "Traveler";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-14">
        {/* ======================================================
            HERO
        ====================================================== */}
        <section className="relative min-h-[430px] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-300/30 mb-10">
          {/* Hero Image */}
          <img
            src={heroImage}
            alt="Beautiful travel destination"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/10" />

          {/* Decorative blur */}
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex min-h-[430px] items-center px-6 py-12 sm:px-10 lg:px-14">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                YOUR TRAVEL DASHBOARD
              </div>

              {/* Heading */}
              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Welcome back,
                <span className="block bg-gradient-to-r from-blue-300 via-cyan-200 to-white bg-clip-text text-transparent">
                  {firstName}! 👋
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
                Your next adventure is just a few clicks away. Manage your
                trips, discover new destinations and keep your travel plans
                organized in one place.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/trips/create")}
                  className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50"
                >
                  <span>＋</span>
                  Create New Trip
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>

                <button
                  onClick={() => navigate("/destinations")}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
                >
                  🌍 Explore Destinations
                </button>
              </div>

              {/* Mini stats */}
              <div className="mt-8 flex flex-wrap gap-6 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <span className="text-base">🗺️</span>
                  <span>{trips.length} total trips</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base">📅</span>
                  <span>{upcoming.length} upcoming</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base">🌎</span>
                  <span>Travel smarter</span>
                </div>
              </div>
            </div>

            {/* Floating travel card */}
            <div className="absolute bottom-8 right-8 hidden w-64 overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl lg:block">
              <div className="relative h-36">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=85"
                  alt="Tropical beach"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-3 left-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Inspiration
                  </p>

                  <p className="mt-1 text-sm font-black text-white">
                    Somewhere beautiful
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-white/70">Where next?</span>

                <span className="text-lg">✈️</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            STATS
        ====================================================== */}
        <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Trips
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {loading ? "—" : trips.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">All your journeys</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl transition-transform group-hover:scale-110">
                ✈️
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Upcoming
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {loading ? "—" : upcoming.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">Trips ahead</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl transition-transform group-hover:scale-110">
                📅
              </div>
            </div>
          </div>

          {/* Ongoing */}
          <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ongoing
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {loading ? "—" : ongoing.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Currently travelling
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl transition-transform group-hover:scale-110">
                🧭
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {loading ? "—" : completed.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">Memories made</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl transition-transform group-hover:scale-110">
                ❤️
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              What do you want to do?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jump straight into your next travel task
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {quickActions.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Hover gradient */}
                <div
                  className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${item.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      {item.icon}
                    </div>

                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 ${item.color} transition-all group-hover:bg-slate-900 group-hover:text-white`}
                    >
                      ↗
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-black text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs font-black text-slate-700">
                    Open
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ======================================================
            RECENT TRIPS
        ====================================================== */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Your recent trips
              </h2>



              <p className="mt-1 text-sm text-slate-500">
                Continue planning your adventures
              </p>
            </div>

            {trips.length > 0 && (
              <button
                onClick={() => navigate("/trips")}
                className="rounded-xl px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
              >
                View all →
              </button>
            )}
          </div>

          {/* ====================================================
              LOADING
          ==================================================== */}
          {loading ? (
            <div className="grid gap-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex animate-pulse">
                    <div className="h-36 w-36 bg-slate-200 sm:h-40 sm:w-48" />

                    <div className="flex-1 p-5">
                      <div className="h-5 w-1/3 rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
                      <div className="mt-5 h-8 w-24 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            /* ==================================================
               EMPTY STATE
            ================================================== */
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />

              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-purple-100/50 blur-3xl" />

              <div className="relative z-10">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-100 text-5xl shadow-inner">
                  🗺️
                </div>

                <h3 className="mt-7 text-2xl font-black text-slate-900">
                  Your journey starts here
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                  You haven't created any trips yet. Pick a destination, create
                  your itinerary and start building your next adventure.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => navigate("/trips/create")}
                    className="rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-700"
                  >
                    + Create Your First Trip
                  </button>

                  <button
                    onClick={() => navigate("/destinations")}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Explore Destinations
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ==================================================
               TRIP CARDS
            ================================================== */
            <div className="grid gap-5">
              {trips.slice(0, 5).map((trip) => (
                <article
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-auto sm:w-56">
                      <img
                        src={getTripImage(trip.destination)}
                        alt={trip.destination || "Travel destination"}
                        loading="lazy"
                        onError={handleImageError}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                      {/* Destination */}
                      <div className="absolute bottom-4 left-4">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">
                          Destination
                        </p>

                        <p className="mt-1 text-base font-black text-white">
                          {trip.destination || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-lg font-black text-slate-900">
                                {trip.title || "Untitled Trip"}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-black tracking-wide ${getStatusStyle(
                                  trip.status,
                                )}`}
                              >
                                {trip.status}
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-slate-400">
                              Your travel itinerary
                            </p>
                          </div>

                          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all group-hover:bg-blue-600 group-hover:text-white sm:flex">
                            ↗
                          </span>
                        </div>

                        {/* Info */}
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Location
                            </p>

                            <p className="mt-1 truncate text-xs font-bold text-slate-700">
                              📍 {trip.destination || "—"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Duration
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-700">
                              🗓️ {trip.totalDays || "—"} days
                            </p>
                          </div>

                          <div className="hidden rounded-2xl bg-slate-50 p-3 sm:block">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Status
                            </p>

                            <p className="mt-1 truncate text-xs font-bold text-slate-700">
                              {trip.status || "PLANNING"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom */}
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Trip #{trip.id}
                        </span>

                        <span className="text-xs font-black text-blue-600 transition-transform group-hover:translate-x-1">
                          Open trip →
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>


        {/* ======================================================
            BOTTOM CTA
        ====================================================== */}
        {trips.length > 0 && (
          <section className="relative mt-12 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 shadow-2xl sm:px-10">
            {/* Decorative blobs */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wider text-blue-300">
                  ✈️ KEEP EXPLORING
                </div>

                <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Where will you go next?
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Discover a new destination and turn your travel idea into your
                  next unforgettable trip.
                </p>
              </div>

              <button
                onClick={() => navigate("/destinations")}
                className="group flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50"
              >
                Explore Destinations
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
