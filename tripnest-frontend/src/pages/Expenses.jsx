import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { expenseAPI, tripAPI, tripMemberAPI } from "../utils/api";

const CATEGORIES = [
  "TRANSPORTATION", "HOTEL", "FOOD",
  "SHOPPING", "ENTERTAINMENT", "MISCELLANEOUS"
];

const catEmoji = {
  TRANSPORTATION: "🚗", HOTEL: "🏨",
  FOOD: "🍽️",          SHOPPING: "🛍️",
  ENTERTAINMENT: "🎭",  MISCELLANEOUS: "📦",
};

const Expenses = () => {
  const { tripId } = useParams();
  const navigate   = useNavigate();

  const [trip,       setTrip]       = useState(null);
  const [expenses,   setExpenses]   = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [members,    setMembers]    = useState([]); // group members
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [filter,     setFilter]     = useState("ALL");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "FOOD",
    expenseDate: new Date().toISOString().split("T")[0],
    isShared: false,
    splitType: "EQUAL",
    members: [], // [{ userId, customAmount }]
  });

  useEffect(() => { fetchData(); }, [tripId]);

  const fetchData = async () => {
    try {
      const [tripRes, expRes, sumRes] = await Promise.all([
        tripAPI.getById(tripId),
        expenseAPI.getAll(tripId),
        expenseAPI.summary(tripId),
      ]);
      setTrip(tripRes.data);
      setExpenses(expRes.data);
      setSummary(sumRes.data);

      try {
        const memRes = await tripMemberAPI.getMembers(tripId);
        console.log("Members data:", memRes.data); // ← YE ADD KARO
        setMembers(memRes.data || []);
      } catch {
        setMembers([]);
      }
    } catch {
      navigate("/trips");
    } finally {
      setLoading(false);
    }
  };

  // Toggle member selection
  const toggleMember = (userId) => {
    const exists = form.members.find((m) => m.userId === userId);
    if (exists) {
      setForm({
        ...form,
        members: form.members.filter((m) => m.userId !== userId),
      });
    } else {
      setForm({
        ...form,
        members: [...form.members, { userId, customAmount: "" }],
      });
    }
  };

  const setCustomAmount = (userId, amount) => {
    setForm({
      ...form,
      members: form.members.map((m) =>
        m.userId === userId
          ? { ...m, customAmount: Number(amount) }
          : m
      ),
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        expenseDate: form.expenseDate,
        isShared: form.isShared,
      };

      if (form.isShared && form.members.length > 0) {
        payload.splitType = form.splitType;
        payload.members   = form.members.map((m) => ({
          userId: m.userId,
          customAmount:
            form.splitType === "CUSTOM"
              ? m.customAmount
              : undefined,
        }));
      }

      await expenseAPI.add(tripId, payload);

      setForm({
        description: "",
        amount: "",
        category: "FOOD",
        expenseDate: new Date().toISOString().split("T")[0],
        isShared: false,
        splitType: "EQUAL",
        members: [],
      });
      setShowForm(false);
      fetchData();
    } catch {
      alert("Expense add failed!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await expenseAPI.delete(id);
      fetchData();
    } catch {
      alert("Delete failed!");
    }
  };

  const filtered = filter === "ALL"
    ? expenses
    : expenses.filter((e) => e.category === filter);

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading expenses...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/trips/${tripId}`)}
            className="text-slate-400 text-sm hover:text-slate-600 flex items-center gap-1 mb-4"
          >
            ← Back to trip
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">💸 Expenses</h1>
              <p className="text-slate-500 text-sm mt-1">{trip?.title}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/trips/${tripId}/settlement`)}
                className="border border-slate-200 text-slate-600 px-4 py-2
                           rounded-xl text-sm font-medium hover:bg-slate-50 transition"
              >
                💸 Settlement
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2
                           rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                + Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
              <p className="text-xs text-slate-400">Total Spent</p>
              <p className="text-xl font-bold text-red-500 mt-1">
                ₹{summary.totalSpent?.toLocaleString()}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
              <p className="text-xs text-slate-400">Budget</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                ₹{summary.totalBudget?.toLocaleString() || "—"}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
              <p className="text-xs text-slate-400">Remaining</p>
              <p className={`text-xl font-bold mt-1 ${
                (summary.remainingBudget || 0) < 0 ? "text-red-500" : "text-emerald-600"
              }`}>
                ₹{summary.remainingBudget?.toLocaleString() || "—"}
              </p>
            </div>
          </div>
        )}

        {/* ── Add Expense Form ── */}
        {showForm && (
          <form
            onSubmit={handleAddExpense}
            className="bg-white border border-blue-100 rounded-2xl p-6 mb-6 shadow-sm"
          >
            <h2 className="font-semibold text-slate-800 mb-4">New Expense</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Description */}
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Description *"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <input
                  type="number"
                  placeholder="Amount (₹) *"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category */}
              <div className="col-span-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{catEmoji[c]} {c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Shared Expense Toggle ── */}
            <div className="border border-slate-100 rounded-xl p-4 mb-4 bg-slate-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({
                    ...form,
                    isShared: !form.isShared,
                    members: [],
                  })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 relative
                    ${form.isShared ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow
                    transition-transform duration-200
                    ${form.isShared ? "translate-x-6" : "translate-x-1"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Split with members</p>
                  <p className="text-xs text-slate-400">Enable to split this expense</p>
                </div>
              </label>

              {/* Shared options — show only when toggled */}
              {form.isShared && (
                <div className="mt-4 space-y-4">

                  {/* Split Type */}
                  <div className="flex gap-3">
                    {["EQUAL", "CUSTOM"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, splitType: type })}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition
                          ${form.splitType === type
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
                      >
                        {type === "EQUAL" ? "⚖️ Equal Split" : "✏️ Custom Split"}
                      </button>
                    ))}
                  </div>

                  {/* Member Selection */}
                  {members.length === 0 ? (
                    <div className="text-center py-3 text-slate-400 text-xs">
                      No group members found.{" "}
                      <span
                        className="text-blue-500 cursor-pointer hover:underline"
                        onClick={() => navigate(`/trips/${tripId}`)}
                      >
                        Add members to this trip first.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500">
                        Select members to split with:
                      </p>
                      {members.filter((member) => {
                        const userId = member.user?.id || member.userId;
                        return !!userId;
                      }).map((member) => {
                        const userId = member.user?.id || member.userId;
                        const name     = member.user?.name || member.name || "Member";
                        const email    = member.user?.email || member.email || "";
                        const selected = form.members.find((m) => m.userId === userId);

                        return (
                          <div key={userId} className="flex items-center gap-3">
                            {/* Checkbox */}
                            <div
                              onClick={() => toggleMember(userId)}
                              className={`w-5 h-5 rounded border-2 flex items-center
                                justify-center cursor-pointer transition
                                ${selected
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-slate-300 bg-white"}`}
                            >
                              {selected && (
                                <svg className="w-3 h-3 text-white" fill="none"
                                  viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            {/* Avatar + Name */}
                            <div className="w-8 h-8 rounded-full bg-blue-100
                              text-blue-700 flex items-center justify-center
                              text-sm font-bold">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-800">{name}</p>
                              <p className="text-xs text-slate-400">{email}</p>
                            </div>

                            {/* Custom Amount (only for CUSTOM split) */}
                            {form.splitType === "CUSTOM" && selected && (
                              <input
                                type="number"
                                placeholder="₹ Amount"
                                value={selected.customAmount || ""}
                                onChange={(e) => setCustomAmount(userId, e.target.value)}
                                className="w-28 border border-slate-200 rounded-xl
                                           px-3 py-1.5 text-sm focus:outline-none
                                           focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Equal split preview */}
                  {form.splitType === "EQUAL" && form.members.length > 0 && form.amount && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
                      <p className="text-xs text-blue-700 font-medium">
                        Each person pays:{" "}
                        <span className="font-bold">
                          ₹{(Number(form.amount) / form.members.length).toFixed(2)}
                        </span>
                        {" "}({form.members.length} members)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl
                           text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl
                           text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </form>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-5">
          {["ALL", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                filter === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {cat !== "ALL" && catEmoji[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-slate-400 text-sm">No expenses yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((expense) => (
              <div
                key={expense.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm
                           flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-50
                                  flex items-center justify-center text-xl">
                    {catEmoji[expense.category]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 text-sm">
                        {expense.description}
                      </p>
                      {expense.isShared && (
                        <span className="text-[10px] bg-blue-100 text-blue-700
                                         px-2 py-0.5 rounded-full font-medium">
                          Split
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{expense.expenseDate}</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {expense.category}
                      </span>
                      {expense.paidByName && (
                        <span className="text-xs text-slate-400">
                          paid by {expense.paidByName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">
                    ₹{expense.amount?.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-400 hover:text-red-600 text-xs transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="bg-slate-800 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-white font-medium text-sm">
                Total ({filtered.length} expenses)
              </span>
              <span className="text-white font-bold">
                ₹{filtered.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Expenses;
