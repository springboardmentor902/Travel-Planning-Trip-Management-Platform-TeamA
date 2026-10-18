import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import "./Reports.css";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler
);

const API = axios.create({
    baseURL: "http://localhost:8080",
});

API.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const CATEGORIES = [
    "TRANSPORTATION",
    "HOTEL",
    "FOOD",
    "SHOPPING",
    "ENTERTAINMENT",
    "MISCELLANEOUS",
];

const CATEGORY_LABELS = {
    TRANSPORTATION: "Transportation",
    HOTEL: "Hotel",
    FOOD: "Food",
    SHOPPING: "Shopping",
    ENTERTAINMENT: "Entertainment",
    MISCELLANEOUS: "Miscellaneous",
};

const COLORS = [
    "#6366f1",
    "#14b8a6",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#64748b",
];

const money = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "bottom",
            labels: {
                usePointStyle: true,
                padding: 18,
            },
        },
        tooltip: {
            callbacks: {
                label(context) {
                    return `${context.dataset.label || context.label}: ${money(
                        context.raw
                    )}`;
                },
            },
        },
    },
};

function getErrorMessage(error) {
    const status = error?.response?.status;
    const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error;

    if (backendMessage) {
        return `${backendMessage} (HTTP ${status || "error"})`;
    }

    if (status === 400) {
        return "Invalid request parameters. Check the backend period parameter.";
    }

    if (status === 401) {
        return "Your session may have expired. Log in again.";
    }

    if (status === 403) {
        return "You do not have permission to access this report.";
    }

    if (status) {
        return `Request failed with HTTP ${status}.`;
    }

    return "Could not connect to the backend.";
}

function EmptyState({ children }) {
    return <div className="report-empty">{children}</div>;
}

