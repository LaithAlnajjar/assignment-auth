"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { currentUser, role, loading, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (currentUser) {
      currentUser.getIdToken().then((token) => {
        api
          .get("/profile", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setProfileData(res.data))
          .catch((err) => console.error(err));
      });
    }
  }, [currentUser]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-gray-200 hover:bg-gray-300 hover:cursor-pointer text-gray-800 px-4 py-2 rounded transition "
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              User Profile
            </h2>
            <p className="mt-2 text-gray-900 font-medium">
              {currentUser.email}
            </p>
            <p className="text-gray-500 text-sm">{currentUser.uid}</p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
              Current Role
            </h2>
            <p className="mt-2 text-2xl font-bold text-gray-900 capitalize">
              {role}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Backend Response</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm">
            {profileData
              ? JSON.stringify(profileData, null, 2)
              : "Fetching data..."}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">
            Admin Area
          </h3>
          <Link
            href="/admin/stats"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-sm"
          >
            View System Stats
          </Link>
        </div>
      </div>
    </div>
  );
}
