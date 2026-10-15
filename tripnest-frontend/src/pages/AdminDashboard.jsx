import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dashboardAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Tooltip, PieChart, Pie,
    Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#06b6d4',
];

const Skeleton = ({ className }) => (
    <div className={`bg-slate-200 animate-pulse
                     rounded-xl ${className}`} />
);

const AdminDashboard = () => {
    const navigate  = useNavigate();
    const { user }  = useAuth();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        // Block non-admin
        if (user && user.role !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }
        fetchAdminData();
    }, [user]);

    const fetchAdminData = async () => {
        try {
            const res =
                await dashboardAPI.getAdminDashboard();
            setData(res.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Access denied — Admin only');
            } else {
                setError('Failed to load admin data');
            }
        } finally {
            setLoading(false);
        }
    };

    // Chart data
    const userRoleData = data
        ? Object.entries(data.usersByRole || {})
                .map(([name, value]) => ({ name, value }))
        : [];

    const tripStatusData = data
        ? Object.entries(data.tripsByStatus || {})
                .map(([name, value]) => ({ name, value }))
        : [];

    const destData = data
        ? (data.popularDestinations || [])
                .slice(0, 8)
                .map(d => ({
                    name: d.destination,
                    trips: d.tripCount,
                    pct: d.percentage,
                }))
        : [];

    const expCatData = data
        ? Object.entries(
                data.platformExpensesByCategory || {})
                .filter(([, v]) => v > 0)
                .map(([name, value]) => ({ name, value }))
        : [];

    const monthlyUserData = data
        ? Object.entries(data.monthlySignups || {})
                .map(([month, count]) => ({ month, count }))
        : [];

    const monthlyTripData = data
        ? Object.entries(data.monthlyTripCount || {})
                .map(([month, count]) => ({ month, count }))
        : [];

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6
                             pt-24 sm:pt-28 pb-12">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-2
                                sm:grid-cols-4 gap-4 mb-6">
                    {[1,2,3,4].map(i => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <div className="grid grid-cols-1
                                lg:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => (
                        <Skeleton key={i} className="h-72" />
                    ))}
                </div>
            </main>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex items-center justify-center
                            h-64">
                <div className="text-center">
                    <div className="text-4xl mb-3">🔒</div>
                    <p className="text-red-600 font-semibold">
                        {error}
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 text-blue-600
                                   hover:underline text-sm"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6
                             pt-24 sm:pt-28 pb-12">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold
                                   text-slate-900">
                        Admin Dashboard 🛡️
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Platform-wide analytics and insights
                    </p>
                </div>

                {/* Platform Stats */}
                <div className="grid grid-cols-2
                                sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { emoji: '👥', label: 'Total Users',
                          value: data?.totalUsers || 0,
                          sub: `${data?.activeUsers || 0} active`,
                          color: 'bg-blue-50 border-blue-100' },
                        { emoji: '✈️', label: 'Total Trips',
                          value: data?.totalTrips || 0,
                          sub: `${data?.averageTripDays || 0}d avg`,
                          color: 'bg-green-50 border-green-100' },
                        { emoji: '💰', label: 'Platform Spending',
                          value: `₹${((data?.totalPlatformSpending || 0) / 1000).toFixed(0)}k`,
                          sub: `${data?.totalExpenses || 0} expenses`,
                          color: 'bg-yellow-50 border-yellow-100' },
                        { emoji: '👥', label: 'Groups',
                          value: data?.totalGroups || 0,
                          sub: `${data?.totalDocuments || 0} docs`,
                          color: 'bg-purple-50 border-purple-100' },
                    ].map((card, i) => (
                        <div
                            key={i}
                            className={`border rounded-2xl p-5
                                        ${card.color}`}
                        >
                            <div className="text-2xl mb-2">
                                {card.emoji}
                            </div>
                            <div className="text-2xl font-bold
                                            text-slate-900">
                                {card.value}
                            </div>
                            <div className="text-xs font-medium
                                text-slate-500 mt-0.5">
                                {card.label}
                            </div>
                            {card.sub && (
                                <div className="text-[10px]
                                    text-slate-400 mt-0.5">
                                    {card.sub}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1
                                lg:grid-cols-2 gap-6 mb-6">

                    {/* User Growth */}
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            User Growth 📈
                        </h3>
                        {monthlyUserData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={220}>
                                <AreaChart
                                    data={monthlyUserData}>
                                    <defs>
                                        <linearGradient
                                            id="userGrad"
                                            x1="0" y1="0"
                                            x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="#3b82f6"
                                                stopOpacity={0.15}
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
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="url(#userGrad)"
                                        name="New Users"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex
                                items-center justify-center
                                text-slate-400 text-sm">
                                No user data yet
                            </div>
                        )}
                    </div>

                    {/* Trip Growth */}
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Trip Activity 📅
                        </h3>
                        {monthlyTripData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={220}>
                                <BarChart
                                    data={monthlyTripData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="count"
                                        fill="#10b981"
                                        radius={[6,6,0,0]}
                                        name="Trips"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex
                                items-center justify-center
                                text-slate-400 text-sm">
                                No trip data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1
                                lg:grid-cols-2 gap-6 mb-6">

                    {/* Popular Destinations */}
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Popular Destinations 🌍
                        </h3>
                        {destData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={250}>
                                <BarChart
                                    data={destData}
                                    layout="vertical"
                                    margin={{ left: 20 }}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 10 }}
                                        width={80}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="trips"
                                        fill="#3b82f6"
                                        radius={[0,6,6,0]}
                                        name="Trips"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex
                                items-center justify-center
                                text-slate-400 text-sm">
                                No destination data
                            </div>
                        )}
                    </div>

                    {/* Platform Expenses */}
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Platform Expenses 💰
                        </h3>
                        {expCatData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={250}>
                                <PieChart>
                                    <Pie
                                        data={expCatData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {expCatData.map(
                                            (_, i) => (
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
                                    </Pie>
                                    <Tooltip
                                        formatter={v =>
                                            `₹${v
                                            .toLocaleString()}`}
                                    />
                                    <Legend
                                        formatter={
                                            (val) =>
                                            <span
                                                className="text-xs">
                                                {val}
                                            </span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex
                                items-center justify-center
                                text-slate-400 text-sm">
                                No expense data
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1
                                lg:grid-cols-2 gap-6">

                    {/* Users by Role */}
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Users by Role
                        </h3>
                        <div className="space-y-3">
                            {userRoleData.map((item, i) => (
                                <div key={i}>
                                    <div className="flex
                                        justify-between
                                        text-sm mb-1">
                                        <span className="text-slate-600
                                            font-medium">
                                            {item.name}
                                        </span>
                                        <span className="font-bold
                                            text-slate-800">
                                            {item.value}
                                        </span>
                                    </div>
                                    <div className="w-full
                                        bg-slate-100
                                        rounded-full h-2">
                                        <div
                                            className="h-2
                                                rounded-full"
                                            style={{
                                                background:
                                                    COLORS[
                                                        i %
                                                        COLORS
                                                        .length
                                                    ],
                                                width: `${
                                                    ((item.value /
                                                    (data?.totalUsers
                                                        || 1))
                                                    * 100)
                                                    .toFixed(0)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trip Status */}
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6">
                        <h3 className="font-semibold
                            text-slate-800 mb-4">
                            Trips by Status
                        </h3>
                        <div className="space-y-3">
                            {tripStatusData.map((item, i) => (
                                <div key={i}
                                     className="flex
                                        justify-between
                                        items-center p-3
                                        bg-slate-50 rounded-xl">
                                    <span className="text-sm
                                        text-slate-600
                                        font-medium">
                                        {item.name}
                                    </span>
                                    <span className="font-bold
                                        text-slate-900">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;