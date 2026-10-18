
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./TravelerAnalytics.css";

const API = "http://localhost:8080/api/reports";

const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken") ||
    localStorage.getItem("accessToken");

const money = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);

const readList = (response) => {
    const data = response.data;
    if (Array.isArray(data)) return data;

    // Support APIs that wrap results in an object.
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.content)) return data.content;

    return [];
};

const categoryName = (value) =>
    String(value || "Uncategorized")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function TravelerAnalytics() {
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [trends, setTrends] = useState([]);
    const [trips, setTrips] = useState([]);
    const [period, setPeriod] = useState("month");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        setError("");

        const token = getToken();
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};

        const requests = [
            {
                name: "Category expenses",
                request: () =>
                    axios.get(`${API}/expenses/categories`, config),
                setter: setCategories,
            },
            {
                name: "Budget vs. actual",
                request: () =>
                    axios.get(`${API}/budget-vs-actual`, config),
                setter: setBudgets,
            },
            {
                name: "Spending trends",
                request: () =>
                    axios.get(`${API}/trends`, {
                        ...config,
                        params: { period },
                    }),
                setter: setTrends,
            },
            {
                name: "Trip activity",
                request: () =>
                    axios.get(`${API}/trips/trends`, config),
                setter: setTrips,
            },
        ];

        try {
            const results = await Promise.allSettled(
                requests.map((item) => item.request())
            );

            const failures = [];

            results.forEach((result, index) => {
                if (result.status === "fulfilled") {
                    requests[index].setter(readList(result.value));
                } else {
                    console.error(
                        `${requests[index].name} failed:`,
                        result.reason
                    );
                    requests[index].setter([]);
                    failures.push(requests[index].name);
                }
            });

            if (failures.length) {
                setError(`Unable to load: ${failures.join(", ")}.`);
            }
        } catch (err) {
            console.error("Analytics loading error:", err);
            setError("Unable to load analytics. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const totalSpent = categories.reduce(
        (sum, item) => sum + (Number(item.totalSpent) || 0),
        0
    );

    const expenseCount = categories.reduce(
        (sum, item) => sum + (Number(item.expenseCount) || 0),
        0
    );

    const getPlanned = (item) =>
        (Number(item.plannedTransportation) || 0) +
        (Number(item.plannedHotel) || 0) +
        (Number(item.plannedFood) || 0) +
        (Number(item.plannedShopping) || 0) +
        (Number(item.plannedEntertainment) || 0) +
        (Number(item.plannedMiscellaneous) || 0);

    const getActual = (item) =>
        (Number(item.actualTransportation) || 0) +
        (Number(item.actualHotel) || 0) +
        (Number(item.actualFood) || 0) +
        (Number(item.actualShopping) || 0) +
        (Number(item.actualEntertainment) || 0) +
        (Number(item.actualMiscellaneous) || 0);

    const plannedTotal = budgets.reduce(
        (sum, item) => sum + getPlanned(item),
        0
    );

    const actualTotal = budgets.reduce(
        (sum, item) => sum + getActual(item),
        0
    );

    const maxCategory = Math.max(
        1,
        ...categories.map((item) => Number(item.totalSpent) || 0)
    );

    const maxTrend = Math.max(
        1,
        ...trends.map((item) => Number(item.totalSpent) || 0)
    );

    return (
        <section className="ta-page">
            <header className="ta-header">
                <div>
                    <span className="ta-eyebrow">TRIPNEST INSIGHTS</span>
                    <h1>Traveler Analytics</h1>
                    <p>
                        Understand your travel expenses, budgets, and trip activity.
                    </p>
                </div>

                <button
                    className="ta-refresh"
                    onClick={loadAnalytics}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "↻ Refresh"}
                </button>
            </header>

            {error && <div className="ta-error">{error}</div>}

            {loading ? (
                <div className="ta-empty">Loading your analytics...</div>
            ) : (
                <>
                    <div className="ta-stats">
                        <article className="ta-stat">
                            <span className="ta-icon">₹</span>
                            <p>Total recorded spending</p>
                            <h2>{money(totalSpent)}</h2>
                            <small>Recorded category expenses</small>
                        </article>

                        <article className="ta-stat">
                            <span className="ta-icon">▤</span>
                            <p>Recorded expenses</p>
                            <h2>{expenseCount}</h2>
                            <small>Number of expense entries</small>
                        </article>

                        <article className="ta-stat">
                            <span className="ta-icon">✈</span>
                            <p>Trips with activity</p>
                            <h2>{trips.length}</h2>
                            <small>Trips returned by the activity API</small>
                        </article>

                        <article className="ta-stat">
                            <span className="ta-icon">◷</span>
                            <p>Budget remaining</p>
                            <h2>{money(plannedTotal - actualTotal)}</h2>
                            <small>Planned minus recorded spending</small>
                        </article>
                    </div>

                    <div className="ta-grid">
                        <article className="ta-panel">
                            <h2>Expense Breakdown</h2>
                            <p className="ta-subtitle">Recorded spending by category</p>

                            {categories.length === 0 ? (
                                <div className="ta-empty">
                                    No category report data is available.
                                </div>
                            ) : (
                                categories.map((item, index) => {
                                    const amount = Number(item.totalSpent) || 0;

                                    return (
                                        <div
                                            className="ta-category"
                                            key={item.category || index}
                                        >
                                            <div className="ta-category-label">
                                                <span>{categoryName(item.category)}</span>
                                                <strong>{money(amount)}</strong>
                                            </div>

                                            <div className="ta-track">
                                                <div
                                                    className="ta-bar"
                                                    style={{
                                                        width: `${(amount / maxCategory) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </article>

                        <article className="ta-panel">
                            <h2>Budget vs. Actual</h2>
                            <p className="ta-subtitle">
                                Planned budget compared with recorded expenses
                            </p>

                            <div className="ta-budget-summary">
                                <div>
                                    <span>Planned</span>
                                    <strong>{money(plannedTotal)}</strong>
                                </div>
                                <div>
                                    <span>Actual</span>
                                    <strong>{money(actualTotal)}</strong>
                                </div>
                            </div>

                            {budgets.length === 0 ? (
                                <div className="ta-empty">
                                    No budget comparison data is available.
                                </div>
                            ) : (
                                budgets.map((item, index) => {
                                    const planned = getPlanned(item);
                                    const actual = getActual(item);

                                    return (
                                        <div
                                            className="ta-category"
                                            key={item.tripId ?? index}
                                        >
                                            <div className="ta-category-label">
                                                <span>
                                                    {item.tripTitle || `Trip ${item.tripId ?? ""}`}
                                                </span>
                                                <strong>
                                                    {money(actual)} / {money(planned)}
                                                </strong>
                                            </div>

                                            <div className="ta-track">
                                                <div
                                                    className={`ta-bar ${actual > planned ? "ta-over" : ""
                                                        }`}
                                                    style={{
                                                        width: `${planned > 0
                                                                ? Math.min(100, (actual / planned) * 100)
                                                                : actual > 0
                                                                    ? 100
                                                                    : 0
                                                            }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </article>

                        <article className="ta-panel">
                            <div className="ta-panel-heading">
                                <div>
                                    <h2>Spending Trends</h2>
                                    <p className="ta-subtitle">
                                        Recorded spending over time
                                    </p>
                                </div>

                                <select
                                    value={period}
                                    onChange={(event) => setPeriod(event.target.value)}
                                    aria-label="Spending trend period"
                                >
                                    <option value="week">Weekly</option>
                                    <option value="month">Monthly</option>
                                </select>
                            </div>

                            {trends.length === 0 ? (
                                <div className="ta-empty">
                                    No spending trend data is available.
                                </div>
                            ) : (
                                trends.map((item, index) => {
                                    const amount = Number(item.totalSpent) || 0;

                                    return (
                                        <div
                                            className="ta-category"
                                            key={`${item.period || "period"}-${index}`}
                                        >
                                            <div className="ta-category-label">
                                                <span>{item.period || "Period"}</span>
                                                <strong>{money(amount)}</strong>
                                            </div>

                                            <div className="ta-track">
                                                <div
                                                    className="ta-bar"
                                                    style={{
                                                        width: `${(amount / maxTrend) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </article>

                        <article className="ta-panel">
                            <h2>Trip Activity</h2>
                            <p className="ta-subtitle">
                                Recorded expenses for each trip
                            </p>

                            {trips.length === 0 ? (
                                <div className="ta-empty">
                                    No trip activity data is available.
                                </div>
                            ) : (
                                trips.map((trip, index) => (
                                    <div
                                        className="ta-trip-row"
                                        key={trip.tripId ?? index}
                                    >
                                        <div>
                                            <strong>
                                                {trip.tripTitle ||
                                                    `Trip ${trip.tripId ?? index + 1}`}
                                            </strong>
                                            <small>
                                                {Number(trip.expenseCount) || 0} expenses
                                            </small>
                                        </div>
                                        <strong>{money(trip.totalSpent)}</strong>
                                    </div>
                                ))
                            )}
                        </article>
                    </div>
                </>
            )}
        </section>
    );
}
