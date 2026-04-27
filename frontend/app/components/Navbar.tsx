"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-stone-100/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] transition-all supports-[backdrop-filter]:bg-white/60">
      <nav className="flex items-center justify-between mx-auto max-w-7xl px-6 lg:px-8 py-3.5">
        <div className="flex lg:flex-1">
          <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900 hover:text-stone-700 transition-all hover:scale-[1.02] active:scale-95 origin-left">
            ServEase<span className="text-amber-500">.</span>
          </Link>
        </div>

        {/* Center Pill Navigation */}
        <div className="hidden lg:flex items-center justify-center gap-x-8 bg-stone-50/80 px-8 py-2.5 rounded-full border border-stone-200/50 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] backdrop-blur-md">
          <Link href="/services" className="relative group text-sm font-bold tracking-wide transition-all duration-300">
            <span className="text-gray-600 group-hover:text-black transition-colors duration-300">Catalog</span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full bg-black rounded-full"></span>
          </Link>
          <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
          <Link href="/cart" className="relative group text-sm font-bold tracking-wide transition-all duration-300">
            <span className="text-gray-600 group-hover:text-black transition-colors duration-300">Booking Cart</span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full bg-black rounded-full"></span>
          </Link>
          <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
          <Link href="/provider/login" className="relative group text-sm font-bold tracking-wide transition-all duration-300">
            <span className="text-amber-600 group-hover:text-amber-700 transition-colors duration-300 flex items-center gap-1.5">
              Provider Portal
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full bg-amber-600 rounded-full"></span>
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-5">
          {!loading && user ? (
            <>
              {/* Dashboard Link */}
              <Link href="/dashboard" className="group flex items-center gap-2 pr-4 pl-1 py-1 rounded-full hover:bg-stone-50/80 transition-colors duration-300 border border-transparent hover:border-stone-200/50">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                  <svg className="w-4 h-4 text-stone-500 group-hover:text-amber-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors duration-300">My Bookings</span>
              </Link>
              
              <div className="w-px h-6 bg-stone-200 mx-2"></div>
              
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-800 to-stone-600 flex items-center justify-center font-black text-white text-sm shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-2 border-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Welcome</span>
                  <span className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{user.name.split(' ')[0]}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-full transition-all duration-300 ml-3"
              >
                Logout
              </button>
            </>
          ) : !loading && !user ? (
            <>
              <Link href="/login" className="text-sm font-bold tracking-wide text-gray-600 hover:text-black transition-colors px-4 py-2">
                Log in
              </Link>
              <button onClick={() => router.push('/login')} className="group relative inline-flex items-center justify-center bg-gray-900 text-white rounded-full px-7 py-2.5 text-sm font-bold overflow-hidden shadow-[0_4px_14px_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all">
                <span className="relative z-10 flex items-center gap-1.5">
                  Get Started <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
              </button>
            </>
          ) : (
            <div className="flex gap-4 items-center">
               <div className="w-24 h-10 animate-pulse bg-stone-100 rounded-full"></div>
               <div className="w-32 h-10 animate-pulse bg-stone-200 rounded-full"></div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
