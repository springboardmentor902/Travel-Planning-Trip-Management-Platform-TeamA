import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  tripAPI,
  itineraryAPI,
  activityAPI,
  tripMemberAPI,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const activityTypes = [
  "SIGHTSEEING",
  "TRANSPORTATION",
  "ACCOMMODATION",
  "DINING",
  "ADVENTURE",
  "SHOPPING",
  "OTHER",
];

const typeEmoji = {
  SIGHTSEEING: "🏛️",
  TRANSPORTATION: "🚗",
  ACCOMMODATION: "🏨",
  DINING: "🍽️",
  ADVENTURE: "🏄",
  SHOPPING: "🛍️",
  OTHER: "📌",
};

const statusStyles = {
  PLANNING: "bg-violet-50 text-violet-700 border-violet-200",
  UPCOMING: "bg-blue-50 text-blue-700 border-blue-200",
  ONGOING: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETE: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const initialActivity = {
  title: "",
  activityType: "SIGHTSEEING",
  startTime: "",
  endTime: "",
  location: "",
  notes: "",
  estimatedCost: "",
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

const formatMoney = (value) => {
  if (value == null || value === "") return "Not set";

  const amount = Number(value);

  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN")}`
    : "Not set";
};

const getId = (item) => item?.id ?? item?._id;

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [activities, setActivities] = useState({});
  const [members, setMembers] = useState([]);
  const [activeDay, setActiveDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [activeMainTab, setActiveMainTab] = useState("itinerary");

  const [showAddActivity, setShowAddActivity] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [activityForm, setActivityForm] = useState(initialActivity);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingActivityId, setDeletingActivityId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const fetchActivities = useCallback(
    async (itineraryId) => {
      try {
        const response =
          await activityAPI.getByItinerary(itineraryId);

        const data = Array.isArray(response?.data)
          ? response.data
          : [];

        setActivities((previous) => ({
          ...previous,
          [itineraryId]: data,
        }));
      } catch (error) {
        console.error("Activities load failed:", error);
        setActivities((previous) => ({
          ...previous,
          [itineraryId]: [],
        }));
      }
    },
    []
  );

  const fetchMembers = useCallback(async () => {
    try {
      const response = await tripMemberAPI.getMembers(id);
      setMembers(
        Array.isArray(response?.data) ? response.data : []
      );
    } catch (error) {
      console.error("Members load failed:", error);
    }
  }, [id]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [tripResponse, itineraryResponse, membersResponse] =
        await Promise.all([
          tripAPI.getById(id),
          itineraryAPI.getByTrip(id),
          tripMemberAPI.getMembers(id),
        ]);

      const tripData = tripResponse?.data;
      const days = Array.isArray(itineraryResponse?.data)
        ? itineraryResponse.data
        : [];
      const memberData = Array.isArray(membersResponse?.data)
        ? membersResponse.data
        : [];

      if (!tripData) {
        throw new Error("Trip details were not returned by the server.");
      }

      setTrip(tripData);
      setItineraries(days);
      setMembers(memberData);

      const firstDayId = days.length ? getId(days[0]) : null;
      setActiveDay(firstDayId);

      if (firstDayId != null) {
        await fetchActivities(firstDayId);
      }
    } catch (error) {
      console.error("Trip details load failed:", error);
      setPageError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load this trip."
      );
    } finally {
      setLoading(false);
    }
  }, [id, fetchActivities]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const currentEmail = (
    user?.email || storedUser?.email || ""
  ).toLowerCase();

  const ownerEmail = (
    trip?.ownerEmail || ""
  ).toLowerCase();

  const isOwner =
    Boolean(currentEmail) && ownerEmail === currentEmail;

  const currentActivities = activeDay
    ? activities[activeDay] || []
    : [];

  const activeItinerary = itineraries.find(
    (day) => String(getId(day)) === String(activeDay)
  );

  const handleDayClick = (dayId) => {
    setActiveDay(dayId);
    setShowAddActivity(false);
    setActivityError("");

    if (!Object.prototype.hasOwnProperty.call(activities, dayId)) {
      fetchActivities(dayId);
    }
  };

  const handleAddActivity = async (event) => {
    event.preventDefault();

    if (!activeDay || savingActivity) return;

    setActivityError("");

    if (
      activityForm.startTime &&
      activityForm.endTime &&
      activityForm.endTime < activityForm.startTime
    ) {
      setActivityError("End time cannot be earlier than start time.");
      return;
    }

    if (
      activityForm.estimatedCost !== "" &&
      (!Number.isFinite(Number(activityForm.estimatedCost)) ||
        Number(activityForm.estimatedCost) < 0)
    ) {
      setActivityError("Enter a valid activity cost.");
      return;
    }

    setSavingActivity(true);

    try {
      await activityAPI.create(activeDay, {
        ...activityForm,
        title: activityForm.title.trim(),
        location: activityForm.location.trim(),
        notes: activityForm.notes.trim(),
        estimatedCost:
          activityForm.estimatedCost !== ""
            ? Number(activityForm.estimatedCost)
            : null,
        startTime: activityForm.startTime || null,
        endTime: activityForm.endTime || null,
      });

      setActivityForm(initialActivity);
      setShowAddActivity(false);
      await fetchActivities(activeDay);
    } catch (error) {
      console.error("Activity creation failed:", error);
      setActivityError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to add this activity."
      );
    } finally {
      setSavingActivity(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (deletingActivityId !== null) return;

    if (!window.confirm("Delete this activity?")) return;

    setDeletingActivityId(activityId);
    setActionError("");

    try {
      await activityAPI.delete(activityId);
      await fetchActivities(activeDay);
    } catch (error) {
      console.error("Activity deletion failed:", error);
      setActionError("Unable to delete this activity.");
    } finally {
      setDeletingActivityId(null);
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();

    const email = inviteEmail.trim();

    if (!email || inviteLoading) return;

    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      await tripMemberAPI.invite(id, email);

      setInviteSuccess(`Invitation sent to ${email}.`);
      setInviteEmail("");
      await fetchMembers();
    } catch (error) {
      console.error("Member invitation failed:", error);
      setInviteError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Unable to send the invitation."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (removingMemberId !== null) return;

    if (!window.confirm("Remove this member from the trip?")) return;

    setRemovingMemberId(memberId);
    setActionError("");

    try {
      await tripMemberAPI.remove(id, memberId);
      await fetchMembers();
    } catch (error) {
      console.error("Member removal failed:", error);
      setActionError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Unable to remove this member."
      );
    } finally {
      setRemovingMemberId(null);
    }
  };

  const tabs = [
    { id: "itinerary", label: "Itinerary", icon: "📅" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "expenses", label: "Expenses", icon: "💰" },
    { id: "documents", label: "Documents", icon: "📂" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="mb-6 h-52 animate-pulse rounded-3xl bg-white shadow-sm" />

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm lg:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  if (pageError || !trip) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-3xl px-4 pb-12 pt-32">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">🧭</div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Unable to load trip
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {pageError || "This trip could not be found."}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={fetchAll}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try again
              </button>

              <button
                type="button"
                onClick={() => navigate("/trips")}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to trips
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const tripStatus = String(trip.status || "PLANNING").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate("/trips")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <span>←</span> Back to trips
        </button>

        {/* Trip header */}
        <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 shadow-lg shadow-blue-600/10 sm:p-8">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                  ✦ YOUR ADVENTURE
                </span>

                <h1 className="mt-4 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {trip.title || "Untitled trip"}
                </h1>

                <p className="mt-2 flex items-center gap-2 text-sm text-blue-100">
                  <span>📍</span>
                  {trip.destination || "Destination not set"}
                </p>
              </div>

              <span className="w-fit rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold text-white">
                {tripStatus}
              </span>
            </div>

            {/* Trip overview */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Start date",
                  value: formatDate(trip.startDate),
                  icon: "🗓️",
                },
                {
                  label: "End date",
                  value: formatDate(trip.endDate),
                  icon: "🏁",
                },
                {
                  label: "Duration",
                  value:
                    trip.totalDays != null
                      ? `${trip.totalDays} days`
                      : "Not set",
                  icon: "⏱️",
                },
                {
                  label: "Total budget",
                  value: formatMoney(trip.totalBudget),
                  icon: "₹",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xs text-blue-100">
                    {item.icon} {item.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-bold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {trip.description && (
              <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-blue-50">
                {trip.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5 text-xs text-blue-100">
              <span>
                Created by:{" "}
                <strong className="text-white">
                  {trip.ownerName || "Trip owner"}
                </strong>
                {isOwner ? " (You)" : ""}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1.5">
                👥 {members.length}{" "}
                {members.length === 1 ? "member" : "members"}
              </span>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-8 flex flex-wrap gap-3">
          {[
            {
              label: "Documents",
              icon: "📂",
              path: `/trips/${id}/documents`,
            },
            {
              label: "Trip report",
              icon: "📊",
              path: `/reports/trips/${id}`,
            },
            {
              label: "Settlement",
              icon: "💸",
              path: `/trips/${id}/settlement`,
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {item.icon} {item.label}
            </button>
          ))}
        </section>

        {/* Main tabs */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-3 sm:px-5">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activeMainTab === tab.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.id === "members" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        activeMainTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {members.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Shared action errors */}
            {actionError && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {actionError}
                <button
                  type="button"
                  onClick={() => setActionError("")}
                  className="ml-3 font-bold"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ITINERARY TAB */}
            {activeMainTab === "itinerary" && (
              <div>
                {itineraries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                    <div className="text-4xl">🗺️</div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                      No itinerary days yet
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Your trip exists, but no itinerary days are available.
                      Generate or create an itinerary to start adding activities.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                    {/* Days sidebar */}
                    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Your itinerary
                      </h2>

                      <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                        {itineraries.map((day) => {
                          const dayId = getId(day);
                          const selected =
                            String(activeDay) === String(dayId);

                          return (
                            <button
                              key={dayId}
                              type="button"
                              onClick={() => handleDayClick(dayId)}
                              className={`min-w-28 flex-1 rounded-xl border p-3 text-left transition lg:min-w-0 ${
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                              }`}
                            >
                              <span className="block text-sm font-bold">
                                Day {day.dayNumber}
                              </span>
                              <span
                                className={`mt-1 block text-xs ${
                                  selected
                                    ? "text-blue-100"
                                    : "text-slate-400"
                                }`}
                              >
                                {formatDate(day.date)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </aside>

                    {/* Activities panel */}
                    <div className="min-w-0">
                      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                            Daily plan
                          </span>
                          <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Day {activeItinerary?.dayNumber} activities
                          </h2>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(activeItinerary?.date)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowAddActivity((previous) => !previous);
                            setActivityError("");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <span>{showAddActivity ? "−" : "+"}</span>
                          {showAddActivity
                            ? "Close form"
                            : "Add activity"}
                        </button>
                      </div>

                      {/* Add activity form */}
                      {showAddActivity && (
                        <form
                          onSubmit={handleAddActivity}
                          className="mb-6 space-y-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-6"
                        >
                          <div>
                            <h3 className="font-bold text-slate-900">
                              Add a new activity
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Add the details to your daily itinerary.
                            </p>
                          </div>

                          {activityError && (
                            <p
                              role="alert"
                              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                            >
                              {activityError}
                            </p>
                          )}

                          <div>
                            <label className={labelClass}>
                              Activity title *
                            </label>
                            <input
                              type="text"
                              value={activityForm.title}
                              onChange={(event) =>
                                setActivityForm((previous) => ({
                                  ...previous,
                                  title: event.target.value,
                                }))
                              }
                              placeholder="e.g. Visit the local market"
                              maxLength={150}
                              className={inputClass}
                              required
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              Activity type
                            </label>
                            <select
                              value={activityForm.activityType}
                              onChange={(event) =>
                                setActivityForm((previous) => ({
                                  ...previous,
                                  activityType: event.target.value,
                                }))
                              }
                              className={inputClass}
                            >
                              {activityTypes.map((type) => (
                                <option key={type} value={type}>
                                  {typeEmoji[type]} {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                              <label className={labelClass}>
                                Start time
                              </label>
                              <input
                                type="time"
                                value={activityForm.startTime}
                                onChange={(event) =>
                                  setActivityForm((previous) => ({
                                    ...previous,
                                    startTime: event.target.value,
                                  }))
                                }
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <label className={labelClass}>
                                End time
                              </label>
                              <input
                                type="time"
                                min={activityForm.startTime || undefined}
                                value={activityForm.endTime}
                                onChange={(event) =>
                                  setActivityForm((previous) => ({
                                    ...previous,
                                    endTime: event.target.value,
                                  }))
                                }
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                              <label className={labelClass}>
                                Location
                              </label>
                              <input
                                type="text"
                                value={activityForm.location}
                                onChange={(event) =>
                                  setActivityForm((previous) => ({
                                    ...previous,
                                    location: event.target.value,
                                  }))
                                }
                                placeholder="Place or address"
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <label className={labelClass}>
                                Estimated cost (₹)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={activityForm.estimatedCost}
                                onChange={(event) =>
                                  setActivityForm((previous) => ({
                                    ...previous,
                                    estimatedCost: event.target.value,
                                  }))
                                }
                                placeholder="Optional"
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div>
                            <label className={labelClass}>Notes</label>
                            <textarea
                              rows={3}
                              maxLength={1000}
                              value={activityForm.notes}
                              onChange={(event) =>
                                setActivityForm((previous) => ({
                                  ...previous,
                                  notes: event.target.value,
                                }))
                              }
                              placeholder="Add any important details..."
                              className={`${inputClass} resize-y`}
                            />
                          </div>

                          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                            <button
                              type="button"
                              disabled={savingActivity}
                              onClick={() => {
                                setShowAddActivity(false);
                                setActivityError("");
                              }}
                              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-1"
                            >
                              Cancel
                            </button>

                            <button
                              type="submit"
                              disabled={savingActivity}
                              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-[2]"
                            >
                              {savingActivity
                                ? "Saving activity..."
                                : "Save activity"}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Activities list */}
                      {currentActivities.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                          <div className="text-3xl">📋</div>
                          <h3 className="mt-3 font-bold text-slate-800">
                            No activities for this day
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            Add activities to organize your schedule.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {currentActivities.map((activity) => (
                            <article
                              key={getId(activity)}
                              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                  {typeEmoji[activity.activityType] || "📌"}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h3 className="break-words font-bold text-slate-900">
                                    {activity.title || "Untitled activity"}
                                  </h3>
                                  <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                    {activity.activityType || "OTHER"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  disabled={
                                    deletingActivityId !== null
                                  }
                                  onClick={() =>
                                    handleDeleteActivity(getId(activity))
                                  }
                                  className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                >
                                  {String(deletingActivityId) ===
                                  String(getId(activity))
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                                {activity.startTime && (
                                  <span>
                                    🕒 {activity.startTime}
                                    {activity.endTime
                                      ? ` – ${activity.endTime}`
                                      : ""}
                                  </span>
                                )}

                                {activity.location && (
                                  <span className="break-words">
                                    📍 {activity.location}
                                  </span>
                                )}

                                {activity.estimatedCost != null && (
                                  <span className="font-bold text-emerald-700">
                                    {formatMoney(activity.estimatedCost)}
                                  </span>
                                )}
                              </div>

                              {activity.notes && (
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                                  {activity.notes}
                                </p>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MEMBERS TAB */}
            {activeMainTab === "members" && (
              <div className="space-y-6">
                {isOwner && (
                  <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        ✉️
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900">
                          Invite a member
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Invite a registered TripNest user.
                        </p>
                      </div>
                    </div>

                    {inviteSuccess && (
                      <p
                        role="status"
                        className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                      >
                        {inviteSuccess}
                      </p>
                    )}

                    {inviteError && (
                      <p
                        role="alert"
                        className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                      >
                        {inviteError}
                      </p>
                    )}

                    <form
                      onSubmit={handleInvite}
                      className="flex flex-col gap-3 sm:flex-row"
                    >
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(event) =>
                          setInviteEmail(event.target.value)
                        }
                        placeholder="friend@example.com"
                        className={inputClass}
                        required
                      />

                      <button
                        type="submit"
                        disabled={inviteLoading}
                        className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {inviteLoading ? "Sending..." : "Send invite"}
                      </button>
                    </form>
                  </section>
                )}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Trip members
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        People collaborating on this journey.
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                      {members.length} total
                    </span>
                  </div>

                  {members.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="text-4xl">👥</div>
                      <p className="mt-3 font-semibold text-slate-800">
                        No members yet
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {isOwner
                          ? "Invite someone to plan this trip together."
                          : "There are no members to display."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => {
                        const memberId = getId(member);
                        const isCurrentUser =
                          (member.email || "").toLowerCase() ===
                          currentEmail;
                        const isAdmin = member.role === "ADMIN";

                        return (
                          <div
                            key={memberId}
                            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                {member.name?.charAt(0)?.toUpperCase() ||
                                  "?"}
                              </div>

                              <div className="min-w-0">
                                <p className="break-words text-sm font-bold text-slate-800">
                                  {member.name || "Trip member"}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs font-medium text-blue-600">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="mt-1 break-all text-xs text-slate-500">
                                  {member.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:justify-end">
                              <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                  isAdmin
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-white text-slate-600"
                                }`}
                              >
                                {isAdmin ? "👑 Admin" : "👤 Member"}
                              </span>

                              {isOwner && !isCurrentUser && (
                                <button
                                  type="button"
                                  disabled={removingMemberId !== null}
                                  onClick={() =>
                                    handleRemoveMember(memberId)
                                  }
                                  className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                >
                                  {String(removingMemberId) ===
                                  String(memberId)
                                    ? "Removing..."
                                    : "Remove"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* EXPENSES TAB */}
            {activeMainTab === "expenses" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Manage expenses",
                    description:
                      "Add expenses, track costs and review your trip budget.",
                    icon: "💰",
                    color: "bg-emerald-50",
                    path: `/trips/${id}/expenses`,
                  },
                  {
                    title: "Expense settlement",
                    description:
                      "Review shared expenses and see who owes whom.",
                    icon: "💸",
                    color: "bg-blue-50",
                    path: `/trips/${id}/settlement`,
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-6"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${item.color}`}
                    >
                      {item.icon}
                    </div>

                    <h3 className="mt-5 font-bold text-slate-900 transition group-hover:text-blue-700">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                      Open section <span>→</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeMainTab === "documents" && (
              <button
                type="button"
                onClick={() => navigate(`/trips/${id}/documents`)}
                className="group flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:p-6"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  📂
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-slate-900 transition group-hover:text-blue-700">
                    Documents and photos
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Manage your travel documents, booking confirmations,
                    tickets and trip photos.
                  </p>
                </div>

                <span className="text-sm font-semibold text-blue-600">
                  Open documents →
                </span>
              </button>
            )}
          </div>
        </section>

        {/* Bottom section */}
        <section className="relative mt-8 overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8">
          <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-blue-500/10" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Keep your trip organized
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Review your itinerary, coordinate with your group and
                keep important travel information together.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/trips")}
              className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-50"
            >
              All trips <span className="ml-1">→</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TripDetail;