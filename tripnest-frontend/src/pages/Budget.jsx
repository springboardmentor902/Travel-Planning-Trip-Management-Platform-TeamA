import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { budgetAPI, expenseAPI, tripAPI } from "../utils/api";

const categories = [
  { key: "transportationBudget", label: "Transportation", emoji: "🚗" },
  { key: "hotelBudget",          label: "Hotel",          emoji: "🏨" },
  { key: "foodBudget",           label: "Food",           emoji: "🍽️" },
  { key: "shoppingBudget",       label: "Shopping",       emoji: "🛍️" },
  { key: "entertainmentBudget",  label: "Entertainment",  emoji: "🎭" },
  { key: "miscBudget",           label: "Miscellaneous",  emoji: "📦" },
];

const Budget = () => {
  const { tripId } = useParams();
  const navigate   = useNavigate();

  const [trip,    setTrip]    = useState(null);
  const [budget,  setBudget]  = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error,   setError]   = useState("");

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

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      const tripRes = await tripAPI.getById(tripId);
      setTrip(tripRes.data);

      try {
        const [budgetRes, summaryRes] = await Promise.all([
          budgetAPI.get(tripId),
          expenseAPI.summary(tripId),
        ]);
        setBudget(budgetRes.data);
        setSummary(summaryRes.data);

        // Form mein existing data fill karo
        setForm({
          totalAmount: budgetRes.data.totalAmount || "",
          currency: budgetRes.data.currency || "INR",
          transportationBudget:
            budgetRes.data.transportationBudget || "",
          hotelBudget:         budgetRes.data.hotelBudget || "",
          foodBudget:          budgetRes.data.foodBudget || "",
          shoppingBudget:      budgetRes.data.shoppingBudget || "",
          entertainmentBudget:
            budgetRes.data.entertainmentBudget || "",
          miscBudget:          budgetRes.data.miscBudget || "",
        });
      } catch {
        // Budget abhi set nahi hua
        setShowForm(true);
      }
    } catch {
      navigate("/trips");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        totalAmount: Number(form.totalAmount),
        currency: form.currency,
        transportationBudget:
          form.transportationBudget
            ? Number(form.transportationBudget) : null,
        hotelBudget:
          form.hotelBudget
            ? Number(form.hotelBudget) : null,
        foodBudget:
          form.foodBudget
            ? Number(form.foodBudget) : null,
        shoppingBudget:
          form.shoppingBudget
            ? Number(form.shoppingBudget) : null,
        entertainmentBudget:
          form.entertainmentBudget
            ? Number(form.entertainmentBudget) : null,
        miscBudget:
          form.miscBudget
            ? Number(form.miscBudget) : null,
      };

      const res = budget
        ? await budgetAPI.update(tripId, payload)
        : await budgetAPI.create(tripId, payload);

      setBudget(res.data);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  const getBarColor = (pct) => {
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80)  return "bg-orange-500";
    if (pct >= 60)  return "bg-yellow-500";
    return "bg-emerald-500";
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading budget...</p>
      </div>
    </div>
  );

  const spentPct = summary?.spentPercentage || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/trips/${tripId}`)}
            className="text-slate-400 text-sm hover:text-slate-600
                       flex items-center gap-1 mb-4"
          >
            ← Back to trip
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                💰 Budget Manager
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {trip?.title}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2
                         rounded-xl text-sm font-medium
                         hover:bg-blue-700 transition"
            >
              {budget ? "Edit Budget" : "Set Budget"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200
                          text-red-600 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Budget Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200
                       rounded-2xl p-6 mb-6 shadow-sm"
          >
            <h2 className="font-semibold text-slate-800 mb-5">
              {budget ? "Update Budget" : "Set Trip Budget"}
            </h2>

            {/* Total Amount */}
            <div className="mb-5">
              <label className="block text-sm font-medium
                                text-slate-700 mb-1">
                Total Budget (₹) *
              </label>
              <input
                type="number"
                value={form.totalAmount}
                onChange={(e) => setForm({
                  ...form, totalAmount: e.target.value
                })}
                placeholder="e.g. 25000"
                className="w-full border border-slate-200 rounded-xl
                           px-4 py-2.5 text-sm focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Category Budgets */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {categories.map((cat) => (
                <div key={cat.key}>
                  <label className="block text-sm font-medium
                                    text-slate-700 mb-1">
                    {cat.emoji} {cat.label}
                  </label>
                  <input
                    type="number"
                    value={form[cat.key]}
                    onChange={(e) => setForm({
                      ...form, [cat.key]: e.target.value
                    })}
                    placeholder="0"
                    className="w-full border border-slate-200
                               rounded-xl px-4 py-2.5 text-sm
                               focus:outline-none focus:ring-2
                               focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-slate-200
                           rounded-xl text-sm text-slate-600
                           hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white
                           rounded-xl text-sm font-medium
                           hover:bg-blue-700 transition
                           disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Budget"}
              </button>
            </div>
          </form>
        )}

        {/* Budget Overview */}
        {budget && summary ? (
          <>
            {/* Main Card */}
            <div className="bg-white border border-slate-200
                            rounded-2xl p-6 mb-5 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-slate-400 font-medium
                                uppercase tracking-wide">
                    Total Budget
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    ₹{budget.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <span className={`text-sm font-bold px-3 py-1
                                  rounded-full ${
                  spentPct >= 100
                    ? "bg-red-100 text-red-600"
                    : spentPct >= 80
                    ? "bg-orange-100 text-orange-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}>
                  {spentPct}% used
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs
                                text-slate-500 mb-2">
                  <span>Spent: ₹{summary.totalSpent?.toLocaleString()}</span>
                  <span>Remaining: ₹{summary.remainingBudget?.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all
                                ${getBarColor(spentPct)}`}
                    style={{ width: `${Math.min(spentPct, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-bold text-blue-600 mt-1">
                    ₹{budget.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Spent</p>
                  <p className="font-bold text-red-500 mt-1">
                    ₹{summary.totalSpent?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Left</p>
                  <p className="font-bold text-emerald-600 mt-1">
                    ₹{summary.remainingBudget?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white border border-slate-200
                            rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-5">
                Category Breakdown
              </h2>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const allocated = budget[cat.key] || 0;
                  const spent = summary.categoryBreakdown?.[
                    cat.key.replace("Budget", "")
                      .toUpperCase()
                  ] || 0;
                  const pct = allocated > 0
                    ? Math.min((spent / allocated) * 100, 100)
                    : 0;

                  return (
                    <div key={cat.key}>
                      <div className="flex justify-between
                                      items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span className="text-sm font-medium
                                           text-slate-700">
                            {cat.label}
                          </span>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          {allocated > 0
                            ? `₹${spent.toLocaleString()} / ₹${allocated.toLocaleString()}`
                            : "Not set"
                          }
                        </div>
                      </div>
                      {allocated > 0 && (
                        <div className="h-2 bg-slate-100
                                        rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full
                                        ${getBarColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : !showForm && (
          <div className="bg-white border border-slate-200
                          rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-semibold text-slate-800 mb-2">
              No budget set
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Set a budget to track your expenses
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2.5
                         rounded-xl text-sm hover:bg-blue-700"
            >
              Set Budget
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Budget;