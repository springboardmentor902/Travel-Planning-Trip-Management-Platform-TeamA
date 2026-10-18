
import {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const AuthContext = createContext(null);

function getRoleName(data) {
  const role =
    data?.role?.name ||
    data?.role?.roleName ||
    data?.role?.authority ||
    data?.roleName ||
    data?.authority ||
    data?.user?.role?.name ||
    data?.user?.role?.roleName ||
    data?.user?.roleName ||
    data?.user?.role ||
    data?.role;

  if (typeof role === "string") {
    return role.replace(/^ROLE_/i, "").toUpperCase();
  }

  return "";
}

function normalizeUser(responseData) {
  const data = responseData?.user || responseData || {};
  const roleName = getRoleName(responseData);

  return {
    ...data,
    roleName,
    role: roleName || data.role,
  };
}

function readStoredUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = () => setUser(readStoredUser());

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveSession = (data) => {
    const token = data?.token || data?.accessToken || data?.jwtToken;

    if (token) {
      localStorage.setItem("token", token);
    }

    const normalizedUser = normalizeUser(data);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);

    return normalizedUser;
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const loggedInUser = saveSession(response.data);

      if (loggedInUser.roleName === "GROUP_ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

      return { success: true, user: loggedInUser };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Invalid email or password!",
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await api.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      const registeredUser = saveSession(response.data);

      if (registeredUser.roleName === "GROUP_ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

      return { success: true, user: registeredUser };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed!",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
