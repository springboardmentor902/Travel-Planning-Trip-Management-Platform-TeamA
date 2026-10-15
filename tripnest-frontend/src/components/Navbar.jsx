import { useAuth } from "../context/AuthContext";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { notificationAPI } from "../utils/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isScroll, setIsScroll] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Notification states
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  // ================= SCROLL EFFECT =================
  useEffect(() => {
    const handleScroll = () => {
      setIsScroll(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ================= MOBILE MENU EFFECT =================
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // ================= NOTIFICATION EFFECT =================
  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // ================= FETCH UNREAD COUNT =================
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getCount();
      setUnreadCount(res.data.unreadCount);
    } catch {}
  };

  // ================= FETCH NOTIFICATIONS =================
  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data);
    } catch {}
  };

  // ================= BELL CLICK =================
  const handleBellClick = () => {
    setShowNotif(!showNotif);

    if (!showNotif) {
      fetchNotifications();
    }
  };

  // ================= MARK ALL READ =================
  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();

      setUnreadCount(0);

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
    } catch {}
  };

  // ================= MARK SINGLE NOTIFICATION READ =================
  const handleNotifClick = async (notif) => {
    try {
      // Only decrease count if notification was unread
      if (!notif.isRead) {
        await notificationAPI.markRead(notif.id);

        setUnreadCount((prev) => Math.max(0, prev - 1));

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id
              ? { ...n, isRead: true }
              : n
          )
        );
      }

      if (notif.redirectUrl) {
        navigate(notif.redirectUrl);
      }

      setShowNotif(false);
    } catch {}
  };

  // ================= CLOSE MOBILE MENU =================
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    closeMenu();
    logout();
  };

  // ================= NAV ITEMS =================
  const isAdmin = user?.role === 'ADMIN';

