import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Requests() {
  const navigate = useNavigate();
  const [openRequests, setOpenRequests] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

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

  // Real-time listener for open requests
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "requests"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOpenRequests(requests);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching open requests:", err);
        setError("Failed to load requests. Please refresh the page.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time listener for active requests (accepted by current user)
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "requests"),
      where("acceptedById", "==", currentUser.uid),
      where("status", "==", "in_progress")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActiveRequests(requests);
      },
      (err) => {
        console.error("Error fetching active requests:", err);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!currentUser) {
      setError("You must be logged in to create a request");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await addDoc(collection(db, "requests"), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requesterId: currentUser.uid,
        requesterEmail: currentUser.email,
        status: "pending",
        createdAt: serverTimestamp(),
        acceptedById: null,
        acceptedByEmail: null,
      });

      setFormData({ title: "", description: "" });
      setSuccess("Request created successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error creating request:", err);
      setError("Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (requestId, requesterId) => {
    if (!currentUser) {
      setError("You must be logged in to accept a request");
      return;
    }

    if (requesterId === currentUser.uid) {
      setError("You cannot accept your own request");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const requestRef = doc(db, "requests", requestId);
      await updateDoc(requestRef, {
        status: "in_progress",
        acceptedById: currentUser.uid,
        acceptedByEmail: currentUser.email,
        acceptedAt: serverTimestamp(),
      });

      setSuccess("Request accepted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error accepting request:", err);
      setError("Failed to accept request");
    }
  };

  const handleComplete = async (requestId) => {
    try {
      setError("");
      setSuccess("");

      const requestRef = doc(db, "requests", requestId);
      await updateDoc(requestRef, {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      setSuccess("Request completed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error completing request:", err);
      setError("Failed to complete request");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Requests Dashboard</h1>
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

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                placeholder="e.g., Coffee from mess"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Offered (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 50"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full text-white px-4 py-2 rounded-lg transition font-medium ${
                submitting
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {submitting ? "Creating..." : "Create Request"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Available Requests ({openRequests.length})
          </h2>
          {openRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No open requests available.
            </p>
          ) : (
            <div className="space-y-3">
              {openRequests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 p-4 rounded-lg hover:border-blue-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-800">
                        {req.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Price: ₹{req.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Posted by: {req.requesterEmail}
                      </p>
                    </div>
                    {req.requesterId !== currentUser?.uid && (
                      <button
                        onClick={() => handleAccept(req.id, req.requesterId)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium ml-4"
                      >
                        Accept
                      </button>
                    )}
                    {req.requesterId === currentUser?.uid && (
                      <span className="text-sm text-gray-500 ml-4">Your request</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            My Active Deliveries ({activeRequests.length})
          </h2>
          {activeRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No active deliveries.
            </p>
          ) : (
            <div className="space-y-3">
              {activeRequests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 p-4 rounded-lg hover:border-green-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-800">
                        {req.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Price: ₹{req.description}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Status: In Progress
                      </p>
                    </div>
                    <button
                      onClick={() => handleComplete(req.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium ml-4"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}