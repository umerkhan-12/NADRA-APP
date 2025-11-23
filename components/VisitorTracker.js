"use client";
import { useEffect } from "react";

export default function VisitorTracker({ page = "home" }) {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch("/api/visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page }),
        });
      } catch (error) {
        console.error("Visitor tracking failed:", error);
      }
    };

    trackVisit();
  }, [page]);

  return null;
}
