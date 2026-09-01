import React from 'react';
import { CheckCircle2, Radio, AlertCircle, Clock, Wrench, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = (status || '').toUpperCase();
  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  switch (norm) {
    case 'AVAILABLE':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
          Available
        </span>
      );
    case 'RENTED':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-sky-50 text-sky-950 border border-sky-300 shadow-2xs ${sizeClasses}`}>
          <Radio className="w-3.5 h-3.5 mr-1 text-sky-700 animate-pulse" />
          Rented (On Site)
        </span>
      );
    case 'UNASSIGNED':
      return (
        <span className={`inline-flex items-center font-black rounded-full bg-amber-100 text-amber-950 border border-amber-400 shadow-2xs ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-800" />
          Unassigned (In Yard)
        </span>
      );
    case 'OVERDUE':
      return (
        <span className={`inline-flex items-center font-black rounded-full bg-rose-50 text-rose-950 border border-rose-300 shadow-2xs ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-700" />
          Overdue Contract
        </span>
      );
    case 'MAINTENANCE':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-purple-50 text-purple-950 border border-purple-300 shadow-2xs ${sizeClasses}`}>
          <Wrench className="w-3.5 h-3.5 mr-1 text-purple-700" />
          Maintenance
        </span>
      );
    case 'ACTIVE':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs ${sizeClasses}`}>
          <Radio className="w-3.5 h-3.5 mr-1 text-emerald-700" />
          Active
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-slate-200 text-slate-900 border border-slate-300 shadow-2xs ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-700" />
          Completed
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-red-50 text-red-950 border border-red-300 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 mr-1 text-red-700" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-slate-100 text-slate-900 border border-slate-300 ${sizeClasses}`}>
          {norm}
        </span>
      );
  }
};
