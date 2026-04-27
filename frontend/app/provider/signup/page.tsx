/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProviderSignUp() {
    const router = useRouter();
    
    // User Details
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // If already logged in, redirect
        const token = localStorage.getItem("providerToken");
        if (token) {
            router.push("/provider/dashboard");
        }
    }, [router]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = {
                name,
                email,
                phone,
                password,
                city,
                area
            };

            const res = await fetch("http://localhost:5000/provider/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || "Registration failed");
            }

            // Registration successful - log the user in automatically
            localStorage.setItem("providerToken", data.token);
            localStorage.setItem("providerData", JSON.stringify(data.provider));
            
            router.push("/provider/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 relative overflow-hidden backdrop-blur-3xl py-12">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-200/50 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-stone-300/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-3xl p-6 md:p-8 relative z-10 animate-fade-in-up">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 md:p-10">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
                            ServEase<span className="text-amber-500">Pro</span>
                        </h1>
                        <p className="text-sm font-medium text-stone-500 mt-2">Join us as a professional partner.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4 md:space-y-6">
                        
                        {/* Form fields layout */}
                        <div className="max-w-xl mx-auto space-y-6">
                                <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">Personal Details</h2>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="John Doe" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="john@example.com" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="+91 9876543210" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="••••••••" required />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">City</label>
                                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="Mumbai" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Area</label>
                                        <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="Bandra" required />
                                    </div>
                                </div>
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative flex justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Creating account...
                                        </span>
                                    ) : (
                                        "Create Provider Account"
                                    )}
                                </button>
                            </div>
                        </div>


                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                        <p className="text-sm font-medium text-stone-500">
                            Already have an account?{" "}
                            <Link href="/provider/login" className="text-amber-600 hover:text-amber-700 font-bold hover:underline transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
