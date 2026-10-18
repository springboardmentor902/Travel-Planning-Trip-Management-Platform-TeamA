
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

const API = "http://localhost:8080/api/admin";

function getRole(user) {
    const rawRole =
        user?.roleName ||
        user?.role?.name ||
        user?.role?.roleName ||
        user?.role?.authority ||
        user?.role ||
        "";

    return String(rawRole).replace(/^ROLE_/i, "").toUpperCase();
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTrips: 0,
        totalExpenses: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const role = getRole(user);
    const isWebsiteAdmin = role === "ADMIN";

    const loadStats = useCallback(async () => {
        setLoading(true);
        setError("");

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");

        if (!token) {
            setError("Please log in to access the website admin dashboard.");
            setLoading(false);
            return;
        }

        if (!isWebsiteAdmin) {
            setError(
                role === "GROUP_ADMIN"
                    ? "You are a Group Admin, not a website administrator. Use group management instead."
                    : "Access denied. Only website administrators can view this dashboard."
            );
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API}/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setStats({
                totalUsers: Number(response.data?.totalUsers) || 0,
                totalTrips: Number(response.data?.totalTrips) || 0,
                totalExpenses: Number(response.data?.totalExpenses) || 0,
            });
        } catch (err) {
            console.error("Admin stats error:", err);

            if (err.response?.status === 401) {
                setError("Your session is invalid or expired. Please log in again.");
            } else if (err.response?.status === 403) {
                setError(
                    "The backend rejected this account. Verify that it has the ADMIN role and ROLE_ADMIN authority."
                );
            } else {
                setError(
                    "Could not load platform statistics. Check that the backend is running."
                );
            }
        } finally {
            setLoading(false);
        }
    }, [isWebsiteAdmin, role]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const cards = [
        {
            label: "Registered Users",
            value: stats.totalUsers,
            icon: "👥",
            description: "All registered accounts",
        },
        {
            label: "Total Trips",
            value: stats.totalTrips,
            icon: "✈️",
            description: "Trips across the platform",
        },
        {
            label: "Recorded Expenses",
            value: stats.totalExpenses,
            icon: "₹",
            description: "Expense entries across all trips",
        },
    ];

    return (
        <div className="admin-dashboard">
            <header className="admin-topbar">
                <Link to="/admin-dashboard" className="admin-brand">
                    ✈ TripNest <span>ADMIN</span>
                </Link>

                <div className="admin-actions">
                    {isWebsiteAdmin ? (
                        <span className="admin-user-link">
                            {user?.name || user?.email || "Website Admin"}
                        </span>
                    ) : (
                        <Link to="/groups" className="admin-user-link">
                            Group Management
                        </Link>
                    )}

                    <button onClick={loadStats} disabled={loading}>
                        {loading ? "Loading..." : "↻ Refresh"}
                    </button>

                    <button onClick={() => navigate("/dashboard")}>
                        Traveler Dashboard
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <section className="admin-welcome">
                    <span className="admin-eyebrow">PLATFORM OVERVIEW</span>
                    <h1>Website Admin Dashboard</h1>
                    <p>
                        Monitor users, trips, and activity across TripNest.
                    </p>
                </section>

                {error && (
                    <div className="admin-error">
                        <span>{error}</span>

                        {error.includes("log in") ||
                            error.includes("session") ? (
                            <button onClick={() => navigate("/login")}>
                                Go to Login
                            </button>
                        ) : null}

                        {role === "GROUP_ADMIN" && (
                            <button onClick={() => navigate("/groups")}>
                                Go to Groups
                            </button>
                        )}
                    </div>
                )}

                <section className="admin-stats-grid">
                    {cards.map((card) => (
                        <article
                            className="admin-stat-card"
                            key={card.label}
                        >
                            <div className="admin-stat-icon">
                                {card.icon}
                            </div>

                            <p>{card.label}</p>

                            <h2>
                                {loading
                                    ? "..."
                                    : card.value.toLocaleString("en-IN")}
                            </h2>

                            <small>{card.description}</small>
                        </article>
                    ))}
                </section>

                <section className="admin-info-panel">
                    <div>
                        <h2>Platform Summary</h2>
                        <p>
                            These figures are loaded from the backend and
                            include platform-wide records, not just the
                            currently logged-in user's records.
                        </p>
                    </div>

                    <div className="admin-info-icon">📊</div>
                </section>
            </main>
        </div>
    );
}
