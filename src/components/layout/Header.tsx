import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { RoleBadge } from '../common/Badge.tsx';
import { api } from '../../services/api.ts';
import { NotificationItem, UserRole } from '../../types/index.ts';
import {
  Menu, Bell, LogOut, Check, ChevronDown,
  UserCheck, ShieldCheck, HardHat, User
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigate }) => {
  const { user, role, logout, switchUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications(user.id, role || undefined);
      setNotifications(res.notifications || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user, role]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead('all');
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    } catch {
      // ignore
    }
  };

  const handleSwitch = async (targetRole: UserRole) => {
    await switchUser(targetRole);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:ml-64 no-print transition-all">
      {/* Left: Hamburger & Current page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            SMK NEGERI 1 TEGALSARI
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Sistem Sarana & Prasarana
            </span>
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
            title="Ganti Mode Role Cepat"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Mode:</span>
            <RoleBadge role={role || 'pemohon'} size="sm" />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <p className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Uji Coba Hak Akses Role
              </p>
              <button
                onClick={() => handleSwitch('admin')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition ${
                  role === 'admin' ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-semibold">ADMIN</p>
                    <p className="text-[10px] text-slate-500 font-normal">Akses penuh & pengaturan</p>
                  </div>
                </div>
                {role === 'admin' && <Check className="w-3.5 h-3.5 text-purple-600" />}
              </button>

              <button
                onClick={() => handleSwitch('sarpras')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition ${
                  role === 'sarpras' ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold">PETUGAS SARPRAS</p>
                    <p className="text-[10px] text-slate-500 font-normal">Persetujuan & inventaris</p>
                  </div>
                </div>
                {role === 'sarpras' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              <button
                onClick={() => handleSwitch('pemohon')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition ${
                  role === 'pemohon' ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="font-semibold">PEMOHON</p>
                    <p className="text-[10px] text-slate-500 font-normal">Pengajuan & cetak</p>
                  </div>
                </div>
                {role === 'pemohon' && <Check className="w-3.5 h-3.5 text-teal-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Notifikasi</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Tidak ada notifikasi baru.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.link) onNavigate(n.link.replace('/', ''));
                        setShowNotifMenu(false);
                      }}
                      className={`p-2.5 rounded-xl text-left cursor-pointer transition border ${
                        n.dibaca
                          ? 'bg-white border-transparent hover:bg-slate-50'
                          : 'bg-indigo-50/60 border-indigo-100 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800">{n.judul}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.pesan}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition text-left"
            title="Lihat Profil"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
              {user?.nama?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.nama?.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user?.unitNama?.split('(')[0].trim() || 'Unit'}</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Keluar dari Sistem"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
