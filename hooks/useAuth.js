"use client";
import { useEffect, useState } from "react";

export default function useAuth(requiredRole = null) {
  const [authState] = useState(() => {
    if (typeof window === "undefined") {
      return { user: null, role: null, loading: true };
    }

    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("userName");

    if (!storedUserId || !storedRole) {
      return { user: null, role: null, loading: false };
    }

    return {
      user: { userId: storedUserId, role: storedRole, name: storedName },
      role: storedRole,
      loading: false,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!authState.user || !authState.role) {
      window.location.href = "/login";
      return;
    }
    if (requiredRole && authState.role !== requiredRole) {
      window.location.href = "/unauthorized";
    }
  }, [requiredRole, authState.user, authState.role]);

  return { user: authState.user, loading: authState.loading };
}
