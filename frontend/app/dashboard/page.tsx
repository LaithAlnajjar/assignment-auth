"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { handler } from "next/dist/build/templates/app-page";

export default function Dashboard() {
  const { currentUser, role, loading, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);

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

  const handleRoleToggle = async (newRole: "admin" | "user") => {
    if (!currentUser) return;
    setDemoLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const endpoint = newRole === "admin" ? "/demo/promote" : "/demo/demote";

      await api.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      window.location.reload();
    } catch (err) {
      console.error("Failed to switch role", err);
      setDemoLoading(false);
    }
  };

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
          <h3 className="text-lg text-gray-800 font-semibold mb-4">
            Backend Response
          </h3>
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

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mt-10">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">
            🚧 For Demo Purpose Only
          </h3>
          <p className="text-yellow-700 mb-4 text-sm">
            Use these buttons to instantly toggle your role and test RBAC
            functionality. (This section would not exist in production).
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => handleRoleToggle("admin")}
              disabled={demoLoading || role === "admin"}
              className={`px-4 py-2 rounded font-medium transition
                ${
                  role === "admin"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:cursor-pointer"
                }
              `}
            >
              {demoLoading ? "Switching..." : "Promote to Admin"}
            </button>

            <button
              onClick={() => handleRoleToggle("user")}
              disabled={demoLoading || role === "user"}
              className={`px-4 py-2 rounded font-medium transition 
                ${
                  role === "user"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-700 text-white shadow-sm hover:cursor-pointer"
                }
              `}
            >
              {demoLoading ? "Switching..." : "Demote to User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
