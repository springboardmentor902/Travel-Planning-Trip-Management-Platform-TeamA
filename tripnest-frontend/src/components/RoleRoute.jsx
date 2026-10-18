
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRoles, children }) {
    const { user } = useAuth();
    const location = useLocation();

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("accessToken");

    // No authenticated session
    if (!user || !token) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

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

    // Role is missing: do not guess or grant access
    if (!role) {
        return (
            <div style={{ padding: "24px" }}>
                Your account role could not be identified. Please log in again.
            </div>
        );
    }

    // Redirect authenticated users to the correct home page
    if (!allowedRoles.includes(role)) {
        if (role === "ADMIN") {
            return <Navigate to="/admin-dashboard" replace />;
        }

        if (role === "GROUP_ADMIN") {
            return <Navigate to="/groups" replace />;
        }

        if (role === "TRAVELER") {
            return <Navigate to="/dashboard" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return children;
}
