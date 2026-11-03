import React, { ReactNode } from 'react';
import { Inbox, Car, Building2, Calendar, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'inbox' | 'car' | 'building' | 'calendar';
  customIcon?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tentu belum ada pengajuan.',
  description = 'Silakan buat pengajuan baru melalui formulir yang tersedia.',
  actionText = 'Buat Pengajuan',
  onAction,
  icon = 'inbox',
  customIcon,
}) => {
  const getIcon = () => {
    if (customIcon) return customIcon;
    switch (icon) {
      case 'car':
        return <Car className="h-10 w-10 text-slate-400 stroke-1" />;
      case 'building':
        return <Building2 className="h-10 w-10 text-slate-400 stroke-1" />;
      case 'calendar':
        return <Calendar className="h-10 w-10 text-slate-400 stroke-1" />;
      default:
        return <Inbox className="h-10 w-10 text-slate-400 stroke-1" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 my-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-400 shadow-sm">
        {getIcon()}
      </div>
      <h4 className="text-base font-semibold text-slate-700">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-sm mt-1">{description}</p>}
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
