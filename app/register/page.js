// "use client";

// import { useState } from "react";

// export default function Register() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//   });

//   const [otpSent, setOtpSent] = useState(false);

//   async function handleSendOtp(e) {
//     e.preventDefault();

//     const res = await fetch("/api/auth/send-otp", {
//       method: "POST",
//       body: JSON.stringify({ email: form.email }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       setOtpSent(true);
//       alert("OTP has been sent to your email!");
//     } else {
//       alert(data.error);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
//       <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4">

//         <h1 className="text-2xl font-bold">Citizen Registration</h1>

//         {!otpSent ? (
//           <>
//             <input
//               className="border p-2 w-full rounded"
//               placeholder="Full Name"
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//             />
//             <input
//               className="border p-2 w-full rounded"
//               placeholder="Email"
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//             />
//             <input
//               className="border p-2 w-full rounded"
//               placeholder="Phone"
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//             />
//             <input
//               className="border p-2 w-full rounded"
//               placeholder="Password"
//               type="password"
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//             />

//             <button
//               onClick={handleSendOtp}
//               className="w-full bg-blue-600 text-white p-2 rounded"
//             >
//               Send OTP
//             </button>
//           </>
//         ) : (
//           <VerifyOtp form={form} />
//         )}
//       </div>
//     </div>
//   );
// }

// function VerifyOtp({ form }) {
//   const [otp, setOtp] = useState("");

//   async function handleVerify(e) {
//     e.preventDefault();

//     const res = await fetch("/api/auth/verify-otp", {
//       method: "POST",
//       body: JSON.stringify({ ...form, otp }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       alert("Account created successfully!");
//       window.location.href = "/login";
//     } else {
//       alert(data.error);
//     }
//   }

//   return (
//     <>
//       <input
//         className="border p-2 w-full rounded"
//         placeholder="Enter OTP"
//         onChange={(e) => setOtp(e.target.value)}
//       />

//       <button
//         onClick={handleVerify}
//         className="w-full bg-green-600 text-white p-2 rounded"
//       >
//         Verify OTP
//       </button>
//     </>
//   );
// }
"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Phone } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  async function handleSendOtp(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json();

    if (data.success) {
      setOtpSent(true);
      alert("OTP sent to your email!");
    } else {
      alert(data.error);
    }
  }

  async function handleVerifyOtp(e) {
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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1687042268510-c790c643ba4a"
          className="w-full h-full object-cover"
          alt="background"
        />
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-sm"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>Register as a Citizen to request NADRA services</CardDescription>
          </CardHeader>

          <CardContent>
            {!otpSent ? (
              <form className="space-y-4" onSubmit={handleSendOtp}>
                {/* Name */}
                <div>
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name
                  </Label>
                  <Input
                    placeholder="Your Name"
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    required
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone Number
                  </Label>
                  <Input
                    placeholder="03XXXXXXXXX"
                    required
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                {/* Password */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Your password"
                    required
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                {/* Send OTP */}
                <Button
                  type="submit"
                  className="w-full bg-linear-to-r from-purple-600 to-blue-600"
                >
                  Send OTP
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <Label>Enter OTP</Label>
                  <Input
                    placeholder="6-digit code"
                    required
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Verify OTP & Register
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
