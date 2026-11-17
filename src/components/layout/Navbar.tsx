"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-sports-green flex items-center justify-center text-navy-950 shadow-lg shadow-sports-green/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-100 flex items-center gap-1">
                Athlete<span className="text-sports-green">Care</span>
              </span>
              <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-semibold">
                Wellness & Readiness Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-sports-green transition-colors">
              Platform Features
            </Link>
            <Link href="#roles" className="hover:text-sports-green transition-colors">
              Stakeholders
            </Link>
            <Link href="#readiness" className="hover:text-sports-green transition-colors">
              Readiness Scoring
            </Link>
            <Link href="#about" className="hover:text-sports-green transition-colors">
              Synopsis
            </Link>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-slate-100 px-4 py-2 rounded-xl hover:bg-navy-850 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-bold bg-sports-green hover:bg-sports-green-hover text-navy-950 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-sports-green/10 hover:shadow-sports-green/20"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-navy-850 border border-navy-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-navy-800 bg-navy-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:bg-navy-800 rounded-lg"
          >
            Platform Features
          </Link>
          <Link
            href="#roles"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:bg-navy-800 rounded-lg"
          >
            Stakeholders
          </Link>
          <Link
            href="#readiness"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:bg-navy-800 rounded-lg"
          >
            Readiness Scoring
          </Link>
          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:bg-navy-800 rounded-lg"
          >
            Synopsis
          </Link>
          <div className="pt-4 border-t border-navy-800 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-navy-850 text-slate-200 font-semibold text-sm border border-navy-800"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-sports-green text-navy-950 font-bold text-sm shadow-md"
            >
              Register Athlete
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
