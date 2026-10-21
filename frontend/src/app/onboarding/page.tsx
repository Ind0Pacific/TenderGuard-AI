'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  VendorCategory,
  ChecklistDocumentConfig,
} from '@/lib/types';
import { getChecklistForCategory } from '@/lib/checklists';
import {
  HardHat,
  Cpu,
  Truck,
  Building2,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface CategoryOption {
  id: VendorCategory;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  sampleTenders: string[];
}

const CATEGORIES: CategoryOption[] = [
  {
    id: VendorCategory.CONSTRUCTION,
    title: 'Construction & Civil Infrastructure',
    subtitle: 'PWD / CPWD / NHAI / State Works',
    description:
      'Civil engineering contractors, heavy earthmoving, bridge construction, road surfacing, and industrial site works.',
    icon: HardHat,
    accentColor: 'text-amber-400 bg-amber-500/10',
    borderColor: 'border-amber-500/40',
    glowColor: 'from-amber-500/10 to-orange-500/10',
    sampleTenders: ['PWD Highway Expansion', 'State Bridge Works', 'Metro Rail Viaduct'],
  },
  {
    id: VendorCategory.ELECTRONICS,
    title: 'Electronics & IT Hardware',
    subtitle: 'Hardware / Telecom / Smart Infrastructure',
    description:
      'IT hardware suppliers, optical fiber, surveillance systems, biometric devices, and electrical equipment manufacturers.',
    icon: Cpu,
    accentColor: 'text-cyan-400 bg-cyan-500/10',
    borderColor: 'border-cyan-500/40',
    glowColor: 'from-cyan-500/10 to-blue-500/10',
    sampleTenders: ['Smart City CCTV Grid', 'Defense Telecom Terminals', 'State Datacenter Racks'],
  },
  {
    id: VendorCategory.LOGISTICS,
    title: 'Logistics & Fleet Transport',
    subtitle: 'Freight / Warehousing / Supply Corridors',
    description:
      'Commercial freight carriers, refrigerated perishable cargo fleets, inter-state transit, and multi-modal freight operators.',
    icon: Truck,
    accentColor: 'text-emerald-400 bg-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    glowColor: 'from-emerald-500/10 to-teal-500/10',
    sampleTenders: ['FCI Grain Distribution', 'State Medical Supply Transit', 'Port Container Haulage'],
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  // State
  const [vendorPhone, setVendorPhone] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>(
    VendorCategory.CONSTRUCTION
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load current session
  useEffect(() => {
    async function loadVendorSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!data.authenticated || !data.vendor) {
          router.push('/login');
          return;
        }

        setVendorPhone(data.vendor.phoneNumber);
        if (data.vendor.companyName) {
          setCompanyName(data.vendor.companyName);
        }
        if (data.vendor.category) {
          setSelectedCategory(data.vendor.category as VendorCategory);
        }
      } catch (err) {
        setErrorMessage('Unable to verify active session');
      } finally {
        setIsLoading(false);
      }
    }

    loadVendorSession();
  }, [router]);

  // Dynamic Sequential Checklist Preview
  const previewChecklist: ChecklistDocumentConfig[] = getChecklistForCategory(selectedCategory);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!companyName.trim() || companyName.trim().length < 3) {
      setErrorMessage('Please enter your full registered Legal Business Entity Name (min 3 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          category: selectedCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update vendor profile');
      }

      // Transition to verification workspace
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error configuring vendor profile');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
        <Navbar />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-secondary glass-panel px-6 py-4 rounded-2xl shadow-sm">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold text-gradient-sovereign">Loading statutory vendor registry...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
      {/* Ambient Aurora Light Orbs */}
      <div className="absolute top-10 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-teal-500/15 via-emerald-400/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[480px] left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-secondary/10 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 relative z-10">
        {/* Onboarding Stepper Header */}
        <div className="glass-panel gradient-border-card rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container/60 pb-5">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-semibold mb-2 border border-secondary/20 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                <span>Vendor Identity Verified (+91 {vendorPhone.slice(-10)})</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient-sovereign">
                Company Profile &amp; Procurement Category
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Configure your business profile to activate the statutory sequential document verification workflow.
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center space-x-2 self-start sm:self-center font-label">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Phone OTP</span>
              </div>
              <span className="text-outline">→</span>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold shadow-sm">
                <Building2 className="w-3.5 h-3.5" />
                <span>2. Company &amp; Category</span>
              </div>
              <span className="text-outline">→</span>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-container/70 text-on-surface-variant text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>3. Sequential Audit</span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mt-4 flex items-start space-x-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Legal Entity Details */}
          <div className="glass-panel gradient-border-card rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Registered Corporate Legal Entity Name</h2>
                <p className="text-xs text-on-surface-variant">
                  Must match statutory documents (PAN card, GST registration certificate, and MCA incorporation).
                </p>
              </div>
            </div>

            <div className="pt-2 max-w-2xl">
              <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2 font-label">
                Legal Business / Firm Name
              </label>
              <div className="relative rounded-xl border border-white/10 bg-slate-950/80 focus-within:bg-slate-900 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="e.g., Apex Buildtech Infra Pvt Ltd or TechNova Infotech Ltd"
                  disabled={isSubmitting}
                  className="w-full bg-transparent pl-10 pr-4 py-3 text-primary placeholder-on-surface-variant/60 text-sm focus:outline-none font-medium"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center space-x-1">
                <HelpCircle className="w-3 h-3 text-secondary" />
                <span>Our vision AI cross-references this entity name against all uploaded statutory certificates.</span>
              </p>
            </div>
          </div>

          {/* Step 2: Tender Procurement Category Selector */}
          <div className="glass-panel gradient-border-card rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Select Primary Procurement Category</h2>
                <p className="text-xs text-on-surface-variant">
                  This dynamically defines your mandatory statutory compliance checklist (Steps 4 through 6).
                </p>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`cursor-pointer rounded-2xl p-5 text-left transition-all relative overflow-hidden backdrop-blur-md ${
                      isSelected
                        ? 'bg-gradient-to-br from-teal-500/15 via-white/90 to-emerald-500/10 border-2 border-secondary shadow-lg shadow-teal-500/10'
                        : 'glass-panel gradient-border-card hover:border-secondary/50 hover:shadow-md'
                    }`}
                  >
                    {/* Active Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-secondary text-white text-[10px] font-bold font-label shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-secondary-container text-on-secondary-fixed-variant shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-primary">{cat.title}</h3>
                        <p className="text-[11px] text-on-surface-variant font-medium">{cat.subtitle}</p>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{cat.description}</p>

                    <div className="border-t border-surface-container/60 pt-3">
                      <p className="text-[10px] font-semibold text-secondary uppercase tracking-wider mb-1.5 font-label">
                        Sample Procurement Scenarios
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.sampleTenders.map((tender, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-white/70 border border-outline-variant/30 text-[10px] text-on-surface-variant font-medium"
                          >
                            {tender}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Sequential Checklist Preview */}
          <div className="glass-panel gradient-border-card rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container/60 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-fixed-variant flex items-center justify-center shadow-sm">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gradient-sovereign">
                    Sequential Audit Pipeline for {selectedCategory}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    6 statutory documents verified sequentially. Each step must pass before the next unlocks.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-on-surface-variant font-label">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                <span>3 Universal Base</span>
                <span className="text-outline">+</span>
                <span className="w-2 h-2 rounded-full bg-secondary shadow-sm shadow-secondary/50"></span>
                <span>3 Category Specific</span>
              </div>
            </div>

            {/* Steps Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {previewChecklist.map((doc) => (
                <div
                  key={doc.docType}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all backdrop-blur-sm ${
                    doc.isUniversal
                      ? 'bg-white/60 border-surface-container hover:bg-white/80'
                      : 'bg-gradient-to-br from-emerald-500/5 via-white/70 to-teal-500/5 border-secondary/30 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-secondary uppercase tracking-wider font-label">
                        Step {doc.stepNumber} • {doc.isUniversal ? 'Universal' : 'Category Specific'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        Doc: {doc.docType}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-primary leading-snug">
                      {doc.title}
                    </h4>

                    <p className="text-[11px] text-on-surface-variant line-clamp-2">
                      {doc.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-surface-container/60 flex items-center justify-between text-[10px] text-on-surface-variant">
                    <span>Authority: <strong className="text-primary font-mono">{doc.authorityOrForm}</strong></span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Zero Retention
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              className="text-xs text-on-surface-variant hover:text-primary transition font-medium flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Return to Live Workspace</span>
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !companyName.trim()}
              className="btn-gradient-primary px-7 py-3 rounded-xl text-white font-semibold text-sm shadow-lg shadow-teal-900/15 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Configuring Sequential Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Initialize Verification Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
