"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Immediately lock and eject
    }
  }, [user, loading, router]);

  // Trap while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-[100dvh] bg-[#fdfcfa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
           <p className="text-sm font-bold text-gray-900 tracking-widest uppercase">Securing Connection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
