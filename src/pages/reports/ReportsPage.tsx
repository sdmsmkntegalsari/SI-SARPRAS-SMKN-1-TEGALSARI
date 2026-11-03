import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { Unit } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import {
  generateReportsPDF,
  generateVehiclesListPDF,
  generateRoomsListPDF,
  generateFacilitiesListPDF
} from '../../utils/pdfGenerator.ts';
import { getLogoJawaTimur, getLogoSekolah } from '../../utils/logos.ts';
import {
  FileBarChart, Printer, Download, FileSpreadsheet,
  Filter, Search, Calendar, Car, Building2, CheckCircle2,
  Truck, DoorOpen, Wrench, Check
} from 'lucide-react';

interface Props {
  initialType?: 'MOBIL' | 'AULA' | 'SEMUA';
}

export const ReportsPage: React.FC<Props> = ({ initialType = 'SEMUA' }) => {
  const { settings } = useAuth();
  const { success, error: toastError } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, disetujui: 0, menunggu: 0, ditolak: 0, selesai: 0 });
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [jenis, setJenis] = useState<string>(initialType);
  const [status, setStatus] = useState<string>('SEMUA');
  const [unitId, setUnitId] = useState<string>('SEMUA');
  const [tanggalAwal, setTanggalAwal] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().split('T')[0];
  });
  const [tanggalAkhir, setTanggalAkhir] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    api.getUnits().then((res) => setUnits(res.units || [])).catch(console.error);
  }, []);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReports({
        jenis: jenis !== 'SEMUA' ? jenis : undefined,
        status: status !== 'SEMUA' ? status : undefined,
        unitId: unitId !== 'SEMUA' ? unitId : undefined,
        tanggalAwal,
        tanggalAkhir,
      });
      setData(res.data || []);
      setSummary(res.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [jenis, status, unitId, tanggalAwal, tanggalAkhir]);

  // Export to Excel / CSV with proper UTF-8 BOM
  const exportToExcel = () => {
    const headers = [
      'No',
      'Nomor Pengajuan',
      'Jenis Pengajuan',
      'Nama Pemohon',
      'Unit Kerja',
      'Kegiatan',
      'Sarana/Ruang',
      'Tanggal Pelaksanaan',
      'Waktu',
      'Status',
      'Disetujui Oleh',
    ];

    const rows = data.map((item, idx) => [
      idx + 1,
      item.nomor,
      item.jenis,
      `"${item.pemohon.replace(/"/g, '""')}"`,
      `"${item.unit.replace(/"/g, '""')}"`,
      `"${item.kegiatan.replace(/"/g, '""')}"`,
      `"${item.sarana.replace(/"/g, '""')}"`,
      item.tanggal,
      item.waktu,
      item.status,
      `"${item.disetujuiOleh.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `LAPORAN_SARPRAS_SMKN1TEGALSARI_${jenis}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    try {
      generateReportsPDF(
        data,
        summary,
        { jenis, tanggalAwal, tanggalAkhir, status },
        settings
      );
      success('Laporan resmi format PDF (A4 Landscape) berhasil dibuat & diunduh.');
    } catch (err: any) {
      toastError('Gagal membuat file PDF laporan: ' + (err?.message || ''));
    }
  };

  const handlePrint = () => {
    try {
      generateReportsPDF(
        data,
        summary,
        { jenis, tanggalAwal, tanggalAkhir, status },
        settings
      );
      success('Laporan PDF resmi telah dibuat dan diunduh. Siap dibuka untuk dicetak!');
      window.print();
    } catch {
      // In restricted iframes, PDF is already downloaded
    }
  };

  const handleExportVehiclesPDF = async () => {
    try {
      const res = await api.getVehicles();
      generateVehiclesListPDF(res.vehicles || [], settings);
      success('Laporan PDF data kendaraan sekolah berhasil diunduh.');
    } catch (err: any) {
      toastError('Gagal mengunduh laporan kendaraan');
    }
  };

  const handleExportRoomsPDF = async () => {
    try {
      const res = await api.getRooms();
      generateRoomsListPDF(res.rooms || [], settings);
      success('Laporan PDF data ruangan sekolah berhasil diunduh.');
    } catch (err: any) {
      toastError('Gagal mengunduh laporan ruangan');
    }
  };

  const handleExportFacilitiesPDF = async () => {
    try {
      const res = await api.getFacilities();
      generateFacilitiesListPDF(res.facilities || [], settings);
      success('Laporan PDF data inventaris fasilitas berhasil diunduh.');
    } catch (err: any) {
      toastError('Gagal mengunduh laporan fasilitas');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {jenis === 'MOBIL'
                ? 'Laporan Peminjaman Mobil'
                : jenis === 'AULA'
                ? 'Laporan Penggunaan Aula'
                : 'Rekapitulasi Sarana dan Prasarana'}
            </h2>
            <p className="text-xs text-slate-500">
              Pusat pelaporan dan rekap kegiatan operasional sarpras SMK Negeri 1 Tegalsari
            </p>
          </div>
        </div>

        {/* Export / Print buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Download Spreadsheet Excel (CSV)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            title="Unduh Laporan Format PDF Resmi A4"
          >
            <Download className="w-4 h-4" />
            Unduh PDF Laporan
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            title="Cetak Laporan (Generate PDF Siap Cetak)"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen
          </button>
        </div>
      </div>

      {/* Quick Sarpras Inventory PDF Export Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Printer className="w-4 h-4 text-indigo-600" />
          <span>Cetak Laporan Master Data Sarpras:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportVehiclesPDF}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 font-medium text-[11px] shadow-2xs transition cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-indigo-500" />
            PDF Data Kendaraan
          </button>
          <button
            onClick={handleExportRoomsPDF}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 font-medium text-[11px] shadow-2xs transition cursor-pointer"
          >
            <DoorOpen className="w-3.5 h-3.5 text-indigo-500" />
            PDF Data Ruangan
          </button>
          <button
            onClick={handleExportFacilitiesPDF}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 font-medium text-[11px] shadow-2xs transition cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-500" />
            PDF Data Fasilitas
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            FILTER REKAPITULASI LAPORAN
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Jenis Layanan</label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="SEMUA">Semua Layanan (Mobil & Aula)</option>
              <option value="MOBIL">Peminjaman Mobil</option>
              <option value="AULA">Penggunaan Aula</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status Pengajuan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="MENUNGGU PERSETUJUAN">Menunggu Persetujuan</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Unit Pemohon</label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="SEMUA">Semua Unit Kerja</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={tanggalAwal}
              onChange={(e) => setTanggalAwal(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2 outline-none focus:border-indigo-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2 outline-none focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Quick Summary Pill Counters */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">
            Total: {summary.total}
          </span>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
            Disetujui: {summary.disetujui}
          </span>
          <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full font-semibold">
            Selesai: {summary.selesai}
          </span>
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-semibold">
            Menunggu: {summary.menunggu}
          </span>
          <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full font-semibold">
            Ditolak: {summary.ditolak}
          </span>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs print:m-0 print:p-0 print:border-none print:shadow-none font-sans">
        {/* Printable Official Kop Surat */}
        <div className="hidden print:block border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center justify-between">
            {/* Logo Jawa Timur (Kiri) */}
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src={getLogoJawaTimur()}
                alt="Logo Jawa Timur"
                className="h-16 w-16 object-contain"
              />
            </div>

            {/* Teks Kop Surat */}
            <div className="flex-1 text-center px-4">
              <h4 className="text-xs uppercase font-bold">
                {settings?.instansi || 'PEMERINTAH PROVINSI JAWA TIMUR'}
              </h4>
              <h4 className="text-xs uppercase font-bold">
                {settings?.subInstansi || 'DINAS PENDIDIKAN'}
              </h4>
              <h2 className="text-base uppercase font-black text-black">
                {settings?.namaSekolah || 'SMK NEGERI 1 TEGALSARI'}
              </h2>
              <p className="text-[10px] text-slate-600">
                {settings?.alamat} | Telepon: {settings?.telepon}
              </p>
            </div>

            {/* Logo Sekolah (Kanan) */}
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src={getLogoSekolah(settings)}
                alt="Logo Sekolah"
                className="h-16 w-16 object-contain"
              />
            </div>
          </div>

          <div className="mt-3 text-center">
            <h3 className="text-sm font-bold uppercase underline">
              LAPORAN REKAPITULASI SARANA DAN PRASARANA
            </h3>
            <p className="text-[10px]">
              Periode: {tanggalAwal} s.d. {tanggalAkhir} | Jenis: {jenis}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 print:bg-slate-100">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">No. Pengajuan</th>
                <th className="py-2.5 px-3">Layanan</th>
                <th className="py-2.5 px-3">Pemohon / Unit</th>
                <th className="py-2.5 px-3">Kegiatan</th>
                <th className="py-2.5 px-3">Sarana / Lokasi</th>
                <th className="py-2.5 px-3">Waktu Pelaksanaan</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Penyetujui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data rekapitulasi pada periode dan kriteria ini.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                      {item.nomor}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">
                      {item.jenis}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800">{item.pemohon}</p>
                      <p className="text-[10px] text-slate-500">{item.unit}</p>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate font-medium text-slate-700">
                      {item.kegiatan}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {item.sarana}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800">{item.tanggal}</p>
                      <p className="text-[10px] text-slate-500">{item.waktu} WIB</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {item.disetujuiOleh}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signature space on print */}
        <div className="hidden print:grid grid-cols-2 gap-8 text-center text-xs mt-12 pt-4">
          <div>
            <p className="text-[11px] text-slate-600 mb-1">Mengetahui,</p>
            <p className="font-semibold">Kepala SMKN 1 Tegalsari</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{settings?.kepalaSekolahNama}</p>
            <p className="text-[10px]">NIP. {settings?.kepalaSekolahNip}</p>
          </div>

          <div>
            <p className="text-[11px] text-slate-600 mb-1">
              Tegalsari, {new Date().toLocaleDateString('id-ID')}
            </p>
            <p className="font-semibold">Waka Sarana & Prasarana</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{settings?.wakaSarprasNama}</p>
            <p className="text-[10px]">NIP. {settings?.wakaSarprasNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
