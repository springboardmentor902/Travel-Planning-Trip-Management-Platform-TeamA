import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dashboardAPI, tripAPI } from '../utils/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Tooltip, Cell,
    AreaChart, Area, Legend,
} from 'recharts';

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#06b6d4',
];

const STATUS_COLOR = {
    UNDER: 'bg-green-100 text-green-700',
    NEAR:  'bg-yellow-100 text-yellow-700',
    OVER:  'bg-red-100 text-red-700',
};

const TripReport = () => {
    const { id }    = useParams();
    const navigate  = useNavigate();

    const [report,  setReport]  = useState(null);
    const [trips,   setTrips]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [reportRes, tripsRes] =
                await Promise.all([
                    dashboardAPI.getTripReport(id),
                    tripAPI.getAll(),
                ]);
            setReport(reportRes.data);
            setTrips(tripsRes.data);
        } catch {
            navigate('/analytics');
        } finally {
            setLoading(false);
        }
    };

    // Chart data
    const budgetVsActual = report
        ? (report.categoryReports || [])
                .filter(c =>
                    c.budgeted > 0 || c.actual > 0)
                .map(c => ({
                    name: c.category,
                    Budget: c.budgeted,
                    Actual: c.actual,
                }))
        : [];

    const dailyData = report
        ? Object.entries(report.dailySpending || {})
                .map(([date, amount]) => ({
                    date: date.slice(5), amount }))
        : [];

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex justify-center
                            items-center h-64">
                <div className="w-8 h-8 border-2
                    border-blue-600 border-t-transparent
                    rounded-full animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6
                             pt-24 sm:pt-28 pb-12">

                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/analytics')}
                        className="text-slate-400 text-sm
                            hover:text-slate-600 mb-4 flex
                            items-center gap-1"
                    >
                        ← Back to Analytics
                    </button>

                    <div className="flex justify-between
                                    items-start">
                        <div>
                            <h1 className="text-2xl font-bold
                                text-slate-900">
                                Trip Report 📋
                            </h1>
                            <p className="text-slate-400
                                text-sm mt-1">
                                {report?.tripTitle}
                                {' '}— {report?.destination}
                            </p>
                        </div>

                        {/* Trip Selector */}
                        <select
                            value={id}
                            onChange={e =>
                                navigate(
                                    `/reports/trips/${e.target.value}`)}
                            className="border border-slate-200
                                rounded-xl px-3 py-2 text-sm
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500"
                        >
                            {trips.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
<div className="grid grid-cols-2
                sm:grid-cols-4 gap-4 mb-6">
    {[
        { label: 'Total Budget',
          value: `₹${(report?.totalBudget || 0).toLocaleString()}`,
          color: 'bg-blue-50 border-blue-100 text-blue-700' },
        { label: 'Total Spent',
          value: `₹${(report?.totalSpent || 0).toLocaleString()}`,
          color: 'bg-red-50 border-red-100 text-red-700' },
        { label: 'Remaining',
          value: `₹${(report?.totalRemaining || 0).toLocaleString()}`,
          color: 'bg-green-50 border-green-100 text-green-700' },
        { label: 'Used',
          value: `${report?.spentPercentage || 0}%`,
          color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
    ].map((c, i) => (
        <div key={i}
             className={`border rounded-2xl p-4 ${c.color}`}>
            <p className="text-xs opacity-70">
                {c.label}
            </p>
            <p className="text-xl font-bold mt-1">
                {c.value}
            </p>
        </div>
    ))}
</div>

                {/* Budget Progress */}
                <div className="bg-white border border-slate-200
                                rounded-2xl p-6 mb-6">
                    <h3 className="font-semibold text-slate-800
                                   mb-3">
                        Budget Usage
                    </h3>
                    <div className="w-full bg-slate-100
                                    rounded-full h-4 mb-2">
                        <div
                            className={`h-4 rounded-full
                                transition-all
                                ${(report?.spentPercentage || 0)
                                    >= 90
                                    ? 'bg-red-500'
                                    : (report?.spentPercentage || 0)
                                    >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-500'}`}
                            style={{
                                width: `${Math.min(
                                    report?.spentPercentage
                                        || 0, 100)}%`
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-400">
                        {report?.spentPercentage}% spent
                    </p>
                </div>

                {/* Budget vs Actual Chart */}
                {budgetVsActual.length > 0 && (
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6 mb-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Budget vs Actual by Category
                        </h3>
                        <ResponsiveContainer
                            width="100%"
                            height={280}>
                            <BarChart data={budgetVsActual}
                                      margin={{ left: 10 }}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={
                                        v => `₹${v/1000}k`}
                                />
                                <Tooltip
                                    formatter={v =>
                                        `₹${v.toLocaleString()}`}
                                />
                                <Legend />
                                <Bar
                                    dataKey="Budget"
                                    fill="#3b82f6"
                                    radius={[4,4,0,0]}
                                />
                                <Bar
                                    dataKey="Actual"
                                    fill="#ef4444"
                                    radius={[4,4,0,0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Category Table */}
                {report?.categoryReports?.length > 0 && (
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6 mb-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Category Breakdown
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b
                                        border-slate-100">
                                        {['Category',
                                          'Budgeted',
                                          'Actual',
                                          'Remaining',
                                          'Usage',
                                          'Status']
                                          .map(h => (
                                            <th key={h}
                                                className="text-left
                                                    py-3 px-2
                                                    text-xs
                                                    text-slate-400
                                                    font-semibold">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.categoryReports
                                            .filter(c =>
                                                c.budgeted > 0
                                                || c.actual > 0)
                                            .map((c, i) => (
                                        <tr key={i}
                                            className="border-b
                                                border-slate-50
                                                hover:bg-slate-50">
                                            <td className="py-3 px-2
                                                font-medium
                                                text-slate-700">
                                                {c.category}
                                            </td>
                                            <td className="py-3 px-2
                                                text-slate-600">
                                                ₹{c.budgeted
                                                    .toLocaleString()}
                                            </td>
                                            <td className="py-3 px-2
                                                text-red-600
                                                font-medium">
                                                ₹{c.actual
                                                    .toLocaleString()}
                                            </td>
                                            <td className="py-3 px-2
                                                text-green-600">
                                                ₹{c.remaining
                                                    .toLocaleString()}
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="w-20
                                                    bg-slate-100
                                                    rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-blue-500"
                                                        style={{
                                                            width: `${Math.min(c.usagePercentage, 100)}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs
                                                    text-slate-400">
                                                    {c.usagePercentage}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`text-xs
                                                    px-2 py-1
                                                    rounded-full
                                                    font-semibold
                                                    ${STATUS_COLOR[
                                                        c.status]}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Daily Spending */}
                {dailyData.length > 0 && (
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6 mb-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Daily Spending Trend
                        </h3>
                        <ResponsiveContainer
                            width="100%"
                            height={200}>
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient
                                        id="dailyGrad"
                                        x1="0" y1="0"
                                        x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="#ef4444"
                                            stopOpacity={0.1}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#ef4444"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={
                                        v => `₹${v/1000}k`}
                                />
                                <Tooltip
                                    formatter={v =>
                                        `₹${v.toLocaleString()}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    fill="url(#dailyGrad)"
                                    name="Spent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Top Expenses */}
                {report?.topExpenses?.length > 0 && (
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6 mb-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Top Expenses
                        </h3>
                        <div className="space-y-3">
                            {report.topExpenses.map(
                                (exp, i) => (
                                <div key={i}
                                     className="flex
                                        items-center
                                        justify-between p-3
                                        bg-slate-50 rounded-xl">
                                    <div className="flex
                                        items-center gap-3">
                                        <div
                                            className="w-7 h-7
                                                rounded-full
                                                flex items-center
                                                justify-center
                                                text-white text-xs
                                                font-bold"
                                            style={{
                                                background:
                                                    COLORS[
                                                        i %
                                                        COLORS
                                                        .length]
                                            }}
                                        >
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm
                                                font-medium
                                                text-slate-800">
                                                {exp.description}
                                            </p>
                                            <p className="text-xs
                                                text-slate-400">
                                                {exp.category}
                                                {' '}• {exp.date}
                                                {' '}• {exp.paidBy}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-bold
                                        text-slate-900">
                                        ₹{exp.amount
                                            ?.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shared vs Personal */}
                {(report?.sharedTotal > 0
                    || report?.personalTotal > 0) && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 border
                            border-purple-100 rounded-2xl p-5">
                            <p className="text-xs
                                text-purple-500">
                                Shared Expenses
                            </p>
                            <p className="text-xl font-bold
                                text-purple-700 mt-1">
                                ₹{report.sharedTotal
                                    ?.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-blue-50 border
                            border-blue-100 rounded-2xl p-5">
                            <p className="text-xs
                                text-blue-500">
                                Personal Expenses
                            </p>
                            <p className="text-xl font-bold
                                text-blue-700 mt-1">
                                ₹{report.personalTotal
                                    ?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TripReport;