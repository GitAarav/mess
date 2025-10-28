import { logout } from "../firebase";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to Dashboard!</h1>
      <button
        onClick={logout}
        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        Logout
      </button>
    </div>
  );
}
