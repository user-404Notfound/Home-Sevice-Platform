"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import { apiUrl } from "@/lib/api";
function ServicesContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search");

  const [activeCategory, setActiveCategory] = useState("All");
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = query
      ? `${apiUrl}/services/search?q=${encodeURIComponent(query)}`
      : `${apiUrl}/services`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
        const uniqueCategories = Array.from(new Set(data.map((s: any) => s.category))) as string[];
        setCategories(["All", ...uniqueCategories]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services", err);
        setLoading(false);
      });
  }, [query]);

  const filteredServices = activeCategory === "All"
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-amber-200">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 animate-fade-in-up">

        {/* Header Section */}
        <div className="relative max-w-4xl mb-12">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute top-0 right-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] pointer-events-none"></div>

          <h1 className="relative z-10 text-5xl lg:text-7xl font-black tracking-tight text-stone-900 mb-6 drop-shadow-sm">
            {query ? `Results for "${query}"` : "Discover Services"}
          </h1>
          <p className="relative z-10 text-xl lg:text-2xl text-stone-500 font-medium leading-relaxed max-w-2xl">
            {query ? "We found these parent categories matching your task needs." : "Browse our curated catalog of premium home services. From quick fixes to complete makeovers, we've got you covered."}
          </p>
        </div>

        {/* Categories Sticky Bar */}
        <div className="sticky top-20 z-40 -mx-6 px-6 lg:mx-0 lg:px-0 py-4 bg-[#fafafa]/80 backdrop-blur-xl border-b border-stone-200/50 mb-12 shadow-[0_4px_30px_rgb(0,0,0,0.02)] transition-all rounded-b-3xl lg:rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 pr-6 border-r border-stone-200">
              <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">Filter</span>
            </div>
            <div className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 pt-2 items-center flex-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative shrink-0 whitespace-nowrap px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden group ${activeCategory === cat
                    ? 'text-white shadow-[0_8px_20px_rgb(0,0,0,0.1)] -translate-y-1'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:border-amber-300 hover:text-stone-900 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                >
                  {activeCategory === cat && (
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800 -z-10"></div>
                  )}
                  <span className="flex items-center gap-2 relative z-10">
                    {activeCategory === cat && <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></span>}
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredServices.map((service, idx) => (
            <div
              key={`${activeCategory}-${service.id}`}
              className="group relative bg-white rounded-[2rem] p-7 border border-stone-100/80 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col justify-between animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
            >
              {/* Subtle grain overlay for premium feel */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }}></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-stone-50 border border-stone-100 flex items-center justify-center text-3xl group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                    {service.icon}
                  </div>
                  {service.popular && (
                    <span className="bg-gradient-to-r from-amber-200 to-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                      Popular
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-amber-600 transition-colors duration-300">
                  {service.name}
                </h3>
                <p className="text-sm text-stone-500 font-medium leading-relaxed mb-8 line-clamp-3">
                  {service.desc}
                </p>
              </div>

              <div className="pt-5 mt-auto relative z-10 origin-bottom">
                <Link
                  href={`/services/${service.id}`}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-stone-50 group-hover:bg-gray-900 group-hover:text-white text-gray-900 rounded-xl text-sm font-bold transition-all duration-300"
                >
                  <span>Explore Options</span>
                  <div className="w-8 h-8 rounded-full bg-white group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State / Fallback */}
        {filteredServices.length === 0 && (
          <div className="py-24 text-center animate-fade-in-up">
            <p className="text-lg text-stone-400 font-medium">No services found in this category.</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServicesContent />
    </Suspense>
  )
}
