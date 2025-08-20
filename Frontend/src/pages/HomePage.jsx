import { Player } from "@lottiefiles/react-lottie-player";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyTokenAndGetUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        // Call the new profile endpoint
        const response = await axios.get("/api/auth/profile/", config);
        setUser(response.data.user);
      } catch (err) {
        console.error("Token verification failed:", err);

        // If token is invalid, try to refresh it
        if (err.response?.status === 401) {
          const refreshToken = localStorage.getItem("refresh_token");

          if (refreshToken) {
            try {
              const refreshResponse = await axios.post("/api/token/refresh/", {
                refresh: refreshToken,
              });

              localStorage.setItem("access_token", refreshResponse.data.access);

              // Retry getting user profile with new token
              const retryConfig = {
                headers: {
                  Authorization: `Bearer ${refreshResponse.data.access}`,
                  "Content-Type": "application/json",
                },
              };

              const retryResponse = await axios.get(
                "/api/auth/profile/",
                retryConfig
              );
              setUser(retryResponse.data.user);
            } catch (refreshErr) {
              // Refresh failed, remove tokens and redirect
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              navigate("/login");
            }
          } else {
            // No refresh token, redirect to login
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
          }
        } else {
          setError("Failed to load user profile");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyTokenAndGetUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome, {user?.first_name || user?.username}!
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center">
          Congratulations, {user?.username}!
        </h1>

        <p className="text-lg text-gray-600 text-center max-w-2xl">
          You've successfully logged in to your account. Welcome to your CV
          builder dashboard!
        </p>

        <div className="w-64 h-64">
          <Player
            autoplay
            loop
            src="https://lottie.host/3a4de3cc-5f66-4b5f-a3bb-eb2c95ab73a5/OzMVQltxxD.json"
            className="w-full h-full"
          />
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Profile
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span className="font-medium">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            {user?.first_name && (
              <div className="flex justify-between">
                <span className="text-gray-600">First Name:</span>
                <span className="font-medium">{user?.first_name}</span>
              </div>
            )}
            {user?.last_name && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Name:</span>
                <span className="font-medium">{user?.last_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Member since:</span>
              <span className="font-medium">
                {user?.created_at &&
                  new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
