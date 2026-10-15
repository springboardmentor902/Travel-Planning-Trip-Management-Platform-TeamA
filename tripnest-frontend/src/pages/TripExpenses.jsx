import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { tripAPI, tripMemberAPI } from '../utils/api';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    'TRANSPORTATION','HOTEL','FOOD',
    'SHOPPING','ENTERTAINMENT','MISCELLANEOUS'
];

const CAT_EMOJI = {
    TRANSPORTATION:'🚗', HOTEL:'🏨', FOOD:'🍽️',
    SHOPPING:'🛍️', ENTERTAINMENT:'🎭', MISCELLANEOUS:'📦',
};

const TripExpenses = () => {
    const { id }   = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [trip,      setTrip]      = useState(null);
    const [expenses,  setExpenses]  = useState([]);
    const [members,   setMembers]   = useState([]);
    const [summary,   setSummary]   = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [showForm,  setShowForm]  = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error,     setError]     = useState('');

    const [form, setForm] = useState({
        description:  '',
        amount:       '',
        category:     'FOOD',
        expenseDate:  new Date().toISOString().split('T')[0],
        isShared:     false,
        splitType:    'EQUAL',
        selectedMembers: [],
        customAmounts:   {},
    });

    useEffect(() => { fetchAll(); }, [id]);

    const fetchAll = async () => {
        try {
            const [tripRes, expRes, memRes, sumRes] =
                await Promise.all([
                    tripAPI.getById(id),
                    api.get(`/api/trips/${id}/expenses`),
                    tripMemberAPI.getMembers(id),
                    api.get(`/api/trips/${id}/expenses/summary`),
                ]);
            setTrip(tripRes.data);
            setExpenses(expRes.data);
            setMembers(memRes.data);
            setSummary(sumRes.data);
        } catch { navigate(`/trips/${id}`); }
        finally  { setLoading(false); }
    };

    const storedUser = localStorage.getItem('user');
    const currentEmail = user?.email
        || (storedUser ? JSON.parse(storedUser).email : '');

    const toggleMember = (memberId) => {
        setForm(prev => {
            const sel = prev.selectedMembers;
            return {
                ...prev,
                selectedMembers: sel.includes(memberId)
                    ? sel.filter(id => id !== memberId)
                    : [...sel, memberId],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const body = {
                description:  form.description,
                amount:       Number(form.amount),
                category:     form.category,
                expenseDate:  form.expenseDate,
                isShared:     form.isShared,
                splitType:    form.isShared
                                  ? form.splitType : null,
                members: form.isShared
                    ? form.selectedMembers.map(uid => ({
                        userId:       uid,
                        customAmount: form.splitType === 'CUSTOM'
                            ? Number(form.customAmounts[uid] || 0)
                            : null,
                      }))
                    : null,
            };
            await api.post(`/api/trips/${id}/expenses`, body);
            setShowForm(false);
            setForm({
                description: '', amount: '', category: 'FOOD',
                expenseDate: new Date().toISOString().split('T')[0],
                isShared: false, splitType: 'EQUAL',
                selectedMembers: [], customAmounts: {},
            });
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed!');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (expId) => {
        if (!window.confirm('Delete?')) return;
        try {
            await api.delete(`/api/expenses/${expId}`);
            fetchAll();
        } catch {}
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50"><Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-2 border-blue-600
                    border-t-transparent rounded-full animate-spin"/>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50"><Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6
                         pt-24 sm:pt-28 pb-12">

            <button onClick={() => navigate(`/trips/${id}`)}
                className="text-slate-400 text-sm hover:text-slate-600
                           flex items-center gap-1 mb-6">
                ← Back to trip
            </button>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Expenses 💰
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {trip?.title}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            navigate(`/trips/${id}/settlement`)}
                        className="px-3 py-2 border border-green-200
                            text-green-600 text-sm rounded-xl
                            hover:bg-green-50 transition">
                        💸 Settlement
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2
                            rounded-xl text-sm font-medium
                            hover:bg-blue-700 transition">
                        + Add
                    </button>
                </div>
            </div>

            {/* Summary */}
            {summary && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label:'Budget', value:`₹${(summary.totalBudget||0).toLocaleString()}`, color:'text-slate-800' },
                        { label:'Spent',  value:`₹${(summary.totalSpent||0).toLocaleString()}`,  color:'text-red-600'   },
                        { label:'Left',   value:`₹${(summary.remainingBudget||0).toLocaleString()}`, color:'text-green-600' },
                    ].map((s,i) => (
                        <div key={i} className="bg-white border
                            border-slate-200 rounded-2xl p-4 text-center">
                            <p className="text-xs text-slate-400">
                                {s.label}
                            </p>
                            <p className={`text-lg font-bold mt-1 ${s.color}`}>
                                {s.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="bg-white border border-blue-100
                                rounded-2xl p-5 mb-5">
                    <h3 className="font-semibold text-slate-800 mb-4">
                        Add Expense
                    </h3>

                    {error && (
                        <div className="mb-3 bg-red-50 border
                            border-red-200 text-red-600 rounded-xl
                            px-4 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}
                          className="space-y-3">

                        <input
                            type="text"
                            placeholder="Description *"
                            value={form.description}
                            onChange={e => setForm(p => ({
                                ...p, description: e.target.value}))}
                            className="w-full border border-slate-200
                                rounded-xl px-3 py-2 text-sm
                                focus:outline-none focus:ring-2
                                focus:ring-blue-500"
                            required
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="number"
                                placeholder="Amount ₹ *"
                                value={form.amount}
                                onChange={e => setForm(p => ({
                                    ...p, amount: e.target.value}))}
                                className="border border-slate-200
                                    rounded-xl px-3 py-2 text-sm
                                    focus:outline-none focus:ring-2
                                    focus:ring-blue-500"
                                required
                            />
                            <input
                                type="date"
                                value={form.expenseDate}
                                onChange={e => setForm(p => ({
                                    ...p,
                                    expenseDate: e.target.value}))}
                                className="border border-slate-200
                                    rounded-xl px-3 py-2 text-sm
                                    focus:outline-none focus:ring-2
                                    focus:ring-blue-500"
                            />
                        </div>

                        {/* Category */}
                        <div className="grid grid-cols-3
                                        sm:grid-cols-6 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setForm(p => ({
                                        ...p, category: cat}))}
                                    className={`p-2 rounded-xl border
                                        text-center text-xs transition
                                        ${form.category === cat
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                                >
                                    <div className="text-lg mb-0.5">
                                        {CAT_EMOJI[cat]}
                                    </div>
                                    {cat.charAt(0)
                                        + cat.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

                        {/* Shared Toggle */}
                        {members.length > 1 && (
                            <div>
                                <label className="flex items-center
                                                  gap-3 cursor-pointer">
                                    <div
                                        onClick={() => setForm(p => ({
                                            ...p,
                                            isShared: !p.isShared,
                                            selectedMembers: [],
                                        }))}
                                        className={`w-11 h-6 rounded-full
                                            transition-colors relative
                                            ${form.isShared
                                                ? 'bg-blue-600'
                                                : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-0.5
                                            left-0.5 w-5 h-5 bg-white
                                            rounded-full shadow transition
                                            ${form.isShared
                                                ? 'translate-x-5'
                                                : ''}`}
                                        />
                                    </div>
                                    <span className="text-sm
                                        font-medium text-slate-700">
                                        Split with members
                                    </span>
                                </label>

                                {form.isShared && (
                                    <div className="mt-3 space-y-3">
                                        {/* Split type */}
                                        <div className="flex gap-2">
                                            {['EQUAL','CUSTOM'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() =>
                                                        setForm(p => ({
                                                            ...p,
                                                            splitType: t
                                                        }))}
                                                    className={`flex-1
                                                        py-2 rounded-xl
                                                        text-sm font-medium
                                                        border transition
                                                        ${form.splitType === t
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-slate-200 text-slate-600'}`}
                                                >
                                                    {t === 'EQUAL'
                                                        ? '⚖️ Equal'
                                                        : '✏️ Custom'}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Member selection */}
                                        <p className="text-xs
                                            text-slate-400">
                                            Select members to split:
                                        </p>
                                        <div className="space-y-2">
                                            {members.map(m => (
                                                <div key={m.id}
                                                     className="flex
                                                        items-center
                                                        gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            form
                                                            .selectedMembers
                                                            .includes(m.id)}
                                                        onChange={() =>
                                                            toggleMember(
                                                                m.id)}
                                                        className="w-4 h-4
                                                            accent-blue-600"
                                                    />
                                                    <span className="text-sm
                                                        text-slate-700
                                                        flex-1">
                                                        {m.name}
                                                        {m.email ===
                                                            currentEmail
                                                            && ' (You)'}
                                                    </span>

                                                    {/* Custom amount */}
                                                    {form.splitType
                                                        === 'CUSTOM'
                                                        && form
                                                            .selectedMembers
                                                            .includes(m.id)
                                                        && (
                                                        <input
                                                            type="number"
                                                            placeholder="₹"
                                                            value={
                                                                form
                                                                .customAmounts[
                                                                    m.id]
                                                                || ''}
                                                            onChange={e =>
                                                                setForm(p => ({
                                                                    ...p,
                                                                    customAmounts: {
                                                                        ...p.customAmounts,
                                                                        [m.id]: e.target.value,
                                                                    }
                                                                }))}
                                                            className="w-24
                                                                border
                                                                border-slate-200
                                                                rounded-lg
                                                                px-2 py-1
                                                                text-sm
                                                                focus:outline-none
                                                                focus:ring-2
                                                                focus:ring-blue-500"
                                                        />
                                                    )}

                                                    {/* Equal preview */}
                                                    {form.splitType
                                                        === 'EQUAL'
                                                        && form
                                                            .selectedMembers
                                                            .includes(m.id)
                                                        && form.amount && (
                                                        <span className="text-xs
                                                            text-green-600
                                                            font-medium">
                                                            ₹{(Number(form.amount)
                                                                / form
                                                                .selectedMembers
                                                                .length)
                                                                .toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-2 border
                                    border-slate-200 rounded-xl
                                    text-sm text-slate-600
                                    hover:bg-slate-50">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-2 bg-blue-600
                                    text-white rounded-xl text-sm
                                    font-medium hover:bg-blue-700
                                    disabled:opacity-50">
                                {submitting ? 'Adding...' : 'Add Expense'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expense List */}
            {expenses.length === 0 ? (
                <div className="bg-white border border-slate-200
                                rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-3">💰</div>
                    <p className="font-semibold text-slate-700">
                        No expenses yet
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 bg-blue-600 text-white
                            px-5 py-2 rounded-xl text-sm
                            hover:bg-blue-700">
                        Add First Expense
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {expenses.map(exp => (
                        <div key={exp.id}
                             className="bg-white border
                                border-slate-200 rounded-2xl p-4
                                hover:border-blue-100 transition">
                            <div className="flex items-start
                                            justify-between">
                                <div className="flex gap-3">
                                    <span className="text-2xl">
                                        {CAT_EMOJI[exp.category]
                                            || '📦'}
                                    </span>
                                    <div>
                                        <p className="font-medium
                                            text-slate-800 text-sm">
                                            {exp.description}
                                        </p>
                                        <div className="flex
                                            flex-wrap gap-2 mt-1">
                                            <span className="text-xs
                                                bg-slate-100
                                                text-slate-500
                                                px-2 py-0.5
                                                rounded-full">
                                                {exp.category}
                                            </span>
                                            {exp.isShared && (
                                                <span className="text-xs
                                                    bg-purple-100
                                                    text-purple-700
                                                    px-2 py-0.5
                                                    rounded-full">
                                                    Shared
                                                </span>
                                            )}
                                            <span className="text-xs
                                                text-slate-400">
                                                {exp.expenseDate}
                                            </span>
                                            <span className="text-xs
                                                text-slate-400">
                                                by {exp.paidByEmail
                                                    === currentEmail
                                                    ? 'You'
                                                    : exp.paidByName
                                                        || exp.paidByEmail}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center
                                                gap-3">
                                    <p className="font-bold
                                        text-slate-900">
                                        ₹{exp.amount?.toLocaleString()}
                                    </p>
                                    {(exp.paidByEmail
                                            === currentEmail
                                        || trip?.ownerEmail
                                            === currentEmail) && (
                                        <button
                                            onClick={() =>
                                                handleDelete(exp.id)}
                                            className="text-xs
                                                text-red-400
                                                hover:text-red-600">
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
        </div>
    );
};

export default TripExpenses;