import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Navigate to="/profile" />} />
      <Route path="/profile" element={<ProfileSetup user={user} />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
