import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-[slideUp_0.6s_ease-out]">
        {/* Heading */}
        <h2 className="text-center text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          ✈️ TripNest Login
        </h2>

        <p className="text-center text-slate-500 text-sm mb-8">
          Welcome back! Login to continue your journey.
        </p>

        {/* Error */}
        {error && (
          <div className="bg-gradient-to-br from-red-100 to-red-200 text-red-800 px-4 py-3 rounded-xl mb-4 text-center border border-red-300 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base bg-slate-50 transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base bg-slate-50 transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-base font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>

          <span className="px-3 text-sm text-gray-500">ya</span>

          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Login Button */}
        <a
  href={`${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`}
  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded py-2 hover:bg-gray-50 transition"
>
  <img
    src="https://www.google.com/favicon.ico"
    alt="Google"
    className="w-5 h-5"
  />
  <span className="text-sm font-medium text-gray-700">
    Login with Google
  </span>
</a>

        {/* Register */}
        <p className="text-center mt-6 text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-500 font-semibold transition-colors duration-300 hover:text-pink-500 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
