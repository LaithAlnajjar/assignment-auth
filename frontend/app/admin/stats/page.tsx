"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function AdminStatsPage() {
  const { currentUser, role, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      if (role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [currentUser, role, loading, router]);

  useEffect(() => {
    if (currentUser && role === "admin") {
      currentUser.getIdToken().then((token) => {
        api
          .get("/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setStats(res.data))
          .catch((err) => console.error("Failed to fetch stats", err));
      });
    }
  }, [currentUser, role]);

  if (loading) return <div className="p-10">Checking permissions...</div>;
  if (!currentUser || role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-500">System overview and statistics</p>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 font-medium underline"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">
              Total Users
            </h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">
              {stats?.totalUsers ?? "..."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">
              Revenue
            </h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">
              {stats?.revenue ?? "..."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">
              Active Users
            </h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">
              {stats?.activeUsers ?? "..."}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Raw API Response</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto font-mono text-sm">
            {stats ? JSON.stringify(stats, null, 2) : "Loading data..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
