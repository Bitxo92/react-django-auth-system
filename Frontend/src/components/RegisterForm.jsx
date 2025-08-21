import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CircularProgress from "./CircularProgress";
import {
  UserPen,
  Mail,
  User,
  Lock,
  UserRoundPlus,
  Eye,
  EyeOff,
  ShieldX,
} from "lucide-react";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { username, email, password, password_confirm, first_name, last_name } =
    formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password_confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get("/api/auth/health");
      if (res.status !== 200) {
        setError("Unable to connect to the server. Please try again later.");
        return;
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again later.");
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify({
        username,
        email,
        password,
        password_confirm,
        first_name,
        last_name,
      });

      const res = await axios.post("/api/auth/register/", body, config);
      localStorage.setItem("access_token", res.data.token.access);
      localStorage.setItem("refresh_token", res.data.token.refresh);
      window.location.href = "/home";
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          setError(errors[key][0]);
        });
      } else {
        setError("Registration failed");
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
          Create your account
        </h2>
      </div>
      <form className="space-y-6" onSubmit={onSubmit}>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded relative ">
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
              htmlFor="username"
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
              placeholder="Choose a username"
              value={username}
              onChange={onChange}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              <div className="flex items-center ml-2">
                <Mail className="h-5 w-5 md:h-6 md:w-6 mr-1" />
                <span>Email</span>
              </div>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your email"
              value={email}
              onChange={onChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                <div className="flex items-center ml-2">
                  <UserPen className="h-5 w-5 md:h-6 md:w-6 mr-1" />
                  <span>First Name</span>
                </div>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="First Name"
                value={first_name}
                onChange={onChange}
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                <div className="flex items-center ml-2">
                  <UserPen className="h-5 w-5 md:h-6 md:w-6 mr-1" />
                  <span>Last Name</span>
                </div>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Last Name"
                value={last_name}
                onChange={onChange}
              />
            </div>
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

          <div>
            <label
              htmlFor="password_confirm"
              className="block text-sm font-medium text-gray-700"
            >
              <div className="flex items-center ml-2">
                <Lock className="h-5 w-5 md:h-6 md:w-6 mr-1" />
                <span>Confirm Password</span>
              </div>
            </label>
            <div className="relative">
              <input
                id="password_confirm"
                name="password_confirm"
                type={showPassword ? "text" : "password"}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm your password"
                value={password_confirm}
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
            <UserRoundPlus className="h-5 w-5 md:h-6 md:w-6 mr-1" />
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
