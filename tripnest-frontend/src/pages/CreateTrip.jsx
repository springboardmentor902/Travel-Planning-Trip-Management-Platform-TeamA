
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MapboxSearch from "../components/MapboxSearch";
import { tripAPI, itineraryAPI } from "../utils/api";

const initialForm = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  totalBudget: "",
  description: "",
  status: "PLANNING",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

const CreateTrip = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "startDate" &&
      previous.endDate &&
      value > previous.endDate
        ? { endDate: "" }
        : {}),
    }));

    if (error) setError("");
  };

  const handleDestinationSelect = (place) => {
    setForm((previous) => ({
      ...previous,
      destination: place?.name || "",
    }));

    setError("");
  };

  const getDuration = () => {
    if (!form.startDate || !form.endDate) return null;

    const start = new Date(`${form.startDate}T00:00:00`);
    const end = new Date(`${form.endDate}T00:00:00`);
    const difference = Math.round(
      (end.getTime() - start.getTime()) / 86400000
    );

    return difference >= 0 ? difference + 1 : null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.destination.trim()) {
      setError("Please select a destination from the search results.");
      return;
    }

    if (form.startDate && form.endDate < form.startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (
      form.totalBudget !== "" &&
      (!Number.isFinite(Number(form.totalBudget)) ||
        Number(form.totalBudget) < 0)
    ) {
      setError("Please enter a valid budget.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        destination: form.destination.trim(),
        totalBudget:
          form.totalBudget !== ""
            ? Number(form.totalBudget)
            : null,
      };

      const response = await tripAPI.create(payload);
      const trip = response?.data;

      const tripId = trip?.id ?? trip?._id;

      if (tripId == null) {
        throw new Error(
          "Trip was created, but its ID was not returned by the server."
        );
      }

      try {
        await itineraryAPI.generate(tripId);
      } catch (itineraryError) {
        console.error("Itinerary generation failed:", itineraryError);

        navigate(`/trips/${tripId}`, {
          state: {
            notice:
              "Your trip was created. You can generate or edit your itinerary from the trip page.",
          },
        });

        return;
      }

      navigate(`/trips/${tripId}`);
    } catch (err) {
      console.error("Create trip failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to create your trip. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const duration = getDuration();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/trips")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <span>←</span> Back to trips
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <span>✦</span> PLAN YOUR NEXT ADVENTURE
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Create a new trip
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Add your destination, travel dates and budget.
                TripNest will help you organize your journey.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                1
              </span>
              Trip details
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
              ⚠️
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-800">
                Unable to continue
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

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Main form */}
          <section className="min-w-0 lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                    🗺️
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Trip details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Tell us about your journey
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-8">
                {/* Trip title */}
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Trip title <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Goa Summer Vacation"
                    maxLength={100}
                    required
                    className={inputClass}
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className={labelClass}>
                    Destination <span className="text-red-500">*</span>
                  </label>

                  <div className="rounded-xl">
                    <MapboxSearch
                      placeholder="Search city or destination..."
                      onPlaceSelect={handleDestinationSelect}
                    />
                  </div>

                  {form.destination && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <span>📍</span>
                      <div className="min-w-0">
                        <p className="text-xs text-emerald-700">
                          Selected destination
                        </p>
                        <p className="truncate text-sm font-semibold text-emerald-800">
                          {form.destination}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            destination: "",
                          }))
                        }
                        className="ml-auto text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* Travel dates */}
                <div>
                  <h3 className={labelClass}>
                    Travel dates <span className="text-red-500">*</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="mb-2 block text-xs font-medium text-slate-500"
                      >
                        🗓️ Start date
                      </label>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={form.startDate}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="mb-2 block text-xs font-medium text-slate-500"
                      >
                        🏁 End date
                      </label>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={form.endDate}
                        onChange={handleChange}
                        min={form.startDate || undefined}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {duration !== null && (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                      📅 {duration} {duration === 1 ? "day" : "days"} planned
                    </p>
                  )}
                </div>

                {/* Budget and status */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="totalBudget" className={labelClass}>
                      Total budget
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                        ₹
                      </span>
                      <input
                        id="totalBudget"
                        name="totalBudget"
                        type="number"
                        min="0"
                        step="any"
                        value={form.totalBudget}
                        onChange={handleChange}
                        placeholder="25,000"
                        className={`${inputClass} pl-9`}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Optional
                    </p>
                  </div>

                  <div>
                    <label htmlFor="status" className={labelClass}>
                      Trip status
                    </label>

                    <select
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="description" className={labelClass}>
                      Trip description
                    </label>
                    <span className="text-xs text-slate-400">Optional</span>
                  </div>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="What do you want to explore? Add notes or special requirements..."
                    rows={4}
                    maxLength={1000}
                    className={`${inputClass} resize-y`}
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.description.length}/1000
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate("/trips")}
                    disabled={loading}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-1"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:flex-[2]"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating trip...
                      </>
                    ) : (
                      <>
                        Create trip <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-28">
            {/* Live preview */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10" />

                <div className="relative">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-wider text-white">
                    LIVE PREVIEW
                  </span>

                  <p className="mt-5 text-sm text-blue-100">
                    Your next adventure
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-black text-white">
                    {form.title.trim() || "Your trip title"}
                  </h2>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm text-white backdrop-blur">
                    📍 {form.destination || "Choose a destination"}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    📅
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Travel dates</p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                      {form.startDate && form.endDate
                        ? `${form.startDate} → ${form.endDate}`
                        : "Dates not selected"}
                    </p>
                    {duration !== null && (
                      <p className="mt-1 text-xs text-blue-600">
                        {duration} {duration === 1 ? "day" : "days"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    💰
                  </span>
                  <div>
                    <p className="text-xs text-slate-400">Budget</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {form.totalBudget !== "" &&
                      Number(form.totalBudget) >= 0
                        ? `₹${Number(form.totalBudget).toLocaleString("en-IN")}`
                        : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">Current status</span>
                  <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-700">
                    {form.status}
                  </span>
                </div>
              </div>
            </section>

            {/* Next steps */}
            <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-5">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/10" />

              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-xl">
                  💡
                </div>

                <h3 className="font-bold text-white">What happens next?</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Once your trip is created, TripNest attempts to generate
                  itinerary days automatically.
                </p>

                <div className="mt-5 space-y-4">
                  {[
                    "Your trip is saved",
                    "Itinerary generation is attempted",
                    "You can customize your travel plan",
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300">
                        {index + 1}
                      </span>
                      <span className="text-xs text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CreateTrip;
