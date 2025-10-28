import { signInWithGoogle } from "../firebase";

export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-2xl shadow-xl text-center w-80">
        <h1 className="text-2xl font-semibold mb-6 text-gray-700">
          Sign In with Google
        </h1>
        <button
          onClick={signInWithGoogle}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition w-full"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
