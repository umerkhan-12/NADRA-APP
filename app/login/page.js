"use client";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER"); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // ⭐ SAVE USER DATA IN LOCAL STORAGE
    localStorage.setItem("userId", data.userId);
localStorage.setItem("role", data.role);
    localStorage.setItem("userName", data.Name);

    alert(`Login successful as ${data.role}`);

    // ⭐ REDIRECT BASED ON ROLE
    if (data.role === "ADMIN") window.location.href = "/admin/dashboard";
    if (data.role === "AGENT") window.location.href = "/agent/dashboard";
    if (data.role === "USER") window.location.href = "/USER/dashboard";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1687042268510-c790c643ba4a"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-sm"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-2">
        <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-2 w-16 h-16 bg-linear-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Login As</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? "Checking..." : "Sign In"}
              </Button>

              {/* Sign Up Link */}
              <div className="text-sm text-center">
                <a href="/register" className="text-blue-600 hover:underline">
                  Don't have an account? Sign Up
                </a>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
