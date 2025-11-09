import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import api from "../services/api";

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [acknowledgingId, setAcknowledgingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

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
  // Fetch user's orders from backend
  useEffect(() => {
    if (!currentUser) return;

    const fetchOrders = async () => {
      try {
        const response = await api.get("/requests/my-orders");
        const ordersList = (response.data.data || []).map((order) => ({
          id: order.id.toString(),
          title: order.title,
          description: order.description.toString(),
          status: order.status,
          acceptedByEmail: order.accepted_by_email || null,
          createdAt: order.created_at ? { seconds: new Date(order.created_at).getTime() / 1000 } : null,
          completedAt: order.completed_at ? { seconds: new Date(order.completed_at).getTime() / 1000 } : null,
          acknowledgedByRequester: order.acknowledged_by_requester || false,
        }));
        setOrders(ordersList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchOrders();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
    };
    return texts[status] || status;
  };

  const handleAcknowledge = async (orderId) => {
    try {
      setAcknowledgingId(orderId);
      setError("");
      setSuccess("");
      await api.patch(`/requests/${orderId}/acknowledge`);
      setSuccess("Order acknowledged successfully!");
      setTimeout(() => setSuccess(""), 3000);
      // Orders will refresh via polling
    } catch (err) {
      console.error("Error acknowledging order:", err);
      setError(err.response?.data?.message || "Failed to acknowledge order");
      setTimeout(() => setError(""), 5000);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) {
      return;
    }

    try {
      setCancellingId(orderId);
      setError("");
      setSuccess("");
      await api.delete(`/requests/${orderId}`);
      setSuccess("Request cancelled successfully!");
      setTimeout(() => setSuccess(""), 3000);
      // Orders will refresh via polling
    } catch (err) {
      console.error("Error canceling order:", err);
      setError(err.response?.data?.message || "Failed to cancel order");
      setTimeout(() => setError(""), 5000);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
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

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">You haven't created any orders yet.</p>
          <button
            onClick={() => navigate("/requests")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 p-5 rounded-lg hover:border-blue-300 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {order.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Price: ₹{order.description}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              {order.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleCancel(order.id)}
                    disabled={cancellingId === order.id}
                    className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                      cancellingId === order.id
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {cancellingId === order.id ? "Cancelling..." : "Cancel Request"}
                  </button>
                </div>
              )}

              {order.status === "in_progress" && order.acceptedByEmail && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">✓ Accepted by:</span>{" "}
                    {order.acceptedByEmail}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Your request is being processed!
                  </p>
                </div>
              )}

              {order.status === "completed" && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">✓ Completed by:</span>{" "}
                    {order.acceptedByEmail || "Unknown"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Completed on:{" "}
                    {order.completedAt?.toDate?.()?.toLocaleString() || 
                     (order.completedAt?.seconds ? new Date(order.completedAt.seconds * 1000).toLocaleString() : "Recently")}
                  </p>
                  {!order.acknowledgedByRequester && (
                    <button
                      onClick={() => handleAcknowledge(order.id)}
                      disabled={acknowledgingId === order.id}
                      className={`mt-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                        acknowledgingId === order.id
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {acknowledgingId === order.id ? "Acknowledging..." : "✓ Acknowledge Receipt"}
                    </button>
                  )}
                  {order.acknowledgedByRequester && (
                    <p className="text-xs text-green-700 mt-2 font-medium">
                      ✓ You have acknowledged receipt
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                Created: {order.createdAt?.toDate?.()?.toLocaleString() || 
                         (order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : "Just now")}
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