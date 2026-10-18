import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { budgetAPI, expenseAPI } from "../utils/api";

const Budget = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();

    const [budget, setBudget] = useState(null);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        totalAmount: "",
        currency: "INR",
        transportationBudget: "",
        hotelBudget: "",
        foodBudget: "",
        shoppingBudget: "",
        entertainmentBudget: "",
        miscBudget: "",
    });

    // ==============================
    // LOAD BUDGET
    // ==============================

    useEffect(() => {
        if (!tripId) {
            setError("Trip ID is missing.");
            setLoading(false);
            return;
        }

        loadBudget();
    }, [tripId]);

    const loadBudget = async () => {
        try {
            setLoading(true);
            setError("");

            let budgetData = null;
            let expenseSummaryData = null;

            // Load the saved budget.
            try {
                const response = await budgetAPI.get(tripId);
                budgetData = response.data;
            } catch (err) {
                console.log("No budget found yet.");
            }

            // IMPORTANT:
            // Spending is calculated from the Expense API because
            // the Expenses page uses this same summary successfully.
            try {
                const response = await expenseAPI.getSummary(tripId);
                expenseSummaryData = response.data;
            } catch (err) {
                console.log("No expense summary available yet.");
            }

            setBudget(budgetData);
            setSummary(expenseSummaryData);

            // Fill form if budget exists.
            if (budgetData) {
                setForm({
                    totalAmount: budgetData.totalAmount ?? "",
                    currency: budgetData.currency ?? "INR",
                    transportationBudget:
                        budgetData.transportationBudget ?? "",
                    hotelBudget: budgetData.hotelBudget ?? "",
                    foodBudget: budgetData.foodBudget ?? "",
                    shoppingBudget:
                        budgetData.shoppingBudget ?? "",
                    entertainmentBudget:
                        budgetData.entertainmentBudget ?? "",
                    miscBudget: budgetData.miscBudget ?? "",
                });
            }
        } catch (err) {
            console.error("Budget loading failed:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load budget."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==============================
    // FORM CHANGE
    // ==============================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ==============================
    // SAVE BUDGET
    // ==============================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!tripId) {
            setError("Trip ID is missing.");
            return;
        }

        if (
            !form.totalAmount ||
            Number(form.totalAmount) <= 0
        ) {
            setError("Please enter a valid total budget.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const data = {
                totalAmount: Number(form.totalAmount),

                currency: form.currency || "INR",

                transportationBudget:
                    Number(form.transportationBudget) || 0,

                hotelBudget:
                    Number(form.hotelBudget) || 0,

                foodBudget:
                    Number(form.foodBudget) || 0,

                shoppingBudget:
                    Number(form.shoppingBudget) || 0,

                entertainmentBudget:
                    Number(form.entertainmentBudget) || 0,

                miscBudget:
                    Number(form.miscBudget) || 0,
            };

            if (budget) {
                await budgetAPI.update(tripId, data);
                setSuccess("Budget updated successfully.");
            } else {
                await budgetAPI.create(tripId, data);
                setSuccess("Budget created successfully.");
            }

            await loadBudget();
        } catch (err) {
            console.error("Budget save failed:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to save budget."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==============================
    // DELETE BUDGET
    // ==============================

    const handleDelete = async () => {
        if (!budget) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this budget?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await budgetAPI.delete(tripId);

            setBudget(null);
            setSummary(null);

            setForm({
                totalAmount: "",
                currency: "INR",
                transportationBudget: "",
                hotelBudget: "",
                foodBudget: "",
                shoppingBudget: "",
                entertainmentBudget: "",
                miscBudget: "",
            });

            setSuccess("Budget deleted successfully.");
        } catch (err) {
            console.error("Budget delete failed:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to delete budget."
            );
        }
    };

    // ==============================
    // MONEY FORMAT
    // ==============================

    const money = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        })}`;
    };

    // Budget comes from Budget API.
    const totalBudget = Number(
        budget?.totalAmount ?? 0
    );

    // Spending comes from Expense API summary.
    const totalSpent = Number(
        summary?.totalSpent ?? 0
    );

    // Always calculate these from the two current values so the
    // Budget page immediately reflects newly added/deleted expenses.
    const remainingBudget =
        totalBudget - totalSpent;

    const spentPercentage =
        totalBudget > 0
            ? (totalSpent / totalBudget) * 100
            : 0;

    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <div style={styles.page}>
                <Navbar />

                <div style={styles.loadingContainer}>
                    <div style={styles.loadingIcon}>💰</div>

                    <h2>Loading Budget...</h2>

                    <p>
                        Please wait while we load your trip budget.
                    </p>
                </div>
            </div>
        );
    }

    // ==============================
    // PAGE
    // ==============================

    return (
        <div style={styles.page}>
            <Navbar />

            <main style={styles.container}>

                {/* HEADER */}

                <section style={styles.header}>
                    <div>
                        <div style={styles.badge}>
                            💰
                        </div>

                        <h1 style={styles.title}>
                            Trip Budget
                        </h1>

                        <p style={styles.subtitle}>
                            Manage your budget and track your spending
                            for Trip #{tripId}.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate(`/trips/${tripId}/expenses`)
                        }
                        style={styles.expenseButton}
                    >
                        💳 Manage Expenses →
                    </button>
                </section>

                {/* ERROR */}

                {error && (
                    <div style={styles.error}>
                        ⚠️ {error}
                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div style={styles.success}>
                        ✓ {success}
                    </div>
                )}

                {/* SUMMARY */}

                <section style={styles.summaryGrid}>

                    <div style={styles.card}>
                        <span style={styles.cardIcon}>💰</span>

                        <div>
                            <p style={styles.cardLabel}>
                                Total Budget
                            </p>

                            <h2 style={styles.cardValue}>
                                {money(totalBudget)}
                            </h2>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <span style={styles.cardIcon}>💸</span>

                        <div>
                            <p style={styles.cardLabel}>
                                Total Spent
                            </p>

                            <h2 style={styles.cardValue}>
                                {money(totalSpent)}
                            </h2>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <span style={styles.cardIcon}>🏦</span>

                        <div>
                            <p style={styles.cardLabel}>
                                Remaining
                            </p>

                            <h2 style={styles.cardValue}>
                                {money(remainingBudget)}
                            </h2>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <span style={styles.cardIcon}>📊</span>

                        <div>
                            <p style={styles.cardLabel}>
                                Used
                            </p>

                            <h2 style={styles.cardValue}>
                                {spentPercentage.toFixed(1)}%
                            </h2>
                        </div>
                    </div>

                </section>

                {/* PROGRESS */}

                <section style={styles.progressCard}>

                    <div style={styles.progressHeader}>
                        <strong>Budget Usage</strong>

                        <span>
                            {spentPercentage.toFixed(1)}%
                        </span>
                    </div>

                    <div style={styles.progressBackground}>
                        <div
                            style={{
                                ...styles.progressBar,
                                width: `${Math.min(
                                    spentPercentage,
                                    100
                                )}%`,
                            }}
                        />
                    </div>

                    <div style={styles.progressFooter}>
                        <span>
                            Spent: {money(totalSpent)}
                        </span>

                        <span>
                            Budget: {money(totalBudget)}
                        </span>
                    </div>

                </section>

                {/* BUDGET FORM */}

                <section style={styles.formCard}>

                    <div style={styles.sectionTitle}>
                        <div>
                            <h2>
                                {budget
                                    ? "Update Trip Budget"
                                    : "Set Trip Budget"}
                            </h2>

                            <p>
                                Enter your total budget and category-wise
                                allocation.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* TOTAL */}

                        <div style={styles.formGrid}>

                            <div style={styles.field}>
                                <label>
                                    Total Budget *
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    name="totalAmount"
                                    value={form.totalAmount}
                                    onChange={handleChange}
                                    placeholder="15000"
                                />
                            </div>

                            <div style={styles.field}>
                                <label>
                                    Currency
                                </label>

                                <select
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                >
                                    <option value="INR">
                                        INR - ₹
                                    </option>

                                    <option value="USD">
                                        USD - $
                                    </option>

                                    <option value="EUR">
                                        EUR - €
                                    </option>
                                </select>
                            </div>

                        </div>

                        <h3 style={styles.categoryHeading}>
                            Category Allocation
                        </h3>

                        <div style={styles.formGrid}>

                            <div style={styles.field}>
                                <label>
                                    🚗 Transportation
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="transportationBudget"
                                    value={
                                        form.transportationBudget
                                    }
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div style={styles.field}>
                                <label>
                                    🏨 Hotel
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="hotelBudget"
                                    value={form.hotelBudget}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div style={styles.field}>
                                <label>
                                    🍔 Food
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="foodBudget"
                                    value={form.foodBudget}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div style={styles.field}>
                                <label>
                                    🛍️ Shopping
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="shoppingBudget"
                                    value={
                                        form.shoppingBudget
                                    }
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div style={styles.field}>
                                <label>
                                    🎯 Entertainment
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="entertainmentBudget"
                                    value={
                                        form.entertainmentBudget
                                    }
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div style={styles.field}>
                                <label>
                                    📦 Miscellaneous
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="miscBudget"
                                    value={form.miscBudget}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                        </div>

                        {/* BUTTONS */}

                        <div style={styles.actions}>

                            {budget && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    style={styles.deleteButton}
                                >
                                    🗑️ Delete Budget
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                style={styles.saveButton}
                            >
                                {saving
                                    ? "Saving..."
                                    : budget
                                        ? "Update Budget"
                                        : "Save Budget"}
                            </button>

                        </div>

                    </form>
                </section>

                {/* NAVIGATION */}

                <div style={styles.bottomNavigation}>

                    <button
                        onClick={() => navigate("/trips")}
                        style={styles.secondaryButton}
                    >
                        ← My Trips
                    </button>

                    <button
                        onClick={() =>
                            navigate(`/trips/${tripId}/expenses`)
                        }
                        style={styles.primaryButton}
                    >
                        View Expenses →
                    </button>

                </div>

            </main>
        </div>
    );
};

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#172033",
    },

    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "35px 25px 60px",
    },

    loadingContainer: {
        maxWidth: "700px",
        margin: "100px auto",
        textAlign: "center",
        background: "#fff",
        padding: "60px",
        borderRadius: "25px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },

    loadingIcon: {
        fontSize: "55px",
    },

    header: {
        background:
            "linear-gradient(135deg, #f59e0b, #f97316)",
        color: "#fff",
        borderRadius: "25px",
        padding: "35px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "25px",
        boxShadow: "0 15px 35px rgba(249,115,22,0.2)",
    },

    badge: {
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "1px",
        opacity: 0.9,
    },

    title: {
        fontSize: "38px",
        margin: "8px 0",
    },

    subtitle: {
        margin: 0,
        opacity: 0.9,
    },

    expenseButton: {
        border: "none",
        background: "#fff",
        color: "#ea580c",
        padding: "14px 20px",
        borderRadius: "14px",
        fontWeight: "700",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },

    error: {
        marginTop: "20px",
        padding: "15px 18px",
        background: "#fee2e2",
        color: "#b91c1c",
        borderRadius: "14px",
    },

    success: {
        marginTop: "20px",
        padding: "15px 18px",
        background: "#dcfce7",
        color: "#15803d",
        borderRadius: "14px",
    },

    summaryGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginTop: "25px",
    },

    card: {
        background: "#fff",
        borderRadius: "20px",
        padding: "22px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow: "0 8px 25px rgba(15,23,42,0.05)",
    },

    cardIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: "#fff7ed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "23px",
    },

    cardLabel: {
        margin: 0,
        color: "#64748b",
        fontSize: "13px",
    },

    cardValue: {
        margin: "5px 0 0",
        fontSize: "23px",
    },

    progressCard: {
        background: "#fff",
        borderRadius: "20px",
        padding: "25px",
        marginTop: "20px",
        boxShadow: "0 8px 25px rgba(15,23,42,0.05)",
    },

    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px",
    },

    progressBackground: {
        height: "12px",
        background: "#e2e8f0",
        borderRadius: "20px",
        overflow: "hidden",
    },

    progressBar: {
        height: "100%",
        background:
            "linear-gradient(90deg, #f59e0b, #f97316)",
        borderRadius: "20px",
        transition: "width 0.4s ease",
    },

    progressFooter: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "10px",
        fontSize: "13px",
        color: "#64748b",
    },

    formCard: {
        background: "#fff",
        borderRadius: "25px",
        padding: "30px",
        marginTop: "20px",
        boxShadow: "0 8px 25px rgba(15,23,42,0.05)",
    },

    sectionTitle: {
        marginBottom: "25px",
    },

    categoryHeading: {
        marginTop: "30px",
        marginBottom: "18px",
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
    },

    field: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },

    actions: {
        marginTop: "30px",
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        flexWrap: "wrap",
    },

    saveButton: {
        border: "none",
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#fff",
        padding: "13px 24px",
        borderRadius: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    deleteButton: {
        border: "1px solid #fecaca",
        background: "#fff",
        color: "#dc2626",
        padding: "13px 20px",
        borderRadius: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    bottomNavigation: {
        marginTop: "25px",
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
    },

    primaryButton: {
        border: "none",
        background: "#4f46e5",
        color: "#fff",
        padding: "13px 20px",
        borderRadius: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    secondaryButton: {
        border: "1px solid #dbe3ef",
        background: "#fff",
        color: "#334155",
        padding: "13px 20px",
        borderRadius: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },
};

export default Budget;