import { useEffect, useState } from "react";
import {
  createRequest,
  getOpenRequests,
  acceptRequest,
  getActiveRequests,
  completeRequest,
  getMyOrders,
  getMyDeliveries,
} from "../services/requestService";

export default function Requests() {
  const [openRequests, setOpenRequests] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "" });

  // Fetch open & active requests on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const open = await getOpenRequests();
    const active = await getActiveRequests();
    setOpenRequests(open.data);
    setActiveRequests(active.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createRequest(formData);
    setFormData({ title: "", description: "" });
    fetchData();
  };

  const handleAccept = async (id) => {
    await acceptRequest(id);
    fetchData();
  };

  const handleComplete = async (id) => {
    await completeRequest(id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Requests Dashboard</h1>

        {/* Create request */}
        <form onSubmit={handleCreate} className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="border p-2 w-full rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border p-2 w-full rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Request
          </button>
        </form>

        {/* Open requests */}
        <h2 className="text-xl font-semibold mb-2">Open Requests</h2>
        {openRequests.length === 0 ? (
          <p>No open requests.</p>
        ) : (
          openRequests.map((req) => (
            <div
              key={req.id}
              className="border p-3 rounded mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{req.title}</p>
                <p className="text-sm text-gray-600">{req.description}</p>
              </div>
              <button
                onClick={() => handleAccept(req.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
            </div>
          ))
        )}

        {/* Active requests */}
        <h2 className="text-xl font-semibold mt-6 mb-2">Active Requests</h2>
        {activeRequests.length === 0 ? (
          <p>No active requests.</p>
        ) : (
          activeRequests.map((req) => (
            <div
              key={req.id}
              className="border p-3 rounded mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{req.title}</p>
                <p className="text-sm text-gray-600">{req.description}</p>
              </div>
              <button
                onClick={() => handleComplete(req.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Mark Complete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
