"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import AuthGuard from "../components/AuthGuard";
import { useAuth } from "../context/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [providersMap, setProvidersMap] = useState<Record<number, any>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("cart");
    if (existing) {
      const c = JSON.parse(existing);
      setCart(c);

      // Async fetch to populate the provider avatars and names
      const pIds = Array.from(new Set(c.map((i: any) => i.provider_id)));
      if (pIds.length > 0) {
        fetch(`http://localhost:5000/services/providers/details?ids=${pIds.join(',')}`)
          .then(res => res.json())
          .then(data => {
            const map: Record<number, any> = {};
            data.forEach((p: any) => { map[p.id] = p; });
            setProvidersMap(map);
          })
          .catch(console.error);
      }
    }
    setMounted(true);
  }, []);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));

    // Ghost Sync logic targeting Database mapping
    if (token) {
        fetch('http://localhost:5000/cart/sync', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ cartItems: newCart })
        }).catch(err => console.error("Ghost Sync failed", err));
    }
  };

  const updateQuantity = (id: number, providerId: number, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id && item.provider_id === providerId) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeItem = (id: number, providerId: number) => {
    const newCart = cart.filter(item => !(item.id === id && item.provider_id === providerId));
    saveCart(newCart);
  };

  // Global Math
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const platformFee = cart.length > 0 ? 49 : 0;
  const total = subtotal + platformFee;

  // Grouped Providers Logic
  const groupedProviderIds = Array.from(new Set(cart.map(c => c.provider_id)));

  if (!mounted) return null; // Avoid SSR hydration mismatch

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-amber-100 pb-32">
        
        {/* Unified Global Navigation */}
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 animate-fade-in-up">

        <div className="mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
            Your Cart
          </h1>
          <p className="text-lg text-stone-500 font-medium">
            Review your selected services and proceed to secure booking.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-stone-100 rounded-[2rem] shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
            <div className="w-32 h-32 bg-stone-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-stone-500 mb-8 max-w-sm text-center">There is nothing here yet. Explore our trusted network of professionals.</p>
            <button
              onClick={() => router.push('/services')}
              className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

            {/* Left Column: Grouped Provider Blocks */}
            <div className="xl:col-span-2 space-y-8">
              {groupedProviderIds.map((pId: any, pIdx) => {
                const providerInfo = providersMap[pId];
                const providerItems = cart.filter(c => c.provider_id === pId);
                const providerSubtotal = providerItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

                return (
                  <div
                    key={pId}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] animate-fade-in-up"
                    style={{ animationDelay: `${pIdx * 100}ms` }}
                  >
                    {/* Provider Banner */}
                    <div className="p-6 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center font-black text-gray-500 text-lg">
                          {providerInfo ? providerInfo.name.charAt(0) : "P"}
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-900 text-lg leading-snug">
                            {providerInfo ? providerInfo.name : "Loading Professional..."}
                          </h2>
                          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mt-0.5">
                            {providerInfo && (
                              <>
                                <span className="flex items-center gap-1 text-amber-600">⭐ {Number(providerInfo.rating).toFixed(1)}</span>
                                <span className="text-stone-300">|</span>
                                📍 {providerInfo.area}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subservices List */}
                    <div className="p-6 space-y-4">
                      {providerItems.map((item, idx) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 rounded-2xl border border-stone-100 hover:border-stone-200 transition-colors">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-stone-500 text-xs leading-relaxed mb-3 line-clamp-2">{item.desc}</p>
                            <p className="text-lg font-black text-gray-900">₹{item.price}</p>
                          </div>

                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                            <button
                              onClick={() => removeItem(item.id, item.provider_id)}
                              className="text-stone-400 hover:text-red-500 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Remove
                            </button>

                            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.provider_id, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-white text-stone-600 shadow-sm hover:text-red-500 hover:shadow transition-all font-bold"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.provider_id, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-stone-900 text-white shadow-sm hover:bg-black transition-all font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Provider Subtotal Footer */}
                    <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-end items-center">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest mr-4">Package Subtotal</span>
                      <span className="text-lg font-black text-gray-900">₹{providerSubtotal.toFixed(2)}</span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Right Column: Checkout Summary sticky */}
            <div className="xl:col-span-1">
              <div className="sticky top-28 bg-white border border-stone-100 rounded-[2rem] p-8 shadow-[0_4px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Overview</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-stone-600 font-medium text-sm">
                    <span>Subtotal ({cart.reduce((a, c) => a + c.quantity, 0)} services)</span>
                    <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 font-medium text-sm">
                    <span>Platform Fee</span>
                    <span className="text-gray-900 font-bold">₹{platformFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-6 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-black text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-2 text-right tracking-widest uppercase">Includes all fixed charges</p>
                </div>

                <button
                  onClick={() => router.push('/booking')}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all text-sm uppercase tracking-wider block text-center"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 flex flex-col gap-2">
                  {groupedProviderIds.length > 1 && (
                    <div className="flex items-start gap-2 text-amber-600 bg-amber-50 rounded-lg p-3 text-xs font-medium border border-amber-100">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      You have multiple professionals in this order. They will be scheduled simultaneously during checkout.
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-semibold mt-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                    256-bit Secure Encryption
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
    </AuthGuard>
  );
}
