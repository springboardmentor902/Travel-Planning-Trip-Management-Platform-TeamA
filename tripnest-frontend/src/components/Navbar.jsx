import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rawRole =
    user?.roleName ||
    user?.role?.name ||
    user?.role?.roleName ||
    user?.role?.authority ||
    user?.role ||
    "";

  const role = String(rawRole)
    .replace(/^ROLE_/i, "")
    .toUpperCase();

  const isWebsiteAdmin = role === "ADMIN";
  const isGroupAdmin = role === "GROUP_ADMIN";
  const isTraveler = role === "TRAVELER";

  const homePath = isWebsiteAdmin
    ? "/admin-dashboard"
    : isGroupAdmin
      ? "/groups"
      : "/dashboard";

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path + "/"));

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navLinkClass = (path) =>
    `navbar-link ${isActive(path) ? "navbar-link-active" : ""}`;

  return (
    <nav className="tripnest-navbar">
      <Link to={homePath} className="navbar-brand">
        <span className="navbar-brand-icon">✈️</span>
        <span>TripNest</span>
      </Link>

      <div className="navbar-navigation">
        {isWebsiteAdmin && (
          <Link
            to="/admin-dashboard"
            className={navLinkClass("/admin-dashboard")}
          >
            <span>🛡️</span>
            <span>Website Admin</span>
          </Link>
        )}

        {isGroupAdmin && (
          <>
            <Link
              to="/groups"
              className={navLinkClass("/groups")}
            >
              <span>👥</span>
              <span>Manage Groups</span>
            </Link>

            <Link
              to="/dashboard"
              className={navLinkClass("/dashboard")}
            >
              <span>🏠</span>
              <span>Dashboard</span>
            </Link>
          </>
        )}

        {(isTraveler || isGroupAdmin) && (
          <>
            <Link to="/trips" className={navLinkClass("/trips")}>
              <span>✈️</span>
              <span>My Trips</span>
            </Link>

            <Link
              to="/reports"
              className={navLinkClass("/reports")}
            >
              <span>📊</span>
              <span>Reports</span>
            </Link>

            <Link
              to="/analytics"
              className={navLinkClass("/analytics")}
            >
              <span>📈</span>
              <span>Analytics</span>
            </Link>

            <Link
              to="/groups"
              className={navLinkClass("/groups")}
            >
              <span>👥</span>
              <span>Groups</span>
            </Link>
          </>
        )}

        {user && (
          <div className="navbar-notification">
            <NotificationBell />
          </div>
        )}

        {user && (
          <div className="navbar-account">
            <span className="navbar-user-name" title={user.email || user.name}>
              {user.name || user.email || "User"}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="navbar-logout"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
