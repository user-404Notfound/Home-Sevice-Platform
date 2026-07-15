"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import AuthGuard from "../components/AuthGuard";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../../lib/api";
export default function BookingPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [schedules, setSchedules] = useState<Record<string, { date: string, time: string }>>({});
  const [disabledSlots, setDisabledSlots] = useState<Record<string, string[]>>({});
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Date Logic
  const today = new Date();
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate()
    };
  });

  const timeSlots = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

  useEffect(() => {
    const existing = localStorage.getItem("cart");
    let c = [];
    if (existing) {
      c = JSON.parse(existing);
      setCart(c);
    }
    setMounted(true);

    if (c.length > 0) {
      const pIds = Array.from(new Set(c.map((i: any) => i.provider_id)));
      fetch(`${apiUrl}/services/providers/details?ids=${pIds.join(',')}`)
        .then(res => res.json())
        .then(data => setProviders(data))
        .catch(console.error);
    }
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const platformFee = cart.length > 0 ? 49 : 0;
  const total = subtotal + platformFee;

  const isFormValid = address.trim().length > 5 && providers.length > 0 && Object.keys(schedules).length === providers.length && Object.values(schedules).every(s => s.date && s.time);

  const handleDateSelect = async (providerId: string, date: string) => {
    setSchedules(prev => ({ ...prev, [providerId]: { ...(prev[providerId] || {}), date, time: '' } }));

    try {
      const res = await fetch(`${apiUrl}/bookings/availability?providerId=${providerId}&date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDisabledSlots(prev => ({ ...prev, [providerId]: data.bookedSlots || [] }));
      }
    } catch (err) {
      console.error('Failed to fetch availability', err);
    }
  };

  const handleTimeSelect = (providerId: string, time: string) => {
    setSchedules(prev => ({ ...prev, [providerId]: { ...(prev[providerId] || {}), time } }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems: cart,
          schedules: schedules,
          location: address
        })
      });

      if (!res.ok) throw new Error("Checkout failed server side.");

      setIsSubmitting(false);
      setIsSuccess(true);
      localStorage.removeItem("cart");
      setCart([]);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert("There was an issue processing your booking securely. Please try again.");
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#fdfcfa] flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
          <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Booking Confirmed!</h1>
        <p className="text-xl text-stone-500 mb-10 max-w-md">Your professional schedule has securely been locked. We will send you an email with the final details.</p>
        <button onClick={() => router.push('/services')} className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all">
          Explore More Services
        </button>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-amber-100 pb-32">

        <Navbar />

        <main className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 animate-fade-in-up">

          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
              Confirm Your Booking
            </h1>
            <p className="text-lg text-stone-500 font-medium">
              Review details and schedule your service securely.
            </p>
          </div>

          {cart.length === 0 && !isSuccess ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold">Nothing to book here!</h2>
              <button onClick={() => router.push('/services')} className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-xl">Go Back</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">

              {/* Left Column: Form & Details */}
              <div className="xl:col-span-2 space-y-12">

                {/* Provider & Items Breakdown Grouped */}
                <section className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm shadow-md">1</span>
                    Assigned Professionals
                  </h2>

                  {providers.map((provider) => (
                    <div key={provider.id} className="bg-white border text-sm sm:text-base border-amber-200 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                      <div className="p-6 sm:p-8 bg-amber-50/50 border-b border-amber-100/60 flex items-start gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center text-xl font-black text-amber-700 shrink-0">
                          {provider.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600 mt-2">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-900">⭐ {Number(provider.rating).toFixed(1)}</span>
                              <span className="text-stone-400 font-normal">({provider.review_count})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              📍 {provider.city} ({provider.area})
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 sm:p-8 space-y-4">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Requested Tasks</p>
                        {cart.filter(c => c.provider_id === provider.id).map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-100">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">{item.name} <span className="font-medium text-stone-400">x{item.quantity}</span></span>
                            </div>
                            <span className="font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {/* Embedded Provider Specific Scheduling */}
                      <div className="p-6 sm:p-8 bg-stone-50 border-t border-stone-100 rounded-b-3xl">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Select Date for {provider.name.split(' ')[0]}</p>
                        <div className="flex gap-3 overflow-x-auto pb-4 hide-scroll-bar">
                          {next7Days.map((d) => (
                            <button
                              key={d.full}
                              onClick={() => handleDateSelect(provider.id, d.full)}
                              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 transition-all duration-300 ${schedules[provider.id]?.date === d.full
                                ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                }`}
                            >
                              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 ${schedules[provider.id]?.date === d.full ? 'text-stone-300' : 'text-stone-400'}`}>{d.dayStr}</span>
                              <span className="text-xl sm:text-2xl font-black">{d.dateNum}</span>
                            </button>
                          ))}
                        </div>

                        {schedules[provider.id]?.date && (
                          <div className="mt-4 animate-fade-in-up">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Time Slot</p>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {timeSlots.map(time => {
                                const isBooked = disabledSlots[provider.id]?.includes(time);
                                return (
                                  <button
                                    key={time}
                                    disabled={isBooked}
                                    onClick={() => handleTimeSelect(provider.id, time)}
                                    className={`px-4 py-2 sm:px-5 sm:py-3 rounded-xl font-bold text-sm border-2 transition-all duration-300 ${isBooked
                                      ? 'border-stone-100 bg-stone-100 text-stone-300 line-through cursor-not-allowed'
                                      : schedules[provider.id]?.time === time
                                        ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                                        : 'border-stone-200 bg-white text-stone-600 hover:border-gray-900 hover:text-gray-900'
                                      }`}
                                  >
                                    {time}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </section>

                {/* Address Section */}
                <section className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm shadow-md">2</span>
                    Service Address
                  </h2>

                  <div className="bg-white border border-stone-100 rounded-3xl p-6 sm:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                    <div className="relative">
                      <label htmlFor="address" className="block text-sm font-bold text-stone-500 mb-2">Complete Address (Flat / Area / Pin)</label>
                      <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 402, Signature Towers, Link Road..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-5 text-gray-900 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:bg-white transition-all outline-none resize-none min-h-[120px]"
                      />
                    </div>
                  </div>
                </section>

              </div>

              {/* Right Column: Checkout Summary sticky */}
              <div className="xl:col-span-1">
                <div className="sticky top-28 bg-white border border-stone-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-stone-600 font-medium">
                      <span>Services ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
                      <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 font-medium">
                      <span>Platform Fee</span>
                      <span className="text-gray-900 font-bold">₹{platformFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-6 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-black text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={!isFormValid || isSubmitting}
                    className={`relative w-full py-4 font-bold rounded-xl shadow-md transition-all text-sm uppercase tracking-wider overflow-hidden ${!isFormValid
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                      </span>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>

                  <p className={`text-xs mt-4 text-center font-bold ${!isFormValid ? 'text-amber-500' : 'text-green-600/0'}`}>
                    Select Date, Time, and Address to unlock.
                  </p>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </AuthGuard>
  );
}
