import api from "../utils/api";

const notificationService = {
    // Get all notifications
    getNotifications: async () => {
        const response = await api.get("/api/notifications");
        return response.data;
    },

    // Get only unread notifications
    getUnreadNotifications: async () => {
        const response = await api.get("/api/notifications/unread");
        return response.data;
    },

    // Get unread notification count
    getUnreadCount: async () => {
        const response = await api.get("/api/notifications/count");
        return response.data;
    },

    // Mark one notification as read
    markAsRead: async (id) => {
        const response = await api.patch(
            `/api/notifications/${id}/read`
        );
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.patch(
            "/api/notifications/read-all"
        );
        return response.data;
    },

    // Delete notification
    deleteNotification: async (id) => {
        const response = await api.delete(
            `/api/notifications/${id}`
        );
        return response.data;
    },

    // Create manual notification
    createNotification: async (data) => {
        const response = await api.post(
            "/api/notifications",
            data
        );
        return response.data;
    }
};

export default notificationService;