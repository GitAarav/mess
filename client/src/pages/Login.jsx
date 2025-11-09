// client/src/pages/Login.jsx
import { useState } from "react";
import { signInWithGoogle } from "../firebase";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      // Navigation will happen automatically via auth state change
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white rounded-2xl shadow-xl text-center">
          <h1 className="text-2xl font-semibold mb-6 text-gray-700">
            Sign In with Google
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className={`w-full text-white px-6 py-3 rounded-lg transition font-medium ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}