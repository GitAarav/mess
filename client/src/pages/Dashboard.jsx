import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, auth } from "../firebase";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/");
      }
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Dashboard!
          </h1>
          <p className="text-gray-600">
            Logged in as: <span className="font-medium">{user?.email}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Profile Information
          </h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p><span className="font-medium">Name:</span> {user?.displayName || "Not set"}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">User ID:</span> {user?.uid}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-medium"
          >
            Logout
          </button>
          <button
            onClick={() => navigate("/requests")}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
          >
            View Requests
          </button>
        </div>
      </div>
    </div>
  );
}