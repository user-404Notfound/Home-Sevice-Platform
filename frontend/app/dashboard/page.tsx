"use client";

import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProviderId, setReviewProviderId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (token) {
        fetch('http://localhost:5000/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setBookings(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error("Failed to load historical bookings", err);
            setLoading(false);
        });
    }
  }, [token]);

  const submitReview = async () => {
      if (!reviewProviderId || !token) return;
      setSubmittingReview(true);
      try {
          const res = await fetch("http://localhost:5000/bookings/review", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ provider_id: reviewProviderId, rating, comment })
          });
          if (res.ok) {
              alert("Review submitted successfully! Thank you.");
              setReviewModalOpen(false);
              setRating(5);
              setComment("");
          } else {
              alert("Failed to submit review. Try again later.");
          }
      } catch (err) {
          console.error(err);
          alert("Error submitting review");
      } finally {
          setSubmittingReview(false);
      }
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-amber-100 pb-32">
        
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 animate-fade-in-up">
          
          <div className="mb-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-stone-200 border-4 border-white shadow-md flex items-center justify-center font-black text-gray-400 text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
                Good morning, {user.name.split(' ')[0]}
              </h1>
              <p className="text-lg text-stone-500 font-medium">
                Here is a summary of your scheduled maintenance and bookings.
              </p>
            </div>
          </div>

          {/* Grid Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            <div className="bg-white border text-sm sm:text-base border-stone-100 rounded-[2rem] p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500 z-0"></div>
               <div className="relative z-10">
                   <svg className="w-8 h-8 text-amber-500 mb-6 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <h3 className="text-stone-500 font-bold mb-1 text-sm uppercase tracking-widest">Upcoming</h3>
                   <p className="text-4xl font-black text-gray-900">{bookings.length}</p>
               </div>
            </div>

            <div className="bg-white border text-sm sm:text-base border-stone-100 rounded-[2rem] p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-green-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500 z-0"></div>
               <div className="relative z-10">
                   <svg className="w-8 h-8 text-green-500 mb-6 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                   <h3 className="text-stone-500 font-bold mb-1 text-sm uppercase tracking-widest">Completed</h3>
                   <p className="text-4xl font-black text-gray-900">0</p>
               </div>
            </div>

            <div className="bg-white border text-sm sm:text-base border-stone-100 rounded-[2rem] p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500 z-0"></div>
               <div className="relative z-10">
                   <svg className="w-8 h-8 text-blue-500 mb-6 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                   <h3 className="text-stone-500 font-bold mb-1 text-sm uppercase tracking-widest">Total Spent</h3>
                   <p className="text-4xl font-black text-gray-900">
                     ₹{bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0).toFixed(2)}
                   </p>
               </div>
            </div>

          </div>

          {!loading && bookings.length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                <svg className="w-16 h-16 text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Bookings Detected</h2>
                <p className="text-stone-500 font-medium max-w-md mx-auto mb-6">You haven't scheduled any maintenance services recently. Check the catalog to get started.</p>
                <button onClick={() => router.push('/services')} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-lg">
                Explore Services
                </button>
            </div>
          ) : (
            <div className="space-y-6">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Appointments</h2>
               {bookings.map(b => (
                   <div key={b.booking_id} className="bg-white border border-stone-100 rounded-[2rem] p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
                           <div>
                               <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                   <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                   {new Date(b.booking_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {b.booking_time}
                               </p>
                               <h3 className="text-2xl font-bold text-gray-900">{b.service_name} • <span className="font-medium text-stone-400">{b.provider_name}</span></h3>
                           </div>
                           <div className="flex flex-col items-start md:items-end">
                               <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${
                                   b.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                   b.status.toLowerCase() === 'rejected' || b.status.toLowerCase() === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                   'bg-amber-50 text-amber-600 border-amber-200'
                               }`}>{b.status}</span>
                               <p className="text-2xl font-black text-gray-900 mt-2">₹{parseFloat(b.total_price || 0).toFixed(2)}</p>
                               {b.status === 'pending' && b.completion_pin && (
                                   <div className="mt-3 bg-stone-100 px-4 py-2 rounded-xl text-center border border-stone-200">
                                       <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Completion PIN</p>
                                       <p className="text-2xl font-black tracking-widest text-stone-900">{b.completion_pin}</p>
                                       <p className="text-[10px] text-stone-400 font-medium mt-1">Share this with provider when done</p>
                                   </div>
                               )}
                               {b.status === 'completed' && (
                                   <button 
                                      onClick={() => { setReviewProviderId(b.provider_id); setReviewModalOpen(true); }}
                                      className="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline transition-colors"
                                   >
                                       Write a Review
                                   </button>
                               )}
                           </div>
                       </div>
                       
                       <div className="space-y-3">
                           <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tasks Overview</p>
                           {b.items && b.items.map((item: any, idx: number) => (
                               <div key={idx} className="flex justify-between items-center text-sm font-bold text-gray-900 bg-stone-50 px-4 py-3 rounded-xl border border-stone-100/50">
                                   <span>{item.subservice_name} <span className="text-stone-400 font-medium ml-1">x{item.quantity}</span></span>
                                   <span>₹{parseFloat(item.price || 0).toFixed(2)}</span>
                               </div>
                           ))}
                       </div>
                   </div>
               ))}
            </div>
          )}

        </main>
      </div>

      {reviewModalOpen && (
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-fade-in-up">
                  <h3 className="text-2xl font-black text-stone-900 mb-2">Rate Your Service</h3>
                  <p className="text-stone-500 font-medium mb-6">How was your experience with the provider?</p>
                  
                  <div className="mb-6">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Rating</label>
                      <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                  key={star} 
                                  onClick={() => setRating(star)}
                                  className="focus:outline-none hover:scale-110 transition-transform"
                              >
                                  <svg className={`w-8 h-8 ${rating >= star ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="mb-8">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Comment (Optional)</label>
                      <textarea 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          placeholder="Tell us what you liked..."
                          className="w-full px-4 py-3 rounded-2xl bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                      ></textarea>
                  </div>

                  <div className="flex justify-end gap-4">
                      <button 
                          onClick={() => setReviewModalOpen(false)}
                          disabled={submittingReview}
                          className="px-6 py-3 font-bold text-stone-600 hover:text-stone-900 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={submitReview}
                          disabled={submittingReview}
                          className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-lg disabled:opacity-50"
                      >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </AuthGuard>
  );
}
