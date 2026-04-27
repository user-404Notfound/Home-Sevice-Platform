"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-white">

      {/* Navbar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
            ? "bg-white/90 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-gray-100"
            : "bg-white/5 backdrop-blur-[2px] border-b border-white/10"
          } animate-fade-in-down`}
      >
        <nav className={`flex items-center justify-between mx-auto max-w-7xl px-6 lg:px-8 transition-all duration-500 ${isScrolled ? "py-4" : "py-6"}`}>

          {/* Logo */}
          <div className="flex lg:flex-1">
            <a
              href="/"
              className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white drop-shadow-md'
                }`}
            >
              ServEase<span className="text-amber-500">.</span>
            </a>
          </div>

          {/* Links */}
          <div className="hidden lg:flex lg:gap-x-10">
            <a
              href="/services"
              className="relative group text-base font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
            >
              <span className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 group-hover:text-black' : 'text-gray-100 group-hover:text-white drop-shadow-sm'
                }`}>
                Services
              </span>
              <span className={`absolute -bottom-1.5 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-black' : 'bg-white'
                }`}></span>
            </a>
            <a
              href="/provider/login"
              className="relative group text-base font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
            >
              <span className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 group-hover:text-black' : 'text-gray-100 group-hover:text-white drop-shadow-sm'
                }`}>
                Become a Provider
              </span>
              <span className={`absolute -bottom-1.5 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-black' : 'bg-white'
                }`}></span>
            </a>
          </div>

          {/* Login */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href={user ? "/dashboard" : "/login"}
              className={`group relative inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.03] ${isScrolled
                  ? 'bg-gray-900 text-white shadow-md hover:shadow-lg hover:bg-black'
                  : 'bg-white/90 backdrop-blur-md text-gray-900 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-white'
                }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {user ? "Dashboard" : "Log in"} <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative isolate min-h-[110vh] flex items-center justify-center overflow-hidden">

        {/* Background Image with Parallax */}
        <div className="absolute inset-0 -z-20 w-full h-full animate-zoom-parallax">
          <img
            src="/hero_bg.jpg"
            alt="Home Services Professionals"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Soft Dark Transparent Overlay */}
        <div className="absolute inset-0 -z-10 bg-black/25"></div>

        {/* Floating Icons */}
        <div className="absolute top-[30%] left-[8%] md:top-[35%] md:left-[15%] -z-10 animate-float opacity-80">
          <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/90 drop-shadow-2xl"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
        </div>
        <div className="absolute bottom-[25%] right-[8%] md:bottom-[35%] md:right-[15%] -z-10 animate-float-delayed opacity-80">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/90 drop-shadow-2xl"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" /><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.35 2.22 2.02 3.02 2.02 2.45 0 4.25-2.06 4.25-4.5 0-1.5-1.5-2.56-2.27-2.56z" /></svg>
        </div>

        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10 w-full pt-16">

          <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl tracking-tight animate-fade-in-up drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] leading-tight">
            Book Trusted Home Services Easily
          </h1>

          <p className="mt-6 text-xl sm:text-2xl text-gray-100 animate-fade-in-up-delay-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] font-medium max-w-2xl mx-auto">
            Find expert professionals for cleaning, repairs, plumbing, and more — all scheduled at your convenience.
          </p>

          {/* Glassmorphism Search Bar */}
          <div className="mt-10 mx-auto max-w-2xl bg-white/15 border border-white/20 backdrop-blur-md rounded-full p-2.5 flex items-center shadow-2xl animate-fade-in-up-delay-1 focus-within:-translate-y-1 transition-transform duration-300">
            <div className="flex-1 px-4 text-left flex items-center">
              <svg className="w-6 h-6 text-white/80 mr-3 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="What service do you need?"
                className="w-full bg-transparent border-none outline-none text-white placeholder-white/80 font-medium text-lg h-12"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-[0_4px_14px_0_rgba(0,0,0,0.3)]">
              Search
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 animate-fade-in-up-delay-2">
            <a
              href="/services"
              className="w-full sm:w-auto rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white px-10 py-4 text-base font-semibold text-black hover:bg-gray-100 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300"
            >
              Explore Services
            </a>

            <a
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-black/30 backdrop-blur-md border border-white/30 px-10 py-4 text-base font-semibold text-white hover:bg-black/50 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
            >
              {user ? "Go to Dashboard" : "Login"}
            </a>
          </div>

          {/* Provider Link */}
          <div className="mt-8 animate-fade-in-up-delay-2">
            <a href="/provider/signup" className="text-white/80 hover:text-white text-sm font-medium transition-colors hover:underline underline-offset-4">
              Are you a professional? Sign up here.
            </a>
          </div>
        </div>

        {/* Smooth Transition Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-50 to-transparent z-0 pointer-events-none"></div>
      </div>

      {/* 1. Service Categories */}
      <section className="py-24 bg-stone-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl hover:text-stone-700 transition">Our Services</h2>
            <p className="mt-4 text-lg text-gray-600">Expert professionals for every home need.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Plumbing', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /> },
              { name: 'Electrical', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /> },
              { name: 'Cleaning', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /> },
              { name: 'AC Repair', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" /> },
              { name: 'Carpentry', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655 9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043M8.457 8.457 3 3m5.457 5.457 7.086 7.086m0 0L21 21" /> },
            ].map((service) => (
              <div key={service.name} className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-300 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mb-4 group-hover:bg-stone-900 transition-colors duration-300">
                  <svg className="w-8 h-8 text-stone-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    {service.icon}
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold">{service.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section className="py-24 bg-stone-100/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Your home service in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative animate-fade-in-up">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-stone-200 -z-10"></div>

            {[
              { step: '01', title: 'Choose Service', desc: 'Select from our wide range of professional services for your home.' },
              { step: '02', title: 'Book Appointment', desc: 'Pick a date, time, and professional that works best for your schedule.' },
              { step: '03', title: 'Get Service', desc: 'Our verified professional arrives on time and gets the job done right.' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-stone-50 border-8 border-stone-100 flex items-center justify-center text-2xl font-bold text-stone-800 shadow-sm mb-6 group-hover:border-stone-900 group-hover:bg-stone-50 group-hover:text-stone-900 transition duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Us</h2>
            <p className="mt-4 text-lg text-stone-400">We set the standard for home services.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Verified Pros', desc: 'Background checked and highly rated experts.' },
              { title: 'Transparent Pricing', desc: 'No hidden fees. You know what you pay upfront.' },
              { title: 'Quick Service', desc: 'On-demand serving allowing same day appointments.' },
              { title: 'Guarantee', desc: 'If you are not entirely happy, we make it right.' }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-stone-800 border border-stone-700 hover:bg-stone-800/80 hover:-translate-y-1 transition duration-300">
                <div className="w-12 h-12 rounded-full bg-stone-700/50 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-stone-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-24 bg-stone-900 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight mb-6">Ready to book your service?</h2>
          <p className="text-xl text-stone-300 mb-10 max-w-2xl mx-auto">Get connected with top-rated professionals in minutes and experience zero-hassle home maintenance.</p>
          <a href={user ? "/services" : "/login"} className="inline-block bg-white text-gray-900 font-bold px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 text-lg">
            {user ? "Explore Services" : "Get Started Now"}
          </a>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white py-12 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <a href="/" className="text-2xl font-extrabold tracking-tight text-gray-900">
              ServEase<span className="text-amber-500">.</span>
            </a>
            <p className="mt-2 text-sm text-gray-500">© 2026 ServEase Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-gray-600">
            <a href="#" className="hover:text-gray-900 transition-colors">Services</a>
            <a href="#" className="hover:text-gray-900 transition-colors">About Us</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}