import api from "../utils/api";

const groupService = {
    // Get all groups for the logged-in user
    getAll: () => {
        return api.get("/api/groups");
    },

    // Get one group
    getById: (groupId) => {
        return api.get(`/api/groups/${groupId}`);
    },

    // Get groups belonging to a particular trip
    getByTrip: (tripId) => {
        return api.get(`/api/groups/trip/${tripId}`);
    },

    // Create a new group
    create: (data) => {
        return api.post("/api/groups", data);
    },

    // Invite a user by email
    invite: (groupId, email) => {
        return api.post(
            `/api/groups/${groupId}/invite`,
            {
                email: email.trim(),
            }
        );
    },

    // Accept group invitation
    accept: (groupId) => {
        return api.patch(
            `/api/groups/${groupId}/accept`
        );
    },

    // Decline group invitation
    decline: (groupId) => {
        return api.patch(
            `/api/groups/${groupId}/decline`
        );
    },

    // Remove a member from a group
    removeMember: (groupId, memberId) => {
        return api.delete(
            `/api/groups/${groupId}/members/${memberId}`
        );
    },

    // Delete group
    delete: (groupId) => {
        return api.delete(
            `/api/groups/${groupId}`
        );
    },
};

export default groupService;