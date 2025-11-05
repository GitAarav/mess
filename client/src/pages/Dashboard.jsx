import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, auth } from "../firebase";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async (currentUser) => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get("http://localhost:3000/auth/check", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.exists && response.data.user) {
          setProfileData(response.data.user);
        } else {
          navigate("/profile");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const getMessBlockName = (messId) => {
    const messBlocks = {
      1: "A Block",
      2: "B Block",
      3: "C Block"
    };
    return messBlocks[messId] || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Dashboard!
            </h1>
            <p className="text-gray-600">
              Logged in as: <span className="font-medium">{user?.email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {profileData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                Profile Information
              </h2>
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Email:</span> {profileData.email}</p>
                <p><span className="font-medium">Room Number:</span> {profileData.room_number}</p>
                <p><span className="font-medium">Phone Number:</span> {profileData.phone_number}</p>
                <p><span className="font-medium">Default Mess:</span> {getMessBlockName(profileData.default_mess_id)}</p>
                <p><span className="font-medium">User ID:</span> {profileData.user_id}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => navigate("/requests")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
            >
              Browse Requests
            </button>
            <button
              onClick={() => navigate("/my-orders")}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
            >
              My Orders
            </button>
            <button
              onClick={() => navigate("/my-deliveries")}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition font-medium"
            >
              My Deliveries
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}