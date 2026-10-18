
import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import groupService from "../services/groupService";
import { tripAPI } from "../utils/api";

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [groupName, setGroupName] = useState("");
    const [tripId, setTripId] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getErrorMessage = (err, fallback) =>
        err.response?.data?.message ||
        err.response?.data?.error ||
        fallback;

    const getCurrentUserEmail = () => {
        const directEmail = localStorage.getItem("email");

        if (directEmail) {
            return directEmail.trim().toLowerCase();
        }

        try {
            const user = JSON.parse(
                localStorage.getItem("user") || "null"
            );

            return user?.email
                ? user.email.trim().toLowerCase()
                : "";
        } catch {
            return "";
        }
    };

    const getCurrentMembership = (group) => {
        if (!Array.isArray(group?.members)) {
            return null;
        }

        const email = getCurrentUserEmail();
        if (!email) return null;

        return (
            group.members.find((member) => {
                const memberEmail =
                    member?.email ||
                    member?.userEmail ||
                    member?.user?.email ||
                    "";

                return (
                    memberEmail.trim().toLowerCase() === email
                );
            }) || null
        );
    };

    const isPending = (group) => {
        const membership = getCurrentMembership(group);

        return (
            membership?.status?.toUpperCase() === "PENDING" ||
            group?.status?.toUpperCase() === "PENDING" ||
            group?.invitationStatus?.toUpperCase() === "PENDING"
        );
    };

    const isGroupCreator = (group) => {
        const email = getCurrentUserEmail();

        const creatorEmail =
            group?.createdBy?.email ||
            group?.creator?.email ||
            group?.createdByEmail ||
            "";

        return (
            email !== "" &&
            creatorEmail.toString().trim().toLowerCase() === email
        );
    };

    const loadGroups = useCallback(async () => {
        const response = await groupService.getAll();

        setGroups(
            Array.isArray(response.data) ? response.data : []
        );
    }, []);

    const loadTrips = useCallback(async () => {
        try {
            setLoadingTrips(true);

            const response = await tripAPI.getAll();

            setTrips(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Failed to load trips:", err);
            setError(
                getErrorMessage(err, "Unable to load your trips.")
            );
        } finally {
            setLoadingTrips(false);
        }
    }, []);

    const refreshPageData = useCallback(async () => {
        setError("");

        try {
            await Promise.all([loadGroups(), loadTrips()]);
        } catch (err) {
            console.error("Failed to load groups:", err);
            setError(
                getErrorMessage(err, "Unable to load groups.")
            );
        } finally {
            setLoading(false);
        }
    }, [loadGroups, loadTrips]);

    useEffect(() => {
        refreshPageData();
    }, [refreshPageData]);

    // ------------------------------------------------------------
    // CREATE GROUP: A trip must be selected.
    // ------------------------------------------------------------

    const createGroup = async (e) => {
        e.preventDefault();

        if (!groupName.trim()) {
            setError("Enter a group name.");
            return;
        }

        if (!tripId) {
            setError("Please select a trip for this group.");
            return;
        }

        const selectedTrip = trips.find(
            (trip) => String(trip.id) === String(tripId)
        );

        if (!selectedTrip) {
            setError("Selected trip was not found. Refresh and try again.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const response = await groupService.create({
                name: groupName.trim(),
                tripId: Number(tripId),
            });

            console.log("Created group:", response.data);

            setGroupName("");
            setTripId("");

            await loadGroups();

            setSuccess(
                `Group created and linked to "${selectedTrip.title}". You can now invite travellers.`
            );
        } catch (err) {
            console.error("Group creation failed:", err);
            setError(
                getErrorMessage(err, "Failed to create group.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------------------------------------------------
    // INVITE MEMBER
    // ------------------------------------------------------------

    const inviteMember = async (group) => {
        if (!inviteEmail.trim()) {
            setError("Enter your friend's email.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await groupService.invite(
                group.id,
                inviteEmail.trim()
            );

            setInviteEmail("");
            setSelectedGroup(null);

            await loadGroups();

            setSuccess("Invitation sent successfully.");
        } catch (err) {
            console.error("Invitation failed:", err);
            setError(
                getErrorMessage(err, "Failed to send invitation.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------------------------------------------------
    // ACCEPT INVITATION
    // ------------------------------------------------------------

    const acceptInvite = async (groupId) => {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await groupService.accept(groupId);

            // Refresh the group membership and the trip list.
            await Promise.all([loadGroups(), loadTrips()]);

            setSuccess(
                "Invitation accepted. Your linked trip list has been refreshed."
            );
        } catch (err) {
            console.error("Accept invitation failed:", err);
            setError(
                getErrorMessage(err, "Failed to accept invitation.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------------------------------------------------
    // DECLINE INVITATION
    // ------------------------------------------------------------

    const declineInvite = async (groupId) => {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await groupService.decline(groupId);
            await loadGroups();

            setSuccess("Invitation declined.");
        } catch (err) {
            console.error("Decline invitation failed:", err);
            setError(
                getErrorMessage(err, "Failed to decline invitation.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------------------------------------------------
    // REMOVE MEMBER
    // ------------------------------------------------------------

    const removeMember = async (groupId, memberId) => {
        if (!window.confirm("Remove this member from the group?")) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await groupService.removeMember(groupId, memberId);
            await loadGroups();

            setSuccess("Member removed successfully.");
        } catch (err) {
            console.error("Remove member failed:", err);
            setError(
                getErrorMessage(err, "Failed to remove member.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------------------------------------------------
    // DELETE GROUP
    // ------------------------------------------------------------

    const deleteGroup = async (id) => {
        if (!window.confirm("Delete this group?")) return;

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await groupService.delete(id);

            setGroups((previous) =>
                previous.filter((group) => group.id !== id)
            );

            if (selectedGroup?.id === id) {
                setSelectedGroup(null);
            }

            setSuccess("Group deleted successfully.");
        } catch (err) {
            console.error("Group delete failed:", err);
            setError(
                getErrorMessage(err, "Failed to delete group.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------------------------------------------------
    // LOADING
    // ------------------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6">
                    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-12 text-center">
                        <div className="animate-pulse text-4xl">👥</div>
                        <p className="mt-4 text-slate-500">
                            Loading groups...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // ------------------------------------------------------------
    // MAIN PAGE
    // ------------------------------------------------------------

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6">
                <section className="rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-7 text-white shadow-lg sm:p-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-violet-100">
                        👥 Group Travel
                    </p>

                    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                        Travel Groups
                    </h1>

                    <p className="mt-3 text-sm text-violet-100 sm:text-base">
                        Link trips to groups, invite companions, and
                        manage your travel members.
                    </p>
                </section>

                {error && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                        <span>✓</span>
                        <p>{success}</p>
                    </div>
                )}

                {/* CREATE GROUP */}

                <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-xl">
                            👥
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Create a Group
                            </h2>
                            <p className="text-sm text-slate-500">
                                Select the trip that this group will share.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={createGroup}
                        className="mt-6 grid gap-4 md:grid-cols-3"
                    >
                        <input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Group name"
                            required
                            maxLength={100}
                            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                        />

                        <select
                            value={tripId}
                            onChange={(e) => setTripId(e.target.value)}
                            required
                            disabled={loadingTrips || trips.length === 0}
                            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="">
                                {loadingTrips
                                    ? "Loading trips..."
                                    : trips.length === 0
                                        ? "No trips available"
                                        : "Select a trip"}
                            </option>

                            {trips.map((trip) => (
                                <option key={trip.id} value={trip.id}>
                                    {trip.title || "Untitled trip"}
                                    {trip.destination
                                        ? ` — ${trip.destination}`
                                        : ""}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            disabled={submitting || loadingTrips || trips.length === 0}
                            className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Please wait..." : "+ Create Group"}
                        </button>
                    </form>

                    {trips.length === 0 && !loadingTrips && (
                        <p className="mt-3 text-sm text-amber-700">
                            Create a trip first, then return here to create
                            its group.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={loadTrips}
                        disabled={loadingTrips}
                        className="mt-3 text-sm font-medium text-violet-700 hover:underline"
                    >
                        {loadingTrips ? "Refreshing trips..." : "Refresh trips"}
                    </button>
                </section>

                {/* GROUP LIST */}

                <section className="mt-10">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                Your Groups
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Invite members and respond to invitations.
                            </p>
                        </div>

                        <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                            {groups.length} group{groups.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {groups.length === 0 ? (
                        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-12 text-center">
                            <div className="text-6xl">🌍</div>
                            <h3 className="mt-5 text-xl font-bold text-slate-800">
                                No groups yet
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Create a group linked to a trip and invite
                                your travel companions.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-6 lg:grid-cols-2">
                            {groups.map((group) => {
                                const pending = isPending(group);
                                const membership = getCurrentMembership(group);
                                const creator = isGroupCreator(group);

                                const linkedTrip =
                                    group.trip ||
                                    group.tripResponse ||
                                    null;

                                const linkedTripName = linkedTrip
                                    ? `${linkedTrip.title || "Trip"}${linkedTrip.destination
                                        ? ` — ${linkedTrip.destination}`
                                        : ""
                                    }`
                                    : group.tripId
                                        ? `Trip #${group.tripId}`
                                        : "No trip linked";

                                return (
                                    <div
                                        key={group.id}
                                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="flex justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-xl">
                                                    👥
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800">
                                                        {group.name || "Travel Group"}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        Group #{group.id}
                                                    </p>
                                                </div>
                                            </div>

                                            {creator && (
                                                <button
                                                    type="button"
                                                    disabled={submitting}
                                                    onClick={() => deleteGroup(group.id)}
                                                    className="text-sm font-semibold text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                                                Linked trip
                                            </p>
                                            <p className="mt-1 font-semibold text-indigo-900">
                                                {linkedTripName}
                                            </p>
                                        </div>

                                        {/* PENDING INVITATION */}

                                        {pending && (
                                            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                                                <p className="font-semibold text-amber-800">
                                                    📩 Group Invitation
                                                </p>
                                                <p className="mt-1 text-sm text-amber-700">
                                                    You have been invited to join{" "}
                                                    <strong>{group.name}</strong>.
                                                </p>

                                                <div className="mt-4 flex gap-3">
                                                    <button
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() => acceptInvite(group.id)}
                                                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                    >
                                                        ✓ Accept
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() => declineInvite(group.id)}
                                                        className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        ✕ Decline
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* INVITE MEMBER */}

                                        {!pending && creator && (
                                            <div className="mt-6">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Invite a member
                                                </p>

                                                <div className="flex gap-2">
                                                    <input
                                                        value={
                                                            selectedGroup?.id === group.id
                                                                ? inviteEmail
                                                                : ""
                                                        }
                                                        onChange={(e) => {
                                                            setSelectedGroup(group);
                                                            setInviteEmail(e.target.value);
                                                        }}
                                                        placeholder="Friend's email"
                                                        type="email"
                                                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                                                    />

                                                    <button
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() => inviteMember(group)}
                                                        className="rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                                                    >
                                                        Invite
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* MEMBERS */}

                                        {Array.isArray(group.members) &&
                                            group.members.length > 0 && (
                                                <div className="mt-6">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Members
                                                        </p>
                                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                                            {group.members.length}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 space-y-2">
                                                        {group.members.map((member) => {
                                                            const email =
                                                                member?.email ||
                                                                member?.userEmail ||
                                                                member?.user?.email ||
                                                                "";

                                                            const name =
                                                                member?.name ||
                                                                member?.user?.name ||
                                                                email ||
                                                                "Member";

                                                            const status =
                                                                member?.status?.toUpperCase() ||
                                                                "";

                                                            const currentUser =
                                                                email &&
                                                                email.trim().toLowerCase() ===
                                                                getCurrentUserEmail();

                                                            return (
                                                                <div
                                                                    key={
                                                                        member.id ||
                                                                        email ||
                                                                        `${group.id}-${name}`
                                                                    }
                                                                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"
                                                                >
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-medium text-slate-700">
                                                                            {name}
                                                                            {currentUser ? " (You)" : ""}
                                                                        </p>
                                                                        {email && (
                                                                            <p className="truncate text-xs text-slate-400">
                                                                                {email}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex shrink-0 items-center gap-2">
                                                                        {status === "PENDING" && (
                                                                            <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-600">
                                                                                Pending
                                                                            </span>
                                                                        )}

                                                                        {status === "ACCEPTED" && (
                                                                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-600">
                                                                                Accepted
                                                                            </span>
                                                                        )}

                                                                        {creator && member.id && !currentUser && (
                                                                            <button
                                                                                type="button"
                                                                                disabled={submitting}
                                                                                onClick={() =>
                                                                                    removeMember(
                                                                                        group.id,
                                                                                        member.id
                                                                                    )
                                                                                }
                                                                                className="text-xs text-red-500 hover:text-red-700"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                        {!group.members?.length && (
                                            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-center">
                                                <p className="text-sm text-slate-500">
                                                    No members yet. Invite your
                                                    friends to this group.
                                                </p>
                                            </div>
                                        )}

                                        {membership?.status?.toUpperCase() === "ACCEPTED" && (
                                            <p className="mt-4 text-sm font-medium text-emerald-700">
                                                ✓ You are a member of this group.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Groups;
