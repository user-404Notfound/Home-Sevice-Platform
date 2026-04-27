"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import { useAuth } from "../../../../context/AuthContext";

export default function ProviderMenuPage() {
  const { token } = useAuth();
  const { id, providerId } = useParams();
  const router = useRouter();

  const [provider, setProvider] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const existingStr = localStorage.getItem('cart');
    if (existingStr) setCart(JSON.parse(existingStr));
  }, []);

  useEffect(() => {
    if (!id || !providerId) return;

    fetch(`http://localhost:5000/services/${id}/providers/${providerId}/menu`)
      .then(res => {
          if (!res.ok) throw new Error("Failed to fetch menu");
          return res.json();
      })
      .then(data => {
        setProvider(data.provider);
        setMenu(data.menu);
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, providerId]);

  const handleAddToCart = (item: any) => {
    try {
      let newCart = [...cart];
      const idx = newCart.findIndex((i: any) => i.id === item.subservice_id && i.provider_id === Number(providerId));

      if (idx > -1) {
        newCart[idx].quantity += 1;
      } else {
        newCart.push({
          id: item.subservice_id || item.pbs_id, // ensure fallback
          name: item.name,
          desc: item.desc || "Custom task offered by provider",
          price: Number(item.provider_price),
          provider_id: Number(providerId),
          service_id: Number(id),
          quantity: 1
        });
      }

      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));

      if (token) {
        fetch('http://localhost:5000/cart/sync', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ cartItems: newCart })
        }).then(res => {
            if (res.status === 409) {
                localStorage.removeItem('cart');
                setCart([]);
                alert("Your cart contained outdated booking profiles and has been reset. Please add this item again!");
            }
        }).catch(err => console.error("Ghost Sync failed", err));
      }
    } catch (e) {
      console.error('Cart error', e);
    }
  };

  const currentProviderCartTotal = cart.filter(i => i.provider_id === Number(providerId))
                                       .reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Professional not found</h2>
        <button onClick={() => router.push(`/services/${id}`)} className="text-amber-600 hover:underline">Return to Providers</button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] text-gray-900 font-sans selection:bg-amber-100 pb-32 relative">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 animate-fade-in-up">
        
        {/* Breadcrumb / Back Navigation */}
        <button onClick={() => router.push(`/services/${id}`)} className="mb-8 flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Professionals
        </button>

        {/* Provider Hero Profile */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-stone-100 shadow-[0_4px_30px_rgb(0,0,0,0.02)] mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-bl-[100%] opacity-50 z-0 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl bg-stone-100 flex items-center justify-center text-3xl font-black text-gray-900 shrink-0">
                    {provider.name.charAt(0)}
                </div>
                <div>
                     <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{provider.name}</h1>
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100 font-bold text-sm flex items-center gap-1 shadow-sm">
                            <span className="text-xs">★</span> {Number(provider.rating).toFixed(1)}
                        </span>
                     </div>
                     <p className="text-stone-500 font-medium mb-3 max-w-xl">{provider.desc}</p>
                     
                     <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-900">
                         <span className="px-4 py-2 bg-stone-50 rounded-xl border border-stone-100">
                             {provider.experience} Years Experience
                         </span>
                         <span className="px-4 py-2 bg-stone-50 rounded-xl border border-stone-100">
                             Base Visit Fee: ₹{provider.base_price}
                         </span>
                     </div>
                </div>
            </div>
        </div>

        {/* Task Menu Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            Services Menu
            <span className="text-sm font-medium text-stone-400">({menu.length} tasks)</span>
        </h2>

        {menu.length === 0 ? (
             <div className="bg-white rounded-[2rem] p-12 text-center border border-stone-100 shadow-sm">
                <p className="text-stone-500 font-medium">This professional hasn't configured specific tasks yet.</p>
             </div>
        ) : (
            <div className="grid gap-4">
                {menu.map((item, idx) => {
                    const quantity = cart.find(i => i.id === (item.subservice_id || item.pbs_id) && i.provider_id === Number(providerId))?.quantity || 0;

                    return (
                        <div key={item.pbs_id} className="bg-white rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-stone-100 shadow-[0_2px_10px_rgb(0,0,0,0.01)] hover:shadow-lg hover:border-gray-900 transition-all duration-300">
                           <div className="flex-1">
                               <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                               <p className="text-stone-500 text-sm leading-relaxed mb-4 max-w-2xl">{item.desc}</p>
                               <span className="text-lg font-black text-gray-900">₹{item.provider_price}</span>
                           </div>

                           <div className="shrink-0 flex items-center justify-end w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100">
                               {quantity > 0 ? (
                                    <div className="flex items-center gap-4 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-md">
                                        <button className="w-8 h-8 flex items-center justify-center font-black rounded-lg hover:bg-stone-700 transition" onClick={() => {/* Decrement logic can be added */}}>-</button>
                                        <span className="font-bold w-4 text-center">{quantity}</span>
                                        <button className="w-8 h-8 flex items-center justify-center font-black rounded-lg hover:bg-stone-700 transition" onClick={() => handleAddToCart(item)}>+</button>
                                    </div>
                               ) : (
                                    <button 
                                        onClick={() => handleAddToCart(item)}
                                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-stone-50 text-gray-900 hover:bg-gray-900 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                        Add to Cart
                                    </button>
                               )}
                           </div>
                        </div>
                    )
                })}
            </div>
        )}

        {/* Customer Reviews Section */}
        <div className="mt-16 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 border-t border-stone-200 pt-10">
                Customer Reviews
                <span className="text-sm font-medium text-stone-400">({reviews.length} reviews)</span>
            </h2>

            {reviews.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-stone-100 shadow-sm">
                   <p className="text-stone-500 font-medium">This professional doesn't have any reviews yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {reviews.map((review: any) => (
                        <div key={review.review_id} className="bg-white rounded-[2rem] p-6 sm:p-8 border border-stone-100 shadow-[0_2px_10px_rgb(0,0,0,0.01)] hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 font-black text-lg flex items-center justify-center">
                                    {review.user_name ? review.user_name.charAt(0) : "U"}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.user_name || "Guest User"}</h4>
                                    <div className="flex items-center gap-1 text-sm text-stone-400 mt-0.5">
                                        <span className="text-green-600 font-bold">★ {review.rating}.0</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 pb-6 sm:pb-8 animate-fade-in-up pointer-events-none">
              <div className="max-w-4xl mx-auto flex items-center justify-between bg-gray-900 border border-gray-800 text-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_20px_40px_rgb(0,0,0,0.3)] pointer-events-auto">
                  <div className="flex flex-col pl-2">
                      <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">{cart.reduce((sum, item) => sum + item.quantity, 0)} Items Total</span>
                      <span className="text-lg sm:text-xl font-black">₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                  </div>
                  <button onClick={() => router.push('/cart')} className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-2">
                      Proceed to Checkout <span className="text-xl leading-none">&rarr;</span>
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}
