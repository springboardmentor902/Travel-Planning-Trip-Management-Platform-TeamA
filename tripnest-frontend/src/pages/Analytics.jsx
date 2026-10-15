import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { analyticsAPI, tripAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, LineChart, Line, Area,
    AreaChart
} from 'recharts';

// ============================================================
// COLORS
// ============================================================
const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
];

const STATUS_COLORS = {
    PLANNING:  '#3b82f6',
    UPCOMING:  '#f59e0b',
    ONGOING:   '#10b981',
    COMPLETED: '#6b7280',
    CANCELLED: '#ef4444',
};

// ============================================================
// STAT CARD
// ============================================================
const StatCard = ({
    emoji, label, value, sub, color = 'blue'
}) => {
    const colors = {
        blue:   'bg-blue-50 border-blue-100 text-blue-600',
        green:  'bg-green-50 border-green-100 text-green-600',
        yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
        red:    'bg-red-50 border-red-100 text-red-600',
        purple: 'bg-purple-50 border-purple-100 text-purple-600',
    };

    return (
        <div className={`rounded-2xl border p-5
                         ${colors[color]}`}>
            <div className="text-2xl mb-2">{emoji}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm font-medium mt-0.5">
                {label}
            </div>
            {sub && (
                <div className="text-xs opacity-70 mt-1">
                    {sub}
                </div>
            )}
        </div>
    );
};

