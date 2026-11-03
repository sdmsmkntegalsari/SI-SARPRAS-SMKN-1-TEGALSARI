import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { Unit, Room } from '../../types/index.ts';
import {
  Building2, ArrowLeft, Check, AlertTriangle,
  Info, CheckCircle2, Users, Clock, Calendar
} from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
}

export const HallBookingForm: React.FC<Props> = ({ onNavigate }) => {
  const { user, settings } = useAuth();
  const { success, error: toastError } = useToast();

  const [units, setUnits] = useState<Unit[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [pemohonNama, setPemohonNama] = useState(user?.nama || '');
  const [unitId, setUnitId] = useState(user?.unitId || '');
  const [unitNama, setUnitNama] = useState(user?.unitNama || '');

  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [keperluan, setKeperluan] = useState('');

  const [roomId, setRoomId] = useState('');
  const [roomNama, setRoomNama] = useState('');

  const [hariTanggal, setHariTanggal] = useState('');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('12:00');
  const [jumlahPeserta, setJumlahPeserta] = useState<number>(100);

  // Fasilitas Checkbox
  const [fasilitasMeja, setFasilitasMeja] = useState(false);
  const [fasilitasKursi, setFasilitasKursi] = useState(true);
  const [fasilitasLcd, setFasilitasLcd] = useState(true);
  const [fasilitasSound, setFasilitasSound] = useState(true);
  const [fasilitasMic, setFasilitasMic] = useState(true);
  const [fasilitasAcKipas, setFasilitasAcKipas] = useState(true);
  const [fasilitasLainnyaChecked, setFasilitasLainnyaChecked] = useState(false);
  const [fasilitasLainnyaText, setFasilitasLainnyaText] = useState('');

  const [keterangan, setKeterangan] = useState(
    'Pengguna wajib menjaga kebersihan, ketertiban, keamanan, dan mengembalikan fasilitas aula seperti semula.'
  );

  // Clash Error State
  const [clashError, setClashError] = useState('');

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [uRes, rRes] = await Promise.all([
          api.getUnits(),
          api.getRooms(),
        ]);
        setUnits(uRes.units || []);
        const availRooms = (rRes.rooms || []).filter(r => r.status === 'TERSEDIA');
        setRooms(availRooms);
        if (availRooms.length > 0) {
          setRoomId(availRooms[0].id);
          setRoomNama(availRooms[0].nama);
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    loadMeta();
  }, []);

  const handleUnitChange = (uId: string) => {
    setUnitId(uId);
    const found = units.find((u) => u.id === uId);
    setUnitNama(found ? found.nama : '');
  };

  const handleRoomChange = (rId: string) => {
    setRoomId(rId);
    const found = rooms.find((r) => r.id === rId);
    setRoomNama(found ? found.nama : '');
  };

  // Clash detection when room, date, or time changes
  useEffect(() => {
    const checkClash = async () => {
      if (!hariTanggal || !jamMulai || !jamSelesai) {
        setClashError('');
        return;
      }

      try {
        const res = await api.checkHallClash({
          roomId,
          hariTanggal,
          jamMulai,
          jamSelesai,
        });

        if (res.clash) {
          setClashError(
            res.message ||
              'Tanggal dan waktu aula telah digunakan. Silakan memilih waktu lain.'
          );
        } else {
          setClashError('');
        }
      } catch {
        setClashError('');
      }
    };

    const timer = setTimeout(checkClash, 350);
    return () => clearTimeout(timer);
  }, [roomId, hariTanggal, jamMulai, jamSelesai]);

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!pemohonNama.trim()) {
      toastError('Nama Pemohon wajib diisi');
      return;
    }
    if (!unitId) {
      toastError('Unit / Program Keahlian wajib dipilih');
      return;
    }
    if (!namaKegiatan.trim()) {
      toastError('Nama kegiatan wajib diisi');
      return;
    }
    if (!hariTanggal) {
      toastError('Hari / Tanggal wajib dipilih');
      return;
    }
    if (!jamMulai || !jamSelesai) {
      toastError('Waktu mulai dan selesai wajib diisi');
      return;
    }
    if (!jumlahPeserta || jumlahPeserta <= 0) {
      toastError('Jumlah peserta wajib diisi');
      return;
    }

    if (clashError) {
      toastError(clashError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createHallBooking({
        pemohonId: user?.id,
        pemohonNama,
        unitId,
        unitNama: unitNama || (units.find((u) => u.id === unitId)?.nama ?? ''),
        namaKegiatan,
        keperluan,
        roomId: roomId || 'room-1',
        roomNama: roomNama || 'Aula Utama "Graha Wiyata"',
        hariTanggal,
        jamMulai,
        jamSelesai,
        jumlahPeserta,
        fasilitas: {
          meja: fasilitasMeja,
          kursi: fasilitasKursi,
          lcd: fasilitasLcd,
          sound: fasilitasSound,
          mic: fasilitasMic,
          acKipas: fasilitasAcKipas,
          lainnya: fasilitasLainnyaChecked ? fasilitasLainnyaText : '',
        },
        disetujuiOleh: settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.',
        jabatanPenyetujui: 'Waka Sarana & Prasarana',
        keterangan,
        isDraft,
      });

      success(res.message);
      onNavigate('hall-bookings');
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan pengajuan aula');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('hall-bookings')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pengajuan Aula
        </button>
        <span className="text-xs font-mono font-bold text-slate-400">
          FORM RESMI SMKN 1 TEGALSARI
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Title */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                Formulir Penggunaan Ruang Aula
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Silakan lengkapi formulir permohonan penggunaan aula dan ruang serbaguna sekolah.
              </p>
            </div>
          </div>
        </div>

        {/* Clash Alert Banner */}
        {clashError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold">Waktu Penggunaan Bentrok!</p>
              <p className="mt-0.5">{clashError}</p>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-8">
          {/* BAGIAN 1: DATA PEMOHON */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
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

          {/* BAGIAN 2: KEGIATAN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                DETAIL KEGIATAN & RUANGAN
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaKegiatan}
                    onChange={(e) => setNamaKegiatan(e.target.value)}
                    placeholder="Contoh: Rapat Pleno Orang Tua Siswa / Seminar Karir"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pilih Ruangan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                    required
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama} (Kapasitas: {r.kapasitas} orang)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Keperluan
                </label>
                <textarea
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Rincian maksud dan tujuan pemakaian aula..."
                  rows={2}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 3: HARI, TANGGAL, WAKTU & PESERTA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                WAKTU & JUMLAH PESERTA
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                  Waktu Mulai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Waktu Selesai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jumlah Peserta <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={jumlahPeserta || ''}
                    onChange={(e) => setJumlahPeserta(Number(e.target.value))}
                    placeholder="Contoh: 150"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                    Orang
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 4: FASILITAS CHECKBOX */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                FASILITAS AULA YANG DIBUTUHKAN
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Meja Rapat / Meja Pemateri', checked: fasilitasMeja, setter: setFasilitasMeja },
                { label: 'Kursi Peserta', checked: fasilitasKursi, setter: setFasilitasKursi },
                { label: 'LCD Proyektor & Layar', checked: fasilitasLcd, setter: setFasilitasLcd },
                { label: 'Sound System Lengkap', checked: fasilitasSound, setter: setFasilitasSound },
                { label: 'Microphone (Wireless)', checked: fasilitasMic, setter: setFasilitasMic },
                { label: 'AC / Kipas Angin Pendingin', checked: fasilitasAcKipas, setter: setFasilitasAcKipas },
              ].map((f, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition select-none ${
                    f.checked
                      ? 'border-indigo-500 bg-indigo-50/50 text-slate-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={f.checked}
                    onChange={(e) => f.setter(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
                  />
                  <span className="text-xs font-semibold">{f.label}</span>
                </label>
              ))}
            </div>

            {/* Checkbox Lainnya */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fasilitasLainnyaChecked}
                  onChange={(e) => setFasilitasLainnyaChecked(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
                />
                <span className="text-xs font-bold text-slate-700">Kebutuhan Fasilitas Lainnya</span>
              </label>

              {fasilitasLainnyaChecked && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={fasilitasLainnyaText}
                    onChange={(e) => setFasilitasLainnyaText(e.target.value)}
                    placeholder="Tuliskan kebutuhan fasilitas lain (misal: Terminal listrik 5 titik, podium kehormatan, dll)"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* BAGIAN 5: KETERANGAN & CATATAN PERSETUJUAN */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Keterangan Penggunaan / Catatan Khusus
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={2}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 text-amber-900 text-xs italic leading-relaxed">
              <strong>Catatan Kewajiban Pengguna:</strong> “Pengguna wajib menjaga kebersihan, ketertiban, keamanan, dan mengembalikan fasilitas aula seperti semula.”
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('hall-bookings')}
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
                  Kirim Pengajuan Booking Aula
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
