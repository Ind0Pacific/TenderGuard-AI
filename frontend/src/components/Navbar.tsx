'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, FileCheck, CheckSquare, Eye, BarChart3, Lock } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Audit Dashboard', href: '/', icon: FileCheck },
    { label: 'Verify Filing', href: '/verify', icon: Shield },
    { label: 'Review Queue', href: '/review', icon: Eye },
    { label: 'Tender Rules', href: '/tenders', icon: CheckSquare },
    { label: 'AI Benchmarks', href: '/benchmarks', icon: BarChart3 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top Government Procurement Banner */}
      <div className="bg-slate-950 text-slate-400 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Government e-Procurement Portal Compliance Verification Node</span>
          <span className="text-slate-600">|</span>
          <span className="text-indigo-400 font-medium">Domain: AI4Impact</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-emerald-400">
            <Lock className="w-3 h-3" />
            <span className="font-medium text-[11px]">Zero-Retention Enforced</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">SHA-256 Audit Mode</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">TenderGuard</span>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-extrabold text-xl">AI</span>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">v1.0</span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide">Explainable Vendor Compliance Framework</p>
            </div>
          </Link>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
