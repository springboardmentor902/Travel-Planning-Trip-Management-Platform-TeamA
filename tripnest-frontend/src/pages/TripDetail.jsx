
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { tripAPI, itineraryAPI, activityAPI } from "../utils/api";

const ACTIVITY_TYPES = [
  "SIGHTSEEING",
  "TRANSPORTATION",
  "ACCOMMODATION",
  "DINING",
  "ADVENTURE",
  "SHOPPING",
  "OTHER",
];

const TYPE_EMOJI = {
  SIGHTSEEING: "🏛️",
  TRANSPORTATION: "🚗",
  ACCOMMODATION: "🏨",
  DINING: "🍽️",
  ADVENTURE: "🏄",
  SHOPPING: "🛍️",
  OTHER: "📌",
};

const EMPTY_ACTIVITY = {
  title: "",
  activityType: "SIGHTSEEING",
  startTime: "",
  endTime: "",
  location: "",
  notes: "",
  estimatedCost: "",
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  (typeof error?.response?.data === "string"
    ? error.response.data
    : null) ||
  error?.message ||
  "Something went wrong. Please try again.";

const formatMoney = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [activities, setActivities] = useState({});
  const [activeDay, setActiveDay] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showDayForm, setShowDayForm] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [dayForm, setDayForm] = useState({
    dayNumber: "",
    date: "",
  });

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityForm, setActivityForm] = useState(EMPTY_ACTIVITY);

  const fetchActivities = useCallback(async (dayId) => {
    if (dayId == null) return;

    try {
      const response = await activityAPI.getByItinerary(dayId);
      setActivities((previous) => ({
        ...previous,
        [dayId]: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (err) {
      setError(getErrorMessage(err));
      setActivities((previous) => ({
        ...previous,
        [dayId]: [],
      }));
    }
  }, []);

  const loadTripDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [tripResponse, itineraryResponse] = await Promise.all([
        tripAPI.getById(id),
        itineraryAPI.getByTrip(id),
      ]);

      const tripData = tripResponse.data;
      const dayList = Array.isArray(itineraryResponse.data)
        ? itineraryResponse.data
        : [];

      dayList.sort(
        (a, b) => Number(a.dayNumber || 0) - Number(b.dayNumber || 0)
      );

      setTrip(tripData);
      setItineraries(dayList);

      const firstDayId =
        dayList.find((day) => day.id === activeDay)?.id ??
        dayList[0]?.id ??
        null;

      setActiveDay(firstDayId);

      const activityEntries = await Promise.all(
        dayList.map(async (day) => {
          try {
            const response = await activityAPI.getByItinerary(day.id);
            return [
              day.id,
              Array.isArray(response.data) ? response.data : [],
            ];
          } catch {
            return [day.id, []];
          }
        })
      );

      setActivities(Object.fromEntries(activityEntries));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]); // Initial load and trip ID changes

  useEffect(() => {
    loadTripDetails();
  }, [loadTripDetails]);

  const refreshItineraries = async (preferredDayId = null) => {
    const response = await itineraryAPI.getByTrip(id);
    const dayList = Array.isArray(response.data) ? response.data : [];

    dayList.sort(
      (a, b) => Number(a.dayNumber || 0) - Number(b.dayNumber || 0)
    );

    setItineraries(dayList);

    const selectedId =
      dayList.find((day) => day.id === preferredDayId)?.id ??
      dayList.find((day) => day.id === activeDay)?.id ??
      dayList[0]?.id ??
      null;

    setActiveDay(selectedId);

    if (selectedId != null) {
      await fetchActivities(selectedId);
    }
  };

  const generateDays = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await itineraryAPI.generate(id);
      await loadTripDetails();
      setMessage("Itinerary generation completed.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openCreateDay = () => {
    const nextDay = itineraries.reduce(
      (maximum, day) =>
        Math.max(maximum, Number(day.dayNumber || 0)),
      0
    ) + 1;

    setEditingDay(null);
    setDayForm({
      dayNumber: String(nextDay),
      date: "",
    });
    setShowDayForm(true);
    setError("");
    setMessage("");
  };

  const openEditDay = (day) => {
    setEditingDay(day);
    setDayForm({
      dayNumber: String(day.dayNumber ?? ""),
      date: day.date ? String(day.date).slice(0, 10) : "",
    });
    setShowDayForm(true);
    setError("");
    setMessage("");
  };

  const saveDay = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      dayNumber: Number(dayForm.dayNumber),
      date: dayForm.date,
    };

    try {
      let savedId = null;

      if (editingDay) {
        await itineraryAPI.update(editingDay.id, payload);
        savedId = editingDay.id;
      } else {
        const response = await itineraryAPI.create(Number(id), payload);
        savedId = response.data?.id ?? null;
      }

      setShowDayForm(false);
      setEditingDay(null);

      await refreshItineraries(savedId);
      setMessage(
        editingDay
          ? "Itinerary day updated successfully."
          : "Itinerary day created successfully."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteDay = async (day) => {
    if (
      !window.confirm(
        `Delete Day ${day.dayNumber}? Any activities linked to it may also be affected.`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await itineraryAPI.delete(day.id);

      setActivities((previous) => {
        const copy = { ...previous };
        delete copy[day.id];
        return copy;
      });

      await refreshItineraries(null);
      setMessage("Itinerary day deleted.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openCreateActivity = () => {
    if (activeDay == null) {
      setError("Create or select an itinerary day first.");
      return;
    }

    setEditingActivity(null);
    setActivityForm(EMPTY_ACTIVITY);
    setShowActivityForm(true);
    setError("");
    setMessage("");
  };

  const openEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title ?? "",
      activityType: activity.activityType ?? "SIGHTSEEING",
      startTime: activity.startTime
        ? String(activity.startTime).slice(0, 5)
        : "",
      endTime: activity.endTime
        ? String(activity.endTime).slice(0, 5)
        : "",
      location: activity.location ?? "",
      notes: activity.notes ?? "",
      estimatedCost: activity.estimatedCost ?? "",
    });

    setShowActivityForm(true);
    setError("");
    setMessage("");
  };

  const saveActivity = async (event) => {
    event.preventDefault();

    if (activeDay == null) {
      setError("Select an itinerary day first.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...activityForm,
      startTime: activityForm.startTime || null,
      endTime: activityForm.endTime || null,
      estimatedCost:
        activityForm.estimatedCost === ""
          ? null
          : Number(activityForm.estimatedCost),
    };

    try {
      if (editingActivity) {
        await activityAPI.update(editingActivity.id, payload);
        setMessage("Activity updated successfully.");
      } else {
        await activityAPI.create(activeDay, payload);
        setMessage("Activity added successfully.");
      }

      setShowActivityForm(false);
      setEditingActivity(null);
      setActivityForm(EMPTY_ACTIVITY);
      await fetchActivities(activeDay);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteActivity = async (activityId) => {
    if (!window.confirm("Delete this activity?")) return;

    setError("");
    setMessage("");

    try {
      await activityAPI.delete(activityId);
      await fetchActivities(activeDay);
      setMessage("Activity deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const currentDay = itineraries.find((day) => day.id === activeDay);
  const currentActivities = activities[activeDay] || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center gap-4 p-10">
          <p className="text-red-600">{error || "Trip not found."}</p>
          <button
            onClick={() => navigate("/trips")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-10 pt-28 sm:px-6">
        <button
          onClick={() => navigate("/trips")}
          className="mb-6 text-sm text-gray-500 hover:text-blue-600"
        >
          ← Back to trips
        </button>

        {/* Trip details */}
        <section className="mb-6 rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {trip.title}
              </h1>
              <p className="mt-1 text-gray-500">
                📍 {trip.destination}
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {trip.status}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400">Start Date</p>
              <p className="text-sm font-medium">{trip.startDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">End Date</p>
              <p className="text-sm font-medium">{trip.endDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm font-medium">
                {trip.totalDays ?? "—"} days
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Budget</p>
              <p className="text-sm font-medium text-green-600">
                {trip.totalBudget != null
                  ? formatMoney(trip.totalBudget)
                  : "Not set"}
              </p>
            </div>
          </div>

          {trip.description && (
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
              {trip.description}
            </p>
          )}
        </section>

        {/* Existing quick actions */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            {
              icon: "💰",
              title: "Budget",
              description: "Manage trip budget",
              path: `/trips/${trip.id}/budget`,
              color: "emerald",
            },
            {
              icon: "💳",
              title: "Expenses",
              description: "Track spending",
              path: `/trips/${trip.id}/expenses`,
              color: "blue",
            },
            {
              icon: "📄",
              title: "Documents",
              description: "Upload travel files",
              path: `/trips/${trip.id}/documents`,
              color: "purple",
            },
            {
              icon: "👥",
              title: "Groups",
              description: "Travel companions",
              path: "/groups",
              color: "violet",
            },
            {
              icon: "🔔",
              title: "Notifications",
              description: "View notifications",
              path: "/notifications",
              color: "amber",
            },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`rounded-xl border border-${item.color}-200 bg-white p-4 text-left transition hover:bg-${item.color}-50`}
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="mt-2 font-bold text-gray-900">{item.title}</p>
              <p className="mt-1 text-xs text-gray-500">
                {item.description}
              </p>
            </button>
          ))}
        </section>

        {/* Status messages */}
        {message && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Itinerary */}
        <section className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Itinerary</h2>
              <p className="mt-1 text-sm text-gray-500">
                Organize your trip day by day.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={openCreateDay}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                + Add Day
              </button>

              <button
                onClick={generateDays}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Please wait..." : "Generate Days"}
              </button>
            </div>
          </div>

          {itineraries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <div className="mb-3 text-4xl">🗓️</div>
              <h3 className="font-semibold text-gray-800">
                No itinerary days yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add a day manually or use Generate Days.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
              {/* Day selector */}
              <aside>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  Trip Days
                </h3>

                <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col">
                  {itineraries.map((day) => (
                    <div
                      key={day.id}
                      className={`min-w-36 rounded-lg border p-3 ${activeDay === day.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                        }`}
                    >
                      <button
                        onClick={() => {
                          setActiveDay(day.id);
                          fetchActivities(day.id);
                          setShowActivityForm(false);
                        }}
                        className="w-full text-left"
                      >
                        <span className="block font-semibold">
                          Day {day.dayNumber}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {day.date || "No date"}
                        </span>
                      </button>

                      <div className="mt-3 flex gap-3 text-xs">
                        <button
                          onClick={() => openEditDay(day)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDay(day)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Activities */}
              <div className="min-w-0">
                {currentDay ? (
                  <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Day {currentDay.dayNumber} Activities
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {currentDay.date}
                        </p>
                      </div>

                      <button
                        onClick={openCreateActivity}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        + Add Activity
                      </button>
                    </div>

                    {currentActivities.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                        <div className="mb-2 text-3xl">📋</div>
                        <p className="text-sm text-gray-500">
                          No activities for this day yet.
                        </p>
                        <button
                          onClick={openCreateActivity}
                          className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                        >
                          Add your first activity
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentActivities.map((activity) => (
                          <article
                            key={activity.id}
                            className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 gap-3">
                                <span className="text-2xl">
                                  {TYPE_EMOJI[activity.activityType] || "📌"}
                                </span>

                                <div className="min-w-0">
                                  <h4 className="break-words font-semibold">
                                    {activity.title}
                                  </h4>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {activity.activityType || "OTHER"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 gap-3 text-xs">
                                <button
                                  onClick={() => openEditActivity(activity)}
                                  className="text-blue-600 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteActivity(activity.id)}
                                  className="text-red-600 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                              {(activity.startTime || activity.endTime) && (
                                <span>
                                  🕐 {activity.startTime || "—"}
                                  {activity.endTime
                                    ? ` – ${activity.endTime}`
                                    : ""}
                                </span>
                              )}

                              {activity.location && (
                                <span>📍 {activity.location}</span>
                              )}

                              {activity.estimatedCost != null && (
                                <span className="font-medium text-green-700">
                                  {formatMoney(activity.estimatedCost)}
                                </span>
                              )}
                            </div>

                            {activity.notes && (
                              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
                                {activity.notes}
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="rounded-lg bg-gray-50 p-6 text-sm text-gray-500">
                    Select a day to view its activities.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Create / edit day modal */}
      {showDayForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={saveDay}
            className="my-6 w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold">
              {editingDay ? "Edit Itinerary Day" : "Add Itinerary Day"}
            </h3>

            <label className="block text-sm text-gray-600">
              Day Number
              <input
                type="number"
                min="1"
                required
                value={dayForm.dayNumber}
                onChange={(event) =>
                  setDayForm((previous) => ({
                    ...previous,
                    dayNumber: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Date
              <input
                type="date"
                required
                min={trip.startDate || undefined}
                max={trip.endDate || undefined}
                value={dayForm.date}
                onChange={(event) =>
                  setDayForm((previous) => ({
                    ...previous,
                    date: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
              />
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDayForm(false)}
                className="flex-1 rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingDay
                    ? "Update Day"
                    : "Create Day"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / edit activity modal */}
      {showActivityForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={saveActivity}
            className="my-6 w-full max-w-lg space-y-3 rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold">
              {editingActivity ? "Edit Activity" : "Add Activity"}
            </h3>

            <label className="block text-sm text-gray-600">
              Activity Title *
              <input
                type="text"
                required
                maxLength={150}
                value={activityForm.title}
                onChange={(event) =>
                  setActivityForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Visit the beach"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Activity Type
              <select
                value={activityForm.activityType}
                onChange={(event) =>
                  setActivityForm((previous) => ({
                    ...previous,
                    activityType: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_EMOJI[type]} {type}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm text-gray-600">
                Start Time
                <input
                  type="time"
                  value={activityForm.startTime}
                  onChange={(event) =>
                    setActivityForm((previous) => ({
                      ...previous,
                      startTime: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block text-sm text-gray-600">
                End Time
                <input
                  type="time"
                  value={activityForm.endTime}
                  onChange={(event) =>
                    setActivityForm((previous) => ({
                      ...previous,
                      endTime: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
                />
              </label>
            </div>

            <label className="block text-sm text-gray-600">
              Location
              <input
                type="text"
                value={activityForm.location}
                onChange={(event) =>
                  setActivityForm((previous) => ({
                    ...previous,
                    location: event.target.value,
                  }))
                }
                placeholder="Activity location"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Estimated Cost (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={activityForm.estimatedCost}
                onChange={(event) =>
                  setActivityForm((previous) => ({
                    ...previous,
                    estimatedCost: event.target.value,
                  }))
                }
                placeholder="0"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Notes
              <textarea
                rows={3}
                value={activityForm.notes}
                onChange={(event) =>
                  setActivityForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                placeholder="Additional details"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
              />
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowActivityForm(false)}
                className="flex-1 rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingActivity
                    ? "Update Activity"
                    : "Save Activity"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
