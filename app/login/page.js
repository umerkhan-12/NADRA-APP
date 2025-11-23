"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Lock, User, Shield, UserCog, LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading("Signing in...");

    try {
      let result;
      
      // Different login flows for USER/ADMIN vs AGENT
      if (role === "AGENT") {
        if (!username || !password) {
          toast.error("Please enter username and password", { id: loadingToast });
          setLoading(false);
          return;
        }
        result = await signIn("agent-login", {
          username,
          password,
          redirect: false,
        });
      } else {
        if (!email || !password) {
          toast.error("Please enter email and password", { id: loadingToast });
          setLoading(false);
          return;
        }
        result = await signIn("user-login", {
          email,
          password,
          redirect: false,
        });
      }

      setLoading(false);

      if (result?.error) {
        toast.error("Invalid credentials. Please try again.", { id: loadingToast });
        return;
      }

      if (result?.ok) {
        toast.success(`Welcome back! Redirecting...`, { id: loadingToast });
        
        // Redirect based on selected role
        setTimeout(() => {
          if (role === "ADMIN") {
            window.location.href = "/admin/dashboard";
          } else if (role === "AGENT") {
            window.location.href = "/agent/dashboard";
          } else {
            window.location.href = "/USER/dashboard";
          }
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.", { id: loadingToast });
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    if (role === "ADMIN") return <Shield className="w-5 h-5" />;
    if (role === "AGENT") return <UserCog className="w-5 h-5" />;
    return <User className="w-5 h-5" />;
  };

  const getRoleColor = () => {
    if (role === "ADMIN") return "from-purple-600 to-pink-600";
    if (role === "AGENT") return "from-cyan-600 to-blue-600";
    return "from-emerald-600 to-green-600";
  };

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
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
      
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md px-4">
          <Card className="shadow-2xl border-white/20 bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden">
            {/* Header with Gradient */}
            <div className={`bg-gradient-to-br ${getRoleColor()} p-6 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="mx-auto mb-3 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border-4 border-white/30">
                  {getRoleIcon()}
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-1 tracking-tight">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-white/90 text-sm">
                  Sign in to access your NADRA account
                </CardDescription>
              </div>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-white font-semibold text-sm">
                    Select Your Role
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger 
                      id="role" 
                      className="bg-white/10 border-white/20 text-white focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="USER" className="text-white hover:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" /> Citizen
                        </div>
                      </SelectItem>
                      <SelectItem value="AGENT" className="text-white hover:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <UserCog className="w-4 h-4" /> Agent
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN" className="text-white hover:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" /> Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Fields based on role */}
                {role === "AGENT" ? (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white font-semibold text-sm flex items-center gap-2">
                      <UserCog className="w-4 h-4" /> Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-semibold text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@email.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-semibold text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 h-10 rounded-xl backdrop-blur-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-11 text-base font-semibold rounded-xl bg-gradient-to-br ${getRoleColor()} hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg text-white border-0`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                {/* Register Link */}
                <div className="text-center pt-3 border-t border-white/10">
                  <p className="text-white/70 text-sm mb-2">
                    Don't have an account?
                  </p>
                  <a
                    href="/register"
                    className="text-white font-semibold hover:underline inline-flex items-center gap-2 transition-all"
                  >
                    Create Account <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

              </form>
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
