import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { notificationAPI } from '../utils/api';

const typeEmoji = {
    TRIP_REMINDER:     '✈️',
    ACTIVITY_REMINDER: '🗓️',
    BUDGET_ALERT:      '💰',
    GROUP_INVITATION:  '👥',
    TRAVEL_UPDATE:     '🔄',
    SYSTEM:            '🔔',
};

const typeLabel = {
    TRIP_REMINDER:     'Trip Reminder',
    ACTIVITY_REMINDER: 'Activity',
    BUDGET_ALERT:      'Budget Alert',
    GROUP_INVITATION:  'Group',
    TRAVEL_UPDATE:     'Trip Update',
    SYSTEM:            'System',
};

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [filter, setFilter]               = useState('ALL');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data);
        } catch {
            console.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationAPI.markRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id
                    ? { ...n, isRead: true } : n));
        } catch {}
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true })));
        } catch {}
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.delete(id);
            setNotifications(prev =>
                prev.filter(n => n.id !== id));
        } catch {}
    };

    const handleClick = async (notif) => {
        if (!notif.isRead) await handleMarkRead(notif.id);
        if (notif.redirectUrl) navigate(notif.redirectUrl);
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now  = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60)    return 'Just now';
        if (diff < 3600)  return Math.floor(diff/60) + 'm ago';
        if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
        return date.toLocaleDateString('en-IN');
    };

    const filters = ['ALL', 'UNREAD',
        'TRIP_REMINDER', 'BUDGET_ALERT',
        'GROUP_INVITATION', 'ACTIVITY_REMINDER'];

    const filtered = notifications.filter(n => {
        if (filter === 'ALL')    return true;
        if (filter === 'UNREAD') return !n.isRead;
        return n.notificationType === filter;
    });

    const unreadCount = notifications.filter(
            n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4
                             sm:px-6 pt-24 sm:pt-28 pb-12">

                {/* Header */}
                <div className="flex justify-between
                                items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold
                                       text-slate-900">
                            Notifications 🔔
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {unreadCount > 0
                                ? `${unreadCount} unread`
                                : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-blue-600
                                       hover:underline font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full
                                text-xs font-semibold transition
                                ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
                        >
                            {f === 'ALL' ? 'All' :
                             f === 'UNREAD' ? 'Unread' :
                             typeLabel[f] || f}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => (
                            <div key={i}
                                 className="bg-white rounded-2xl
                                            p-4 animate-pulse h-20"/>
                        ))}
                    </div>

                ) : filtered.length === 0 ? (

                    /* Empty */
                    <div className="bg-white border border-slate-200
                                    rounded-2xl p-12 text-center">
                        <div className="text-4xl mb-3">🔔</div>
                        <p className="font-semibold text-slate-700">
                            No notifications
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            {filter !== 'ALL'
                                ? 'Try a different filter'
                                : 'You are all caught up!'}
                        </p>
                    </div>

                ) : (

                    /* List */
                    <div className="space-y-2">
                        {filtered.map(notif => (
                            <div
                                key={notif.id}
                                className={`bg-white border
                                    rounded-2xl p-4 transition
                                    ${!notif.isRead
                                        ? 'border-blue-200 bg-blue-50/30'
                                        : 'border-slate-200'}
                                    ${notif.redirectUrl
                                        ? 'cursor-pointer hover:border-blue-300 hover:shadow-sm'
                                        : ''}`}
                                onClick={() =>
                                    notif.redirectUrl &&
                                    handleClick(notif)}
                            >
                                <div className="flex items-start
                                                gap-3">

                                    {/* Icon */}
                                    <div className="w-10 h-10
                                        shrink-0 rounded-xl
                                        bg-slate-100 flex
                                        items-center
                                        justify-center text-xl">
                                        {typeEmoji[
                                            notif.notificationType]
                                            || '🔔'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm
                                            leading-relaxed
                                            ${!notif.isRead
                                                ? 'text-slate-900 font-medium'
                                                : 'text-slate-600'}`}>
                                            {notif.message}
                                        </p>

                                        <div className="flex
                                            items-center gap-3 mt-2">
                                            <span className="text-[10px]
                                                text-slate-400">
                                                {formatTime(
                                                    notif.createdAt)}
                                            </span>
                                            <span className="text-[10px]
                                                bg-slate-100
                                                text-slate-500
                                                px-2 py-0.5
                                                rounded-full">
                                                {typeLabel[
                                                    notif
                                                    .notificationType]
                                                    || 'System'}
                                            </span>
                                            {notif.redirectUrl && (
                                                <span className="text-[10px]
                                                    text-blue-500
                                                    font-medium">
                                                    Click to view →
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center
                                                    gap-2 shrink-0"
                                         onClick={e =>
                                             e.stopPropagation()}>
                                        {!notif.isRead && (
                                            <button
                                                onClick={() =>
                                                    handleMarkRead(
                                                        notif.id)}
                                                className="text-[10px]
                                                    text-blue-600
                                                    hover:underline"
                                            >
                                                Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                handleDelete(notif.id)}
                                            className="text-[10px]
                                                text-red-400
                                                hover:text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {/* Unread dot */}
                                    {!notif.isRead && (
                                        <span className="w-2 h-2
                                            bg-blue-500 rounded-full
                                            shrink-0 mt-1" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Notifications;