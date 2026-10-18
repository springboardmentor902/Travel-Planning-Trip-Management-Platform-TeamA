import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Notifications.css";

const Notifications = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [markingAll, setMarkingAll] = useState(false);

    // ---------------------------------------------------------
    // LOAD NOTIFICATIONS
    // ---------------------------------------------------------
    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/notifications");

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setNotifications(data);
        } catch (err) {
            console.error("Failed to load notifications:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to load notifications."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // INITIAL LOAD
    // ---------------------------------------------------------
    useEffect(() => {
        loadNotifications();
    }, []);

    // ---------------------------------------------------------
    // MARK SINGLE NOTIFICATION AS READ
    // ---------------------------------------------------------
    const markAsRead = async (notification) => {
        if (!notification || notification.read) {
            return;
        }

        try {
            await api.patch(
                `/api/notifications/${notification.id}/read`
            );

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id
                        ? { ...item, read: true }
                        : item
                )
            );
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    // ---------------------------------------------------------
    // MARK ALL AS READ
    // ---------------------------------------------------------
    const markAllAsRead = async () => {
        if (notifications.length === 0) {
            return;
        }

        const unreadExists = notifications.some(
            (notification) => !notification.read
        );

        if (!unreadExists) {
            return;
        }

        try {
            setMarkingAll(true);

            await api.patch("/api/notifications/read-all");

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    read: true,
                }))
            );
        } catch (err) {
            console.error(
                "Failed to mark all notifications as read:",
                err
            );

            setError("Unable to mark all notifications as read.");
        } finally {
            setMarkingAll(false);
        }
    };

    // ---------------------------------------------------------
    // DELETE NOTIFICATION
    // ---------------------------------------------------------
    const deleteNotification = async (id) => {
        if (!id) {
            return;
        }

        try {
            await api.delete(`/api/notifications/${id}`);

            setNotifications((previous) =>
                previous.filter(
                    (notification) => notification.id !== id
                )
            );
        } catch (err) {
            console.error(
                "Failed to delete notification:",
                err
            );

            setError("Unable to delete notification.");
        }
    };

    // ---------------------------------------------------------
    // DELETE ALL LOCALLY
    // ---------------------------------------------------------
    const clearAllNotifications = async () => {
        if (notifications.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete all notifications?"
        );

        if (!confirmed) {
            return;
        }

        try {
            // Backend currently provides delete-by-id,
            // so delete each notification individually.
            await Promise.all(
                notifications.map((notification) =>
                    api.delete(
                        `/api/notifications/${notification.id}`
                    )
                )
            );

            setNotifications([]);
        } catch (err) {
            console.error(
                "Failed to clear notifications:",
                err
            );

            setError(
                "Some notifications could not be deleted."
            );

            // Reload from backend to keep UI accurate.
            loadNotifications();
        }
    };

    // ---------------------------------------------------------
    // FORMAT DATE
    // ---------------------------------------------------------
    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ---------------------------------------------------------
    // NOTIFICATION ICON
    // ---------------------------------------------------------
    const getNotificationIcon = (type) => {
        switch (String(type || "").toUpperCase()) {
            case "TRIP_REMINDER":
                return "✈️";

            case "ACTIVITY_REMINDER":
                return "📅";

            case "BUDGET_ALERT":
                return "💰";

            case "GROUP_INVITATION":
                return "👥";

            case "TRAVEL_UPDATE":
                return "🌍";

            case "SYSTEM":
                return "🔔";

            default:
                return "🔔";
        }
    };

    // ---------------------------------------------------------
    // NOTIFICATION TYPE LABEL
    // ---------------------------------------------------------
    const getNotificationType = (type) => {
        switch (String(type || "").toUpperCase()) {
            case "TRIP_REMINDER":
                return "Trip Reminder";

            case "ACTIVITY_REMINDER":
                return "Activity Reminder";

            case "BUDGET_ALERT":
                return "Budget Alert";

            case "GROUP_INVITATION":
                return "Group Invitation";

            case "TRAVEL_UPDATE":
                return "Travel Update";

            case "SYSTEM":
                return "System";

            default:
                return "Notification";
        }
    };

    // ---------------------------------------------------------
    // COUNTS
    // ---------------------------------------------------------
    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    // ---------------------------------------------------------
    // LOADING
    // ---------------------------------------------------------
    if (loading) {
        return (
            <div className="notifications-page">
                <div className="notifications-container">
                    <div className="notifications-loading">
                        <div className="notifications-spinner"></div>

                        <h3>Loading notifications...</h3>

                        <p>
                            Please wait while we fetch your
                            latest updates.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // PAGE
    // ---------------------------------------------------------
    return (
        <div className="notifications-page">
            <div className="notifications-container">

                {/* HEADER */}
                <div className="notifications-header">

                    <div className="notifications-title-section">

                        <button
                            className="notifications-back-button"
                            onClick={() => navigate(-1)}
                        >
                            ← Back
                        </button>

                        <div className="notifications-title-row">
                            <div className="notifications-title-icon">
                                🔔
                            </div>

                            <div>
                                <h1>Notifications</h1>

                                <p>
                                    Stay updated with your
                                    trips and travel activities.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="notifications-header-actions">

                        {unreadCount > 0 && (
                            <button
                                className="mark-all-button"
                                onClick={markAllAsRead}
                                disabled={markingAll}
                            >
                                {markingAll
                                    ? "Marking..."
                                    : "✓ Mark all as read"}
                            </button>
                        )}

                        {notifications.length > 0 && (
                            <button
                                className="clear-all-button"
                                onClick={clearAllNotifications}
                            >
                                🗑 Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="notifications-error">
                        <span>⚠️</span>
                        <span>{error}</span>

                        <button
                            onClick={() => {
                                setError("");
                                loadNotifications();
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* SUMMARY */}
                <div className="notifications-summary">

                    <div className="summary-card">
                        <div className="summary-icon">
                            🔔
                        </div>

                        <div>
                            <span className="summary-label">
                                Total
                            </span>

                            <strong>
                                {notifications.length}
                            </strong>
                        </div>
                    </div>

                    <div className="summary-card unread-summary">
                        <div className="summary-icon">
                            📩
                        </div>

                        <div>
                            <span className="summary-label">
                                Unread
                            </span>

                            <strong>
                                {unreadCount}
                            </strong>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon">
                            ✅
                        </div>

                        <div>
                            <span className="summary-label">
                                Read
                            </span>

                            <strong>
                                {notifications.length -
                                    unreadCount}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* EMPTY STATE */}
                {notifications.length === 0 ? (
                    <div className="notifications-empty">

                        <div className="empty-icon">
                            🔔
                        </div>

                        <h2>No notifications yet</h2>

                        <p>
                            You're all caught up!
                            New trip reminders, activity
                            updates, budget alerts and other
                            notifications will appear here.
                        </p>

                        <button
                            className="empty-back-button"
                            onClick={() => navigate("/trips")}
                        >
                            ✈️ Go to My Trips
                        </button>
                    </div>
                ) : (
                    /* NOTIFICATION LIST */
                    <div className="notifications-list">

                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-card ${notification.read
                                        ? "notification-read"
                                        : "notification-unread"
                                    }`}
                            >

                                {/* ICON */}
                                <div className="notification-icon">
                                    {getNotificationIcon(
                                        notification.type
                                    )}
                                </div>

                                {/* CONTENT */}
                                <div
                                    className="notification-content"
                                    onClick={() =>
                                        markAsRead(notification)
                                    }
                                >
                                    <div className="notification-top">

                                        <div className="notification-title-wrapper">

                                            <h3>
                                                {notification.title ||
                                                    "Notification"}
                                            </h3>

                                            {!notification.read && (
                                                <span className="unread-dot"></span>
                                            )}
                                        </div>

                                        <span className="notification-type">
                                            {getNotificationType(
                                                notification.type
                                            )}
                                        </span>
                                    </div>

                                    <p className="notification-message">
                                        {notification.message ||
                                            "You have a new notification."}
                                    </p>

                                    <div className="notification-time">
                                        🕒{" "}
                                        {formatDate(
                                            notification.createdAt
                                        )}
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="notification-actions">

                                    {!notification.read && (
                                        <button
                                            className="read-button"
                                            title="Mark as read"
                                            onClick={() =>
                                                markAsRead(
                                                    notification
                                                )
                                            }
                                        >
                                            ✓
                                        </button>
                                    )}

                                    <button
                                        className="delete-notification-button"
                                        title="Delete notification"
                                        onClick={() =>
                                            deleteNotification(
                                                notification.id
                                            )
                                        }
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;