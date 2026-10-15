
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { destinationAPI } from "../utils/api";
import MapboxSearch from "../components/MapboxSearch";

const destinationImages = {
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
  Manali: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=85",
  Rajasthan: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85",
  Kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85",
  Ladakh: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  Agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
  Shimla: "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=85",
  Varanasi: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=85",
  Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85";

const getDestinationImage = (name) => {
  const key = Object.keys(destinationImages).find(
    (item) => item.toLowerCase() === name?.trim().toLowerCase()
  );

  return destinationImages[key] || fallbackImage;
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
    Paris: "🗼",
  };

  const key = Object.keys(emojis).find(
    (item) => item.toLowerCase() === name?.trim().toLowerCase()
  );

  return emojis[key] || "🌍";
};

const Destinations = () => {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch destinations
  useEffect(() => {
    let active = true;

    const fetchDestinations = async () => {
      try {
        const res = await destinationAPI.getAll();
        const data = Array.isArray(res.data) ? res.data : [];

        if (active) {
          setDestinations(data);
          setFiltered(data);
        }
      } catch (error) {
        console.error("Destinations load failed:", error);

        if (active) {
          setDestinations([]);
          setFiltered([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDestinations();

    return () => {
      active = false;
    };
  }, []);

  // Search destinations
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
          destination.country?.toLowerCase().includes(query)
      )
    );
  }, [search, destinations]);

  // Photo fallback
  const handleImageError = (event) => {
    const img = event.currentTarget;

    if (!img.dataset.fallback) {
      img.dataset.fallback = "true";
      img.src = fallbackImage;
    }
  };

  // Open trip creation
  const openDestination = (destination) => {
    navigate("/trips/create", {
      state: {
        destination: destination.name,
      },
    });
  };

  // Select a Mapbox search result
  const handlePlaceSelect = (place) => {
    navigate("/trips/create", {
      state: {
        destination: place.name,
        latitude: place.lat,
        longitude: place.lng,
        address: place.address,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Hero section */}
        <section className="relative mb-12 min-h-[420px] overflow-visible rounded-[2rem] shadow-2xl shadow-slate-300/30">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
            <img
              src={fallbackImage}
              alt="Explore beautiful travel destinations"
              className="h-full w-full object-cover"
              onError={handleImageError}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/20" />

            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex min-h-[420px] items-center px-6 py-12 sm:px-10 lg:px-14">
            <div className="w-full max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                ✈️ EXPLORE • DISCOVER • TRAVEL
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your next
                <span className="block bg-gradient-to-r from-blue-300 via-cyan-200 to-white bg-clip-text text-transparent">
                  adventure awaits.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
                Discover breathtaking destinations, explore new places
                and build unforgettable trips with TripNest.
              </p>

              <div className="relative z-30 mt-7 max-w-xl">
                <MapboxSearch
                  placeholder="Search any destination..."
                  className="py-3 text-base"
                  onPlaceSelect={handlePlaceSelect}
                />
              </div>

              <div className="mt-7 flex flex-wrap gap-6 text-xs text-white/80">
                <span>🌍 {destinations.length || 0} destinations</span>
                <span>🧭 Plan your perfect trip</span>
                <span>❤️ Discover new places</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search result information */}
        {!loading && search.trim() && (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Search results
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} destination
                {filtered.length !== 1 ? "s" : ""} found for "{search}"
              </p>
            </div>

            <button
              onClick={() => setSearch("")}
              className="self-start rounded-xl px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="h-48 w-40 shrink-0 bg-slate-200" />
                <div className="flex-1 space-y-4 p-5">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-8 w-24 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* All destinations — Popular Destinations removed */}
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

              {/* Empty state */}
              {filtered.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
                    🔎
                  </div>

                  <h3 className="mt-6 text-xl font-black text-slate-900">
                    No destinations found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    We couldn't find a destination matching your search.
                    Try another city or country.
                  </p>

                  <button
                    onClick={() => setSearch("")}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700"
                  >
                    Show all destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {filtered.map((dest) => (
                    <article
                      key={dest.id ?? dest._id ?? dest.name}
                      onClick={() => openDestination(dest)}
                      className="group flex cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                    >
                      {/* Destination photo */}
                      <div className="relative h-44 w-36 shrink-0 overflow-hidden sm:h-48 sm:w-48">
                        <img
                          src={getDestinationImage(dest.name)}
                          alt={`${dest.name} travel destination`}
                          loading="lazy"
                          onError={handleImageError}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-lg shadow-lg">
                          {getEmoji(dest.name)}
                        </div>
                      </div>

                      {/* Destination details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-black text-slate-900 sm:text-lg">
                                {dest.name}
                              </h3>

                              <p className="mt-1 text-xs font-medium text-slate-400">
                                📍 {dest.country || "Explore"}
                              </p>
                            </div>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-600 group-hover:text-white">
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

                            <p className="mt-1 text-xs font-bold text-emerald-600">
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

            {/* Bottom CTA */}
            {!search.trim() && filtered.length > 0 && (
              <section className="relative mt-14 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 shadow-2xl sm:px-10">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">
                    <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-blue-300">
                      ✈️ READY TO TRAVEL?
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                      Found somewhere you love?
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Turn your travel idea into a complete itinerary.
                      Plan destinations, dates, budgets and activities.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/trips/create")}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition-all hover:-translate-y-1 hover:bg-blue-50"
                  >
                    Create a Trip →
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
