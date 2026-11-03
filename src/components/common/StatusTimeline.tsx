import React from 'react';
import { StatusHistoryItem } from '../../types/index.ts';
import { StatusBadge } from './Badge.tsx';
import { Clock, User } from 'lucide-react';

export const StatusTimeline: React.FC<{ items: StatusHistoryItem[] }> = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-xs text-slate-400 italic">Belum ada riwayat perubahan status.</p>;
  }

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="relative border-l-2 border-indigo-100 ml-3 pl-5 space-y-5 my-4">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          {/* Dot */}
          <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 shadow-sm group-hover:scale-110 transition-transform" />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">
                {item.statusLama}
              </span>
              <span className="text-xs text-slate-400">→</span>
              <StatusBadge status={item.statusBaru} size="sm" />
              <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                {formatDate(item.timestamp)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-0.5">
              <User className="w-3 h-3 text-slate-400" />
              <span>{item.userNama || 'Petugas Sistem'}</span>
            </div>

            {item.catatan && (
              <p className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-1.5 text-slate-600 italic">
                "{item.catatan}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
