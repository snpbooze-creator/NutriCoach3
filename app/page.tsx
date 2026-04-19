"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (role === "nutritionist") {
      router.replace("/dashboard/nutritionist");
    } else {
      router.replace("/dashboard/client");
    }
  }, [user, role, loading, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Loading…</p>
    </main>
  );
}
