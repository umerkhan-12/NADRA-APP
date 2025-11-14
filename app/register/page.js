"use client";

import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otpSent, setOtpSent] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json();

    if (data.success) {
      setOtpSent(true);
      alert("OTP has been sent to your email!");
    } else {
      alert(data.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4">

        <h1 className="text-2xl font-bold">Citizen Registration</h1>

        {!otpSent ? (
          <>
            <input
              className="border p-2 w-full rounded"
              placeholder="Full Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Phone"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Password"
              type="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              onClick={handleSendOtp}
              className="w-full bg-blue-600 text-white p-2 rounded"
            >
              Send OTP
            </button>
          </>
        ) : (
          <VerifyOtp form={form} />
        )}
      </div>
    </div>
  );
}

function VerifyOtp({ form }) {
  const [otp, setOtp] = useState("");

  async function handleVerify(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ ...form, otp }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Account created successfully!");
      window.location.href = "/login";
    } else {
      alert(data.error);
    }
  }

  return (
    <>
      <input
        className="border p-2 w-full rounded"
        placeholder="Enter OTP"
        onChange={(e) => setOtp(e.target.value)}
      />

      <button
        onClick={handleVerify}
        className="w-full bg-green-600 text-white p-2 rounded"
      >
        Verify OTP
      </button>
    </>
  );
}
