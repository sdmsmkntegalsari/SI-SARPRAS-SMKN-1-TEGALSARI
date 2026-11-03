import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { CalendarEvent } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import {
  Calendar as CalendarIcon, Car, Building2, Filter,
  ChevronLeft, ChevronRight, Clock, User, ArrowUpRight
} from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
}

export const SarprasCalendar: React.FC<Props> = ({ onNavigate }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const loadEvents = async () => {
    try {
      const res = await api.getCalendarEvents(
        filterType !== 'SEMUA' ? filterType : undefined,
        filterStatus !== 'SEMUA' ? filterStatus : undefined
      );
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [filterType, filterStatus]);

  // Filter events in the chosen month
  const monthEvents = events.filter((e) => e.tanggal.startsWith(selectedMonth));

  // Group by date
  const grouped: { [date: string]: CalendarEvent[] } = {};
  for (const e of monthEvents) {
    if (!grouped[e.tanggal]) {
      grouped[e.tanggal] = [];
    }
    grouped[e.tanggal].push(e);
  }

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Kalender Kegiatan Sarpras</h2>
              <p className="text-xs text-slate-500">
                Pusat visualisasi jadwal peminjaman mobil & aula SMK Negeri 1 Tegalsari
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 outline-none"
            />
          </div>
        </div>

        {/* Filters: Jenis & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Jenis: Semua, Mobil, Aula */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Jenis:</span>
            {['SEMUA', 'MOBIL', 'AULA'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filterType === t
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'MOBIL' && <Car className="w-3.5 h-3.5" />}
                {t === 'AULA' && <Building2 className="w-3.5 h-3.5" />}
                <span>{t}</span>
              </button>
            ))}
          </div>

          {/* Status: Semua, Menunggu, Disetujui, Selesai */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
            {[
              { id: 'SEMUA', label: 'Semua' },
              { id: 'MENUNGGU PERSETUJUAN', label: 'Menunggu' },
              { id: 'DISETUJUI', label: 'Disetujui' },
              { id: 'SELESAI', label: 'Selesai' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === s.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar List / Event Schedule View */}
      {sortedDates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Tidak ada jadwal sarpras</h4>
          <p className="text-xs text-slate-500 mt-1">
            Belum ada kegiatan mobil atau aula yang cocok dengan filter yang dipilih pada bulan ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                  <h3 className="text-sm font-bold text-slate-800">
                    {new Date(date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  {grouped[date].length} Kegiatan
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {grouped[date].map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      if (event.tipe === 'MOBIL') onNavigate(`car-detail-${event.id}`);
                      else onNavigate(`hall-detail-${event.id}`);
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer hover:shadow-md ${
                      event.tipe === 'MOBIL'
                        ? 'bg-linear-to-br from-indigo-50/40 to-white border-indigo-100 hover:border-indigo-300'
                        : 'bg-linear-to-br from-purple-50/40 to-white border-purple-100 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                            event.tipe === 'MOBIL'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {event.tipe === 'MOBIL' ? <Car className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                          {event.tipe}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {event.nomorPengajuan}
                        </span>
                      </div>
                      <StatusBadge status={event.status} size="sm" />
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">
                      {event.title.replace(/\[(Mobil|Aula)\]\s*/, '')}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {event.subTitle}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {event.jam} WIB
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {event.pemohon} ({event.unit ? event.unit.split('(')[0].trim() : '-'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
