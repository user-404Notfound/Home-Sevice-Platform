"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "@/lib/api";
export default function AuthPage() {
  const router = useRouter();
  const { loginStateHack, user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleToggle = (toLogin: boolean) => {
    clearMessages();
    setIsLogin(toLogin);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Failed to login");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      loginStateHack();

      // Cloud Hydration: Restore previous Cart session to local buffer
      try {
        const cartRes = await fetch(`${apiUrl}/cart`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const cloudCart = await cartRes.json();
        if (cloudCart && cloudCart.length > 0) {
          localStorage.setItem("cart", JSON.stringify(cloudCart));
        }
      } catch (e) { console.error("Cloud Cart link failed", e); }

      setSuccess("Login successful. Redirecting...");

      setTimeout(() => router.push("/services"), 800);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\+?[\d\s\-()]{7,15}$/.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, location, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Failed to register");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      loginStateHack();
      setSuccess("Account created successfully. Redirecting...");

      setTimeout(() => router.push("/services"), 800);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-stone-50 font-sans">

      {/* Left side: Premium Bright Luxury Design (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-stone-50 z-0 border-r border-stone-100">

        {/* Soft elegant background mesh & diffusion effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Top-left very subtle warm glow */}
          <div className="absolute -top-[15%] -left-[10%] w-[60%] h-[60%] bg-amber-100 rounded-full filter blur-[100px] opacity-[0.4] animate-pulse"></div>

          {/* Center-right clean ambient diffusion */}
          <div className="absolute top-[20%] right-[-20%] w-[70%] h-[70%] bg-orange-50 rounded-full filter blur-[120px] opacity-[0.6] animate-float"></div>

          {/* Bottom focus zone behind text */}
          <div className="absolute -bottom-[20%] left-[5%] w-[90%] h-[70%] bg-stone-100 rounded-full filter blur-[140px] opacity-[0.8] animate-float-delayed"></div>
        </div>

        {/* Delicate Fine Grain Noise Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }}></div>

        {/* Top Brand */}
        <div className="relative z-10 p-16">
          <Link href="/" className="text-3xl font-black tracking-tighter text-gray-900 hover:text-stone-600 transition-colors duration-300">
            ServEase<span className="text-amber-500">.</span>
          </Link>
        </div>

        {/* Bottom Content with smooth grid crossfade */}
        <div className="relative z-10 p-16 mb-8 mt-auto grid grid-cols-1 grid-rows-1 text-gray-900">
          {/* Login Text */}
          <div className={`col-start-1 row-start-1 transition-all duration-700 ease-out flex flex-col justify-end ${isLogin ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98] pointer-events-none'}`}>
            <h1 className="text-5xl lg:text-[4rem] font-black tracking-tight mb-8 leading-[1.05]">
              Welcome back to your trusted home.
            </h1>
            <p className="text-xl text-stone-500 max-w-lg font-medium leading-relaxed">
              Access your dashboard to schedule, manage, and track expert professionals across all your properties.
            </p>
          </div>

          {/* Register Text */}
          <div className={`col-start-1 row-start-1 transition-all duration-700 ease-out flex flex-col justify-end ${!isLogin ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98] pointer-events-none'}`}>
            <h1 className="text-5xl lg:text-[4rem] font-black tracking-tight mb-8 leading-[1.05]">
              Build the future of home maintenance.
            </h1>
            <p className="text-xl text-stone-500 max-w-lg font-medium leading-relaxed">
              Join a network of verified providers and homeowners actively seeking high-quality maintenance solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 lg:p-12 xl:p-24 animate-fade-in-up">

        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8">
          <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900">
            ServEase<span className="text-amber-500">.</span>
          </Link>
        </div>

        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 transition-all duration-500 relative overflow-hidden">

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {isLogin ? "Log in" : "Create an account"}
            </h2>
            <p className="text-stone-500 font-medium">
              {isLogin ? "Welcome back! Please enter your details." : "Enter your information to get started."}
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {success}
            </div>
          )}

          {/* Form wrapper with grid logic for fluid height stability */}
          <div className="relative w-full grid grid-cols-1 grid-rows-1">

            {/* Login Form */}
            <form onSubmit={handleLogin} className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${isLogin ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto z-10' : 'opacity-0 -translate-x-8 scale-[0.97] pointer-events-none z-0'}`}>
              <div className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-gray-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium" />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-gray-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-5 mb-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-stone-300 text-gray-900 focus:ring-gray-900 cursor-pointer" />
                  <span className="text-sm font-medium text-stone-600 group-hover:text-stone-900 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-sm font-bold text-gray-900 hover:text-stone-600 transition-colors">Forgot Password?</a>
              </div>

              <button disabled={loading} type="submit" className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center">
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Log in'}
              </button>

              <p className="mt-8 text-center text-sm font-medium text-stone-500">
                Don't have an account? <button type="button" onClick={() => handleToggle(false)} className="text-gray-900 font-bold hover:underline">Sign up</button>
              </p>
            </form>


            {/* Register Form */}
            <form onSubmit={handleRegister} className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${!isLogin ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto z-10' : 'opacity-0 translate-x-8 scale-[0.97] pointer-events-none z-0'}`}>
              <div className="space-y-4">

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-gray-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium" />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-gray-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium" />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-gray-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium" />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (Optional)" className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-gray-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium" />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-gray-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium" />
                </div>

              </div>

              <button disabled={loading} type="submit" className="w-full mt-8 py-4 bg-gray-900 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center">
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Create Account'}
              </button>

              <p className="mt-6 text-center text-sm font-medium text-stone-500">
                Already have an account? <button type="button" onClick={() => handleToggle(true)} className="text-gray-900 font-bold hover:underline">Log in</button>
              </p>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}
