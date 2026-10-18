
import { useEffect, useState } from "react";

const OAuth2Success = () => {
  const [status, setStatus] = useState("Completing Google login...");

  useEffect(() => {
    const finishLogin = () => {
      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");
      const email = params.get("email");
      const role = params.get("role");

      // Safe diagnostics: never print the token.
      console.log("TripNest OAuth callback:", {
        path: window.location.pathname,
        hasToken: Boolean(token),
        hasEmail: Boolean(email),
        hasRole: Boolean(role),
        error: params.get("error"),
      });

      if (!token || !email || !role) {
        setStatus(
          "Google login failed. The backend did not return all required login details."
        );
        return;
      }

      const normalizedRole = role.toUpperCase();

      const allowedRoles = ["ADMIN", "GROUP_ADMIN", "TRAVELER"];

      if (!allowedRoles.includes(normalizedRole)) {
        setStatus("Google login failed. The account role is invalid.");
        return;
      }

      try {
        const user = {
          token,
          email,
          role: normalizedRole,
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Remove sensitive authentication data from the visible URL.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        setStatus("Login successful. Redirecting...");

        const destination =
          normalizedRole === "ADMIN"
            ? "/admin-dashboard"
            : normalizedRole === "GROUP_ADMIN"
              ? "/groups"
              : "/dashboard";

        // Reload the app so AuthContext can read the saved session.
        window.location.replace(destination);
      } catch (error) {
        console.error(
          "Unable to save OAuth login state:",
          error.message
        );
        setStatus("Login failed while saving your session. Please try again.");
      }
    };

    finishLogin();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>TripNest</h2>
      <p>{status}</p>
    </main>
  );
};

export default OAuth2Success;
