
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuth2Success from "./pages/OAuth2Success";

// Main pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import CreateTrip from "./pages/CreateTrip";
import TripDetail from "./pages/TripDetail";
import Destinations from "./pages/Destinations";

// Trip features
import Budget from "./pages/Budget";
import Expenses from "./pages/Expenses";
import Documents from "./pages/Documents";
import Groups from "./pages/Groups";
import Notifications from "./pages/Notifications";

// Reports and analytics
import Reports from "./pages/Reports";
import TravelerAnalyticsPage from "./pages/TravelerAnalyticsPage";

// Admin
import AdminDashboard from "./pages/AdminDashboard";

// Route protection
import RoleRoute from "./components/RoleRoute";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Google OAuth callback */}
      <Route
        path="/oauth2/success"
        element={<OAuth2Success />}
      />

      {/* Website admin */}
      <Route
        path="/admin-dashboard"
        element={
          <RoleRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />

      {/* Traveler and group-admin access */}
      <Route
        path="/dashboard"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Dashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/trips"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Trips />
          </RoleRoute>
        }
      />

      {/* Create a trip: no ID is required */}
      <Route
        path="/trips/create"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <CreateTrip />
          </RoleRoute>
        }
      />

      {/* Trip detail uses useParams().id */}
      <Route
        path="/trips/:id"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <TripDetail />
          </RoleRoute>
        }
      />

      {/* Budget uses useParams().tripId */}
      <Route
        path="/trips/:tripId/budget"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Budget />
          </RoleRoute>
        }
      />

      {/* Expenses uses useParams().tripId */}
      <Route
        path="/trips/:tripId/expenses"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Expenses />
          </RoleRoute>
        }
      />

      {/* Documents for a trip */}
      <Route
        path="/trips/:tripId/documents"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Documents />
          </RoleRoute>
        }
      />

      {/* Destinations */}
      <Route
        path="/destinations"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Destinations />
          </RoleRoute>
        }
      />

      {/* Groups */}
      <Route
        path="/groups"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Groups />
          </RoleRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Notifications />
          </RoleRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <Reports />
          </RoleRoute>
        }
      />

      {/* Traveler analytics */}
      <Route
        path="/analytics"
        element={
          <RoleRoute allowedRoles={["TRAVELER", "GROUP_ADMIN"]}>
            <TravelerAnalyticsPage />
          </RoleRoute>
        }
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
