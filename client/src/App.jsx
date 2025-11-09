// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import MyOrders from "./pages/MyOrders";
import MyDeliveries from "./pages/MyDeliveries";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Firebase auth is initialized
    if (!auth) {
      setError("Firebase authentication not initialized. Please check your configuration.");
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          console.log("Auth state changed:", currentUser?.email || "No user");
          setUser(currentUser);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Auth state change error:", err);
          setError(`Authentication error: ${err.message}`);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up auth listener:", err);
      setError(`Failed to initialize authentication: ${err.message}`);
      setLoading(false);
    }
  }, []);

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route 
          path="/" 
          element={!user ? <Login /> : <Navigate to="/profile" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <ProfileSetup user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/requests" 
          element={user ? <Requests /> : <Navigate to="/" />} 
        />
        <Route 
          path="/my-orders" 
          element={user ? <MyOrders /> : <Navigate to="/" />} 
        />
        <Route 
          path="/my-deliveries" 
          element={user ? <MyDeliveries /> : <Navigate to="/" />} 
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;