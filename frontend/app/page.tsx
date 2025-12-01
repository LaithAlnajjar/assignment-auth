"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-blue-900">
        RBAC Auth System
      </h1>
      <p className="mb-8 text-gray-600">Technical Assignment Demo</p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
