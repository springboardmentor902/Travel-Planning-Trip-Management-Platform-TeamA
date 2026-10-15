import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TRAVEL_STYLES = [
    { value: 'ADVENTURE',   label: '🏔️ Adventure'   },
    { value: 'LUXURY',      label: '💎 Luxury'        },
    { value: 'BUDGET',      label: '💰 Budget'        },
    { value: 'BACKPACKER',  label: '🎒 Backpacker'   },
    { value: 'FAMILY',      label: '👨‍👩‍👧 Family'   },
    { value: 'SOLO',        label: '🧍 Solo'          },
    { value: 'COUPLE',      label: '💑 Couple'        },
];

const BUDGET_RANGES = [
    { value: 'BUDGET',      label: '💸 Under ₹10k'   },
    { value: 'MODERATE',    label: '💳 ₹10k–30k'     },
    { value: 'COMFORTABLE', label: '💰 ₹30k–60k'     },
    { value: 'LUXURY',      label: '💎 ₹60k+'         },
];

const PREFERENCES = [
    'Beach', 'Mountains', 'City', 'Countryside',
    'Historical Sites', 'Adventure Sports', 'Wildlife',
    'Food Tourism', 'Shopping', 'Nightlife',
    'Temples', 'Backpacking', 'Cruises',
];

const TABS = [
    { id: 'profile',      label: '👤 Profile'      },
    { id: 'preferences',  label: '🎯 Preferences'  },
    { id: 'history',      label: '🗺️ History'      },
    { id: 'settings',     label: '⚙️ Settings'     },
];