// ============================================================
// CUSTOM TOOLTIP
// ============================================================
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200
                            rounded-xl px-4 py-3 shadow-lg">
                {label && (
                    <p className="text-xs text-slate-500 mb-1">
                        {label}
                    </p>
                )}
                {payload.map((p, i) => (
                    <p key={i} className="text-sm font-semibold"
                       style={{ color: p.color }}>
                        {p.name}: {typeof p.value === 'number'
                            ? p.value % 1 === 0
                                ? p.value
                                : `₹${p.value.toLocaleString()}`
                            : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const Analytics = () => {
    const navigate   = useNavigate();
    const { user }   = useAuth();

    const [analytics,  setAnalytics]  = useState(null);
    const [trips,      setTrips]      = useState([]);
    const [report,     setReport]     = useState(null);
    const [selectedTrip, setSelectedTrip] = useState('');
    const [loading,    setLoading]    = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [activeTab,  setActiveTab]  = useState('overview');

    // ============================================================
    // FETCH
    // ============================================================

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, tripsRes] =
                await Promise.all([
                    analyticsAPI.getOverview(),
                    tripAPI.getAll(),
                ]);
            setAnalytics(analyticsRes.data);
            setTrips(tripsRes.data);
        } catch (err) {
            console.error('Analytics load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTripReport = async (tripId) => {
        if (!tripId) return;
        setReportLoading(true);
        try {
            const res =
                await analyticsAPI.getExpenseReport(tripId);
            setReport(res.data);
        } catch {
            setReport(null);
        } finally {
            setReportLoading(false);
        }
    };

    const handleTripSelect = (e) => {
    const id = e.target.value;
    setSelectedTrip(id);
    if (id) navigate(`/reports/trips/${id}`);
};

    // ============================================================
    // DATA TRANSFORMS
    // ============================================================

    const expensePieData = analytics
        ? Object.entries(analytics.expensesByCategory || {})
                .filter(([, val]) => val > 0)
                .map(([name, value]) => ({ name, value }))
        : [];

    const activityBarData = analytics
        ? Object.entries(analytics.activitiesByType || {})
                .filter(([, val]) => val > 0)
                .map(([name, value]) => ({
                    name: name.charAt(0)
                        + name.slice(1).toLowerCase(),
                    value
                }))
        : [];

    const tripStatusData = analytics
        ? [
            { name: 'Planning',  value: analytics.plannedTrips   || 0, color: STATUS_COLORS.PLANNING  },
            { name: 'Upcoming',  value: analytics.upcomingTrips  || 0, color: STATUS_COLORS.UPCOMING  },
            { name: 'Ongoing',   value: analytics.ongoingTrips   || 0, color: STATUS_COLORS.ONGOING   },
            { name: 'Completed', value: analytics.completedTrips || 0, color: STATUS_COLORS.COMPLETED },
            { name: 'Cancelled', value: analytics.cancelledTrips || 0, color: STATUS_COLORS.CANCELLED },
          ].filter(d => d.value > 0)
        : [];

    const monthlyTripData = analytics
        ? Object.entries(analytics.tripsByMonth || {})
                .map(([month, count]) => ({ month, count }))
        : [];

    const reportCatData = report
        ? Object.entries(report.categoryBreakdown || {})
                .filter(([, val]) => val > 0)
                .map(([name, value]) => ({ name, value }))
        : [];

    const dailySpendData = report
        ? Object.entries(report.dailySpending || {})
                .map(([date, amount]) => ({
                    date: date.slice(5),
                    amount
                }))
        : [];

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex justify-center items-center
                            h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-2
                        border-blue-600 border-t-transparent
                        rounded-full animate-spin mx-auto
                        mb-3" />
                    <p className="text-slate-400 text-sm">
                        Loading analytics...
                    </p>
                </div>
            </div>
        </div>
    );

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6
                             pt-24 sm:pt-28 pb-12">

                {/* ============================================
                    HEADER
                ============================================ */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold
                                   text-slate-900">
                        Analytics & Reports 📊
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Track your travel spending and activity
                    </p>
                </div>

                {/* ============================================
                    TABS
                ============================================ */}
                <div className="flex gap-2 mb-8 border-b
                                border-slate-200">
                    {[
                        { id: 'overview', label: '📊 Overview' },
                        { id: 'expenses', label: '💰 Expenses' },
                        { id: 'trips',    label: '✈️ Trips'    },
                        { id: 'report',   label: '📋 Report'   },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() =>
                                setActiveTab(tab.id)}
                            className={`pb-3 px-4 text-sm
                                font-medium transition
                                border-b-2 whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ============================================
                    OVERVIEW TAB
                ============================================ */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2
                                        sm:grid-cols-3
                                        lg:grid-cols-6 gap-4">
                            <StatCard
                                emoji="✈️"
                                label="Total Trips"
                                value={analytics?.totalTrips || 0}
                                color="blue"
                            />
                            <StatCard
                                emoji="✅"
                                label="Completed"
                                value={analytics?.completedTrips || 0}
                                color="green"
                            />
                            <StatCard
                                emoji="💰"
                                label="Total Spent"
                                value={`₹${(analytics?.totalAmountSpent || 0).toLocaleString()}`}
                                color="yellow"
                            />
                            <StatCard
                                emoji="🎯"
                                label="Budget Left"
                                value={`₹${(analytics?.totalAmountRemaining || 0).toLocaleString()}`}
                                color="green"
                            />
                            <StatCard
                                emoji="👥"
                                label="Groups"
                                value={analytics?.totalGroups || 0}
                                color="purple"
                            />
                            <StatCard
                                emoji="🗓️"
                                label="Activities"
                                value={analytics?.totalActivities || 0}
                                color="blue"
                            />
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1
                                        lg:grid-cols-2 gap-6">

                            {/* Trip Status Pie */}
                            <div className="bg-white border
                                border-slate-200 rounded-2xl p-6">
                                <h3 className="font-semibold
                                    text-slate-800 mb-4">
                                    Trip Status Distribution
                                </h3>
                                {tripStatusData.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height={250}>
                                        <PieChart>
                                            <Pie
                                                data={tripStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {tripStatusData.map(
                                                    (entry, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={
                                                    <CustomTooltip />}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-48 flex
                                        items-center justify-center
                                        text-slate-400 text-sm">
                                        No trip data yet
                                    </div>
                                )}
                            </div>

                            {/* Activity Types Bar */}
                            <div className="bg-white border
                                border-slate-200 rounded-2xl p-6">
                                <h3 className="font-semibold
                                    text-slate-800 mb-4">
                                    Activity Types
                                </h3>
                                {activityBarData.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height={250}>
                                        <BarChart
                                            data={activityBarData}
                                            margin={{
                                                left: -20,
                                                bottom: 20
                                            }}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#f1f5f9"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 10 }}
                                                angle={-30}
                                                textAnchor="end"
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11 }}
                                            />
                                            <Tooltip
                                                content={
                                                    <CustomTooltip />}
                                            />
                                            <Bar
                                                dataKey="value"
                                                fill="#3b82f6"
                                                radius={[6,6,0,0]}
                                                name="Activities"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-48 flex
                                        items-center justify-center
                                        text-slate-400 text-sm">
                                        No activity data yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Monthly Trips Line Chart */}
                        {monthlyTripData.length > 0 && (
                            <div className="bg-white border
                                border-slate-200 rounded-2xl p-6">
                                <h3 className="font-semibold
                                    text-slate-800 mb-4">
                                    Trips Over Time
                                </h3>
                                <ResponsiveContainer
                                    width="100%"
                                    height={200}>
                                    <AreaChart
                                        data={monthlyTripData}>
                                        <defs>
                                            <linearGradient
                                                id="colorTrips"
                                                x1="0" y1="0"
                                                x2="0" y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0.1}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                        />
                                        <Tooltip
                                            content={
                                                <CustomTooltip />}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="url(#colorTrips)"
                                            name="Trips"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Top Destinations */}
                        {analytics?.topDestinations?.length > 0 && (
                            <div className="bg-white border
                                border-slate-200 rounded-2xl p-6">
                                <h3 className="font-semibold
                                    text-slate-800 mb-4">
                                    Your Destinations 🌍
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {analytics.topDestinations
                                            .map((dest, i) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2
                                                bg-blue-50 text-blue-700
                                                rounded-full text-sm
                                                font-medium border
                                                border-blue-100"
                                        >
                                            📍 {dest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ============================================
                    EXPENSES TAB
                ============================================ */}
                {activeTab === 'expenses' && (
                    <div className="space-y-6">

                        {/* Budget Summary */}
                        <div className="grid grid-cols-1
                                        sm:grid-cols-3 gap-4">
                            <div className="bg-white border
                                border-slate-200 rounded-2xl p-5">
                                <p className="text-xs
                                    text-slate-400">
                                    Total Budget
                                </p>
                                <p className="text-2xl font-bold
                                    text-slate-800 mt-1">
                                    ₹{(analytics
                                        ?.totalBudgetAllocated || 0)
                                        .toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-red-50 border
                                border-red-100 rounded-2xl p-5">
                                <p className="text-xs
                                    text-red-400">
                                    Total Spent
                                </p>
                                <p className="text-2xl font-bold
                                    text-red-600 mt-1">
                                    ₹{(analytics
                                        ?.totalAmountSpent || 0)
                                        .toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-green-50 border
                                border-green-100 rounded-2xl p-5">
                                <p className="text-xs
                                    text-green-400">
                                    Remaining
                                </p>
                                <p className="text-2xl font-bold
                                    text-green-600 mt-1">
                                    ₹{(analytics
                                        ?.totalAmountRemaining || 0)
                                        .toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Expense Pie Chart */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h3 className="font-semibold
                                text-slate-800 mb-4">
                                Spending by Category
                            </h3>
                            {expensePieData.length > 0 ? (
                                <div className="flex flex-col
                                    lg:flex-row items-center gap-6">
                                    <ResponsiveContainer
                                        width={280}
                                        height={280}>
                                        <PieChart>
                                            <Pie
                                                data={expensePieData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {expensePieData.map(
                                                    (_, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={
                                                            COLORS[
                                                                i %
                                                                COLORS.length
                                                            ]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={
                                                    (val) =>
                                                    `₹${val.toLocaleString()}`}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Legend */}
                                    <div className="flex-1
                                        space-y-3 w-full">
                                        {expensePieData.map(
                                            (item, i) => (
                                            <div
                                                key={i}
                                                className="flex
                                                    items-center
                                                    justify-between"
                                            >
                                                <div className="flex
                                                    items-center
                                                    gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            background:
                                                                COLORS[
                                                                    i %
                                                                    COLORS.length
                                                                ]
                                                        }}
                                                    />
                                                    <span className="text-sm
                                                        text-slate-600">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm
                                                    font-semibold
                                                    text-slate-800">
                                                    ₹{item.value
                                                        .toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex
                                    items-center justify-center
                                    text-slate-400">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">
                                            💰
                                        </div>
                                        <p className="text-sm">
                                            No expenses recorded yet
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Category Bar Chart */}
                        {expensePieData.length > 0 && (
                            <div className="bg-white border
                                border-slate-200 rounded-2xl p-6">
                                <h3 className="font-semibold
                                    text-slate-800 mb-4">
                                    Category Comparison
                                </h3>
                                <ResponsiveContainer
                                    width="100%"
                                    height={250}>
                                    <BarChart
                                        data={expensePieData}
                                        margin={{ left: 10 }}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            tickFormatter={
                                                v => `₹${v/1000}k`}
                                        />
                                        <Tooltip
                                            formatter={
                                                v =>
                                                `₹${v.toLocaleString()}`}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[6,6,0,0]}
                                            name="Amount"
                                        >
                                            {expensePieData.map(
                                                (_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={
                                                        COLORS[
                                                            i %
                                                            COLORS.length
                                                        ]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}

                {/* ============================================
                    TRIPS TAB
                ============================================ */}
                {activeTab === 'trips' && (
                    <div className="space-y-6">

                        {/* Trip Stats */}
                        <div className="grid grid-cols-2
                                        sm:grid-cols-5 gap-4">
                            {[
                                { label: 'Planning',  value: analytics?.plannedTrips   || 0, color: 'bg-blue-50 border-blue-200 text-blue-700'   },
                                { label: 'Upcoming',  value: analytics?.upcomingTrips  || 0, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                                { label: 'Ongoing',   value: analytics?.ongoingTrips   || 0, color: 'bg-green-50 border-green-200 text-green-700'  },
                                { label: 'Completed', value: analytics?.completedTrips || 0, color: 'bg-slate-50 border-slate-200 text-slate-700'  },
                                { label: 'Cancelled', value: analytics?.cancelledTrips || 0, color: 'bg-red-50 border-red-200 text-red-700'       },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className={`border rounded-2xl
                                        p-4 text-center ${item.color}`}
                                >
                                    <div className="text-2xl
                                        font-bold">{item.value}</div>
                                    <div className="text-xs
                                        font-medium mt-1">
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trip List */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <div className="flex justify-between
                                items-center mb-4">
                                <h3 className="font-semibold
                                    text-slate-800">
                                    Your Trips
                                </h3>
                                <button
                                    onClick={() =>
                                        navigate('/trips/create')}
                                    className="text-sm text-blue-600
                                        hover:underline"
                                >
                                    + New Trip
                                </button>
                            </div>

                            {trips.length === 0 ? (
                                <div className="text-center py-8
                                    text-slate-400">
                                    <p className="text-sm">
                                        No trips yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {trips.map(trip => (
                                        <div
                                            key={trip.id}
                                            onClick={() =>
                                                navigate(
                                                    `/trips/${trip.id}`)}
                                            className="flex items-center
                                                justify-between p-4
                                                bg-slate-50 rounded-xl
                                                cursor-pointer
                                                hover:bg-blue-50
                                                hover:border-blue-200
                                                border border-transparent
                                                transition"
                                        >
                                            <div>
                                                <p className="font-medium
                                                    text-slate-800
                                                    text-sm">
                                                    {trip.title}
                                                </p>
                                                <p className="text-xs
                                                    text-slate-400 mt-0.5">
                                                    📍 {trip.destination}
                                                    {' '}• {trip.totalDays} days
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs
                                                    px-2 py-1
                                                    rounded-full
                                                    font-medium
                                                    ${trip.status === 'COMPLETED'
                                                        ? 'bg-slate-100 text-slate-600'
                                                        : trip.status === 'ONGOING'
                                                        ? 'bg-green-100 text-green-700'
                                                        : trip.status === 'UPCOMING'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-blue-100 text-blue-700'}`}
                                                >
                                                    {trip.status}
                                                </span>
                                                {trip.totalBudget && (
                                                    <p className="text-xs
                                                        text-slate-400
                                                        mt-1">
                                                        ₹{trip.totalBudget
                                                            .toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Avg Budget */}
                        {analytics?.averageBudgetPerTrip > 0 && (
                            <div className="bg-blue-50 border
                                border-blue-200 rounded-2xl p-5">
                                <p className="text-sm
                                    text-blue-600 font-medium">
                                    💡 Average budget per trip:
                                    <span className="font-bold ml-1">
                                        ₹{analytics
                                            .averageBudgetPerTrip
                                            .toLocaleString()}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ============================================
                    REPORT TAB
                ============================================ */}
                {activeTab === 'report' && (
                    <div className="space-y-6">

                        {/* Trip Selector */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h3 className="font-semibold
                                text-slate-800 mb-3">
                                Select Trip for Report
                            </h3>
                            <select
                                value={selectedTrip}
                                onChange={handleTripSelect}
                                className="w-full border
                                    border-slate-200 rounded-xl
                                    px-4 py-2.5 text-sm
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500"
                            >
                                <option value="">
                                    -- Select a trip --
                                </option>
                                {trips.map(trip => (
                                    <option
                                        key={trip.id}
                                        value={trip.id}
                                    >
                                        {trip.title}
                                        {' '}— {trip.destination}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Loading */}
                        {reportLoading && (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-2
                                    border-blue-600
                                    border-t-transparent
                                    rounded-full animate-spin
                                    mx-auto" />
                            </div>
                        )}

                        {/* Report */}
                        {report && !reportLoading && (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2
                                    sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Budget',  value: `₹${(report.totalBudget || 0).toLocaleString()}`,  color: 'bg-blue-50 text-blue-700 border-blue-100'   },
                                        { label: 'Total Spent',   value: `₹${(report.totalSpent || 0).toLocaleString()}`,   color: 'bg-red-50 text-red-700 border-red-100'     },
                                        { label: 'Remaining',     value: `₹${(report.totalRemaining || 0).toLocaleString()}`, color: 'bg-green-50 text-green-700 border-green-100' },
                                        { label: 'Spent %',       value: `${report.spentPercentage || 0}%`,                  color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className={`border
                                                rounded-2xl p-4
                                                ${item.color}`}
                                        >
                                            <p className="text-xs
                                                opacity-70">
                                                {item.label}
                                            </p>
                                            <p className="text-xl
                                                font-bold mt-1">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Budget Progress */}
                                <div className="bg-white border
                                    border-slate-200 rounded-2xl p-6">
                                    <h3 className="font-semibold
                                        text-slate-800 mb-3">
                                        Budget Usage
                                    </h3>
                                    <div className="w-full bg-slate-100
                                        rounded-full h-4 mb-2">
                                        <div
                                            className={`h-4 rounded-full
                                                transition-all
                                                ${(report.spentPercentage || 0) >= 90
                                                    ? 'bg-red-500'
                                                    : (report.spentPercentage || 0) >= 70
                                                    ? 'bg-yellow-500'
                                                    : 'bg-blue-500'}`}
                                            style={{
                                                width: `${Math.min(
                                                    report.spentPercentage
                                                        || 0, 100)}%`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs
                                        text-slate-500">
                                        {report.spentPercentage}%
                                        of budget used
                                    </p>
                                </div>

                                {/* Category Chart */}
                                {reportCatData.length > 0 && (
                                    <div className="bg-white border
                                        border-slate-200 rounded-2xl
                                        p-6">
                                        <h3 className="font-semibold
                                            text-slate-800 mb-4">
                                            Spending by Category
                                        </h3>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={250}>
                                            <BarChart
                                                data={reportCatData}
                                                margin={{left: 10}}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#f1f5f9"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{fontSize:11}}
                                                />
                                                <YAxis
                                                    tick={{fontSize:11}}
                                                    tickFormatter={
                                                        v =>
                                                        `₹${v/1000}k`}
                                                />
                                                <Tooltip
                                                    formatter={
                                                        v =>
                                                        `₹${v.toLocaleString()}`}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    radius={[6,6,0,0]}
                                                    name="Amount"
                                                >
                                                    {reportCatData
                                                            .map((_,i)=>(
                                                        <Cell
                                                            key={i}
                                                            fill={
                                                                COLORS[
                                                                    i %
                                                                    COLORS
                                                                    .length
                                                                ]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Daily Spending */}
                                {dailySpendData.length > 0 && (
                                    <div className="bg-white border
                                        border-slate-200 rounded-2xl
                                        p-6">
                                        <h3 className="font-semibold
                                            text-slate-800 mb-4">
                                            Daily Spending
                                        </h3>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={200}>
                                            <AreaChart
                                                data={dailySpendData}>
                                                <defs>
                                                    <linearGradient
                                                        id="colorSpend"
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
                                                    tick={{fontSize:10}}
                                                />
                                                <YAxis
                                                    tick={{fontSize:11}}
                                                    tickFormatter={
                                                        v =>
                                                        `₹${v/1000}k`}
                                                />
                                                <Tooltip
                                                    formatter={
                                                        v =>
                                                        `₹${v.toLocaleString()}`}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="amount"
                                                    stroke="#ef4444"
                                                    strokeWidth={2}
                                                    fill="url(#colorSpend)"
                                                    name="Spent"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Top Expenses */}
                                {report.topExpenses?.length > 0 && (
                                    <div className="bg-white border
                                        border-slate-200 rounded-2xl
                                        p-6">
                                        <h3 className="font-semibold
                                            text-slate-800 mb-4">
                                            Top Expenses
                                        </h3>
                                        <div className="space-y-3">
                                            {report.topExpenses
                                                    .map((exp, i) => (
                                                <div
                                                    key={i}
                                                    className="flex
                                                        items-center
                                                        justify-between
                                                        p-3 bg-slate-50
                                                        rounded-xl"
                                                >
                                                    <div className="flex
                                                        items-center
                                                        gap-3">
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                            style={{
                                                                background:
                                                                    COLORS[
                                                                        i %
                                                                        COLORS
                                                                        .length
                                                                    ]
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
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold
                                                        text-slate-800">
                                                        ₹{exp.amount
                                                            ?.toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Shared vs Personal */}
                                {(report.sharedExpensesTotal > 0
                                    || report.personalExpensesTotal
                                        > 0) && (
                                    <div className="grid
                                        grid-cols-2 gap-4">
                                        <div className="bg-purple-50
                                            border border-purple-100
                                            rounded-2xl p-5">
                                            <p className="text-xs
                                                text-purple-500">
                                                Shared Expenses
                                            </p>
                                            <p className="text-xl
                                                font-bold
                                                text-purple-700 mt-1">
                                                ₹{report
                                                    .sharedExpensesTotal
                                                    ?.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-blue-50
                                            border border-blue-100
                                            rounded-2xl p-5">
                                            <p className="text-xs
                                                text-blue-500">
                                                Personal Expenses
                                            </p>
                                            <p className="text-xl
                                                font-bold
                                                text-blue-700 mt-1">
                                                ₹{report
                                                    .personalExpensesTotal
                                                    ?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* No trip selected */}
                        {!selectedTrip && !reportLoading && (
                            <div className="bg-white border
                                border-slate-200 rounded-2xl
                                p-12 text-center">
                                <div className="text-4xl mb-3">
                                    📋
                                </div>
                                <p className="font-semibold
                                    text-slate-700">
                                    Select a trip above
                                </p>
                                <p className="text-sm
                                    text-slate-400 mt-1">
                                    View detailed expense report
                                    for any trip
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Analytics;