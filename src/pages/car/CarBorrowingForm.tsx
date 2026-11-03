import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { Unit, Vehicle } from '../../types/index.ts';
import {
  Car, ArrowLeft, Upload, Check, AlertTriangle,
  Info, Camera, Fuel, Gauge, Clock, Calendar, CheckCircle2
} from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
}

export const CarBorrowingForm: React.FC<Props> = ({ onNavigate }) => {
  const { user, settings } = useAuth();
  const { success, error: toastError } = useToast();

  const [units, setUnits] = useState<Unit[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [pemohonNama, setPemohonNama] = useState(user?.nama || '');
  const [unitId, setUnitId] = useState(user?.unitId || '');
  const [unitNama, setUnitNama] = useState(user?.unitNama || '');

  const [kegiatan, setKegiatan] = useState('');
  const [tujuanRute, setTujuanRute] = useState('');
  const [kmAwal, setKmAwal] = useState<number>(0);
  const [perkiraanJarak, setPerkiraanJarak] = useState('');

  const [hariTanggal, setHariTanggal] = useState('');
  const [jamBerangkat, setJamBerangkat] = useState('08:00');
  const [perkiraanKembali, setPerkiraanKembali] = useState('16:00');

  const [vehicleId, setVehicleId] = useState('');
  const [driverNama, setDriverNama] = useState('');
  const [driverNoHp, setDriverNoHp] = useState('');
  const [bbmPersen, setBbmPersen] = useState<number>(80);

  // Clash warning state
  const [clashError, setClashError] = useState<string>('');
  const [isCheckingClash, setIsCheckingClash] = useState(false);

  // Load Units and Available Vehicles
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [unitRes, vehRes] = await Promise.all([
          api.getUnits(),
          api.getVehicles(),
        ]);
        setUnits(unitRes.units || []);
        // Only TERSEDIA vehicles
        const availVeh = (vehRes.vehicles || []).filter((v) => v.status === 'TERSEDIA');
        setVehicles(availVeh);

        // Pre-select first vehicle if available
        if (availVeh.length > 0 && !vehicleId) {
          setVehicleId(availVeh[0].id);
        }
      } catch (err) {
        console.error('Failed to load form meta:', err);
      } finally {
        setIsLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  // Sync unitNama when unitId changes
  const handleUnitChange = (uId: string) => {
    setUnitId(uId);
    const found = units.find((u) => u.id === uId);
    setUnitNama(found ? found.nama : '');
  };

  // Live clash check whenever vehicleId, hariTanggal, jamBerangkat, perkiraanKembali changes
  useEffect(() => {
    const checkClash = async () => {
      if (!vehicleId || !hariTanggal || !jamBerangkat || !perkiraanKembali) {
        setClashError('');
        return;
      }

      setIsCheckingClash(true);
      try {
        const res = await api.checkCarClash({
          vehicleId,
          hariTanggal,
          jamBerangkat,
          perkiraanKembali,
        });

        if (res.clash) {
          setClashError(
            res.message ||
              'Mohon maaf, kendaraan tersebut sudah digunakan pada tanggal/waktu yang dipilih. Silakan memilih kendaraan atau waktu lain.'
          );
        } else {
          setClashError('');
        }
      } catch {
        setClashError('');
      } finally {
        setIsCheckingClash(false);
      }
    };

    const timer = setTimeout(checkClash, 350);
    return () => clearTimeout(timer);
  }, [vehicleId, hariTanggal, jamBerangkat, perkiraanKembali]);

  const handleSubmit = async (isDraft: boolean = false) => {
    // Validation
    if (!pemohonNama.trim()) {
      toastError('Nama Pemohon wajib diisi');
      return;
    }
    if (!unitId) {
      toastError('Unit / Program Keahlian wajib dipilih');
      return;
    }
    if (!kegiatan.trim()) {
      toastError('Nama kegiatan wajib diisi');
      return;
    }
    if (!hariTanggal) {
      toastError('Hari / Tanggal wajib dipilih');
      return;
    }
    if (!jamBerangkat || !perkiraanKembali) {
      toastError('Jam keberangkatan dan kepulangan wajib diisi');
      return;
    }
    if (!vehicleId) {
      toastError('Kendaraan dinas wajib dipilih');
      return;
    }
    if (!driverNama.trim()) {
      toastError('Nama Pengemudi wajib diisi');
      return;
    }
    if (!driverNoHp.trim()) {
      toastError('Nomor HP Pengemudi wajib diisi');
      return;
    }

    if (clashError) {
      toastError(clashError);
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

    setIsSubmitting(true);
    try {
      const res = await api.createCarBorrowing({
        pemohonId: user?.id,
        pemohonNama,
        unitId,
        unitNama: unitNama || (units.find((u) => u.id === unitId)?.nama ?? ''),
        kegiatan,
        tujuanRute,
        kmAwal,
        perkiraanJarak,
        hariTanggal,
        jamBerangkat,
        perkiraanKembali,
        vehicleId,
        vehicleNama: selectedVehicle?.nama || 'Kendaraan SMKN 1 Tegalsari',
        vehicleNoPol: selectedVehicle?.nomorPolisi || '',
        driverNama,
        driverNoHp,
        bbmPersen,
        disetujuiOleh: settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.',
        jabatanPenyetujui: 'Waka Sarana & Prasarana',
        isDraft,
      });

      success(res.message);
      onNavigate('car-borrowings');
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan pengajuan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('car-borrowings')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pengajuan
        </button>
        <span className="text-xs font-mono font-bold text-slate-400">
          FORM RESMI SMKN 1 TEGALSARI
        </span>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Title */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                Formulir Peminjaman Mobil Sekolah
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Silakan lengkapi formulir permohonan kendaraan dinas operasional sekolah di bawah ini.
              </p>
            </div>
          </div>
        </div>

        {/* Clash Alert Banner */}
        {clashError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 animate-shake">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold">Jadwal Penggunaan Bentrok!</p>
              <p className="mt-0.5">{clashError}</p>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-8">
          {/* BAGIAN 1: DATA PEMOHON */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                DATA PEMOHON
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Pemohon <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pemohonNama}
                  onChange={(e) => setPemohonNama(e.target.value)}
                  placeholder="Nama Lengkap & Gelar Pemohon"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Unit / Program Keahlian <span className="text-rose-500">*</span>
                </label>
                <select
                  value={unitId}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  required
                >
                  <option value="">-- Pilih Unit Kerja / Jurusan --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* BAGIAN 2: KEPERLUAN / TUJUAN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                KEPERLUAN & TUJUAN PERJALANAN
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={kegiatan}
                  onChange={(e) => setKegiatan(e.target.value)}
                  placeholder="Contoh: Kunjungan Industri Guru & Siswa / Pengantaran Peserta LKS"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tujuan / Rute Perjalanan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tujuanRute}
                    onChange={(e) => setTujuanRute(e.target.value)}
                    placeholder="Contoh: SMKN 1 Tegalsari - Banyuwangi Kota (PP)"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      KM Awal
                    </label>
                    <input
                      type="number"
                      value={kmAwal || ''}
                      onChange={(e) => setKmAwal(Number(e.target.value))}
                      placeholder="Contoh: 45000"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Perkiraan Jarak
                    </label>
                    <input
                      type="text"
                      value={perkiraanJarak}
                      onChange={(e) => setPerkiraanJarak(e.target.value)}
                      placeholder="Contoh: 120 KM"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 3: HARI, TANGGAL & WAKTU */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                HARI, TANGGAL & WAKTU
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hari / Tanggal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={hariTanggal}
                  onChange={(e) => setHariTanggal(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jam Berangkat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={jamBerangkat}
                  onChange={(e) => setJamBerangkat(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Perkiraan Kembali <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={perkiraanKembali}
                  onChange={(e) => setPerkiraanKembali(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 4: PILIH KENDARAAN (TERSEDIA) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  PILIH KENDARAAN
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                (Hanya menampilkan unit dengan status TERSEDIA)
              </span>
            </div>

            {vehicles.length === 0 ? (
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                Belum ada kendaraan yang tersedia saat ini.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((v) => {
                  const isSelected = vehicleId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setVehicleId(v.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition relative flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800">{v.nama}</h4>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <p className="text-[11px] font-mono text-indigo-700 font-bold mt-0.5">
                          {v.nomorPolisi}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Kapasitas: {v.kapasitas} Orang • {v.jenis}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BAGIAN 5: PENGEMUDI & KONDISI AWAL */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                5
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                PENGEMUDI & KONDISI AWAL
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Pengemudi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={driverNama}
                  onChange={(e) => setDriverNama(e.target.value)}
                  placeholder="Nama Pengemudi / Driver"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  No. HP Pengemudi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={driverNoHp}
                  onChange={(e) => setDriverNoHp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  BBM Awal: {bbmPersen}%
                </label>
                <div className="flex items-center gap-2 pt-1.5">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={bbmPersen}
                    onChange={(e) => setBbmPersen(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-xs font-bold text-indigo-700 font-mono w-10">
                    {bbmPersen}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 6: PERSETUJUAN & CATATAN RESMI */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Disetujui oleh Pejabat
                </span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.'}
                </p>
                <p className="text-slate-500">Waka Sarana & Prasarana</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Pemberitahuan Sistem
                </span>
                <p className="text-slate-600 italic text-xs mt-0.5 leading-relaxed">
                  “Ketersediaan kendaraan dan pemeriksaan kondisi kendaraan menjadi tanggung jawab petugas sarpras.”
                </p>
              </div>
            </div>
          </div>

          {/* Tombol Simpan / Ajukan */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('car-borrowings')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !!clashError}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition disabled:opacity-50"
            >
              Simpan Sebagai Draf
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!clashError}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                'Memproses Pengajuan...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Kirim Pengajuan Peminjaman
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