const Profile = () => {
    const navigate   = useNavigate();
    const { logout } = useAuth();
    const fileRef    = useRef(null);

    const [profile,     setProfile]     = useState(null);
    const [history,     setHistory]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [uploading,   setUploading]   = useState(false);
    const [activeTab,   setActiveTab]   = useState('profile');
    const [success,     setSuccess]     = useState('');
    const [error,       setError]       = useState('');

    const [form, setForm] = useState({
        name:                '',
        bio:                 '',
        phone:               '',
        city:                '',
        country:             '',
        travelStyle:         '',
        budgetRange:         '',
        travelPreferences:   [],
        favoriteDestinations:[],
        newDest:             '',
    });

    const [pwForm, setPwForm] = useState({
        currentPassword: '',
        newPassword:     '',
        confirmPassword: '',
    });

    // ============================================================
    // FETCH
    // ============================================================

    useEffect(() => {
        fetchProfile();
        fetchHistory();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/profile');
            setProfile(res.data);
            setForm(prev => ({
                ...prev,
                name:    res.data.name    || '',
                bio:     res.data.bio     || '',
                phone:   res.data.phone   || '',
                city:    res.data.city    || '',
                country: res.data.country || '',
                travelStyle:
                    res.data.travelStyle  || '',
                budgetRange:
                    res.data.budgetRange  || '',
                travelPreferences:
                    res.data.travelPreferences   || [],
                favoriteDestinations:
                    res.data.favoriteDestinations || [],
            }));
        } catch {}
        finally { setLoading(false); }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(
                    '/api/profile/history');
            setHistory(res.data);
        } catch {}
    };

    // ============================================================
    // HANDLERS
    // ============================================================

    const showMsg = (msg, isError = false) => {
        if (isError) setError(msg);
        else setSuccess(msg);
        setTimeout(() => {
            setSuccess('');
            setError('');
        }, 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/api/profile', {
                name:                form.name,
                bio:                 form.bio,
                phone:               form.phone,
                city:                form.city,
                country:             form.country,
                travelStyle:
                    form.travelStyle || null,
                budgetRange:
                    form.budgetRange || null,
                travelPreferences:
                    form.travelPreferences,
                favoriteDestinations:
                    form.favoriteDestinations,
            });
            await fetchProfile();
            showMsg('Profile updated!');
        } catch (err) {
            showMsg(err.response?.data?.error
                    || 'Save failed!', true);
        } finally { setSaving(false); }
    };

    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            await api.post('/api/profile/picture', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });
            await fetchProfile();
            showMsg('Photo updated!');
        } catch (err) {
            showMsg(err.response?.data?.error
                    || 'Upload failed!', true);
        } finally { setUploading(false); }
    };

    const handlePasswordChange = async () => {
        if (pwForm.newPassword
                !== pwForm.confirmPassword) {
            showMsg('Passwords do not match!', true);
            return;
        }
        if (pwForm.newPassword.length < 6) {
            showMsg('Min 6 characters!', true);
            return;
        }
        try {
            await api.put('/api/profile/password', {
                currentPassword: pwForm.currentPassword,
                newPassword:     pwForm.newPassword,
            });
            setPwForm({
                currentPassword: '',
                newPassword:     '',
                confirmPassword: '',
            });
            showMsg('Password changed!');
        } catch (err) {
            showMsg(err.response?.data?.error
                    || 'Failed!', true);
        }
    };

    const togglePref = (pref) => {
        setForm(prev => ({
            ...prev,
            travelPreferences:
                prev.travelPreferences.includes(pref)
                ? prev.travelPreferences.filter(
                        p => p !== pref)
                : [...prev.travelPreferences, pref],
        }));
    };

    const addDest = () => {
        const d = form.newDest.trim();
        if (!d) return;
        if (form.favoriteDestinations.includes(d)) {
            setForm(p => ({ ...p, newDest: '' }));
            return;
        }
        setForm(p => ({
            ...p,
            favoriteDestinations:
                [...p.favoriteDestinations, d],
            newDest: '',
        }));
    };

    const removeDest = (dest) => {
        setForm(p => ({
            ...p,
            favoriteDestinations:
                p.favoriteDestinations.filter(
                        d => d !== dest),
        }));
    };

    // ============================================================
    // LOADING
    // ============================================================

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

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4
                sm:px-6 pt-24 sm:pt-28 pb-12">

                {/* ============================================
                    PROFILE HEADER
                ============================================ */}
                <div className="bg-white border
                    border-slate-200 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-5">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-20 h-20
                                rounded-full overflow-hidden
                                bg-blue-100 border-2
                                border-blue-200">
                                {profile?.profilePicture ? (
                                    <img
                                        src={
                                            profile
                                            .profilePicture}
                                        alt="avatar"
                                        className="w-full
                                            h-full
                                            object-cover"
                                    />
                                ) : (
                                    <div className="w-full
                                        h-full flex items-center
                                        justify-center
                                        text-blue-600 font-bold
                                        text-3xl">
                                        {profile?.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() =>
                                    fileRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0
                                    right-0 w-7 h-7 bg-blue-600
                                    text-white rounded-full
                                    flex items-center
                                    justify-center text-xs
                                    hover:bg-blue-700
                                    disabled:opacity-50"
                            >
                                {uploading ? '⏳' : '📷'}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePictureUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold
                                text-slate-900">
                                {profile?.name}
                            </h1>
                            <p className="text-sm
                                text-slate-400 mt-0.5">
                                {profile?.email}
                            </p>
                            <div className="flex gap-2 mt-2
                                flex-wrap">
                                <span className="text-xs
                                    bg-blue-100 text-blue-700
                                    px-2 py-0.5 rounded-full
                                    font-medium">
                                    {profile?.role}
                                </span>
                                {profile?.city && (
                                    <span className="text-xs
                                        text-slate-400">
                                        📍 {profile.city}
                                        {profile.country
                                            && `, ${profile.country}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4
                        mt-5 pt-5 border-t border-slate-50">
                        {[
                            { label: 'Total Trips',
                              value: profile?.totalTrips || 0 },
                            { label: 'Completed',
                              value: profile?.completedTrips || 0 },
                            { label: 'Groups',
                              value: profile?.totalGroups || 0 },
                        ].map((s, i) => (
                            <div key={i}
                                 className="text-center">
                                <p className="text-2xl font-bold
                                    text-blue-600">
                                    {s.value}
                                </p>
                                <p className="text-xs
                                    text-slate-400 mt-0.5">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                {success && (
                    <div className="mb-4 bg-green-50 border
                        border-green-200 text-green-700
                        rounded-xl px-4 py-3 text-sm">
                        ✅ {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 bg-red-50 border
                        border-red-200 text-red-600
                        rounded-xl px-4 py-3 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* ============================================
                    TABS
                ============================================ */}
                <div className="flex gap-1 mb-6 border-b
                    border-slate-200 overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() =>
                                setActiveTab(tab.id)}
                            className={`pb-3 px-4 text-sm
                                font-medium whitespace-nowrap
                                transition border-b-2
                                ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ============================================
                    PROFILE TAB
                ============================================ */}
                {activeTab === 'profile' && (
                    <div className="bg-white border
                        border-slate-200 rounded-2xl p-6
                        space-y-4">
                        <h2 className="font-semibold
                            text-slate-800">
                            Basic Information
                        </h2>

                        <div>
                            <label className="block text-xs
                                font-medium text-slate-500
                                mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(p =>
                                    ({ ...p,
                                       name: e.target.value }))}
                                className="w-full border
                                    border-slate-200 rounded-xl
                                    px-3 py-2 text-sm
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs
                                font-medium text-slate-500
                                mb-1">
                                Bio
                            </label>
                            <textarea
                                value={form.bio}
                                onChange={e => setForm(p =>
                                    ({ ...p,
                                       bio: e.target.value }))}
                                rows={3}
                                placeholder="Tell us about yourself..."
                                className="w-full border
                                    border-slate-200 rounded-xl
                                    px-3 py-2 text-sm resize-none
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs
                                    font-medium text-slate-500
                                    mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm(p =>
                                        ({ ...p,
                                           phone:
                                           e.target.value }))}
                                    placeholder="+91..."
                                    className="w-full border
                                        border-slate-200
                                        rounded-xl px-3 py-2
                                        text-sm
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs
                                    font-medium text-slate-500
                                    mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={e => setForm(p =>
                                        ({ ...p,
                                           city:
                                           e.target.value }))}
                                    placeholder="Mumbai..."
                                    className="w-full border
                                        border-slate-200
                                        rounded-xl px-3 py-2
                                        text-sm
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs
                                font-medium text-slate-500
                                mb-1">
                                Country
                            </label>
                            <input
                                type="text"
                                value={form.country}
                                onChange={e => setForm(p =>
                                    ({ ...p,
                                       country:
                                       e.target.value }))}
                                placeholder="India..."
                                className="w-full border
                                    border-slate-200 rounded-xl
                                    px-3 py-2 text-sm
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-blue-600
                                text-white py-2.5 rounded-xl
                                text-sm font-medium
                                hover:bg-blue-700
                                disabled:opacity-50
                                transition"
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                )}

                {/* ============================================
                    PREFERENCES TAB
                ============================================ */}
                {activeTab === 'preferences' && (
                    <div className="space-y-5">

                        {/* Travel Style */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h2 className="font-semibold
                                text-slate-800 mb-4">
                                Travel Style 🎒
                            </h2>
                            <div className="grid grid-cols-2
                                            sm:grid-cols-4 gap-3">
                                {TRAVEL_STYLES.map(s => (
                                    <button
                                        key={s.value}
                                        type="button"
                                        onClick={() =>
                                            setForm(p => ({
                                                ...p,
                                                travelStyle:
                                                    p.travelStyle
                                                    === s.value
                                                    ? ''
                                                    : s.value,
                                            }))}
                                        className={`p-3 rounded-xl
                                            border text-sm
                                            transition text-center
                                            ${form.travelStyle
                                                === s.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                                : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Budget Range */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h2 className="font-semibold
                                text-slate-800 mb-4">
                                Budget Range 💰
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {BUDGET_RANGES.map(b => (
                                    <button
                                        key={b.value}
                                        type="button"
                                        onClick={() =>
                                            setForm(p => ({
                                                ...p,
                                                budgetRange:
                                                    p.budgetRange
                                                    === b.value
                                                    ? ''
                                                    : b.value,
                                            }))}
                                        className={`p-3 rounded-xl
                                            border text-sm
                                            transition text-center
                                            ${form.budgetRange
                                                === b.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                                : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Travel Interests */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h2 className="font-semibold
                                text-slate-800 mb-4">
                                Travel Interests 🌍
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {PREFERENCES.map(pref => (
                                    <button
                                        key={pref}
                                        type="button"
                                        onClick={() =>
                                            togglePref(pref)}
                                        className={`px-3 py-1.5
                                            rounded-full text-xs
                                            font-medium border
                                            transition
                                            ${form
                                                .travelPreferences
                                                .includes(pref)
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Favorite Destinations */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h2 className="font-semibold
                                text-slate-800 mb-4">
                                Favorite Destinations ❤️
                            </h2>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={form.newDest}
                                    onChange={e =>
                                        setForm(p => ({
                                            ...p,
                                            newDest:
                                                e.target.value
                                        }))}
                                    onKeyDown={e =>
                                        e.key === 'Enter'
                                        && addDest()}
                                    placeholder="Add destination..."
                                    className="flex-1 border
                                        border-slate-200
                                        rounded-xl px-3 py-2
                                        text-sm
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={addDest}
                                    className="bg-blue-600
                                        text-white px-4 py-2
                                        rounded-xl text-sm
                                        hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {form.favoriteDestinations
                                        .map(dest => (
                                    <span
                                        key={dest}
                                        className="flex items-center
                                            gap-1 bg-blue-50
                                            border border-blue-200
                                            text-blue-700 text-xs
                                            px-3 py-1.5 rounded-full"
                                    >
                                        📍 {dest}
                                        <button
                                            onClick={() =>
                                                removeDest(dest)}
                                            className="ml-1
                                                text-blue-400
                                                hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {form.favoriteDestinations
                                        .length === 0 && (
                                    <p className="text-sm
                                        text-slate-400">
                                        No favorites yet
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-blue-600
                                text-white py-2.5 rounded-xl
                                text-sm font-medium
                                hover:bg-blue-700
                                disabled:opacity-50 transition"
                        >
                            {saving
                                ? 'Saving...'
                                : 'Save Preferences'}
                        </button>
                    </div>
                )}

                {/* ============================================
                    HISTORY TAB
                ============================================ */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h2 className="font-semibold
                                text-slate-800 mb-4">
                                Travel History 🗺️
                            </h2>

                            {history.length === 0 ? (
                                <div className="text-center
                                    py-10 text-slate-400">
                                    <div className="text-4xl mb-3">
                                        🌍
                                    </div>
                                    <p className="font-medium
                                        text-slate-600">
                                        No completed trips yet
                                    </p>
                                    <p className="text-sm mt-1">
                                        Complete a trip to see
                                        it here
                                    </p>
                                    <button
                                        onClick={() =>
                                            navigate('/trips')}
                                        className="mt-4
                                            text-blue-600
                                            text-sm
                                            hover:underline"
                                    >
                                        View my trips →
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map(trip => (
                                        <div
                                            key={trip.id}
                                            onClick={() =>
                                                navigate(
                                                `/trips/${trip.id}`)}
                                            className="flex
                                                items-center
                                                justify-between
                                                p-4 bg-slate-50
                                                rounded-xl
                                                cursor-pointer
                                                hover:bg-blue-50
                                                hover:border-blue-200
                                                border border-transparent
                                                transition"
                                        >
                                            <div className="flex
                                                items-center gap-3">
                                                <div className="w-10
                                                    h-10 bg-green-100
                                                    rounded-xl flex
                                                    items-center
                                                    justify-center
                                                    text-xl">
                                                    ✈️
                                                </div>
                                                <div>
                                                    <p className="font-medium
                                                        text-slate-800
                                                        text-sm">
                                                        {trip.title}
                                                    </p>
                                                    <p className="text-xs
                                                        text-slate-400">
                                                        📍{' '}
                                                        {trip.destination}
                                                        {' '}•{' '}
                                                        {trip.totalDays}d
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs
                                                    bg-green-100
                                                    text-green-700
                                                    px-2 py-1
                                                    rounded-full
                                                    font-medium">
                                                    Completed
                                                </span>
                                                <p className="text-xs
                                                    text-slate-400 mt-1">
                                                    {trip.endDate}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ============================================
                    SETTINGS TAB
                ============================================ */}
                {activeTab === 'settings' && (
                    <div className="space-y-5">

                        {/* Change Password */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h2 className="font-semibold
                                text-slate-800 mb-4">
                                Change Password 🔒
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { key: 'currentPassword',
                                      label: 'Current Password',
                                      ph: '••••••' },
                                    { key: 'newPassword',
                                      label: 'New Password',
                                      ph: 'Min 6 chars' },
                                    { key: 'confirmPassword',
                                      label: 'Confirm Password',
                                      ph: 'Repeat new' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block
                                            text-xs font-medium
                                            text-slate-500 mb-1">
                                            {f.label}
                                        </label>
                                        <input
                                            type="password"
                                            value={pwForm[f.key]}
                                            onChange={e =>
                                                setPwForm(p => ({
                                                    ...p,
                                                    [f.key]:
                                                    e.target.value
                                                }))}
                                            placeholder={f.ph}
                                            className="w-full
                                                border
                                                border-slate-200
                                                rounded-xl px-3
                                                py-2 text-sm
                                                focus:outline-none
                                                focus:ring-2
                                                focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={handlePasswordChange}
                                    className="w-full
                                        bg-blue-600 text-white
                                        py-2.5 rounded-xl
                                        text-sm font-medium
                                        hover:bg-blue-700
                                        transition"
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h2 className="font-semibold
                                text-slate-800 mb-4">
                                Account Info ℹ️
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Email',
                                      value: profile?.email },
                                    { label: 'Role',
                                      value: profile?.role },
                                    { label: 'Member Since',
                                      value: profile?.createdAt
                                            ?.split('T')[0] },
                                ].map((item, i) => (
                                    <div key={i}
                                         className="flex
                                            justify-between
                                            items-center py-2
                                            border-b
                                            border-slate-50
                                            last:border-0">
                                        <span className="text-sm
                                            text-slate-500">
                                            {item.label}
                                        </span>
                                        <span className="text-sm
                                            font-medium
                                            text-slate-800">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="bg-white border
                            border-slate-200 rounded-2xl p-6">
                            <h2 className="font-semibold
                                text-slate-800 mb-4">
                                Account Actions
                            </h2>
                            <button
                                onClick={logout}
                                className="w-full py-2.5
                                    border border-red-200
                                    text-red-600 rounded-xl
                                    text-sm font-medium
                                    hover:bg-red-50 transition"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;