"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [provider, setProvider] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("providerData");
        const token = localStorage.getItem("providerToken");

        if (stored && token) {
            setProvider(JSON.parse(stored));
        } else if (pathname !== "/provider/login" && pathname !== "/provider/signup") {
            router.push("/provider/login");
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("providerData");
        localStorage.removeItem("providerToken");
        setProvider(null);
        router.push("/provider/login");
    };

    if (!mounted) return null; // Avoid hydration mis-match

    // If on login or signup page, don't show the dashboard sidebar wrapper
    if (pathname === "/provider/login" || pathname === "/provider/signup") {
        return (
             <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
                {children}
             </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#f8f9fc] text-stone-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-stone-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)] hidden md:flex flex-col sticky top-0 h-screen z-20">
                <div className="p-6 border-b border-stone-50 flex items-center justify-between">
                    <a href="/provider/dashboard" className="text-xl font-black tracking-tighter text-gray-900">
                        ServEase<span className="text-amber-500">Pro</span>
                    </a>
                </div>

                <div className="flex-1 py-6 px-4 space-y-2">
                     <a href="/provider/dashboard" className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${pathname === '/provider/dashboard' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Dashboard
                     </a>
                </div>

                <div className="p-4 border-t border-stone-50">
                    {provider && (
                        <div className="px-4 py-3 mb-2 flex items-center bg-stone-50 rounded-xl border border-stone-100">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold mr-3">
                                {provider.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-stone-900 truncate w-full">{provider.name}</p>
                                <p className="text-xs font-medium text-stone-500 truncate w-full">Service Provider</p>
                            </div>
                        </div>
                    )}
                    <div className="px-4 py-3 flex items-center group cursor-pointer rounded-xl hover:bg-red-50 hover:text-red-600 text-stone-500 transition-colors" onClick={handleLogout}>
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span className="text-sm font-medium">Log out</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-stone-100 flex items-center justify-between p-4 sticky top-0 z-20 relative">
                     <a href="/provider/dashboard" className="text-lg font-black tracking-tighter text-gray-900">
                        ServEase<span className="text-amber-500">Pro</span>
                    </a>
                    <div className="flex items-center gap-4">
                        {provider && (
                            <span className="text-sm font-bold text-stone-900 max-w-[100px] truncate">{provider.name.split(' ')[0]}</span>
                        )}
                        <button onClick={handleLogout} className="text-sm font-medium text-stone-500 hover:text-red-600 transition-colors">
                            Logout
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                         {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
