import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { CarBorrowing } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import { Calendar, Car, ArrowLeft, Plus } from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
}

export const CarCalendar: React.FC<Props> = ({ onNavigate }) => {
  const [borrowings, setBorrowings] = useState<CarBorrowing[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getCarBorrowings();
        setBorrowings(res.carBorrowings || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const filtered = borrowings.filter((b) => b.hariTanggal.startsWith(selectedMonth));

  // Group by date
  const groupedByDate: { [date: string]: CarBorrowing[] } = {};
  for (const b of filtered) {
    if (!groupedByDate[b.hariTanggal]) {
      groupedByDate[b.hariTanggal] = [];
    }
    groupedByDate[b.hariTanggal].push(b);
  }

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('car-borrowings')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Kalender Peminjaman Mobil
            </h2>
            <p className="text-xs text-slate-500">
              Jadwal operasional seluruh armada kendaraan dinas SMKN 1 Tegalsari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 outline-none"
          />
          <button
            onClick={() => onNavigate('car-borrowing-new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Pengajuan Baru
          </button>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Tidak ada peminjaman mobil pada bulan ini</h4>
          <p className="text-xs text-slate-500 mt-1">
            Silakan pilih bulan lain atau ajukan peminjaman mobil baru.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {new Date(date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 ml-auto">
                  {groupedByDate[date].length} Kegiatan Terjadwal
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupedByDate[date].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {item.nomorPengajuan}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{item.kegiatan}</h4>
                      </div>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <p>
                        <strong>Kendaraan:</strong> {item.vehicleNama} ({item.vehicleNoPol})
                      </p>
                      <p>
                        <strong>Waktu:</strong> {item.jamBerangkat} s.d {item.perkiraanKembali} WIB
                      </p>
                      <p>
                        <strong>Pemohon:</strong> {item.pemohonNama} ({item.unitNama})
                      </p>
                      <p>
                        <strong>Pengemudi:</strong> {item.driverNama} ({item.driverNoHp})
                      </p>
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
