import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { DashboardMetrics, MonthlyChartData, RecentApplication, CalendarEvent } from '../types/index.ts';
import { StatusBadge } from '../components/common/Badge.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import {
  FileText, Clock, CheckCircle2, XCircle, Car,
  Building2, Calendar as CalendarIcon, ArrowUpRight,
  TrendingUp, Plus, ShieldCheck, ChevronRight, Printer
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenCarDetail?: (id: string) => void;
  onOpenHallDetail?: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
}) => {
  const { user, role, settings } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyChartData[]>([]);
  const [recentList, setRecentList] = useState<RecentApplication[]>([]);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.getDashboard({
        userId: user?.id,
        role: role || undefined,
      });
      setMetrics(res.metrics);
      setMonthlyData(res.monthlyData || []);
      setRecentList(res.recentList || []);

      // Get today's calendar events
      const today = new Date().toISOString().split('T')[0];
      const calRes = await api.getCalendarEvents();
      const todays = (calRes.events || []).filter(e => e.tanggal === today);
      setTodayEvents(todays);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, role]);

  const maxMonthlyCount = Math.max(
    ...monthlyData.map((d) => Math.max(d.mobil, d.aula, d.total, 1)),
    5
  );

  const totalMobilOverall = monthlyData.reduce((acc, m) => acc + m.mobil, 0);
  const totalAulaOverall = monthlyData.reduce((acc, m) => acc + m.aula, 0);
  const grandTotal = totalMobilOverall + totalAulaOverall || 1;
  const mobilPercent = Math.round((totalMobilOverall / grandTotal) * 100);
  const aulaPercent = 100 - mobilPercent;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 font-bold">
                SISARPRAS SMKN 1 TEGALSARI
              </span>
              <span className="text-xs text-indigo-200">
                • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Selamat Datang, {user?.nama || 'Petugas'}
            </h2>
            <p className="text-sm text-indigo-200/90 mt-1 max-w-xl">
              Sistem Informasi Sarana dan Prasarana terpadu untuk peminjaman mobil dinas,
              penggunaan aula sekolah, serta pemeliharaan fasilitas SMKN 1 Tegalsari.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('car-borrowing-new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Car className="w-4 h-4" />
              Pinjam Mobil
            </button>
            <button
              onClick={() => onNavigate('hall-booking-new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur transition cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              Booking Aula
            </button>
            <button
              onClick={() => onNavigate('print-center')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Pengajuan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pengajuan
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {isLoading ? '...' : metrics?.totalPengajuan ?? 0}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Mobil & Aula</p>
          </div>
        </div>

        {/* Menunggu Persetujuan */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:shadow-md transition bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Menunggu
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-900 tracking-tight">
              {isLoading ? '...' : metrics?.menungguPersetujuan ?? 0}
            </h3>
            <p className="text-[10px] text-amber-700 mt-0.5">Perlu diproses</p>
          </div>
        </div>

        {/* Disetujui */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs hover:shadow-md transition bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Disetujui
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-900 tracking-tight">
              {isLoading ? '...' : metrics?.disetujui ?? 0}
            </h3>
            <p className="text-[10px] text-emerald-700 mt-0.5">Siap digunakan</p>
          </div>
        </div>

        {/* Ditolak */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs hover:shadow-md transition bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Ditolak
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-900 tracking-tight">
              {isLoading ? '...' : metrics?.ditolak ?? 0}
            </h3>
            <p className="text-[10px] text-rose-700 mt-0.5">Jadwal bentrok/lain</p>
          </div>
        </div>

        {/* Mobil Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs hover:shadow-md transition bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Mobil Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-blue-900 tracking-tight">
              {isLoading ? '...' : metrics?.peminjamanMobilHariIni ?? 0}
            </h3>
            <p className="text-[10px] text-blue-700 mt-0.5">Sedang beroperasi</p>
          </div>
        </div>

        {/* Aula Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs hover:shadow-md transition bg-purple-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Aula Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-purple-900 tracking-tight">
              {isLoading ? '...' : metrics?.penggunaanAulaHariIni ?? 0}
            </h3>
            <p className="text-[10px] text-purple-700 mt-0.5">Agenda kegiatan</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Today's Agendas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart Card */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Grafik Pengajuan Sarpras Per Bulan
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statistik peminjaman mobil & aula SMKN 1 Tegalsari tahun {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span className="text-slate-600">Mobil ({totalMobilOverall})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-slate-600">Aula ({totalAulaOverall})</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end gap-2 sm:gap-3 pt-6 border-b border-slate-100 pb-2">
            {monthlyData.map((item, idx) => {
              const carHeight = (item.mobil / maxMonthlyCount) * 100;
              const hallHeight = (item.aula / maxMonthlyCount) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Car bar */}
                    <div
                      style={{ height: `${Math.max(carHeight, 4)}%` }}
                      className="w-1/2 max-w-[14px] bg-indigo-600 rounded-t-sm group-hover:bg-indigo-700 transition relative"
                      title={`${item.bulan}: Mobil (${item.mobil})`}
                    />
                    {/* Hall bar */}
                    <div
                      style={{ height: `${Math.max(hallHeight, 4)}%` }}
                      className="w-1/2 max-w-[14px] bg-purple-500 rounded-t-sm group-hover:bg-purple-600 transition relative"
                      title={`${item.bulan}: Aula (${item.aula})`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 mt-2 truncate w-full text-center">
                    {item.bulan}
                  </span>
                </div>
              );
            })}
          </div>

          {/* By Type Ratio breakdown */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-2">
            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-600 font-semibold">Peminjaman Mobil</p>
                <p className="text-lg font-black text-indigo-900">{totalMobilOverall} Pengajuan</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-1 rounded-lg border border-indigo-200">
                {mobilPercent}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-600 font-semibold">Penggunaan Aula</p>
                <p className="text-lg font-black text-purple-900">{totalAulaOverall} Pengajuan</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-white px-2 py-1 rounded-lg border border-purple-200">
                {aulaPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Agenda Hari Ini & Quick Inventory Overview */}
        <div className="space-y-6">
          {/* Today's Agenda */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Kegiatan Hari Ini</h3>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
              >
                Kalender <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayEvents.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400">Tidak ada agenda sarpras terjadwal hari ini.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {todayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-slate-100 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase bg-white border border-slate-200 text-slate-700">
                          {evt.tipe}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1 truncate">
                          {evt.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{evt.subTitle}</p>
                      </div>
                      <StatusBadge status={evt.status} size="sm" />
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{evt.jam} WIB</span>
                      <span className="font-medium text-slate-700">{evt.pemohon}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Assets Badge */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              STATUS INVENTARIS TERDATA
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-800">
                <p className="text-base font-extrabold text-indigo-400">{metrics?.totalMobil ?? 4}</p>
                <p className="text-[10px] text-slate-300">Kendaraan</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800">
                <p className="text-base font-extrabold text-purple-400">{metrics?.totalRuangan ?? 3}</p>
                <p className="text-[10px] text-slate-300">Ruangan</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800">
                <p className="text-base font-extrabold text-teal-400">{metrics?.totalFasilitas ?? 6}</p>
                <p className="text-[10px] text-slate-300">Fasilitas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pengajuan Terbaru Table */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Pengajuan Terbaru</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar pengajuan peminjaman sarana dan prasarana terkini
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('car-borrowings')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Semua Mobil
            </button>
            <button
              onClick={() => onNavigate('hall-bookings')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Semua Aula
            </button>
          </div>
        </div>

        {recentList.length === 0 ? (
          <EmptyState
            title="Tentu belum ada pengajuan."
            description="Silakan buat pengajuan peminjaman mobil atau aula baru."
            onAction={() => onNavigate('car-borrowing-new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">No. Pengajuan</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3">Pemohon / Unit</th>
                  <th className="py-3 px-3">Kegiatan</th>
                  <th className="py-3 px-3">Sarana</th>
                  <th className="py-3 px-3">Waktu Pelaksanaan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                      {item.nomorPengajuan}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          item.tipe === 'MOBIL'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.tipe}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{item.pemohonNama}</p>
                      <p className="text-[11px] text-slate-500">{item.unitNama}</p>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate font-medium text-slate-700">
                      {item.kegiatan}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {item.itemInfo}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-700">{item.hariTanggal}</p>
                      <p className="text-[11px] text-slate-400">{item.waktu} WIB</p>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() =>
                          item.tipe === 'MOBIL'
                            ? onNavigate(`car-detail-${item.id}`)
                            : onNavigate(`hall-detail-${item.id}`)
                        }
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Lihat Detail"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
