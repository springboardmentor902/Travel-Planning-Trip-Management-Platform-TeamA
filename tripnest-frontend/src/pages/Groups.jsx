import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { groupAPI, tripAPI } from "../utils/api";

const initialForm = {
  name: "",
  description: "",
  tripId: "",
};

const Groups = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [inviteGroupId, setInviteGroupId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError("");

      const [groupRes, tripRes] = await Promise.all([
        groupAPI.getAll(),
        tripAPI.getAll(),
      ]);

      setGroups(groupRes.data || []);
      setTrips(tripRes.data || []);
    } catch (err) {
      console.error("Failed to load groups:", err);
      setError("Unable to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);

    try {
      await groupAPI.create({
        name: form.name.trim(),
        description: form.description.trim(),
        tripId: form.tripId ? Number(form.tripId) : null,
      });

      setForm(initialForm);
      setShowForm(false);
      await fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create group."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteGroupId || !inviteEmail.trim()) return;

    setInviting(true);

    try {
      await groupAPI.invite(inviteGroupId, inviteEmail.trim());

      setInviteGroupId(null);
      setInviteEmail("");
      alert("Invitation sent successfully!");
      await fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to send invitation."
      );
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) {
      return;
    }

    setDeletingId(id);

    try {
      await groupAPI.delete(id);
      await fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete group."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGroups = groups.filter((group) => {
    const query = search.toLowerCase();

    return (
      group.name?.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query) ||
      group.tripTitle?.toLowerCase().includes(query)
    );
  });

  const totalMembers = groups.reduce(
    (total, group) =>
      total + (group.memberCount ?? group.members?.length ?? 0),
    0
  );

  const closeCreateForm = () => {
    setShowForm(false);
    setForm(initialForm);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Header */}
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              TRAVEL TOGETHER
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Travel Groups
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Bring your travel companions together and organize your next
              adventure in one place.
            </p>
          </div>

          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <span className="text-lg leading-none">+</span>
            Create Group
          </button>
        </section>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Groups",
              value: groups.length,
              icon: "◎",
              color: "bg-blue-50 text-blue-600",
            },
            {
              label: "Group Members",
              value: totalMembers,
              icon: "♧",
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Linked Trips",
              value: groups.filter((group) => group.tripTitle).length,
              icon: "↗",
              color: "bg-violet-50 text-violet-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.color}`}
              >
                {stat.icon}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "—" : stat.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Create Group Form */}
        {showForm && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Create a new group
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Set up a shared space for your travel companions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCreateForm}
                  aria-label="Close create group form"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Group name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Manali Adventure"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Connect a trip
                  </label>

                  <select
                    value={form.tripId}
                    onChange={(e) =>
                      setForm({ ...form, tripId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">No trip selected</option>

                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="What is this group planning?"
                  rows={3}
                  maxLength={500}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Search and list heading */}
        <section className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your groups
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading your groups..."
                : `${filteredGroups.length} ${
                    filteredGroups.length === 1 ? "group" : "groups"
                  } found`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups..."
              aria-label="Search groups"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="self-start text-sm font-semibold text-red-700 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="mb-4 flex gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mb-5 h-3 w-full rounded bg-slate-100" />
                <div className="h-10 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center sm:px-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              {search ? "⌕" : "♧"}
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {search ? "No matching groups" : "Your travel circle starts here"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try a different search term to find your group."
                : "Create a group, connect a trip, and invite the people you want to travel with."}
            </p>

            {!search && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Create your first group
              </button>
            )}
          </div>
        ) : (
          /* Groups Grid */
          <div className="grid items-start gap-5 lg:grid-cols-2">
            {filteredGroups.map((group) => {
              const members = group.members || [];
              const memberCount =
                group.memberCount ?? members.length;

              return (
                <article
                  key={group.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="p-5 sm:p-6">
                    {/* Card Header */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-sm">
                        {group.name?.charAt(0)?.toUpperCase() || "G"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-lg font-bold text-slate-900 transition group-hover:text-blue-700">
                          {group.name}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {memberCount}{" "}
                          {memberCount === 1 ? "member" : "members"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-4 min-h-10 text-sm leading-6 text-slate-500">
                      {group.description || "A shared space for your next adventure."}
                    </p>

                    {/* Linked Trip */}
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                        ✈
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">
                          Linked trip
                        </p>
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {group.tripTitle || "No trip linked"}
                        </p>
                      </div>
                    </div>

                    {/* Members */}
                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Group members
                        </p>
                        <span className="text-xs text-slate-400">
                          {members.length > 0
                            ? `${members.length} shown`
                            : "No member details"}
                        </span>
                      </div>

                      {members.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {members.map((member) => {
                            const email = member.email || "Member";
                            const initial = email.charAt(0).toUpperCase();

                            return (
                              <div
                                key={member.id ?? member.email}
                                title={email}
                                className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-100 bg-white py-1 pl-1 pr-3"
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                  {initial}
                                </div>

                                <span className="max-w-36 truncate text-xs font-medium text-slate-600">
                                  {email}
                                </span>

                                {member.role && (
                                  <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                      member.role === "ADMIN"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {member.role}
                                  </span>
                                )}

                                {member.status === "PENDING" && (
                                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Invite people to start building your travel group.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                    <button
                      onClick={() => setInviteGroupId(group.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                    >
                      <span className="text-base">+</span>
                      Invite member
                    </button>

                    <button
                      onClick={() => handleDelete(group.id)}
                      disabled={deletingId === group.id}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === group.id ? "Deleting..." : "Delete group"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {inviteGroupId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !inviting) {
              setInviteGroupId(null);
              setInviteEmail("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">
                  ✉
                </div>

                <h2
                  id="invite-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Invite a member
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Send an invitation to join your travel group.
                </p>
              </div>

              <button
                type="button"
                disabled={inviting}
                onClick={() => {
                  setInviteGroupId(null);
                  setInviteEmail("");
                }}
                aria-label="Close invite modal"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite}>
              <label
                htmlFor="invite-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="invite-email"
                type="email"
                autoFocus
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
                className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={inviting}
                  onClick={() => {
                    setInviteGroupId(null);
                    setInviteEmail("");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {inviting ? "Sending..." : "Send invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;