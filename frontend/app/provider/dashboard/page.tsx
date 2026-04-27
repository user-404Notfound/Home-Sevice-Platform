/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();
    const [provider, setProvider] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });
    const [bookings, setBookings] = useState<any[]>([]);
    
    // Service state
    const [hasServices, setHasServices] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Wizard state
    const [wizardCategories, setWizardCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [basePrice, setBasePrice] = useState("");
    const [experienceYears, setExperienceYears] = useState("");
    const [description, setDescription] = useState("");
    
    const [availableSubservices, setAvailableSubservices] = useState<any[]>([]);
    const [selectedSubservices, setSelectedSubservices] = useState<{ id: number, price: string }[]>([]);
    const [customSubservices, setCustomSubservices] = useState<{ name: string, price: string }[]>([]);
    const [savingWizard, setSavingWizard] = useState(false);
    
    // Edit specific state
    const [isEditingServices, setIsEditingServices] = useState(false);
    const [savedCategoryId, setSavedCategoryId] = useState<number | null>(null);
    const [activeServicesConfig, setActiveServicesConfig] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);

    // PIN Modal state
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pinInput, setPinInput] = useState("");
    const [activeBookingIdForPin, setActiveBookingIdForPin] = useState<number | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem("providerToken");
            if (!token) {
                router.push("/provider/login");
                return;
            }

            try {
                // Fetch Services Status First
                const servicesRes = await fetch("http://localhost:5000/provider/my-services", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (servicesRes.ok) {
                    const servicesData = await servicesRes.json();
                    setHasServices(servicesData.hasServices);
                    
                    if (!servicesData.hasServices) {
                        // Load categories for the wizard
                        fetch("http://localhost:5000/services")
                            .then(res => res.json())
                            .then(data => setWizardCategories(data));
                        setLoading(false);
                        return; // Stop loading dashboard stats if no services configured
                    } else {
                        // Pre-fill existing services for the edit wizard
                        const serv = servicesData.services[0];
                        if (serv) {
                            setSelectedCategoryId(serv.service_id);
                            setSavedCategoryId(serv.service_id);
                            setBasePrice(serv.base_price.toString());
                            setExperienceYears(serv.experience_years.toString());
                            setDescription(serv.description || "");
                        }
                        
                        const standardSubs = servicesData.subservices
                            .filter((s:any) => s.subservice_id !== null)
                            .map((s:any) => ({ id: s.subservice_id, price: s.custom_price.toString() }));
                        const customSubs = servicesData.subservices
                            .filter((s:any) => s.subservice_id === null)
                            .map((s:any) => ({ name: s.custom_name, price: s.custom_price.toString() }));
                        
                        setSelectedSubservices(standardSubs);
                        setCustomSubservices(customSubs);
                        
                        setActiveServicesConfig({
                            services: servicesData.services,
                            subservices: servicesData.subservices
                        });

                        fetch("http://localhost:5000/services")
                            .then(res => res.json())
                            .then(data => setWizardCategories(data));
                    }
                }

                // Fetch stats
                const statsRes = await fetch("http://localhost:5000/provider/stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch bookings
                const bookingsRes = await fetch("http://localhost:5000/provider/bookings", {
                     headers: { "Authorization": `Bearer ${token}` }
                });
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    setBookings(bookingsData);
                }

                // Fetch reviews
                const reviewsRes = await fetch("http://localhost:5000/provider/reviews", {
                     headers: { "Authorization": `Bearer ${token}` }
                });
                if (reviewsRes.ok) {
                    const reviewsData = await reviewsRes.json();
                    setReviews(reviewsData);
                }
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        const storedData = localStorage.getItem("providerData");
        if (storedData) {
            setProvider(JSON.parse(storedData));
        }

        fetchDashboardData();
    }, [router]);

    // Fetch subservices when a category is selected
    useEffect(() => {
        if (selectedCategoryId) {
            fetch(`http://localhost:5000/services/${selectedCategoryId}/subservices`)
                .then(res => res.json())
                .then(data => {
                    setAvailableSubservices(data);
                    // Pre-select them all initially as a convenience only if it's a new category
                    if (!hasServices || selectedCategoryId !== savedCategoryId) {
                        setSelectedSubservices(data.map((ds: any) => ({ id: ds.id, price: ds.price })));
                    }
                });
        } else {
            setAvailableSubservices([]);
            setSelectedSubservices([]);
        }
    }, [selectedCategoryId, hasServices, savedCategoryId]);

    const handleSaveServices = async () => {
        if (!selectedCategoryId || !basePrice || !experienceYears) return;
        setSavingWizard(true);

        const token = localStorage.getItem("providerToken");
        
        const payload = {
            services: [
                {
                    service_id: selectedCategoryId,
                    base_price: Number(basePrice),
                    experience_years: Number(experienceYears),
                    description: description,
                    subservices: [
                        ...selectedSubservices.map(s => ({ subservice_id: s.id, price: Number(s.price) })),
                        ...customSubservices.map(c => ({ custom_name: c.name, price: Number(c.price) }))
                    ]
                }
            ]
        };

        try {
            const res = await fetch("http://localhost:5000/provider/my-services", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Success! Refresh the page to load the actual dashboard
                window.location.reload();
            } else {
                const errorData = await res.json();
                if (res.status === 409 || errorData.msg?.includes("not found")) {
                    alert("Your profile was not found. Please log in again.");
                    localStorage.removeItem("providerToken");
                    localStorage.removeItem("providerData");
                    router.push("/provider/login");
                } else {
                    alert(errorData.msg || "Failed to save services");
                }
            }
        } catch (err) {
            console.error("Failed to save services", err);
            alert("An unexpected error occurred while saving services.");
        } finally {
            setSavingWizard(false);
        }
    };

    const openPinModal = (bookingId: number) => {
        setActiveBookingIdForPin(bookingId);
        setPinInput("");
        setPinModalOpen(true);
    };

    const submitCompletionPin = async () => {
        if (!activeBookingIdForPin || pinInput.length !== 6) {
            alert("Please enter a valid 6-digit PIN.");
            return;
        }
        await updateBookingStatus(activeBookingIdForPin, 'completed', pinInput);
        setPinModalOpen(false);
    };

    const updateBookingStatus = async (bookingId: number, status: string, pin?: string) => {
        const token = localStorage.getItem("providerToken");
        if (!token) return;

        setActionLoading(`${bookingId}-${status}`);
        try {
            const bodyPayload: any = { status };
            if (pin) bodyPayload.pin = pin;

            const res = await fetch(`http://localhost:5000/provider/bookings/${bookingId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bodyPayload)
            });

            if (res.ok) {
                setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status } : b));
                setStats(prev => {
                     const oldStatus = bookings.find(b => b.booking_id === bookingId)?.status;
                     const newStats = { ...prev };
                     if (oldStatus === 'pending') newStats.pending--;
                     if (status === 'completed') newStats.completed++;
                     if (status === 'cancelled') newStats.cancelled++;
                     return newStats;
                });
            } else {
                const errorData = await res.json();
                alert(errorData.msg || "Failed to update status");
            }
        } catch (err) {
            console.error("Error updating status", err);
            alert("Error communicating with server.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-screen mt-[-80px]">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-stone-500 font-medium animate-pulse">Loading workspace...</p>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    const statusConfig: Record<string, { bg: string, text: string, ring: string }> = {
        pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
        completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
        cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
        rejected: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' }
    };

    // WIZARD VIEW
    if (hasServices === false || isEditingServices) {
        return (
            <div className="min-h-screen bg-stone-50 pb-20 pt-10 px-4 flex justify-center items-start">
                <div className="max-w-3xl w-full mt-10 md:mt-20">
                    {/* Welcome Banner */}
                    <div className="bg-stone-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-amber-500/20 rounded-full blur-[80px]"></div>
                        <div className="relative z-10">
                            {hasServices ? (
                                <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Manage Your Services 🛠️</h1>
                            ) : (
                                <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Welcome, {provider?.name?.split(' ')[0]}! 🎉</h1>
                            )}
                            <p className="text-stone-300 font-medium text-lg leading-relaxed max-w-xl">
                                {hasServices 
                                    ? "Update the services you provide, tweak your pricing, and manage custom task details below."
                                    : "Let's get your profile set up so customers can start booking you. What services do you provide?"
                                }
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="space-y-8">
                            
                            {/* Step 1: Category */}
                            <div>
                                <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm">1</span>
                                    Select your primary category
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-full md:col-span-1">
                                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Category</label>
                                        <select 
                                            value={selectedCategoryId || ""} 
                                            onChange={(e) => setSelectedCategoryId(Number(e.target.value))} 
                                            className="w-full px-4 py-3.5 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium appearance-none"
                                        >
                                            <option value="" disabled>Select a category</option>
                                            {wizardCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Base Price (₹)</label>
                                            <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-stone-50/50 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Experience (Yrs)</label>
                                            <input type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-stone-50/50 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="5" />
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Service Description / Bio</label>
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3.5 rounded-xl bg-stone-50/50 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="Tell customers what makes your service special..."></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Subservices */}
                            {selectedCategoryId && (
                                <div className="animate-fade-in border-t border-stone-100 pt-8">
                                    <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm">2</span>
                                        Configure Sub-services
                                    </h2>
                                    <p className="text-sm text-stone-500 mb-6">Select the specific tasks you perform and set your own prices. Add any custom ones below.</p>
                                    
                                    <div className="space-y-3">
                                        {availableSubservices.map(sub => {
                                            const isSelected = selectedSubservices.some(s => s.id === sub.id);
                                            return (
                                                <div key={sub.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected ? 'border-amber-500/50 bg-amber-50/30' : 'border-stone-200 bg-white'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedSubservices([...selectedSubservices, { id: sub.id, price: sub.price }]);
                                                            } else {
                                                                setSelectedSubservices(selectedSubservices.filter(s => s.id !== sub.id));
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-stone-900">{sub.name}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-stone-500">₹</span>
                                                            <input 
                                                                type="number" 
                                                                value={selectedSubservices.find(s => s.id === sub.id)?.price || ""}
                                                                onChange={(e) => {
                                                                    setSelectedSubservices(selectedSubservices.map(s => s.id === sub.id ? { ...s, price: e.target.value } : s));
                                                                }}
                                                                className="w-24 px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Custom Subservices */}
                                    <div className="mt-6 pt-6 border-t border-stone-100 border-dashed">
                                        <h3 className="text-sm font-bold text-stone-900 mb-3">Add Custom Sub-services</h3>
                                        <div className="space-y-3">
                                            {customSubservices.map((c, i) => (
                                                 <div key={i} className="flex items-center gap-3">
                                                    <input 
                                                        type="text" 
                                                        value={c.name} 
                                                        onChange={(e) => setCustomSubservices(customSubservices.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item))}
                                                        placeholder="e.g. Special Deep Clean" 
                                                        className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-500"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-stone-500 font-semibold">₹</span>
                                                        <input 
                                                            type="number" 
                                                            value={c.price} 
                                                            onChange={(e) => setCustomSubservices(customSubservices.map((item, idx) => idx === i ? { ...item, price: e.target.value } : item))}
                                                            placeholder="Amount" 
                                                            className="w-24 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-500"
                                                        />
                                                    </div>
                                                    <button onClick={() => setCustomSubservices(customSubservices.filter((_, idx) => idx !== i))} className="p-2 text-stone-400 hover:text-red-500">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => setCustomSubservices([...customSubservices, { name: "", price: "" }])}
                                                className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                Add Another
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-8 border-t border-stone-100 flex justify-end gap-4">
                                {hasServices && (
                                    <button 
                                        onClick={() => {
                                            setIsEditingServices(false);
                                            window.location.reload(); 
                                        }}
                                        className="px-6 py-4 bg-white text-stone-900 border-2 border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-all flex items-center gap-2"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button 
                                    onClick={handleSaveServices}
                                    disabled={!selectedCategoryId || !basePrice || savingWizard}
                                    className="px-8 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all flex items-center gap-2"
                                >
                                    {savingWizard ? 'Saving...' : (hasServices ? 'Save Changes' : 'Complete Setup & Go to Dashboard')}
                                    {!savingWizard && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // REGULAR DASHBOARD VIEW
    return (
        <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 space-y-10 animate-fade-in pb-20">
            
            {/* Header section with glassmorphism */}
            <div className="relative rounded-3xl overflow-hidden bg-white/60 backdrop-blur-3xl border border-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px]"></div>
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-400/20 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-stone-900 mb-2">
                            Welcome back, {provider?.name?.split(' ')[0] || 'Provider'}! 👋
                        </h1>
                        <p className="text-stone-500 font-medium text-lg">Manage your tasks and track your performance.</p>
                    </div>
                    <div>
                        <button 
                            onClick={() => setIsEditingServices(true)}
                            className="px-6 py-3.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Manage Services
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Jobs', value: stats.total, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bg: 'bg-indigo-500/10', color: 'text-indigo-600', ring: 'ring-indigo-100' },
                    { label: 'Pending Action', value: stats.pending, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-amber-500/10', color: 'text-amber-600', ring: 'ring-amber-100' },
                    { label: 'Completed', value: stats.completed, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-emerald-500/10', color: 'text-emerald-600', ring: 'ring-emerald-100' },
                    { label: 'Cancelled', value: stats.cancelled, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-rose-500/10', color: 'text-rose-600', ring: 'ring-rose-100' },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden group`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
                        
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 ring-1 ${stat.ring}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon} />
                                </svg>
                            </div>
                            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-4xl font-black text-stone-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Services */}
            {activeServicesConfig && activeServicesConfig.services.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-10 border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-stone-900">My Provided Services</h2>
                            <p className="text-stone-500 font-medium mt-1">Review your active offerings and pricing.</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {activeServicesConfig.services.map((svc: any) => (
                            <div key={svc.service_id} className="border border-stone-100 rounded-2xl p-6 bg-stone-50/30">
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-100 pb-4 mb-4 gap-4">
                                    <h3 className="text-xl font-bold text-stone-900 flex items-center gap-3">
                                        <span className="text-2xl">{svc.icon}</span> {svc.service_name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-stone-500">
                                        <span className="bg-white px-3 py-1.5 rounded-lg border border-stone-100 shadow-sm">Base Rate: <span className="text-stone-900">₹{svc.base_price}</span></span>
                                        <span className="bg-white px-3 py-1.5 rounded-lg border border-stone-100 shadow-sm">Experience: <span className="text-stone-900">{svc.experience_years} Yrs</span></span>
                                    </div>
                                </div>
                                
                                {svc.description && (
                                    <p className="text-stone-600 mb-6 italic">"{svc.description}"</p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeServicesConfig.subservices
                                        .filter((sub: any) => sub.service_id === svc.service_id)
                                        .map((sub: any) => (
                                            <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-amber-500/30 transition-colors">
                                                <span className="font-bold text-stone-700">{sub.standard_name || sub.custom_name}</span>
                                                <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">₹{sub.custom_price}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-10 border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-stone-900">Customer Reviews</h2>
                            <p className="text-stone-500 font-medium mt-1">See what people are saying about your work.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.map((rev) => (
                            <div key={rev.review_id} className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
                                <div className="flex items-center gap-1 mb-3">
                                    {Array(5).fill(0).map((_, i) => (
                                        <svg key={i} className={`w-5 h-5 ${i < rev.rating ? 'text-amber-400' : 'text-stone-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    ))}
                                </div>
                                <p className="text-stone-700 font-medium mb-3 italic">"{rev.comment}"</p>
                                <p className="text-sm font-bold text-stone-900">— {rev.customer_name}</p>
                                <p className="text-xs text-stone-500 mt-1">{new Date(rev.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bookings List */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-stone-900">Recent Assignments</h2>
                        <p className="text-stone-500 font-medium mt-1">Manage and update your customer bookings.</p>
                    </div>
                </div>
                
                {bookings.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">No bookings yet</h3>
                        <p className="text-stone-500 max-w-sm mx-auto">Your assignments will beautifully appear here once customers start booking your services.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookings.map((booking, index) => {
                            const conf = statusConfig[booking.status] || statusConfig.pending;
                            const isPending = booking.status === 'pending';

                            return (
                                <div 
                                    key={booking.booking_id} 
                                    className="group rounded-2xl border border-stone-100 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white animate-slide-up hover:border-amber-500/20"
                                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            
                                            {/* Booking Info */}
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-stone-900 mb-2">{booking.service_name}</h3>
                                                        <div className="flex items-center gap-3 text-sm font-medium text-stone-500">
                                                            <span className={`inline-flex items-center rounded-lg px-3 py-1 font-bold ring-1 ring-inset ${conf.bg} ${conf.text} ${conf.ring}`}>
                                                                {booking.status.toUpperCase()}
                                                            </span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                                                            <span className="flex items-center gap-1.5">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                {formatDate(booking.booking_date)} at {booking.booking_time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-100">
                                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-0.5">Value</p>
                                                        <p className="text-xl font-black text-stone-900">₹{booking.total_price}</p>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 group-hover:bg-amber-50/30 transition-colors">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold text-xs uppercase">
                                                                {booking.customer_name.substring(0,2)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-stone-900 text-sm leading-tight">{booking.customer_name}</p>
                                                                <p className="text-stone-500 text-xs font-medium mt-0.5">{booking.customer_phone}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-2">
                                                            <svg className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            <p className="text-stone-600 text-sm font-medium leading-relaxed">{booking.location}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 group-hover:bg-amber-50/30 transition-colors">
                                                         <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Task Requirements</p>
                                                         <ul className="space-y-2">
                                                            {booking.items?.map((item: any, i: number) => (
                                                                <li key={i} className="text-sm font-semibold text-stone-700 flex items-start gap-2">
                                                                    <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    <span className="flex-1">{item.quantity}x {item.subservice_name}</span>
                                                                </li>
                                                            ))}
                                                         </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {isPending && (
                                                <div className="flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-stone-100 pt-6 lg:pt-0 lg:pl-8 lg:min-w-[200px]">
                                                    <button 
                                                        onClick={() => openPinModal(booking.booking_id)}
                                                        disabled={actionLoading !== null}
                                                        className="w-full relative flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-white bg-stone-900 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === `${booking.booking_id}-completed` ? 'Updating...' : 'Mark Completed'}
                                                    </button>
                                                    <button 
                                                        onClick={() => updateBookingStatus(booking.booking_id, 'cancelled')}
                                                        disabled={actionLoading !== null}
                                                        className="w-full flex items-center justify-center px-6 py-3.5 rounded-xl font-bold bg-white border-2 border-stone-100 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === `${booking.booking_id}-cancelled` ? 'Updating...' : 'Cancel Assignment'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Custom PIN Modal */}
            {pinModalOpen && (
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in-up">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-stone-900 text-center mb-2">Job Verification</h3>
                        <p className="text-stone-500 font-medium text-center mb-6 text-sm">Please ask the customer for the 6-digit completion PIN from their dashboard.</p>
                        
                        <div className="mb-8 flex justify-center">
                            <input 
                                type="text"
                                maxLength={6}
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full text-center text-4xl font-black tracking-[0.5em] px-4 py-4 rounded-2xl bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all outline-none text-stone-900"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPinModalOpen(false)}
                                className="flex-1 px-4 py-3.5 font-bold text-stone-600 bg-white border-2 border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitCompletionPin}
                                disabled={pinInput.length !== 6 || actionLoading !== null}
                                className="flex-1 px-4 py-3.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-lg disabled:opacity-50"
                            >
                                {actionLoading ? "Verifying..." : "Verify & Complete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
