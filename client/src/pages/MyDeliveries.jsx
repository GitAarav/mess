import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import api from "../services/api";

export default function MyDeliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Fetch user's deliveries from backend
  useEffect(() => {
    if (!currentUser) return;

    const fetchDeliveries = async () => {
      try {
        const response = await api.get("/requests/my-deliveries");
        const deliveriesList = (response.data.data || []).map((delivery) => ({
          id: delivery.id.toString(),
          title: delivery.title,
          description: delivery.description.toString(),
          status: delivery.status,
          requesterEmail: delivery.requester_email || '',
          createdAt: delivery.created_at ? { seconds: new Date(delivery.created_at).getTime() / 1000 } : null,
          completedAt: delivery.completed_at ? { seconds: new Date(delivery.completed_at).getTime() / 1000 } : null,
          acknowledgedByRequester: delivery.acknowledged_by_requester || false,
        }));
        setDeliveries(deliveriesList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        setError("Failed to load your deliveries. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchDeliveries();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchDeliveries, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const getStatusBadge = (status) => {
    const badges = {
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      in_progress: "In Progress",
      completed: "Completed",
    };
    return texts[status] || status;
  };

  const handleComplete = async (requestId) => {
    try {
      setCompletingId(requestId);
      setError("");
      setSuccess("");
      await api.patch(`/requests/${requestId}/complete`);
      setSuccess("Request marked as completed successfully!");
      setTimeout(() => setSuccess(""), 3000);
      // Deliveries will refresh via polling
    } catch (err) {
      console.error("Error completing request:", err);
      setError(err.response?.data?.message || "Failed to mark request as completed");
      setTimeout(() => setError(""), 5000);
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading your deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Deliveries</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                You haven't accepted any deliveries yet.
              </p>
              <button
                onClick={() => navigate("/requests")}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Browse Available Requests
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border border-gray-200 p-5 rounded-lg hover:border-purple-300 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {delivery.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Price: ₹{delivery.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested by: {delivery.requesterEmail}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        delivery.status
                      )}`}
                    >
                      {getStatusText(delivery.status)}
                    </span>
                  </div>

                  {delivery.status === "in_progress" && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleComplete(delivery.id)}
                        disabled={completingId === delivery.id}
                        className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                          completingId === delivery.id
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {completingId === delivery.id ? "Completing..." : "Mark as Completed"}
                      </button>
                    </div>
                  )}

                  {delivery.status === "completed" && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                      <p className="text-sm text-green-800 font-semibold">
                        ✓ Delivery Completed
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Completed on:{" "}
                        {delivery.completedAt?.toDate?.()?.toLocaleString() || 
                         (delivery.completedAt?.seconds ? new Date(delivery.completedAt.seconds * 1000).toLocaleString() : "Recently")}
                      </p>
                      {delivery.acknowledgedByRequester && (
                        <p className="text-xs text-green-700 mt-1 font-medium">
                          ✓ Acknowledged by requester
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-3">
                    Accepted: {delivery.acceptedAt?.toDate?.()?.toLocaleString() || 
                              (delivery.acceptedAt?.seconds ? new Date(delivery.acceptedAt.seconds * 1000).toLocaleString() : "Just now")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}