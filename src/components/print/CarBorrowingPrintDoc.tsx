import React, { useState } from 'react';
import { CarBorrowing, SchoolSettings } from '../../types/index.ts';
import { generateCarBorrowingPDF } from '../../utils/pdfGenerator.ts';
import { getLogoJawaTimur, getLogoSekolah } from '../../utils/logos.ts';
import { Printer, Download, X, Check, FileCheck } from 'lucide-react';

interface Props {
  borrowing: CarBorrowing;
  settings: SchoolSettings | null;
  onClose?: () => void;
}

export const CarBorrowingPrintDoc: React.FC<Props> = ({ borrowing, settings, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [printNotice, setPrintNotice] = useState<string>('');

  const handleDownloadPDF = () => {
    generateCarBorrowingPDF(borrowing, settings);
    setDownloaded(true);
    setPrintNotice('File PDF resmi A4 telah berhasil diunduh. Silakan buka dan cetak (Ctrl+P).');
    setTimeout(() => {
      setDownloaded(false);
      setPrintNotice('');
    }, 5000);
  };

  const handlePrint = () => {
    try {
      // First generate PDF for reliable printing
      generateCarBorrowingPDF(borrowing, settings);
      setDownloaded(true);
      setPrintNotice('Dokumen PDF resmi telah dibuat dan diunduh. Siap dicetak langsung!');
      // Also attempt window.print() if supported
      window.print();
    } catch (e) {
      // Graceful fallback in iframe
      setPrintNotice('File PDF resmi telah diunduh. Silakan buka file tersebut untuk mencetak.');
    }
  };

  const formatDate = (isoOrDate: string) => {
    if (!isoOrDate) return '-';
    try {
      const d = new Date(isoOrDate);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoOrDate;
    }
  };

  const formatShortDate = (isoOrDate: string) => {
    if (!isoOrDate) return '-';
    try {
      const d = new Date(isoOrDate);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoOrDate;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 overflow-y-auto flex justify-center p-0 md:p-6">
      {/* Floating Action Bar */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 no-print">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md transition cursor-pointer"
          >
            {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {downloaded ? 'PDF Berhasil Diunduh' : 'Unduh Dokumen PDF (A4)'}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen (PDF)
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {printNotice && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{printNotice}</span>
          </div>
        )}
      </div>

      {/* A4 Sheet Container */}
      <div className="w-full max-w-[210mm] bg-white text-black p-8 sm:p-12 shadow-2xl my-auto print:m-0 print:p-0 print:shadow-none print:w-full font-serif min-h-[297mm]">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-black pb-3 mb-4 text-center relative">
          <div className="flex items-center justify-between mb-1">
            {/* Logo Jawa Timur (Sebelah Kiri) */}
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              <img
                src={getLogoJawaTimur()}
                alt="Logo Jawa Timur"
                className="max-h-20 max-w-20 object-contain"
              />
            </div>

            <div className="flex-1 text-center px-2">
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {settings?.instansi || 'PEMERINTAH PROVINSI JAWA TIMUR'}
              </h4>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {settings?.subInstansi || 'DINAS PENDIDIKAN'}
              </h4>
              <h2 className="text-lg font-black uppercase text-black tracking-normal mt-0.5">
                {settings?.namaSekolah || 'SMK NEGERI 1 TEGALSARI'}
              </h2>
              <p className="text-[10px] text-slate-700 italic font-sans mt-0.5">
                {settings?.alamat || 'Jl. KH. Syafa\'at, Blokagung, Karangdoro, Kec. Tegalsari, Kab. Banyuwangi, Jawa Timur 68485'}
              </p>
              <p className="text-[10px] text-slate-700 font-sans">
                Telepon: {settings?.telepon || '(0333) 845621'} | Email: {settings?.email || 'smkn1tegalsari@gmail.com'}
              </p>
            </div>

            {/* Logo Sekolah (Sebelah Kanan) */}
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              <img
                src={getLogoSekolah(settings)}
                alt="Logo Sekolah"
                className="max-h-20 max-w-20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Judul Formulir */}
        <div className="text-center my-3">
          <p className="text-xs uppercase font-sans font-bold tracking-wider text-slate-600">
            ADMINISTRASI SARANA DAN PRASARANA
          </p>
          <h3 className="text-base font-bold underline uppercase mt-0.5 tracking-wide">
            FORM PEMINJAMAN MOBIL SEKOLAH
          </h3>
          <div className="flex justify-between items-center text-xs font-mono font-medium mt-2 px-1">
            <span>Nomor Pengajuan: <strong>{borrowing.nomorPengajuan}</strong></span>
            <span>Tanggal Pengajuan: <strong>{formatShortDate(borrowing.createdAt)}</strong></span>
          </div>
        </div>

        {/* Tabel Rincian Data */}
        <table className="w-full text-xs font-sans border-collapse border border-black my-4">
          <tbody>
            <tr className="border-b border-black bg-slate-100 font-semibold">
              <td colSpan={2} className="p-2 font-bold uppercase">I. DATA PEMOHON & KEPERLUAN</td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-1/3 p-2 border-r border-black font-semibold">Nama Pemohon</td>
              <td className="p-2 font-bold">{borrowing.pemohonNama}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Unit / Program Keahlian</td>
              <td className="p-2">{borrowing.unitNama || '-'}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Kegiatan</td>
              <td className="p-2 font-medium">{borrowing.kegiatan}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Tujuan / Rute Perjalanan</td>
              <td className="p-2">{borrowing.tujuanRute}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">KM Awal / Perkiraan Jarak</td>
              <td className="p-2">
                {borrowing.kmAwal ? `${borrowing.kmAwal.toLocaleString('id-ID')} KM` : '-'} {borrowing.perkiraanJarak ? `(${borrowing.perkiraanJarak})` : ''}
              </td>
            </tr>

            <tr className="border-b border-black bg-slate-100 font-semibold">
              <td colSpan={2} className="p-2 font-bold uppercase">II. HARI, TANGGAL & WAKTU PELAKSANAAN</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Hari / Tanggal</td>
              <td className="p-2 font-semibold">{formatDate(borrowing.hariTanggal)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Jam Berangkat</td>
              <td className="p-2">{borrowing.jamBerangkat} WIB</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Perkiraan Kembali</td>
              <td className="p-2">{borrowing.perkiraanKembali} WIB</td>
            </tr>

            <tr className="border-b border-black bg-slate-100 font-semibold">
              <td colSpan={2} className="p-2 font-bold uppercase">III. KENDARAAN, PENGEMUDI & KONDISI AWAL</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Kendaraan</td>
              <td className="p-2 font-bold">{borrowing.vehicleNama} (No. Polisi: {borrowing.vehicleNoPol})</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Nama Pengemudi</td>
              <td className="p-2">{borrowing.driverNama}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Nomor Handphone Pengemudi</td>
              <td className="p-2">{borrowing.driverNoHp}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black font-semibold">Kondisi Bahan Bakar Minyak (BBM)</td>
              <td className="p-2 font-semibold">{borrowing.bbmPersen}% Kapasitas Tangki</td>
            </tr>
          </tbody>
        </table>

        {/* Catatan Resmi (Tanpa 4 Sudut Foto Kendaraan) */}
        <div className="p-2.5 border border-black bg-slate-50 text-[11px] font-sans italic text-slate-800 my-4">
          <strong>Catatan:</strong> “Ketersediaan kendaraan dan pemeriksaan kondisi kendaraan menjadi tanggung jawab petugas sarpras.”
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans mt-8 pt-4">
          <div>
            <p className="text-[11px] text-slate-600 mb-0.5">Mengetahui / Mengajukan,</p>
            <p className="font-semibold">Pemohon</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] font-mono text-slate-400 italic">( Tanda Tangan & Cap Unit )</span>
            </div>
            <p className="font-bold underline uppercase">{borrowing.pemohonNama}</p>
            <p className="text-[11px] text-slate-600">{borrowing.unitNama || 'Pemohon Kegiatan'}</p>
          </div>

          <div>
            <p className="text-[11px] text-slate-600 mb-0.5">
              Tegalsari, {formatShortDate(borrowing.tanggalDisetujui || borrowing.createdAt)}
            </p>
            <p className="font-semibold">
              Disetujui oleh: {borrowing.jabatanPenyetujui || 'Waka Sarana & Prasarana'}
            </p>
            <div className="h-20 flex items-center justify-center">
              <div className="border border-dashed border-emerald-600 px-3 py-1 rounded text-emerald-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                STATUS: {borrowing.status}
              </div>
            </div>
            <p className="font-bold underline uppercase">
              {borrowing.disetujuiOleh || settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.'}
            </p>
            <p className="text-[11px] text-slate-600">
              NIP. {settings?.wakaSarprasNip || '19790412 200801 1 012'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
