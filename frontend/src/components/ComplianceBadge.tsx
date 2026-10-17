import React from 'react';
import { ComplianceStatus } from '@/lib/types';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function ComplianceBadge({
  status,
  size = 'md',
  showIcon = true,
}: ComplianceBadgeProps) {
  const configs = {
    COMPLIANT: {
      label: 'Compliant',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      icon: CheckCircle2,
      dot: 'bg-emerald-500',
    },
    NON_COMPLIANT: {
      label: 'Non-Compliant',
      bg: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      icon: XCircle,
      dot: 'bg-rose-500',
    },
    REQUIRES_REVIEW: {
      label: 'Requires Review',
      bg: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      icon: AlertTriangle,
      dot: 'bg-amber-500',
    },
  };

  const config = configs[status] || configs.REQUIRES_REVIEW;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 space-x-1.5',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 space-x-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} flex-shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
}
