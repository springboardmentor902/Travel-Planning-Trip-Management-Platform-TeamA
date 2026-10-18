import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { tripAPI } from "../utils/api";

const statusColors = {
  PLANNING: "bg-violet-50 text-violet-700 border-violet-200",
  UPCOMING: "bg-blue-50 text-blue-700 border-blue-200",
  ONGOING: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const statusIcons = {
  PLANNING: "📝",
  UPCOMING: "📅",
  ONGOING: "🧭",
  COMPLETED: "✓",
  CANCELLED: "✕",
};

const Trips = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await tripAPI.getAll();
      setTrips(res.data);
    } catch (err) {
      console.error("Trips load failed:", err);
      setError("Trips load nahi hui!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Trip delete karna chahte ho?")) return;

    try {
      await tripAPI.delete(id);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed!");
    }
  };

  const planningTrips = trips.filter((trip) => trip.status === "PLANNING");

  const upcomingTrips = trips.filter((trip) => trip.status === "UPCOMING");

  const ongoingTrips = trips.filter((trip) => trip.status === "ONGOING");

  const completedTrips = trips.filter((trip) => trip.status === "COMPLETED");

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="mb-8">
            <div className="h-8 w-40 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-56 rounded bg-slate-200 animate-pulse mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200" />

                  <div className="flex-1">
                    <div className="h-5 w-1/2 bg-slate-200 rounded" />
                    <div className="h-3 w-1/3 bg-slate-200 rounded mt-3" />
                  </div>
                </div>

                <div className="h-16 bg-slate-200 rounded-xl mt-5" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        {/* ======================================================
            SIMPLE HEADER
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 mb-8 shadow-lg shadow-blue-600/10">
          {/* ONE IMAGE ONLY */}
          <img
            src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80"
            alt="Travel"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-blue-700/90 to-indigo-700/85" />

          <div className="relative z-10 p-7 sm:p-9">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold text-white mb-4">
                  🗺️ Your journeys
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  My Trips
                </h1>

                <p className="text-blue-100 text-sm mt-2">
                  {trips.length} trip
                  {trips.length !== 1 ? "s" : ""} planned
                </p>
              </div>

              <button
                onClick={() => navigate("/trips/create")}
                className="w-fit bg-white text-blue-700 px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-50 transition"
              >
                + New Trip
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ======================================================
            STATS
        ====================================================== */}

        {trips.length > 0 && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Total Trips</p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {trips.length}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Planning</p>

              <p className="text-2xl font-bold text-violet-600 mt-1">
                {planningTrips.length}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Upcoming</p>

              <p className="text-2xl font-bold text-blue-600 mt-1">
                {upcomingTrips.length}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Completed</p>

              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {completedTrips.length}
              </p>
            </div>
          </section>
        )}

        {/* ======================================================
            TITLE
        ====================================================== */}

        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">All Trips</h2>

            <p className="text-sm text-slate-500 mt-1">
              Manage your planned journeys
            </p>
          </div>

          {trips.length > 0 && (
            <span className="text-xs text-slate-400">{trips.length} total</span>
          )}
        </div>

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {trips.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-16 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-4xl">
              ✈️
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-6">
              Koi trip nahi hai abhi
            </h3>

            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
              Apni pehli trip plan karo aur apna next adventure organize karna
              start karo.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button
                onClick={() => navigate("/trips/create")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Create Trip
              </button>

              <button
                onClick={() => navigate("/destinations")}
                className="border border-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                Explore Destinations
              </button>
            </div>
          </div>
        ) : (
          /* ====================================================
             TRIPS
          ==================================================== */

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="group bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Simple icon */}
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                      ✈️
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg truncate">
                        {trip.title || "Untitled Trip"}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1 truncate">
                        📍 {trip.destination || "Unknown destination"}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-full border font-bold ${
                      statusColors[trip.status] ||
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {statusIcons[trip.status] || "•"}
                    {trip.status}
                  </span>
                </div>

                {/* Info */}
                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      Start
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-1 truncate">
                      {trip.startDate || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      End
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-1 truncate">
                      {trip.endDate || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      Duration
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {trip.totalDays || "—"} days
                    </p>
                  </div>
                </div>

                {/* Budget */}
                {trip.totalBudget && (
                  <div className="mt-4 flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">
                      💰 Trip Budget
                    </span>

                    <span className="text-sm font-bold text-emerald-600">
                      ₹{trip.totalBudget.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div
                  className="flex gap-2 mt-4 pt-4 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="flex-1 py-2 rounded-xl border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-600 hover:text-white transition"
                  >
                    View Details →
                  </button>

                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================
            BOTTOM CTA
        ====================================================== */}

        {trips.length > 0 && (
          <section className="mt-10 bg-slate-900 rounded-3xl px-6 py-7 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h3 className="text-lg font-bold text-white">
                Planning another adventure?
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Create a new itinerary for your next journey.
              </p>
            </div>

            <button
              onClick={() => navigate("/trips/create")}
              className="shrink-0 bg-white text-slate-900 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
            >
              + Create New Trip
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Trips;