export default function Reports() {
    const [categories, setCategories] = useState([]);
    const [budgetReports, setBudgetReports] = useState([]);
    const [spendingTrends, setSpendingTrends] = useState([]);
    const [tripTrends, setTripTrends] = useState([]);

    const [period, setPeriod] = useState("MONTH");
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadReports = useCallback(async () => {
        setLoading(true);
        setErrors([]);

        const requests = [
            {
                name: "Category expenses",
                run: () => API.get("/api/reports/expenses/categories"),
                save: setCategories,
            },
            {
                name: "Budget vs. actual",
                run: () => API.get("/api/reports/budget-vs-actual"),
                save: setBudgetReports,
            },
            {
                name: "Spending trends",
                run: () =>
                    API.get("/api/reports/trends", {
                        params: {
                            period: period.toUpperCase(),
                        },
                    }),
                save: setSpendingTrends,
            },
            {
                name: "Trip activity",
                run: () => API.get("/api/reports/trips/trends"),
                save: setTripTrends,
            },
        ];

        const results = await Promise.allSettled(
            requests.map((request) => request.run())
        );

        const failed = [];

        results.forEach((result, index) => {
            const request = requests[index];

            if (result.status === "fulfilled") {
                const data = result.value.data;

                request.save(Array.isArray(data) ? data : []);

                console.log(
                    `[Reports] ${request.name}:`,
                    data
                );
            } else {
                failed.push({
                    name: request.name,
                    message: getErrorMessage(result.reason),
                });

                console.error(
                    `[Reports] ${request.name} failed:`,
                    result.reason?.response?.data || result.reason
                );
            }
        });

        setErrors(failed);
        setLastUpdated(new Date());
        setLoading(false);
    }, [period]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const categoryMap = Object.fromEntries(
        categories.map((item) => [
            item.category,
            Number(item.totalSpent) || 0,
        ])
    );

    const totalSpent = categories.reduce(
        (sum, item) => sum + (Number(item.totalSpent) || 0),
        0
    );

    const totalExpenses = categories.reduce(
        (sum, item) => sum + (Number(item.expenseCount) || 0),
        0
    );

    // Expected trend item: { period: "...", totalSpent: number }
    // Expected trip item: { period: "...", totalSpent: number }
    // Adjust the field names if your backend returns a different DTO.
    const totalTrips = tripTrends.reduce(
        (sum, item) => sum + (Number(item.totalSpent) || 0),
        0
    );

    const categoryData = {
        labels: CATEGORIES.map(
            (category) => CATEGORY_LABELS[category]
        ),
        datasets: [
            {
                label: "Actual spending",
                data: CATEGORIES.map(
                    (category) => categoryMap[category] || 0
                ),
                backgroundColor: COLORS,
                borderWidth: 0,
                hoverOffset: 7,
            },
        ],
    };

    const trendData = {
        labels: spendingTrends.map(
            (item) => item.period ?? item.date ?? ""
        ),
        datasets: [
            {
                label: "Spending",
                data: spendingTrends.map(
                    (item) => Number(item.totalSpent) || 0
                ),
                borderColor: "#6366f1",
                backgroundColor: "rgba(99, 102, 241, 0.13)",
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const tripData = {
        labels: tripTrends.map(
            (item) => item.period ?? item.date ?? ""
        ),
        datasets: [
            {
                label: "Trips created",
                data: tripTrends.map(
                    (item) =>
                        Number(item.tripCount ?? item.totalSpent) || 0
                ),
                backgroundColor: "#14b8a6",
                borderRadius: 6,
                maxBarThickness: 48,
            },
        ],
    };

    /*
     * The budget API must return both planned and actual category totals
     * before this comparison chart can display accurate data.
     *
     * Expected structure:
     * {
     *   tripId: 1,
     *   tripTitle: "Trip name",
     *   planned: { FOOD: 5000, HOTEL: 10000, ... },
     *   actual: { FOOD: 1200, HOTEL: 0, ... }
     * }
     */
    const budgetRows = [];

    budgetReports.forEach((trip) => {
        const planned = trip.planned;
        const actual = trip.actual;

        if (!planned || !actual) {
            return;
        }

        CATEGORIES.forEach((category) => {
            budgetRows.push({
                label: `${trip.tripTitle || `Trip ${trip.tripId}`} - ${CATEGORY_LABELS[category]
                    }`,
                planned: Number(planned[category]) || 0,
                actual: Number(actual[category]) || 0,
            });
        });
    });

    const budgetData = {
        labels: budgetRows.map((item) => item.label),
        datasets: [
            {
                label: "Planned budget",
                data: budgetRows.map((item) => item.planned),
                backgroundColor: "#818cf8",
                borderRadius: 4,
            },
            {
                label: "Actual spending",
                data: budgetRows.map((item) => item.actual),
                backgroundColor: "#f59e0b",
                borderRadius: 4,
            },
        ],
    };

    return (
        <main className="reports-page">
            <header className="reports-header">
                <div className="reports-heading">
                    <p className="reports-eyebrow">
                        TRIPNEST ANALYTICS
                    </p>

                    <h1>Reports &amp; Charts</h1>

                    <p className="reports-subtitle">
                        Understand your travel spending and track your trip activity.
                    </p>

                    {lastUpdated && (
                        <p className="reports-updated">
                            Last refreshed: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    className="reports-refresh"
                    onClick={loadReports}
                    disabled={loading}
                >
                    {loading ? "Loading reports..." : "↻ Refresh"}
                </button>
            </header>

            {errors.length > 0 && (
                <section className="reports-error" role="alert">
                    <strong>Some reports could not be loaded.</strong>

                    <ul>
                        {errors.map((error) => (
                            <li key={error.name}>
                                <strong>{error.name}:</strong> {error.message}
                            </li>
                        ))}
                    </ul>

                    <p>Open the browser console for technical details.</p>
                </section>
            )}

            {loading && (
                <div className="reports-loading">
                    <span className="reports-spinner" />
                    Loading your reports...
                </div>
            )}

            <section className="reports-stats">
                <article className="report-stat">
                    <span className="stat-icon">₹</span>
                    <p>Total recorded spending</p>
                    <h2>{money(totalSpent)}</h2>
                    <small>Based on recorded expense totals</small>
                </article>

                <article className="report-stat">
                    <span className="stat-icon">▤</span>
                    <p>Recorded expenses</p>
                    <h2>{totalExpenses}</h2>
                    <small>Number of recorded expense entries</small>
                </article>

                <article className="report-stat">
                    <span className="stat-icon">✈</span>
                    <p>Trips created</p>
                    <h2>{totalTrips}</h2>
                    <small>Based on trip activity data</small>
                </article>
            </section>

            <section className="reports-grid">
                <article className="report-card">
                    <div className="report-card-heading">
                        <div>
                            <h2>Expense breakdown</h2>
                            <p>Recorded spending by category</p>
                        </div>
                    </div>

                    {categories.length === 0 ? (
                        <EmptyState>
                            No category report data is available.
                        </EmptyState>
                    ) : totalSpent > 0 ? (
                        <div className="report-chart report-doughnut">
                            <Doughnut
                                data={categoryData}
                                options={{
                                    ...chartOptions,
                                    cutout: "66%",
                                }}
                            />
                        </div>
                    ) : (
                        <EmptyState>
                            The API returned zero spending for every category.
                            Verify that expenses exist for your trips.
                        </EmptyState>
                    )}

                    <div className="category-list">
                        {CATEGORIES.map((category, index) => (
                            <div className="category-row" key={category}>
                                <span className="category-name">
                                    <i
                                        style={{
                                            backgroundColor: COLORS[index],
                                        }}
                                    />
                                    {CATEGORY_LABELS[category]}
                                </span>

                                <strong>
                                    {money(categoryMap[category] || 0)}
                                </strong>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="report-card">
                    <div className="report-card-heading">
                        <div>
                            <h2>Budget vs. actual</h2>
                            <p>Planned and recorded spending</p>
                        </div>
                    </div>

                    {budgetRows.length > 0 ? (
                        <div className="report-chart report-bar">
                            <Bar
                                data={budgetData}
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        x: {
                                            ticks: {
                                                autoSkip: true,
                                                maxRotation: 45,
                                                minRotation: 0,
                                            },
                                        },
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value) => `₹${value}`,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <EmptyState>
                            Your budget API must return planned and actual category
                            totals to display this comparison accurately.
                        </EmptyState>
                    )}
                </article>

                <article className="report-card report-card-wide">
                    <div className="report-card-heading">
                        <div>
                            <h2>Spending trends</h2>
                            <p>Recorded expenses over time</p>
                        </div>

                        <select
                            className="report-period"
                            value={period}
                            onChange={(event) =>
                                setPeriod(event.target.value)
                            }
                            aria-label="Choose spending trend period"
                        >
                            <option value="WEEK">Weekly</option>
                            <option value="MONTH">Monthly</option>
                        </select>
                    </div>

                    {spendingTrends.length > 0 ? (
                        <div className="report-chart report-line">
                            <Line
                                data={trendData}
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value) => `₹${value}`,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <EmptyState>
                            {errors.some(
                                (error) => error.name === "Spending trends"
                            )
                                ? "The spending trends API failed. Check the error message above."
                                : "No spending trend data is available for this period."}
                        </EmptyState>
                    )}
                </article>

                <article className="report-card report-card-wide">
                    <div className="report-card-heading">
                        <div>
                            <h2>Trip activity</h2>
                            <p>Trips created over time</p>
                        </div>
                    </div>

                    {tripTrends.length > 0 ? (
                        <div className="report-chart report-bar">
                            <Bar
                                data={tripData}
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                precision: 0,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <EmptyState>
                            No trip activity data is available yet.
                        </EmptyState>
                    )}
                </article>
            </section>
        </main>
    );
}
