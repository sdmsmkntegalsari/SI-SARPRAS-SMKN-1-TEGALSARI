import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { CarBorrowing, HallBooking, Vehicle, Room, Facility, Unit } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { CarBorrowingPrintDoc } from '../../components/print/CarBorrowingPrintDoc.tsx';
import { HallBookingPrintDoc } from '../../components/print/HallBookingPrintDoc.tsx';
import {
  generateCarBorrowingPDF,
  generateHallBookingPDF,
  generateReportsPDF,
  generateVehiclesListPDF,
  generateRoomsListPDF,
  generateFacilitiesListPDF
} from '../../utils/pdfGenerator.ts';
import { getLogoJawaTimur, getLogoSekolah } from '../../utils/logos.ts';
import {
  Printer, Download, FileText, Car, Building2,
  FileBarChart, Search, Filter, Eye, CheckCircle2,
  Calendar, Layers, Truck, DoorOpen, Wrench, Info, AlertCircle
} from 'lucide-react';

interface Props {
  onNavigate?: (page: string) => void;
}

export const PrintCenterPage: React.FC<Props> = ({ onNavigate }) => {
  const { user, role, settings } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'mobil' | 'aula' | 'laporan'>('mobil');
  const [isLoading, setIsLoading] = useState(false);

  // Car Borrowings
  const [carList, setCarList] = useState<CarBorrowing[]>([]);
  const [carFilterStatus, setCarFilterStatus] = useState<string>('DISETUJUI');
  const [carSearch, setCarSearch] = useState('');
  const [selectedCar, setSelectedCar] = useState<CarBorrowing | null>(null);

  // Hall Bookings
  const [hallList, setHallList] = useState<HallBooking[]>([]);
  const [hallFilterStatus, setHallFilterStatus] = useState<string>('DISETUJUI');
  const [hallSearch, setHallSearch] = useState('');
  const [selectedHall, setSelectedHall] = useState<HallBooking | null>(null);

  // Report Date Range State
  const [tanggalAwal, setTanggalAwal] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().split('T')[0];
  });
  const [tanggalAkhir, setTanggalAkhir] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [reportStatus, setReportStatus] = useState<string>('SEMUA');

  // Load car borrowings
  const loadCarData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCarBorrowings({
        userId: role === 'pemohon' ? user?.id : undefined,
        role: role || undefined,
        status: carFilterStatus !== 'SEMUA' ? carFilterStatus : undefined,
      });
      setCarList(res.carBorrowings || []);
    } catch (err: any) {
      toastError(err?.message || 'Gagal mengambil data peminjaman mobil');
    } finally {
      setIsLoading(false);
    }
  };

  // Load hall bookings
  const loadHallData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHallBookings({
        userId: role === 'pemohon' ? user?.id : undefined,
        role: role || undefined,
        status: hallFilterStatus !== 'SEMUA' ? hallFilterStatus : undefined,
      });
      setHallList(res.hallBookings || []);
    } catch (err: any) {
      toastError(err?.message || 'Gagal mengambil data penggunaan aula');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mobil') {
      loadCarData();
    } else if (activeTab === 'aula') {
      loadHallData();
    }
  }, [activeTab, carFilterStatus, hallFilterStatus]);

  // Handle direct print/download car doc
  const handlePrintCarDoc = (item: CarBorrowing) => {
    try {
      generateCarBorrowingPDF(item, settings);
      success(`Dokumen PDF peminjaman mobil ${item.nomorPengajuan} berhasil dibuat & diunduh.`);
    } catch (err: any) {
      toastError('Gagal membuat dokumen PDF: ' + (err?.message || ''));
    }
  };

  // Handle direct print/download hall doc
  const handlePrintHallDoc = (item: HallBooking) => {
    try {
      generateHallBookingPDF(item, settings);
      success(`Dokumen PDF penggunaan aula ${item.nomorPengajuan} berhasil dibuat & diunduh.`);
    } catch (err: any) {
      toastError('Gagal membuat dokumen PDF: ' + (err?.message || ''));
    }
  };

  // Handle reports PDF export
  const handlePrintReport = async (jenis: 'MOBIL' | 'AULA' | 'SEMUA') => {
    try {
      setIsLoading(true);
      const res = await api.getReports({
        jenis: jenis !== 'SEMUA' ? jenis : undefined,
        status: reportStatus !== 'SEMUA' ? reportStatus : undefined,
        tanggalAwal,
        tanggalAkhir,
      });

      generateReportsPDF(
        res.data || [],
        res.summary || {},
        { jenis, tanggalAwal, tanggalAkhir, status: reportStatus },
        settings
      );
      success(`Laporan Rekapitulasi ${jenis} format PDF resmi (A4) berhasil dibuat & diunduh.`);
    } catch (err: any) {
      toastError('Gagal membuat laporan PDF: ' + (err?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintVehiclesList = async () => {
    try {
      setIsLoading(true);
      const res = await api.getVehicles();
      generateVehiclesListPDF(res.vehicles || [], settings);
      success('Laporan PDF data kendaraan dinas berhasil dibuat & diunduh.');
    } catch (err: any) {
      toastError('Gagal membuat laporan kendaraan: ' + (err?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintRoomsList = async () => {
    try {
      setIsLoading(true);
      const res = await api.getRooms();
      generateRoomsListPDF(res.rooms || [], settings);
      success('Laporan PDF data prasarana ruangan berhasil dibuat & diunduh.');
    } catch (err: any) {
      toastError('Gagal membuat laporan ruangan: ' + (err?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintFacilitiesList = async () => {
    try {
      setIsLoading(true);
      const res = await api.getFacilities();
      generateFacilitiesListPDF(res.facilities || [], settings);
      success('Laporan PDF inventaris fasilitas berhasil dibuat & diunduh.');
    } catch (err: any) {
      toastError('Gagal membuat laporan fasilitas: ' + (err?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered lists
  const filteredCarList = carList.filter((b) => {
    if (!carSearch) return true;
    const s = carSearch.toLowerCase();
    return (
      b.nomorPengajuan.toLowerCase().includes(s) ||
      b.kegiatan.toLowerCase().includes(s) ||
      b.pemohonNama.toLowerCase().includes(s) ||
      b.vehicleNama.toLowerCase().includes(s)
    );
  });

  const filteredHallList = hallList.filter((h) => {
    if (!hallSearch) return true;
    const s = hallSearch.toLowerCase();
    return (
      h.nomorPengajuan.toLowerCase().includes(s) ||
      h.namaKegiatan.toLowerCase().includes(s) ||
      h.pemohonNama.toLowerCase().includes(s) ||
      h.roomNama.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src={getLogoJawaTimur()}
              alt="Logo Jawa Timur"
              className="w-10 h-12 object-contain"
              title="Logo Pemprov Jawa Timur"
            />
            <img
              src={getLogoSekolah(settings)}
              alt="Logo Sekolah"
              className="w-10 h-12 object-contain"
              title="Logo SMKN 1 Tegalsari"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Pusat Cetak Dokumen & PDF Resmi
            </h2>
            <p className="text-xs text-slate-500">
              Kop Surat resmi dilengkapi Logo Jawa Timur (kiri) & Logo Sekolah (kanan) untuk seluruh laporan Sarpras
            </p>
          </div>
        </div>

        {/* Quick Instructions Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Format PDF A4 Resmi Kedinasan (Siap Cetak)</span>
        </div>
      </div>

      {/* Official Notice */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <p className="font-bold">Panduan Pencetakan Dokumen Resmi:</p>
          <p className="mt-0.5">
            Setiap tombol <strong>Cetak / Unduh PDF</strong> secara otomatis membuat berkas dokumen berstandar kedinasan
            SMKN 1 Tegalsari (lengkap dengan Kop Surat, nomor pengajuan unik, dan lembar tanda tangan pengesahan).
            Buka file PDF yang terunduh dan tekan tombol <strong>Cetak (Ctrl + P)</strong> pada pembaca PDF untuk mencetak langsung ke kertas A4.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('mobil')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'mobil'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          Dokumen Peminjaman Mobil
        </button>

        <button
          onClick={() => setActiveTab('aula')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'aula'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Dokumen Penggunaan Aula
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'laporan'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileBarChart className="w-4 h-4" />
          Cetak Seluruh Laporan & Rekapitulasi
        </button>
      </div>

      {/* TAB 1: PEMINJAMAN MOBIL */}
      {activeTab === 'mobil' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={carSearch}
                onChange={(e) => setCarSearch(e.target.value)}
                placeholder="Cari nomor pengajuan mobil, kegiatan, atau pemohon..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              {['DISETUJUI', 'SEMUA', 'MENUNGGU PERSETUJUAN', 'SELESAI'].map((st) => (
                <button
                  key={st}
                  onClick={() => setCarFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    carFilterStatus === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'DISETUJUI' ? 'Disetujui (Siap Cetak)' : st}
                </button>
              ))}
            </div>
          </div>

          {/* List Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredCarList.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="Tidak ada dokumen peminjaman mobil."
                  description="Belum ada data pengajuan mobil dengan kriteria status yang dipilih."
                  actionText={role === 'pemohon' ? 'Buat Pengajuan Baru' : undefined}
                  onAction={() => onNavigate && onNavigate('car-borrowing-new')}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">No. Pengajuan</th>
                      <th className="py-3 px-4">Pemohon & Unit</th>
                      <th className="py-3 px-4">Kegiatan & Rute</th>
                      <th className="py-3 px-4">Kendaraan</th>
                      <th className="py-3 px-4">Hari / Tanggal</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi Cetak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCarList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {item.nomorPengajuan}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{item.pemohonNama}</p>
                          <p className="text-[11px] text-slate-500">{item.unitNama}</p>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-slate-800 truncate">{item.kegiatan}</p>
                          <p className="text-[11px] text-slate-500 truncate">{item.tujuanRute}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{item.vehicleNama}</p>
                          <p className="text-[11px] font-mono text-slate-500">{item.vehicleNoPol}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-700">{item.hariTanggal}</p>
                          <p className="text-[11px] text-slate-500">{item.jamBerangkat} - {item.perkiraanKembali} WIB</p>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview modal */}
                            <button
                              onClick={() => setSelectedCar(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                              title="Lihat Pratinjau Dokumen"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              Pratinjau
                            </button>

                            {/* Direct Download/Print PDF */}
                            <button
                              onClick={() => handlePrintCarDoc(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title="Download & Cetak PDF Resmi A4"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Cetak PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PENGGUNAAN AULA */}
      {activeTab === 'aula' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={hallSearch}
                onChange={(e) => setHallSearch(e.target.value)}
                placeholder="Cari nomor booking aula, kegiatan, atau pemohon..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              {['DISETUJUI', 'SEMUA', 'MENUNGGU PERSETUJUAN', 'SELESAI'].map((st) => (
                <button
                  key={st}
                  onClick={() => setHallFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    hallFilterStatus === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'DISETUJUI' ? 'Disetujui (Siap Cetak)' : st}
                </button>
              ))}
            </div>
          </div>

          {/* List Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredHallList.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="Tidak ada dokumen penggunaan aula."
                  description="Belum ada data pengajuan aula dengan kriteria status yang dipilih."
                  actionText={role === 'pemohon' ? 'Buat Pengajuan Baru' : undefined}
                  onAction={() => onNavigate && onNavigate('hall-booking-new')}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">No. Pengajuan</th>
                      <th className="py-3 px-4">Pemohon & Unit</th>
                      <th className="py-3 px-4">Kegiatan</th>
                      <th className="py-3 px-4">Ruangan</th>
                      <th className="py-3 px-4">Hari / Tanggal</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi Cetak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHallList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {item.nomorPengajuan}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{item.pemohonNama}</p>
                          <p className="text-[11px] text-slate-500">{item.unitNama}</p>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-slate-800 truncate">{item.namaKegiatan}</p>
                          <p className="text-[11px] text-slate-500">{item.jumlahPeserta} Peserta</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{item.roomNama}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-700">{item.hariTanggal}</p>
                          <p className="text-[11px] text-slate-500">{item.jamMulai} - {item.jamSelesai} WIB</p>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              onClick={() => setSelectedHall(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                              title="Lihat Pratinjau Dokumen"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              Pratinjau
                            </button>

                            {/* Direct Download/Print PDF */}
                            <button
                              onClick={() => handlePrintHallDoc(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title="Download & Cetak PDF Resmi A4"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Cetak PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CETAK SELURUH LAPORAN & REKAPITULASI */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Filter Range Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Filter className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                PENGATURAN PERIODE LAPORAN REKAPITULASI
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tanggal Awal
                </label>
                <input
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) => setTanggalAwal(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Status Pengajuan
                </label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="SEMUA">Semua Status (Lengkap)</option>
                  <option value="DISETUJUI">Hanya Disetujui</option>
                  <option value="SELESAI">Hanya Selesai</option>
                  <option value="MENUNGGU PERSETUJUAN">Hanya Menunggu</option>
                  <option value="DITOLAK">Hanya Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6 Report Download Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Laporan Peminjaman Mobil */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Laporan Rekapitulasi Mobil
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Rekapitulasi seluruh peminjaman mobil dinas, pengemudi, rute, dan status persetujuan dalam periode terpilih.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">A4 Landscape</span>
                <button
                  onClick={() => handlePrintReport('MOBIL')}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* 2. Laporan Penggunaan Aula */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Laporan Rekapitulasi Aula
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Rekapitulasi jadwal penggunaan aula sekolah, unit pemohon, jumlah peserta, dan sarana yang digunakan.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">A4 Landscape</span>
                <button
                  onClick={() => handlePrintReport('AULA')}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* 3. Laporan Rekapitulasi Lengkap Sarpras */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileBarChart className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Laporan Terpadu Sarpras
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Rekapitulasi gabungan peminjaman mobil & penggunaan aula sekolah untuk laporan berkala pimpinan.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">A4 Landscape</span>
                <button
                  onClick={() => handlePrintReport('SEMUA')}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* 4. Laporan Data Kendaraan */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Laporan Inventaris Kendaraan
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Daftar seluruh kendaraan dinas sekolah, nomor polisi, kapasitas, dan status operasional terbaru.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">A4 Portrait</span>
                <button
                  onClick={handlePrintVehiclesList}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* 5. Laporan Data Ruangan */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Laporan Prasarana Ruangan
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Daftar seluruh ruangan, aula pertemuan, laboratorium, gedung, dan daya tampung kapasitas.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">A4 Portrait</span>
                <button
                  onClick={handlePrintRoomsList}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* 6. Laporan Data Fasilitas */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Laporan Inventaris Fasilitas
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Daftar sarana pendukung (kursi, meja, sound system, LCD proyektor) serta kondisi kelayakan unit.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">A4 Portrait</span>
                <button
                  onClick={handlePrintFacilitiesList}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Cetak PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Car Print Preview Overlay */}
      {selectedCar && (
        <CarBorrowingPrintDoc
          borrowing={selectedCar}
          settings={settings}
          onClose={() => setSelectedCar(null)}
        />
      )}

      {/* Hall Print Preview Overlay */}
      {selectedHall && (
        <HallBookingPrintDoc
          booking={selectedHall}
          settings={settings}
          onClose={() => setSelectedHall(null)}
        />
      )}
    </div>
  );
};
