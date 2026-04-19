"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "@/lib/auth";

export default function NutritionistDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (role !== "nutritionist") {
      router.replace("/dashboard/client");
    }
  }, [user, role, loading, router]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (loading || !user || role !== "nutritionist") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Nutritionist Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Clients", value: "—" },
            { label: "Meal Plans", value: "—" },
            { label: "Upcoming Sessions", value: "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500">
            Your nutritionist workspace is ready. Connect your clients and start
            building meal plans.
          </p>
        </div>
      </div>
    </main>
  );
}
