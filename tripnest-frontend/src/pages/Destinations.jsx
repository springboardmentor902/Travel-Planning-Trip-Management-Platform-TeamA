import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { destinationAPI } from "../utils/api";

const Destinations = () => {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ============================================================
  // DESTINATION IMAGES
  // ============================================================
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

  const fallbackImage =
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85";

  // ============================================================
  // FETCH DESTINATIONS
  // ============================================================
  useEffect(() => {
    fetchDestinations();
  }, []);

  // ============================================================
  // SEARCH FILTER
  // ============================================================
  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFiltered(destinations);
      return;
    }

    setFiltered(
      destinations.filter(
        (destination) =>
          destination.name?.toLowerCase().includes(query) ||
          destination.country?.toLowerCase().includes(query),
      ),
    );
  }, [search, destinations]);

  const fetchDestinations = async () => {
    try {
      const res = await destinationAPI.getAll();

      setDestinations(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Destinations load failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const getDestinationImage = (name) => {
    return destinationImages[name] || fallbackImage;
  };

  const getEmoji = (name) => {
    const emojis = {
      Goa: "🏖️",
      Manali: "🏔️",
      Rajasthan: "🏰",
      Kerala: "🌴",
      Ladakh: "🏔️",
      Agra: "🕌",
      Shimla: "❄️",
      Varanasi: "🛕",
    };

    return emojis[name] || "🌍";
  };

  const popularDestinations = filtered.filter(
    (destination) => destination.isPopular,
  );

  // ============================================================
  // IMAGE FALLBACK
  // ============================================================
  const handleImageError = (e) => {
    if (e.currentTarget.src !== fallbackImage) {
      e.currentTarget.src = fallbackImage;
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-14">
        {/* ======================================================
            HERO SECTION
        ====================================================== */}
        <section className="relative overflow-hidden rounded-[2rem] min-h-[420px] mb-12 shadow-2xl shadow-slate-300/30">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2000&q=90"
            alt="Travel destination"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/20" />

          {/* Decorative blur */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex min-h-[420px] items-center px-6 py-12 sm:px-10 lg:px-14">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white mb-6">
                <span>✈️</span>
                <span>EXPLORE • DISCOVER • TRAVEL</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">
                Your next
                <span className="block bg-gradient-to-r from-blue-300 via-cyan-200 to-white bg-clip-text text-transparent">
                  adventure awaits.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-slate-200">
                Discover breathtaking destinations, explore new places and build
                unforgettable trips with TripNest.
              </p>

              {/* Search */}
              <div className="relative mt-8 max-w-2xl">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl" />

                <div className="relative flex items-center rounded-2xl bg-white p-1.5 shadow-2xl">
                  <span className="flex w-12 items-center justify-center text-xl">
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Search a destination or country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent px-2 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Small stats */}
              <div className="mt-7 flex flex-wrap gap-6 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌍</span>
                  <span>{destinations.length || "8"} destinations</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base">🧭</span>
                  <span>Plan your perfect trip</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base">❤️</span>
                  <span>Traveler favorites</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            SEARCH RESULT INFO
        ====================================================== */}
        {!loading && search.trim() && (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Search results</p>

              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} destination
                {filtered.length !== 1 ? "s" : ""} found for{" "}
                <span className="font-semibold text-slate-700">"{search}"</span>
              </p>
            </div>

            <button
              onClick={() => setSearch("")}
              className="self-start rounded-xl px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50 sm:self-auto"
            >
              Clear search
            </button>
          </div>
        )}

        {/* ======================================================
            LOADING STATE
        ====================================================== */}
        {loading ? (
          <div className="space-y-12">
            <section>
              <div className="mb-5">
                <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="h-56 animate-pulse bg-slate-200" />

                    <div className="p-5">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                      <div className="mt-5 h-8 w-24 animate-pulse rounded-xl bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            {/* ==================================================
                POPULAR DESTINATIONS
            ================================================== */}
            {!search.trim() && popularDestinations.length > 0 && (
              <section className="mb-14">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⭐</span>

                      <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        Popular destinations
                      </h2>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Places travelers are loving right now
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {popularDestinations.map((dest) => (
                    <article
                      key={dest.id}
                      onClick={() => navigate("/trips/create")}
                      className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/40"
                    >
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={getDestinationImage(dest.name)}
                          alt={dest.name}
                          loading="lazy"
                          onError={handleImageError}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Image overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                        {/* Popular badge */}
                        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[10px] font-black tracking-wide text-white shadow-lg backdrop-blur-md">
                          <span>⭐</span>
                          POPULAR
                        </div>

                        {/* Arrow */}
                        <div className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-xl bg-white/20 text-lg text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          ↗
                        </div>

                        {/* Image bottom content */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className="text-xl font-black text-white">
                            {dest.name}
                          </h3>

                          <p className="mt-1 text-xs font-medium text-white/80">
                            📍 {dest.country}
                          </p>
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Best time to visit
                            </p>

                            <p className="mt-1 text-sm font-bold text-emerald-600">
                              🌤️ {dest.bestTimeToVisit || "Year round"}
                            </p>
                          </div>

                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                            →
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* ==================================================
                ALL DESTINATIONS
            ================================================== */}
            <section>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌍</span>

                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      {search.trim()
                        ? "Search results"
                        : "Explore destinations"}
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {search.trim()
                      ? "Destinations matching your search"
                      : "Find a place worth remembering"}
                  </p>
                </div>

                {!search.trim() && (
                  <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:block">
                    {filtered.length} places
                  </span>
                )}
              </div>

              {/* ==================================================
                  EMPTY STATE
              ================================================== */}
              {filtered.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
                    🔎
                  </div>

                  <h3 className="mt-6 text-xl font-black text-slate-900">
                    No destinations found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    We couldn't find a destination matching your search. Try
                    another city or country.
                  </p>

                  <button
                    onClick={() => setSearch("")}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Show all destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {filtered.map((dest) => (
                    <article
                      key={dest.id}
                      onClick={() => navigate("/trips/create")}
                      className="group flex cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                    >
                      {/* Image */}
                      <div className="relative h-44 w-40 shrink-0 overflow-hidden sm:h-48 sm:w-48">
                        <img
                          src={getDestinationImage(dest.name)}
                          alt={dest.name}
                          loading="lazy"
                          onError={handleImageError}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Emoji */}
                        <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-lg shadow-lg backdrop-blur-sm">
                          {getEmoji(dest.name)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-black text-slate-900 sm:text-lg">
                                  {dest.name}
                                </h3>

                                {dest.isPopular && (
                                  <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[9px] font-black tracking-wide text-amber-600">
                                    POPULAR
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs font-medium text-slate-400">
                                📍 {dest.country}
                              </p>
                            </div>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                              ↗
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                            {dest.description ||
                              "Explore this beautiful destination and start planning your next unforgettable journey."}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Best time
                            </p>

                            <p className="mt-0.5 text-xs font-bold text-emerald-600">
                              {dest.bestTimeToVisit || "Year round"}
                            </p>
                          </div>

                          <span className="text-xs font-black text-blue-600 transition-transform group-hover:translate-x-1">
                            Plan trip →
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ==================================================
                BOTTOM CTA
            ================================================== */}
            {!search.trim() && filtered.length > 0 && (
              <section className="relative mt-14 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 shadow-2xl sm:px-10">
                {/* Decorative elements */}
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wide text-blue-300">
                      ✈️ READY TO TRAVEL?
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                      Found somewhere you love?
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Turn your travel idea into a complete itinerary. Plan
                      destinations, dates, budgets and activities in one place.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/trips/create")}
                    className="group flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50"
                  >
                    Create a Trip
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Destinations;
