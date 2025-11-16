"use client";
import { useEffect, useState } from "react";

export default function useAuth(requiredRole = null) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("userName");

    if (!storedUserId || !storedRole) {
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    const userData = {
      userId: storedUserId,
      role: storedRole,
      name: storedName,
    };

    setUser(userData);

    if (requiredRole && storedRole !== requiredRole) {
      window.location.href = "/unauthorized";
      return;
    }

    setLoading(false);
  }, []);

  return { user, loading };
}
