"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { apiUrl } from "@/lib/api";
export default function ServiceTasksPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const existingStr = localStorage.getItem('cart');
    if (existingStr) setCart(JSON.parse(existingStr));
  }, []);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`${apiUrl}/services/${id}`).then(res => {
        if (!res.ok) throw new Error("Service fetch failed");
        return res.json();
      }),
      fetch(`${apiUrl}/services/${id}/providers`).then(res => {
        if (!res.ok) throw new Error("Providers fetch failed");
        return res.json();
      })
    ])
      .then(([serviceData, providersData]) => {
        setService(serviceData);
        setProviders(providersData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#fdfcfa] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Service not found</h2>
        <button onClick={() => router.push('/services')} className="text-amber-600 hover:underline">Return to Services</button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] text-gray-900 font-sans selection:bg-amber-100 pb-32 relative">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 animate-fade-in-up">

        {/* Service Hero Banner - Modernized */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-white border border-stone-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center text-5xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white opacity-50"></div>
              <span className="relative z-10">{service.icon}</span>
            </div>
            <div>
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2 block bg-amber-50 px-3 py-1 rounded-full w-max">
                {service.category}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
                {service.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Provider Listing Section */}
        <div className="animate-fade-in-up mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            Verified Professionals
            <span className="text-sm font-medium text-stone-400">({providers.length} available)</span>
          </h2>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {providers.map((provider: any, idx: number) => (
              <div
                key={provider.id}
                className="group relative bg-white rounded-3xl p-6 md:p-8 border border-stone-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-gray-900 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between"
                style={{ animationDelay: `${idx * 75}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-xl font-black text-gray-900 shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    {provider.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-amber-600 transition-colors">
                      {provider.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm font-semibold text-stone-500 mb-2">
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-100/50">
                        <span className="text-xs">★</span> {Number(provider.rating).toFixed(1)}
                      </div>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {provider.experience} Yrs
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {provider.desc}
                </p>

                <div className="mt-auto pt-5 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Base Visit</span>
                    <span className="text-lg font-black text-gray-900">₹{provider.base_price}</span>
                  </div>
                  <button
                    onClick={() => router.push(`/services/${id}/provider/${provider.id}`)}
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-stone-50 text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-all flex items-center gap-2 shadow-sm"
                  >
                    View Menu
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {providers.length === 0 && (
            <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center">
              <svg className="w-12 h-12 text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-stone-500 font-medium">Currently, no verified professionals are available in this specific category.</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar (if user already had stuff in cart) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 pb-6 sm:pb-8 animate-fade-in-up pointer-events-none">
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-gray-900 border border-gray-800 text-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_20px_40px_rgb(0,0,0,0.3)] pointer-events-auto">
            <div className="flex flex-col pl-2">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">{cart.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
              <span className="text-lg sm:text-xl font-black">₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
            </div>
            <button onClick={() => router.push('/cart')} className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-2">
              View Cart <span className="text-xl leading-none">&rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
