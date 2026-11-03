import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard, Car, Building2, Calendar,
  Truck, DoorOpen, Wrench, FileBarChart,
  Users, Layers, Settings, X, ChevronRight, UserCircle,
  Printer
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { user, role, settings } = useAuth();

  const handleNav = (page: string) => {
    onNavigate(page);
    onClose();
  };

  const isRoleAdmin = role === 'admin';
  const isRoleSarpras = role === 'sarpras';
  const isPrivileged = isRoleAdmin || isRoleSarpras;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo SMKN 1 Tegalsari"
                className="w-9 h-9 rounded-lg object-contain bg-white p-0.5"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-sm">
                S1T
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base">SISARPRAS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-semibold">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                SMKN 1 Tegalsari
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs font-medium">
          {/* Dashboard */}
          <div>
            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-medium ${
                currentPage === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="text-sm">Dashboard</span>
            </button>
          </div>

          {/* PEMINJAMAN */}
          <div>
            <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
              PEMINJAMAN
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('car-borrowings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  currentPage.startsWith('car-')
                    ? 'bg-indigo-600/90 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
                  <span>Peminjaman Mobil</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleNav('hall-bookings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  currentPage.startsWith('hall-')
                    ? 'bg-indigo-600/90 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Penggunaan Aula</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleNav('calendar')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  currentPage === 'calendar'
                    ? 'bg-indigo-600/90 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Kalender Sarpras</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleNav('print-center')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  currentPage === 'print-center'
                    ? 'bg-indigo-600/90 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Printer className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="font-semibold text-emerald-300">Cetak Dokumen</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>

          {/* SARANA & PRASARANA */}
          <div>
            <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
              SARANA & PRASARANA
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('vehicles')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  currentPage === 'vehicles'
                    ? 'bg-indigo-600/90 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Kendaraan</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleNav('rooms')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  currentPage === 'rooms'
                    ? 'bg-indigo-600/90 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DoorOpen className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Ruangan</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleNav('facilities')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  currentPage === 'facilities'
                    ? 'bg-indigo-600/90 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Fasilitas</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>

          {/* LAPORAN (Admin & Sarpras, or Pemohon rekap) */}
          {isPrivileged && (
            <div>
              <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                LAPORAN
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNav('print-center')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    currentPage === 'print-center'
                      ? 'bg-indigo-600/90 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Printer className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Pusat Cetak & PDF</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => handleNav('reports-car')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    currentPage === 'reports-car'
                      ? 'bg-indigo-600/90 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileBarChart className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Laporan Mobil</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => handleNav('reports-hall')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    currentPage === 'reports-hall'
                      ? 'bg-indigo-600/90 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileBarChart className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Laporan Aula</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => handleNav('reports-rekap')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    currentPage === 'reports-rekap'
                      ? 'bg-indigo-600/90 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileBarChart className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Rekap Sarpras</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          )}

          {/* ADMINISTRASI (Khusus Admin) */}
          {isRoleAdmin && (
            <div>
              <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                ADMINISTRASI
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNav('users')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    currentPage === 'users'
                      ? 'bg-indigo-600/90 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Pengguna</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => handleNav('units')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    currentPage === 'units'
                      ? 'bg-indigo-600/90 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Unit Kerja</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => handleNav('settings')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    currentPage === 'settings'
                      ? 'bg-indigo-600/90 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Pengaturan</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User preview bar at bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={() => handleNav('profile')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0">
              <UserCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.nama || 'Pengguna'}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase font-mono tracking-wider">
                {role} • {user?.unitNama ? user.unitNama.split('(')[0].trim() : 'SMKN 1'}
              </p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
