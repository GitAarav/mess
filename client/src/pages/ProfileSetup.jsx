import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import api from "../services/api";

export default function ProfileSetup({ user }) {
  const [formData, setFormData] = useState({
    room_number: "",
    phone_number: "",
    default_mess_id: "1",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingUser = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const response = await api.get("/auth/check");

        if (response.data.exists && response.data.user) {
          const userData = response.data.user;
          
          if (userData.room_number && userData.phone_number && userData.default_mess_id) {
            navigate("/dashboard");
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setError("Failed to check user status");
        setLoading(false);
      }
    };

    checkExistingUser();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!formData.room_number.trim()) {
      setError("Room number is required");
      setSubmitting(false);
      return;
    }
    if (!formData.phone_number.trim()) {
      setError("Phone number is required");
      setSubmitting(false);
      return;
    }
    if (!formData.default_mess_id) {
      setError("Please select a mess block");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/auth/register", {
        room_number: formData.room_number.trim(),
        phone_number: formData.phone_number.trim(),
        default_mess_id: parseInt(formData.default_mess_id),
      });

      alert("Profile completed successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error submitting profile:", err);
      const errorMessage = err.response?.data?.message || "Error submitting profile. Please try again.";
      setError(errorMessage);
      setSubmitting(false);
    }
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-semibold mb-2 text-gray-800">
            Complete Your Profile
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Signed in as: {user?.email}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number
              </label>
              <input
                type="text"
                name="room_number"
                placeholder="e.g., A-101"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                value={formData.room_number}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                placeholder="e.g., +91 9876543210"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                value={formData.phone_number}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mess Block
              </label>
              <select
                name="default_mess_id"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                value={formData.default_mess_id}
                required
                disabled={submitting}
              >
                <option value="">Select Mess Block</option>
                <option value="1">A Block</option>
                <option value="2">B Block</option>
                <option value="3">C Block</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full text-white p-2 rounded font-medium transition-colors ${
                submitting
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}