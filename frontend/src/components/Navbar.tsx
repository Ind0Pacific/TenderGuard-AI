'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [vendorSession, setVendorSession] = useState<{
    phoneNumber: string;
    companyName: string | null;
    category: string | null;
  } | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.vendor) {
            setVendorSession({
              phoneNumber: data.vendor.phoneNumber,
              companyName: data.vendor.companyName,
              category: data.vendor.category,
            });
          }
        }
      } catch (e) {
        // Ignored
      }
    }
    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setVendorSession(null);
      router.push('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navItems = [
    { label: 'Live Verification Workspace', href: '/', id: 'workspace' },
    { label: 'Upload & Ingest', href: '/onboarding', id: 'ingest' },
    { label: 'Audit & Compliance', href: '/dashboard', id: 'audit' },
    { label: 'RAM & Hash Audit Logs', href: '/admin/audit-ledger', id: 'ledger' },
    { label: 'Official Audit Report', href: '/admin/audit-report', id: 'report' },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 glass-panel shadow-2xl border-b border-white/10 backdrop-blur-2xl">
      {/* Top Sovereign GeM 4.0 Sub-Banner with Mesh Atmosphere */}
      <div className="bg-mesh-sovereign text-slate-300 px-4 sm:px-margin py-1.5 flex items-center justify-between text-xs tracking-wider uppercase border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap relative z-10">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <span className="material-symbols-outlined text-[14px]">policy</span>GeM 4.0
          </span>
          <span className="opacity-40 text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300">Ministry of Electronics &amp; Information Technology (MeitY)</span>
          <span className="opacity-40 text-slate-500 hidden sm:inline">|</span>
          <span className="text-teal-300/80 font-mono">Tender Ref: GeM/2026/B/89412</span>
        </div>
        <div className="flex items-center gap-3 text-slate-300 text-xs font-medium relative z-10">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">lock</span>
            <span className="text-emerald-300">Zero-Retention Auditing</span>
          </div>
          <span className="opacity-40 text-slate-500">|</span>
          <span className="text-teal-300 font-mono">SHA-256 Mode</span>
        </div>
      </div>

      {/* Main Stitch Navigation Bar with Premium Glassmorphism */}
      <div className="h-16 w-full px-4 sm:px-margin flex items-center justify-between gap-4">
        {/* Brand & Zero-Storage Badges */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 group-hover:scale-105 group-hover:shadow-teal-400/50 transition-all duration-300">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-gradient-aurora">TenderGuard</span>
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider shadow-sm">
                AI
              </span>
            </div>
          </Link>

          <span className="hidden md:flex px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] uppercase tracking-wider font-semibold items-center gap-1.5 border border-emerald-500/30 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Zero-Storage RAM Security
          </span>

          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-slate-300 text-[11px] font-medium border border-white/10 shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Ephemeral Session: <strong className="text-emerald-300 font-mono">Active</strong></span>
          </div>
        </div>

        {/* Center Navigation Links with Gradient Highlight */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/70 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'btn-gradient-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Evaluator Profile or Login */}
        <div className="flex items-center gap-3">
          {vendorSession ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-white truncate max-w-[150px]">
                  {vendorSession.companyName || 'Auditor #4092'}
                </span>
                <span className="text-[10px] font-mono text-teal-300 font-semibold">
                  {vendorSession.phoneNumber}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out of evaluator portal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-gradient-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Evaluator Access</span>
            </Link>
          )}
        </div>
      </div>

      {/* Privacy Sub-Banner */}
      <div className="h-7 w-full bg-surface-container-low px-4 sm:px-margin flex items-center justify-between text-[11px] text-on-surface-variant border-t border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[14px]">shield</span>
          <span>Privacy Shield Active: Zero Document Disk Persistence. All files parsed in volatile RAM and purged post-hashing.</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="font-semibold text-secondary">RAM Buffer Integrity: 100% Isolated</span>
          <span className="text-outline-variant">|</span>
          <span>Enclave SHA-256 Verifier v4.2.1</span>
        </div>
      </div>
    </header>
  );
}
