import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import notificationService from "../services/notificationService";

const NotificationBell = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    /*
     * =========================================================
     * LOAD UNREAD NOTIFICATIONS
     * =========================================================
     */

    const loadNotifications = useCallback(async () => {

        try {

            const data =
                await notificationService.getUnreadNotifications();

            const list = Array.isArray(data)
                ? data
                : [];

            setNotifications(list);
            setUnreadCount(list.length);

        } catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

        }

    }, []);


    /*
     * =========================================================
     * INITIAL LOAD + EVERY 5 SECONDS
     * =========================================================
     */

    useEffect(() => {

        loadNotifications();

        const interval = setInterval(() => {
            loadNotifications();
        }, 5000);

        return () => {
            clearInterval(interval);
        };

    }, [loadNotifications]);


    /*
     * =========================================================
     * REFRESH WHEN ROUTE CHANGES
     *
     * Dashboard → Budget
     * Budget → Expenses
     * Expenses → Trips
     * etc.
     * =========================================================
     */

    useEffect(() => {

        loadNotifications();

    }, [location.pathname, loadNotifications]);


    /*
     * =========================================================
     * REFRESH WHEN USER RETURNS TO TAB
     * =========================================================
     */

    useEffect(() => {

        const handleVisibilityChange = () => {

            if (
                document.visibilityState === "visible"
            ) {
                loadNotifications();
            }

        };

        const handleWindowFocus = () => {
            loadNotifications();
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        window.addEventListener(
            "focus",
            handleWindowFocus
        );

        return () => {

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            window.removeEventListener(
                "focus",
                handleWindowFocus
            );

        };

    }, [loadNotifications]);


    /*
     * =========================================================
     * BELL CLICK
     * =========================================================
     */

    const handleBellClick = async () => {

        // Always fetch latest notifications
        await loadNotifications();

        setShowPopup((previous) => !previous);

    };


    /*
     * =========================================================
     * OPEN ONE NOTIFICATION
     * =========================================================
     */

    const handleNotificationClick = async (
        notification
    ) => {

        try {

            const alreadyRead =
                notification.isRead === true ||
                notification.read === true;

            if (!alreadyRead) {

                await notificationService.markAsRead(
                    notification.id
                );

            }

            // Immediately refresh unread list
            await loadNotifications();

            setShowPopup(false);

            // Go to notifications page
            navigate("/notifications");

        } catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

            setShowPopup(false);

            navigate("/notifications");

        }

    };


    /*
     * =========================================================
     * MARK ALL AS READ
     * =========================================================
     */

    const handleMarkAllRead = async () => {

        try {

            setLoading(true);

            await notificationService.markAllAsRead();

            // Clear current unread notifications
            setNotifications([]);
            setUnreadCount(0);

            // Fetch again to make sure backend is updated
            await loadNotifications();

        } catch (error) {

            console.error(
                "Failed to mark all notifications as read:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    /*
     * =========================================================
     * NOTIFICATION MESSAGE
     * =========================================================
     */

    const getMessage = (notification) => {

        return (
            notification.message ||
            notification.title ||
            "You have a new notification"
        );

    };


    /*
     * =========================================================
     * NOTIFICATION TYPE
     * =========================================================
     */

    const getType = (notification) => {

        return (
            notification.notificationType ||
            notification.type ||
            "SYSTEM"
        );

    };


    /*
     * =========================================================
     * ICON
     * =========================================================
     */

    const getIcon = (notification) => {

        const type = getType(notification);

        switch (type) {

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
            default:
                return "🔔";
        }

    };


    /*
     * =========================================================
     * DATE FORMAT
     * =========================================================
     */

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        try {

            return new Date(date).toLocaleString();

        } catch {

            return "";

        }

    };


    /*
     * =========================================================
     * UI
     * =========================================================
     */

    return (

        <div
            style={{
                position: "relative",
                display: "inline-flex"
            }}
        >

            {/* ================= BELL ================= */}

            <button
                type="button"
                onClick={handleBellClick}
                title="Notifications"
                aria-label="Notifications"
                style={{
                    position: "relative",
                    width: "48px",
                    height: "48px",
                    minWidth: "48px",
                    borderRadius: "50%",
                    border: "1px solid #dbe3ef",
                    backgroundColor: "#ffffff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "23px",
                    padding: 0,
                    margin: 0,
                    boxShadow:
                        "0 3px 10px rgba(37, 99, 235, 0.12)",
                    zIndex: 9999
                }}
            >

                🔔

                {/* ================= COUNT ================= */}

                {unreadCount > 0 && (

                    <span
                        style={{
                            position: "absolute",
                            top: "-3px",
                            right: "-3px",
                            minWidth: "20px",
                            height: "20px",
                            padding: "0 5px",
                            borderRadius: "999px",
                            backgroundColor: "#ef4444",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #ffffff"
                        }}
                    >
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>

                )}

            </button>


            {/* ================= POPUP ================= */}

            {showPopup && (

                <div
                    style={{
                        position: "absolute",
                        top: "58px",
                        right: 0,
                        width: "360px",
                        maxHeight: "450px",
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        boxShadow:
                            "0 10px 30px rgba(0,0,0,0.18)",
                        border:
                            "1px solid #e5e7eb",
                        overflow: "hidden",
                        zIndex: 10000
                    }}
                >

                    {/* ================= HEADER ================= */}

                    <div
                        style={{
                            padding: "14px 16px",
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            borderBottom:
                                "1px solid #e5e7eb"
                        }}
                    >

                        <strong
                            style={{
                                fontSize: "16px",
                                color: "#111827"
                            }}
                        >
                            Notifications
                        </strong>


                        {unreadCount > 0 && (

                            <button
                                type="button"
                                onClick={
                                    handleMarkAllRead
                                }
                                disabled={loading}
                                style={{
                                    border: "none",
                                    background: "none",
                                    color: "#2563eb",
                                    cursor: loading
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}
                            >
                                {loading
                                    ? "Updating..."
                                    : "Mark all read"}
                            </button>

                        )}

                    </div>


                    {/* ================= LIST ================= */}

                    <div
                        style={{
                            maxHeight: "350px",
                            overflowY: "auto"
                        }}
                    >

                        {notifications.length === 0 ? (

                            <div
                                style={{
                                    padding:
                                        "35px 20px",
                                    textAlign: "center",
                                    color: "#6b7280"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "30px",
                                        marginBottom: "8px"
                                    }}
                                >
                                    🔔
                                </div>

                                <div>
                                    No new notifications
                                </div>

                            </div>

                        ) : (

                            notifications.map(
                                (notification) => (

                                    <button
                                        key={
                                            notification.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            border: "none",
                                            borderBottom:
                                                "1px solid #f1f5f9",
                                            backgroundColor:
                                                "#ffffff",
                                            padding:
                                                "13px 15px",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            display: "flex",
                                            gap: "12px"
                                        }}
                                    >

                                        {/* ICON */}

                                        <span
                                            style={{
                                                fontSize:
                                                    "20px"
                                            }}
                                        >
                                            {getIcon(
                                                notification
                                            )}
                                        </span>


                                        {/* CONTENT */}

                                        <span
                                            style={{
                                                flex: 1
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    color:
                                                        "#111827",
                                                    fontSize:
                                                        "13px",
                                                    lineHeight:
                                                        "1.4"
                                                }}
                                            >
                                                {getMessage(
                                                    notification
                                                )}
                                            </span>


                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    marginTop:
                                                        "5px",
                                                    color:
                                                        "#9ca3af",
                                                    fontSize:
                                                        "11px"
                                                }}
                                            >
                                                {formatDate(
                                                    notification.createdAt
                                                )}
                                            </span>

                                        </span>

                                    </button>

                                )
                            )

                        )}

                    </div>


                    {/* ================= VIEW ALL ================= */}

                    <button
                        type="button"
                        onClick={() => {

                            setShowPopup(false);

                            navigate(
                                "/notifications"
                            );

                        }}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "none",
                            borderTop:
                                "1px solid #e5e7eb",
                            backgroundColor:
                                "#f8fafc",
                            color: "#2563eb",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        View all notifications
                    </button>

                </div>

            )}

        </div>

    );

};

export default NotificationBell;