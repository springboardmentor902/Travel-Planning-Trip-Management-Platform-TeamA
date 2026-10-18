import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { expenseAPI } from "../utils/api";

const categories = [
    "TRANSPORTATION",
    "HOTEL",
    "FOOD",
    "SHOPPING",
    "ENTERTAINMENT",
    "MISCELLANEOUS",
];

const categoryIcons = {
    TRANSPORTATION: "🚗",
    HOTEL: "🏨",
    FOOD: "🍔",
    SHOPPING: "🛍️",
    ENTERTAINMENT: "🎯",
    MISCELLANEOUS: "📦",
};

const Expenses = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [settlement, setSettlement] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        description: "",
        amount: "",
        category: "FOOD",
        expenseDate: new Date()
            .toISOString()
            .split("T")[0],
    });

    // ============================
    // LOAD EXPENSES
    // ============================

    useEffect(() => {
        if (!tripId) {
            setError("Trip ID is missing.");
            setLoading(false);
            return;
        }

        loadExpenses();
    }, [tripId]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            setError("");

            const expenseResponse =
                await expenseAPI.getAll(tripId);

            setExpenses(expenseResponse.data || []);

            try {
                const summaryResponse =
                    await expenseAPI.getSummary(tripId);

                setSummary(summaryResponse.data || null);
            } catch (err) {
                console.log("Summary unavailable.");
            }

            try {
                const settlementResponse =
                    await expenseAPI.getSettlement(tripId);

                setSettlement(
                    settlementResponse.data || null
                );
            } catch (err) {
                console.log("Settlement unavailable.");
            }
        } catch (err) {
            console.error("Expense loading failed:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load expenses."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================
    // FORM CHANGE
    // ============================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ============================
    // ADD / UPDATE
    // ============================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!tripId) {
            setError("Trip ID is missing.");
            return;
        }

        if (!form.description.trim()) {
            setError("Please enter an expense description.");
            return;
        }

        if (
            !form.amount ||
            Number(form.amount) <= 0
        ) {
            setError("Please enter a valid amount.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const data = {
                description: form.description,
                amount: Number(form.amount),
                category: form.category,
                expenseDate: form.expenseDate,
                isShared: false,
            };

            if (editingId) {
                await expenseAPI.update(
                    editingId,
                    data
                );

                setSuccess(
                    "Expense updated successfully."
                );
            } else {
                await expenseAPI.create(
                    tripId,
                    data
                );

                setSuccess(
                    "Expense added successfully."
                );
            }

            resetForm();

            await loadExpenses();
        } catch (err) {
            console.error("Expense save failed:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to save expense."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================
    // EDIT
    // ============================

    const handleEdit = (expense) => {
        setEditingId(expense.id);

        setForm({
            description:
                expense.description || "",

            amount:
                expense.amount ?? "",

            category:
                expense.category || "FOOD",

            expenseDate:
                expense.expenseDate ||
                new Date()
                    .toISOString()
                    .split("T")[0],
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ============================
    // DELETE
    // ============================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await expenseAPI.delete(id);

            setSuccess(
                "Expense deleted successfully."
            );

            await loadExpenses();
        } catch (err) {
            console.error(
                "Expense delete failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete expense."
            );
        }
    };

    // ============================
    // RESET
    // ============================

    const resetForm = () => {
        setEditingId(null);

        setForm({
            description: "",
            amount: "",
            category: "FOOD",
            expenseDate: new Date()
                .toISOString()
                .split("T")[0],
        });
    };

    // ============================
    // TOTAL
    // ============================

    const calculatedTotal = expenses.reduce(
        (total, expense) =>
            total + Number(expense.amount || 0),
        0
    );

    const totalSpent = Number(
        summary?.totalSpent ??
        calculatedTotal
    );

    const totalBudget = Number(
        summary?.totalBudget ??
        0
    );

    const remaining = Number(
        summary?.remainingBudget ??
        (totalBudget - totalSpent)
    );

    // ============================
    // LOADING
    // ============================

    if (loading) {
        return (
            <div style={styles.page}>
                <Navbar />

                <div style={styles.loading}>
                    <div style={{ fontSize: "50px" }}>
                        💳
                    </div>

                    <h2>
                        Loading Expenses...
                    </h2>

                    <p>
                        Please wait.
                    </p>
                </div>
            </div>
        );
    }

    // ============================
    // PAGE
    // ============================

    return (
        <div style={styles.page}>
            <Navbar />

            <main style={styles.container}>

                {/* HEADER */}

                <section style={styles.header}>

                    <div>
                        <div style={styles.badge}>
                            💳 MILESTONE 3
                        </div>

                        <h1 style={styles.title}>
                            Trip Expenses
                        </h1>

                        <p style={styles.subtitle}>
                            Track every expense for
                            Trip #{tripId}.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                `/trips/${tripId}/budget`
                            )
                        }
                        style={styles.budgetButton}
                    >
                        💰 View Budget
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

                    <div style={styles.summaryCard}>
                        <span style={styles.icon}>
                            💰
                        </span>

                        <div>
                            <p style={styles.label}>
                                Total Spent
                            </p>

                            <h2>
                                ₹
                                {totalSpent.toLocaleString(
                                    "en-IN"
                                )}
                            </h2>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <span style={styles.icon}>
                            📊
                        </span>

                        <div>
                            <p style={styles.label}>
                                Number of Expenses
                            </p>

                            <h2>
                                {expenses.length}
                            </h2>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <span style={styles.icon}>
                            🏦
                        </span>

                        <div>
                            <p style={styles.label}>
                                Remaining Budget
                            </p>

                            <h2>
                                ₹
                                {Math.max(
                                    remaining,
                                    0
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </h2>
                        </div>
                    </div>

                </section>

                {/* ADD EXPENSE */}

                <section style={styles.formCard}>

                    <h2>
                        {editingId
                            ? "Edit Expense"
                            : "Add New Expense"}
                    </h2>

                    <p style={styles.formDescription}>
                        Record your travel spending.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div style={styles.formGrid}>

                            <div style={styles.field}>
                                <label>
                                    Description *
                                </label>

                                <input
                                    type="text"
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Hotel booking"
                                />
                            </div>

                            <div style={styles.field}>
                                <label>
                                    Amount *
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    name="amount"
                                    value={form.amount}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="2500"
                                />
                            </div>

                            <div style={styles.field}>
                                <label>
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={
                                        form.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >
                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={
                                                    category
                                                }
                                                value={
                                                    category
                                                }
                                            >
                                                {
                                                    categoryIcons[
                                                    category
                                                    ]
                                                }{" "}
                                                {category}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div style={styles.field}>
                                <label>
                                    Expense Date
                                </label>

                                <input
                                    type="date"
                                    name="expenseDate"
                                    value={
                                        form.expenseDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                        </div>

                        <div style={styles.actions}>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={
                                        styles.cancelButton
                                    }
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                style={
                                    styles.saveButton
                                }
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Expense"
                                        : "Add Expense"}
                            </button>

                        </div>

                    </form>
                </section>

                {/* EXPENSE LIST */}

                <section style={styles.listCard}>

                    <div style={styles.listHeader}>
                        <div>
                            <h2>
                                Expense History
                            </h2>

                            <p>
                                {expenses.length} expense
                                {expenses.length !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </div>

                    {expenses.length === 0 ? (
                        <div style={styles.empty}>
                            <div style={{ fontSize: "50px" }}>
                                💸
                            </div>

                            <h3>
                                No expenses yet
                            </h3>

                            <p>
                                Add your first trip
                                expense above.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {expenses.map(
                                (expense) => (
                                    <div
                                        key={
                                            expense.id
                                        }
                                        style={
                                            styles.expenseRow
                                        }
                                    >
                                        <div
                                            style={
                                                styles.expenseIcon
                                            }
                                        >
                                            {categoryIcons[
                                                expense.category
                                            ] || "💳"}
                                        </div>

                                        <div
                                            style={
                                                styles.expenseInfo
                                            }
                                        >
                                            <strong>
                                                {
                                                    expense.description
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    expense.category
                                                }

                                                {expense.expenseDate &&
                                                    ` • ${expense.expenseDate}`}
                                            </span>
                                        </div>

                                        <strong
                                            style={
                                                styles.amount
                                            }
                                        >
                                            ₹
                                            {Number(
                                                expense.amount ||
                                                0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                        <button
                                            onClick={() =>
                                                handleEdit(
                                                    expense
                                                )
                                            }
                                            style={
                                                styles.editButton
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    expense.id
                                                )
                                            }
                                            style={
                                                styles.deleteButton
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                </section>

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

    loading: {
        maxWidth: "600px",
        margin: "100px auto",
        textAlign: "center",
        background: "#fff",
        padding: "60px",
        borderRadius: "25px",
    },

    header: {
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#fff",
        borderRadius: "25px",
        padding: "35px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
    },

    badge: {
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "1px",
    },

    title: {
        fontSize: "38px",
        margin: "8px 0",
    },

    subtitle: {
        margin: 0,
        opacity: 0.9,
    },

    budgetButton: {
        border: "none",
        background: "#fff",
        color: "#2563eb",
        padding: "14px 20px",
        borderRadius: "14px",
        fontWeight: "700",
        cursor: "pointer",
    },

    error: {
        marginTop: "20px",
        padding: "15px",
        background: "#fee2e2",
        color: "#b91c1c",
        borderRadius: "14px",
    },

    success: {
        marginTop: "20px",
        padding: "15px",
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

    summaryCard: {
        background: "#fff",
        borderRadius: "20px",
        padding: "22px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow:
            "0 8px 25px rgba(15,23,42,0.05)",
    },

    icon: {
        width: "50px",
        height: "50px",
        background: "#eef4ff",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "23px",
    },

    label: {
        margin: 0,
        color: "#64748b",
        fontSize: "13px",
    },

    formCard: {
        background: "#fff",
        borderRadius: "25px",
        padding: "30px",
        marginTop: "20px",
        boxShadow:
            "0 8px 25px rgba(15,23,42,0.05)",
    },

    formDescription: {
        color: "#64748b",
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "20px",
    },

    field: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },

    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        marginTop: "25px",
    },

    saveButton: {
        border: "none",
        background: "#4f46e5",
        color: "#fff",
        padding: "13px 22px",
        borderRadius: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    cancelButton: {
        border: "1px solid #dbe3ef",
        background: "#fff",
        padding: "13px 22px",
        borderRadius: "12px",
        cursor: "pointer",
    },

    listCard: {
        background: "#fff",
        borderRadius: "25px",
        padding: "30px",
        marginTop: "20px",
        boxShadow:
            "0 8px 25px rgba(15,23,42,0.05)",
    },

    listHeader: {
        marginBottom: "20px",
    },

    empty: {
        textAlign: "center",
        padding: "50px",
        color: "#64748b",
    },

    expenseRow: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "16px 0",
        borderBottom: "1px solid #eef2f7",
    },

    expenseIcon: {
        width: "45px",
        height: "45px",
        borderRadius: "12px",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
    },

    expenseInfo: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },

    amount: {
        color: "#111827",
        whiteSpace: "nowrap",
    },

    editButton: {
        border: "1px solid #bfdbfe",
        background: "#eff6ff",
        color: "#2563eb",
        padding: "8px 12px",
        borderRadius: "9px",
        cursor: "pointer",
    },

    deleteButton: {
        border: "1px solid #fecaca",
        background: "#fef2f2",
        color: "#dc2626",
        padding: "8px 12px",
        borderRadius: "9px",
        cursor: "pointer",
    },
};

export default Expenses;