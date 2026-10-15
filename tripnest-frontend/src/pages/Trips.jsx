import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PendingInvitations from "../components/PendingInvitations";
import { tripAPI } from "../utils/api";

const inputClass =
  "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const statusStyles = {
  PLANNING: "bg-violet-50 text-violet-700 border-violet-200",
  UPCOMING: "bg-blue-50 text-blue-700 border-blue-200",
  ONGOING: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETE: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const statusIcons = {
  PLANNING: "✎",
  UPCOMING: "◷",
  ONGOING: "↗",
  COMPLETED: "✓",
  COMPLETE: "✓",
  CANCELLED: "✕",
};

const formatDate = (date) => {
  if (!date) return "Not set";

  const value = String(date).slice(0, 10);
  const parsed = new Date(`${value}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const formatBudget = (budget) => {
  if (budget == null || budget === "") return "Not set";

  const amount = Number(budget);

  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN")}`
    : "Not set";
};

const getTripId = (trip) => trip?.id ?? trip?._id;

const Trips = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await tripAPI.getAll();
      const data = response?.data;

      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Trips load failed:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load your trips. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (event, trip) => {
    event.stopPropagation();

    const id = getTripId(trip);

    if (id == null || deletingId !== null) return;

    const confirmed = window.confirm(
      `Delete "${trip.title || "this trip"}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await tripAPI.delete(id);
      setTrips((previous) =>
        previous.filter((item) => String(getTripId(item)) !== String(id))
      );
    } catch (err) {
      console.error("Trip deletion failed:", err);
      setError(
        err?.response?.data?.message || "Unable to delete this trip."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const planningTrips = trips.filter(
    (trip) => trip.status === "PLANNING"
  );

  const upcomingTrips = trips.filter(
    (trip) => trip.status === "UPCOMING"
  );

  const completedTrips = trips.filter(
    (trip) =>
      trip.status === "COMPLETED" || trip.status === "COMPLETE"
  );

  const stats = [
    {
      label: "Total trips",
      value: trips.length,
      icon: "✈",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Planning",
      value: planningTrips.length,
      icon: "✎",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Upcoming",
      value: upcomingTrips.length,
      icon: "◷",
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Completed",
      value: completedTrips.length,
      icon: "✓",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-700">
              <span>✦</span> YOUR TRAVEL SPACE
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              My Trips
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Plan your journeys, organize itineraries and keep every
              adventure in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/trips/create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <span className="text-lg">+</span> Create new trip
          </button>
        </div>

        {/* Summary banner */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 shadow-lg shadow-blue-600/10 sm:p-8">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-28 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                Your next adventure starts here
              </span>

              <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                Make every journey count.
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100">
                {trips.length
                  ? `You have ${trips.length} ${
                      trips.length === 1 ? "trip" : "trips"
                    } in your travel space. Keep your plans organized and ready.`
                  : "Choose a destination and start building your next travel plan."}
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl text-white backdrop-blur">
              ✈
            </div>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <span className="text-lg">⚠</span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-800">
                Something went wrong
              </p>
              <p className="mt-1 break-words text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Statistics */}
        {!loading && trips.length > 0 && (
          <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    {stat.label}
                  </p>

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${stat.bg} ${stat.color}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <p className={`mt-3 text-3xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Pending invitations */}
        {!loading && (
          <section className="mb-10">
            <PendingInvitations />
          </section>
        )}

        {/* Trips section heading */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              All trips
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your planned journeys and travel details.
            </p>
          </div>

          {!loading && (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              {trips.length} {trips.length === 1 ? "trip" : "trips"}
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-6 h-20 rounded-xl bg-slate-100" />
                <div className="mt-5 h-10 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty state */
          <section className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-10 sm:py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
              ✈️
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              No trips yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your travel space is ready. Create your first trip and
              start organizing your destination, dates and itinerary.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/trips/create")}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Create your first trip
              </button>

              <button
                type="button"
                onClick={() => navigate("/destinations")}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Explore destinations
              </button>
            </div>
          </section>
        ) : (
          /* Trip cards */
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {trips.map((trip) => {
              const id = getTripId(trip);
              const status = String(trip.status || "PLANNING").toUpperCase();
              const statusStyle =
                statusStyles[status] ||
                "border-slate-200 bg-slate-50 text-slate-600";

              return (
                <article
                  key={id ?? trip.title}
                  className="group min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  {/* Card header */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-2xl transition group-hover:scale-105">
                        ✈️
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-lg font-bold text-slate-900 transition group-hover:text-blue-700">
                          {trip.title || "Untitled trip"}
                        </h3>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          <span className="mr-1">📍</span>
                          {trip.destination || "Unknown destination"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold sm:text-xs ${statusStyle}`}
                      >
                        <span>{statusIcons[status] || "•"}</span>
                        {status}
                      </span>
                    </div>

                    {/* Trip information */}
                    <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Start date
                        </p>
                        <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                          {formatDate(trip.startDate)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          End date
                        </p>
                        <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                          {formatDate(trip.endDate)}
                        </p>
                      </div>

                      <div className="col-span-2 border-t border-slate-200 pt-3 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Duration
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-700">
                          {trip.totalDays != null
                            ? `${trip.totalDays} days`
                            : trip.startDate && trip.endDate
                              ? `${Math.max(
                                  1,
                                  Math.round(
                                    (new Date(
                                      `${String(trip.endDate).slice(0, 10)}T00:00:00`
                                    ) -
                                      new Date(
                                        `${String(trip.startDate).slice(0, 10)}T00:00:00`
                                      )) /
                                      86400000
                                  ) + 1
                                )} days`
                              : "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <span className="text-xs font-medium text-slate-600">
                        <span className="mr-2">₹</span>Trip budget
                      </span>

                      <span className="text-sm font-bold text-emerald-700">
                        {formatBudget(trip.totalBudget)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => navigate(`/trips/${id}`)}
                        disabled={id == null}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        View trip <span className="ml-1">→</span>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => handleDelete(event, trip)}
                        disabled={id == null || deletingId !== null}
                        className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {String(deletingId) === String(id)
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Bottom call to action */}
        {!loading && trips.length > 0 && (
          <section className="relative mt-10 overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8">
            <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-blue-500/10" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Planning another adventure?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Add a new destination and build your next itinerary.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/trips/create")}
                className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-50"
              >
                + Create new trip
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Trips;