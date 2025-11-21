"use client";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Phone, KeyRound, ArrowRight, CheckCircle, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    cnic: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading("Sending OTP to your phone...");

    const res = await fetch("/api/auth/send-otp-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success("OTP sent! Check your phone.", { id: loadingToast });
      setOtpSent(true);
    } else {
      toast.error(data.error || "Failed to send OTP", { id: loadingToast });
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading("Verifying OTP and creating account...");

    const res = await fetch("/api/auth/verify-otp-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone, otp }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success("Account created successfully! Redirecting to login...", { id: loadingToast });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } else {
      toast.error(data.error || "OTP verification failed", { id: loadingToast });
    }
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-linear-to-br from-emerald-900 via-teal-900 to-cyan-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Card */}
        <div className="relative z-10 w-full max-w-md px-4">
          <Card className="shadow-2xl border-white/20 bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-br from-emerald-600 to-teal-600 p-5 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="mx-auto mb-3 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border-4 border-white/30">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-1 tracking-tight">
                  Create Account
                </CardTitle>
                <CardDescription className="text-white/90 text-sm">
                  {otpSent ? "Verify your phone number" : "Register as a citizen"}
                </CardDescription>
              </div>
            </div>

            <CardContent className="p-5">
              {!otpSent ? (
                <form className="space-y-3" onSubmit={handleSendOtp}>
                  {/* Name */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-sm flex items-center gap-2">
                      <User className="h-4 w-4" /> Full Name
                    </Label>
                    <Input
                      placeholder="Enter your full name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder="yourname@email.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone Number
                    </Label>
                    <Input
                      placeholder="+923001234567"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                    <p className="text-white/60 text-xs">Format: +92XXXXXXXXXX</p>
                  </div>

                  {/* CNIC */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-sm flex items-center gap-2">
                      <KeyRound className="h-4 w-4" /> CNIC Number
                    </Label>
                    <Input
                      placeholder="12345-1234567-1"
                      maxLength={15}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                      required
                      value={form.cnic}
                      onChange={(e) =>
                        setForm({ ...form, cnic: e.target.value })
                      }
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-sm flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Create a strong password"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                      required
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                  </div>

                  {/* Register Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 text-base font-semibold rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg text-white border-0"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending OTP...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Send OTP
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="text-center pt-3 border-t border-white/10">
                    <p className="text-white/70 text-sm mb-2">
                      Already have an account?
                    </p>
                    <a
                      href="/login"
                      className="text-white font-semibold hover:underline inline-flex items-center gap-2 transition-all"
                    >
                      Sign In <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                  {/* OTP Info Card */}
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-emerald-300 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">OTP Sent!</p>
                        <p className="text-white/80 text-xs mt-1">
                          We've sent a 6-digit code to <span className="font-semibold">{form.phone}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-sm flex items-center gap-2">
                      <KeyRound className="h-4 w-4" /> Enter OTP Code
                    </Label>
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-12 rounded-xl backdrop-blur-sm text-center text-xl tracking-widest font-mono"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-10 text-base font-semibold rounded-xl bg-linear-to-br from-green-600 to-emerald-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Verify & Create Account
                      </span>
                    )}
                  </Button>

                  {/* Resend OTP */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="text-white/80 text-sm hover:text-white hover:underline transition-all"
                    >
                      Didn't receive the code? Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}