// navItems mein conditionally add karo
const navItems = [
    { name: "Dashboard",  path: "/dashboard",  icon: "⌂"  },
    { name: "Trips",      path: "/trips",       icon: "✈️" },
    { name: "Analytics",  path: "/analytics",   icon: "📊" },
    { name: "Groups",     path: "/groups",      icon: "👥" },
    ...(isAdmin ? [{ name: "Admin", path: "/admin", icon: "🛡️" }] : []),
];

  // ================= DESKTOP LINK CLASS =================
  const desktopLinkClass = ({ isActive }) =>
    `relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
    }`;

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${
            isScroll
              ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
              : "bg-white border-b border-slate-100"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[76px] flex items-center justify-between">

            {/* ================= LOGO ================= */}
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200">
                <span className="text-xl">✈️</span>

                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>

              <div className="leading-none">
                <div className="text-xl font-bold tracking-tight text-slate-900">
                  Trip<span className="text-blue-600">Nest</span>
                </div>

                <p className="hidden sm:block text-[9px] uppercase tracking-[0.18em] text-slate-400 font-semibold mt-1">
                  Travel smarter
                </p>
              </div>
            </Link>

            {/* ================= DESKTOP NAV ================= */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-1 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={desktopLinkClass}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* ================= DESKTOP USER ================= */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <>
                  {/* User */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {user?.name
                        ? user.name.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="hidden lg:block max-w-[150px]">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {user?.name || "Traveler"}
                      </p>

                      <p className="text-[10px] text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </Link>

                  {/* Role */}
                  {user?.role && (
                    <span className="hidden xl:inline-flex px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wide">
                      {user.role}
                    </span>
                  )}

                  {/* ================= NOTIFICATION BELL ================= */}
                  <div className="relative">
                    <button
                      onClick={handleBellClick}
                      className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                      aria-label="Notifications"
                    >
                      <span className="text-lg">🔔</span>

                      {unreadCount > 0 && (
                        <span
                          className="absolute -top-1 -right-1
                                     w-5 h-5 bg-red-500 text-white
                                     text-[10px] font-bold rounded-full
                                     flex items-center justify-center"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* ================= NOTIFICATION DROPDOWN ================= */}
                    {showNotif && (
                      <div
                        className="absolute right-0 top-12 w-80
                                   bg-white border border-slate-200
                                   rounded-2xl shadow-2xl z-50
                                   overflow-hidden"
                      >
                        {/* Header */}
                        <div
                          className="flex justify-between items-center
                                     px-4 py-3 border-b border-slate-100"
                        >
                          <span className="font-semibold text-slate-800 text-sm">
                            Notifications
                          </span>

                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-sm">
                              No notifications
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleNotifClick(notif)}
                                className={`px-4 py-3 cursor-pointer
                                            border-b border-slate-50
                                            hover:bg-slate-50 transition
                                            ${
                                              !notif.isRead
                                                ? "bg-blue-50/50"
                                                : ""
                                            }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-lg mt-0.5">
                                    {getNotifEmoji(
                                      notif.notificationType
                                    )}
                                  </span>

                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-xs leading-relaxed
                                        ${
                                          !notif.isRead
                                            ? "text-slate-800 font-medium"
                                            : "text-slate-600"
                                        }`}
                                    >
                                      {notif.message}
                                    </p>

                                    <p className="text-[10px] text-slate-400 mt-1">
                                      {formatTime(notif.createdAt)}
                                    </p>
                                  </div>

                                  {!notif.isRead && (
                                    <span
                                      className="w-2 h-2 bg-blue-500
                                                 rounded-full mt-1 shrink-0"
                                    />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div
                            className="px-4 py-3 border-t
                                       border-slate-100 text-center"
                          >
                            <button
                              onClick={() => {
                                navigate("/notifications");
                                setShowNotif(false);
                              }}
                              className="text-xs text-blue-600
                                         hover:underline font-medium"
                            >
                              View all notifications →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ================= LOGOUT ================= */}
                  <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      ↪
                    </span>
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* ================= MOBILE BUTTON ================= */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`
                md:hidden
                w-10 h-10
                flex items-center justify-center
                rounded-xl
                border
                transition-all
                ${
                  isMenuOpen
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }
              `}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE BACKDROP ================= */}
      <div
        onClick={closeMenu}
        className={`
          fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm
          md:hidden
          transition-opacity duration-300
          ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      />

      {/* ================= MOBILE MENU ================= */}
      <aside
        className={`
          fixed top-0 right-0 bottom-0
          z-[60]
          w-[min(88vw,360px)]
          bg-white
          shadow-2xl
          md:hidden
          transition-transform duration-300 ease-out
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Mobile Header */}
        <div className="h-[76px] px-5 border-b border-slate-100 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <span>✈️</span>
            </div>

            <div className="text-lg font-bold text-slate-900">
              Trip<span className="text-blue-600">Nest</span>
            </div>
          </Link>

          <button
            onClick={closeMenu}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto h-[calc(100vh-76px)]">

          {/* ================= MOBILE USER CARD ================= */}
          {user && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {user?.name || "Traveler"}
                  </p>

                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>

              {user?.role && (
                <div className="mt-3">
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-white border border-blue-100 text-blue-600 text-[10px] font-bold uppercase">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ================= MOBILE NAV LINKS ================= */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3 mb-3">
              Navigation
            </p>

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `
                    flex items-center gap-3
                    px-4 py-3.5
                    rounded-xl
                    text-sm font-medium
                    transition-all
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    }
                  `
                }
              >
                <span className="text-lg w-6 text-center">
                  {item.icon}
                </span>

                <span className="flex-1">
                  {item.name}
                </span>

                <span className="text-sm opacity-50">
                  →
                </span>
              </NavLink>
            ))}
          </div>

          {/* ================= MOBILE CREATE TRIP ================= */}
          <div className="mt-7">
            <button
              onClick={() => {
                closeMenu();
                window.location.href = "/trips/create";
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition"
            >
              <span>＋</span>
              Create New Trip
            </button>
          </div>

          {/* ================= DIVIDER ================= */}
          <div className="border-t border-slate-100 my-6" />

          {/* ================= MOBILE LOGOUT ================= */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 text-sm font-semibold transition"
            >
              <span>↪</span>
              Logout
            </button>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-400 mt-8">
            TripNest · Travel smarter, together.
          </p>
        </div>
      </aside>
    </>
  );
};

// ================= NOTIFICATION EMOJI =================
const getNotifEmoji = (type) => {
  switch (type) {
    case "TRIP_REMINDER":
      return "✈️";

    case "ACTIVITY_REMINDER":
      return "🗓️";

    case "BUDGET_ALERT":
      return "💰";

    case "GROUP_INVITATION":
      return "👥";

    case "TRAVEL_UPDATE":
      return "🔄";

    default:
      return "🔔";
  }
};

// ================= FORMAT NOTIFICATION TIME =================
const formatTime = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();

  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) {
    return "Just now";
  }

  if (diff < 3600) {
    return Math.floor(diff / 60) + "m ago";
  }

  if (diff < 86400) {
    return Math.floor(diff / 3600) + "h ago";
  }

  return Math.floor(diff / 86400) + "d ago";
};

export default Navbar;