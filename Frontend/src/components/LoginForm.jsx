import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CircularProgress from "./CircularProgress";
import { User, Lock, LogIn, Eye, EyeOff, ShieldX } from "lucide-react";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify({ username, password });
      const res = await axios.post("/api/auth/login/", body, config);

      localStorage.setItem("access_token", res.data.token.access);
      localStorage.setItem("refresh_token", res.data.token.refresh);
      window.location.href = "/home";
    } catch (err) {
      if (!err.response) {
        setError("Unable to connect to the server. Please try again later.");
      } else if (err.response.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(err.response?.data?.detail || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative max-w-md w-full bg-white-500 rounded-md  backdrop-filter backdrop-blur-md bg-opacity-40 border p-6 border-gray-200
 shadow-md space-y-6"
    >
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
          <CircularProgress />
        </div>
      )}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <form className="space-y-6" onSubmit={onSubmit}>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded relative">
            <div className="flex">
              <ShieldX className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700"
            >
              <div className="flex items-center ml-2">
                <User className="h-5 w-5 md:h-6 md:w-6 mr-1" />
                <span>Username</span>
              </div>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your username"
              value={username}
              onChange={onChange}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              <div className="flex items-center ml-2">
                <Lock className="h-5 w-5 md:h-6 md:w-6 mr-1" />
                <span>Password</span>
              </div>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                             focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={onChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 hover:cursor-pointer focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                       bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 hover:cursor-pointer"
          >
            {" "}
            <LogIn className="h-5 w-5 md:h-6 md:w-6 mr-2" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <div className="text-center">
          <Link
            to="/register"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
