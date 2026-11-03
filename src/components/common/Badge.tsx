import React from 'react';
import { BorrowingStatus } from '../../types/index.ts';

interface BadgeProps {
  status: BorrowingStatus | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  let bgClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  const s = status ? status.toUpperCase() : '';

  switch (s) {
    case 'DISETUJUI':
    case 'TERSEDIA':
    case 'AKTIF':
    case 'BAIK':
      bgClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'MENUNGGU PERSETUJUAN':
    case 'DIGUNAKAN':
    case 'RUSAK RINGAN':
      bgClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500 animate-pulse';
      break;
    case 'DITOLAK':
    case 'RUSAK BERAT':
    case 'TIDAK AKTIF':
    case 'NONAKTIF':
      bgClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      break;
    case 'SELESAI':
      bgClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      dotColor = 'bg-sky-500';
      break;
    case 'DIBATALKAN':
      bgClasses = 'bg-zinc-100 text-zinc-600 border-zinc-200';
      dotColor = 'bg-zinc-400';
      break;
    case 'SERVIS':
    case 'PERBAIKAN':
      bgClasses = 'bg-orange-50 text-orange-700 border-orange-200';
      dotColor = 'bg-orange-500';
      break;
    case 'DRAFT':
      bgClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dotColor = 'bg-indigo-400';
      break;
    default:
      bgClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      dotColor = 'bg-slate-400';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bgClasses} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};

export const RoleBadge: React.FC<{ role: string; className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  role,
  className = '',
  size = 'md',
}) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = role;

  if (role === 'admin') {
    color = 'bg-purple-100 text-purple-800 border-purple-200 font-bold';
    label = 'ADMIN';
  } else if (role === 'sarpras') {
    color = 'bg-blue-100 text-blue-800 border-blue-200 font-bold';
    label = 'PETUGAS SARPRAS';
  } else if (role === 'pemohon') {
    color = 'bg-teal-100 text-teal-800 border-teal-200 font-bold';
    label = 'PEMOHON';
  }

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`${sizeClass} rounded border uppercase tracking-wider ${color} ${className}`}>
      {label}
    </span>
  );
};
