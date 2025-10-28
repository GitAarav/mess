import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup({ user }) {
  const [formData, setFormData] = useState({
    room_number: "",
    phone_number: "",
    mess_block: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/auth/register", {
        email: user.email,
        room_number: formData.room_number,
        phone_number: formData.phone_number,
        mess_block: formData.mess_block,
      });
      alert("Profile completed!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error submitting profile");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Complete Your Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="room_number"
            placeholder="Room Number"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />
          <select
            name="mess_block"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          >
            <option value="">Select Mess Block</option>
            <option value="A">A Block</option>
            <option value="B">B Block</option>
            <option value="C">C Block</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
