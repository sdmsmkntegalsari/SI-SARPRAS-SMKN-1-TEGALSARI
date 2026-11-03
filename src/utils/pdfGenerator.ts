import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CarBorrowing, HallBooking, SchoolSettings, Vehicle, Room, Facility } from '../types/index.ts';
import { getLogoJawaTimur, getLogoSekolah, LOGO_SMKN1_TEGALSARI_PNG } from './logos.ts';

// Helper to format Indonesian dates
function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Draw standard header kop surat dengan Logo Jawa Timur di Kiri & Logo Sekolah di Kanan
function drawLetterhead(doc: jsPDF, settings: SchoolSettings | null, isLandscape: boolean = false): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = isLandscape ? 17 : 19;
  const logoHeight = isLandscape ? 21 : 23;
  const logoY = isLandscape ? 8 : 10;

  // 1. Logo Jawa Timur (Sebelah Kiri Kop)
  try {
    const logoJatim = getLogoJawaTimur();
    doc.addImage(logoJatim, 'PNG', 14, logoY, logoWidth, logoHeight);
  } catch (err) {
    console.error('Failed to draw Jawa Timur logo:', err);
  }

  // 2. Logo Sekolah (Sebelah Kanan Kop)
  try {
    const logoSekolah = getLogoSekolah(settings);
    const format = logoSekolah.startsWith('data:image/jpeg') || logoSekolah.startsWith('data:image/jpg') ? 'JPEG' : 'PNG';
    doc.addImage(logoSekolah, format, pageWidth - 14 - logoWidth, logoY, logoWidth, logoHeight);
  } catch (err) {
    console.error('Failed to draw custom School logo, falling back to default:', err);
    try {
      doc.addImage(LOGO_SMKN1_TEGALSARI_PNG, 'PNG', pageWidth - 14 - logoWidth, logoY, logoWidth, logoHeight);
    } catch (fallbackErr) {
      console.error('Failed to draw fallback School logo:', fallbackErr);
    }
  }

  let y = isLandscape ? 11 : 13;

  doc.setFont('times', 'bold');
  doc.setFontSize(isLandscape ? 9 : 10);
  doc.text((settings?.instansi || 'PEMERINTAH PROVINSI JAWA TIMUR').toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += isLandscape ? 4.5 : 5;

  doc.text((settings?.subInstansi || 'DINAS PENDIDIKAN').toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += isLandscape ? 5 : 5.5;

  doc.setFontSize(isLandscape ? 12 : 13);
  doc.text((settings?.namaSekolah || 'SMK NEGERI 1 TEGALSARI').toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += isLandscape ? 4.5 : 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(isLandscape ? 8 : 8.5);
  doc.text(
    settings?.alamat || 'Jl. KH. Syafa\'at, Blokagung, Karangdoro, Kec. Tegalsari, Kab. Banyuwangi, Jawa Timur 68485',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 4;
  doc.text(
    `Telepon: ${settings?.telepon || '(0333) 845621'} | Email: ${settings?.email || 'smkn1tegalsari@gmail.com'}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 4.5;

  // Double horizontal rule
  doc.setLineWidth(0.8);
  doc.line(14, y, pageWidth - 14, y);
  y += 1;
  doc.setLineWidth(0.2);
  doc.line(14, y, pageWidth - 14, y);
  y += isLandscape ? 5 : 6;

  return y;
}

// 1. GENERATE FORM PEMINJAMAN MOBIL PDF (TANPA FOTO 4 SUDUT)
export function generateCarBorrowingPDF(borrowing: CarBorrowing, settings: SchoolSettings | null): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = drawLetterhead(doc, settings, false);

  // Judul Formulir
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('ADMINISTRASI SARANA DAN PRASARANA', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(11.5);
  doc.text('FORM PEMINJAMAN MOBIL SEKOLAH', pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  // Metadata nomor & tanggal
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(`Nomor Pengajuan: ${borrowing.nomorPengajuan}`, 14, y);
  doc.text(`Tanggal: ${formatShortDate(borrowing.createdAt)}`, pageWidth - 14, y, { align: 'right' });
  y += 4.5;

  // Table I: Data Pemohon & Keperluan & Kendaraan
  const tableData: any[] = [
    [{ content: 'I. DATA PEMOHON & KEPERLUAN', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
    ['Nama Pemohon', `: ${borrowing.pemohonNama}`],
    ['Unit / Program Keahlian', `: ${borrowing.unitNama || '-'}`],
    ['Kegiatan', `: ${borrowing.kegiatan}`],
    ['Tujuan / Rute Perjalanan', `: ${borrowing.tujuanRute}`],
    ['KM Awal / Perkiraan Jarak', `: ${borrowing.kmAwal ? borrowing.kmAwal.toLocaleString('id-ID') + ' KM' : '-'} ${borrowing.perkiraanJarak ? '(' + borrowing.perkiraanJarak + ')' : ''}`],
    [{ content: 'II. HARI, TANGGAL & WAKTU PELAKSANAAN', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
    ['Hari / Tanggal', `: ${formatDateIndo(borrowing.hariTanggal)}`],
    ['Jam Berangkat', `: ${borrowing.jamBerangkat} WIB`],
    ['Perkiraan Kembali', `: ${borrowing.perkiraanKembali} WIB`],
    [{ content: 'III. KENDARAAN, PENGEMUDI & KONDISI AWAL', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
    ['Kendaraan', `: ${borrowing.vehicleNama} (No. Polisi: ${borrowing.vehicleNoPol})`],
    ['Nama Pengemudi', `: ${borrowing.driverNama}`],
    ['No. HP Pengemudi', `: ${borrowing.driverNoHp}`],
    ['Bahan Bakar Minyak (BBM)', `: ${borrowing.bbmPersen}% Kapasitas Tangki`],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 9,
      cellPadding: 2.2,
      textColor: [0, 0, 0],
      lineColor: [50, 50, 50],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Catatan Resmi (Tanpa 4 Sudut Foto Kendaraan)
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(250, 250, 250);
  doc.rect(14, y, pageWidth - 28, 8, 'FD');
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text(
    'Catatan: "Ketersediaan kendaraan dan pemeriksaan kondisi kendaraan menjadi tanggung jawab petugas sarpras."',
    16,
    y + 5.2
  );
  y += 16;

  // Area Tanda Tangan
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Mengetahui / Mengajukan,', 40, y, { align: 'center' });
  doc.text(`Tegalsari, ${formatShortDate(borrowing.tanggalDisetujui || borrowing.createdAt)}`, pageWidth - 40, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'bold');
  doc.text('Pemohon,', 40, y, { align: 'center' });
  doc.text(`Disetujui oleh: ${borrowing.jabatanPenyetujui || 'Waka Sarana & Prasarana'}`, pageWidth - 40, y, { align: 'center' });
  y += 20;

  // Status Cap
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 120, 60);
  doc.text(`[ STATUS: ${borrowing.status} ]`, pageWidth - 40, y - 7, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text(borrowing.pemohonNama.toUpperCase(), 40, y, { align: 'center' });
  doc.text((borrowing.disetujuiOleh || settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.').toUpperCase(), pageWidth - 40, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text(borrowing.unitNama || 'Pemohon Kegiatan', 40, y, { align: 'center' });
  doc.text(`NIP. ${settings?.wakaSarprasNip || '19790412 200801 1 012'}`, pageWidth - 40, y, { align: 'center' });

  // Download PDF
  const filename = `FORM_PEMINJAMAN_MOBIL_${borrowing.nomorPengajuan}.pdf`;
  doc.save(filename);
  return doc;
}

// 2. GENERATE FORM PENGGUNAAN AULA PDF
export function generateHallBookingPDF(booking: HallBooking, settings: SchoolSettings | null): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = drawLetterhead(doc, settings, false);

  // Judul Formulir
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('ADMINISTRASI SARANA DAN PRASARANA', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(11.5);
  doc.text('FORM PENGGUNAAN RUANG AULA', pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(`Nomor Pengajuan: ${booking.nomorPengajuan}`, 14, y);
  doc.text(`Tanggal: ${formatShortDate(booking.createdAt)}`, pageWidth - 14, y, { align: 'right' });
  y += 4.5;

  // Facility checklist string
  const facilitiesArr = [];
  if (booking.fasilitas?.meja) facilitiesArr.push('[V] Meja');
  if (booking.fasilitas?.kursi) facilitiesArr.push('[V] Kursi');
  if (booking.fasilitas?.lcd) facilitiesArr.push('[V] LCD Proyektor');
  if (booking.fasilitas?.sound) facilitiesArr.push('[V] Sound System');
  if (booking.fasilitas?.mic) facilitiesArr.push('[V] Microphone');
  if (booking.fasilitas?.acKipas) facilitiesArr.push('[V] AC / Kipas Angin');
  if (booking.fasilitas?.lainnya) facilitiesArr.push(`Lainnya: ${booking.fasilitas.lainnya}`);

  const facilitiesText = facilitiesArr.join('   |   ') || '-';

  const tableData: any[] = [
    [{ content: 'I. DATA PEMOHON & KEGIATAN', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
    ['Nama Pemohon', `: ${booking.pemohonNama}`],
    ['Unit / Program Keahlian', `: ${booking.unitNama || '-'}`],
    ['Nama Kegiatan', `: ${booking.namaKegiatan}`],
    ['Keperluan', `: ${booking.keperluan || '-'}`],
    ['Ruangan yang Digunakan', `: ${booking.roomNama}`],
    [{ content: 'II. WAKTU & JUMLAH PESERTA', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
    ['Hari / Tanggal', `: ${formatDateIndo(booking.hariTanggal)}`],
    ['Waktu Mulai - Selesai', `: ${booking.jamMulai} WIB s.d ${booking.jamSelesai} WIB`],
    ['Perkiraan Jumlah Peserta', `: ${booking.jumlahPeserta} Orang`],
    [{ content: 'III. FASILITAS RUANGAN YANG DIBUTUHKAN', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
    ['Daftar Fasilitas', `: ${facilitiesText}`],
    [{ content: 'IV. KETERANGAN PENGGUNAAN / KEBUTUHAN LAIN', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
    ['Keterangan', `: ${booking.keterangan || '-'}`],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 9,
      cellPadding: 2.2,
      textColor: [0, 0, 0],
      lineColor: [50, 50, 50],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Catatan
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(250, 250, 250);
  doc.rect(14, y, pageWidth - 28, 8, 'FD');
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text(
    'Perhatian: "Pengguna wajib menjaga kebersihan, ketertiban, keamanan, dan mengembalikan fasilitas aula seperti semula."',
    16,
    y + 5.2
  );
  y += 16;

  // Tanda Tangan
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Mengetahui / Mengajukan,', 40, y, { align: 'center' });
  doc.text(`Tegalsari, ${formatShortDate(booking.tanggalDisetujui || booking.createdAt)}`, pageWidth - 40, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'bold');
  doc.text('Pemohon,', 40, y, { align: 'center' });
  doc.text(`Disetujui oleh: ${booking.jabatanPenyetujui || 'Waka Sarana & Prasarana'}`, pageWidth - 40, y, { align: 'center' });
  y += 20;

  // Status Cap
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 120, 60);
  doc.text(`[ STATUS: ${booking.status} ]`, pageWidth - 40, y - 7, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text(booking.pemohonNama.toUpperCase(), 40, y, { align: 'center' });
  doc.text((booking.disetujuiOleh || settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.').toUpperCase(), pageWidth - 40, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text(booking.unitNama || 'Pemohon Kegiatan', 40, y, { align: 'center' });
  doc.text(`NIP. ${settings?.wakaSarprasNip || '19790412 200801 1 012'}`, pageWidth - 40, y, { align: 'center' });

  const filename = `FORM_PENGGUNAAN_AULA_${booking.nomorPengajuan}.pdf`;
  doc.save(filename);
  return doc;
}

// 3. GENERATE LAPORAN REKAPITULASI SARPRAS PDF (A4 LANDSCAPE)
export function generateReportsPDF(
  reportData: any[],
  summary: any,
  filters: { jenis: string; tanggalAwal: string; tanggalAkhir: string; status: string },
  settings: SchoolSettings | null
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = drawLetterhead(doc, settings, true);

  // Judul Laporan
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  const judulLaporan =
    filters.jenis === 'MOBIL'
      ? 'LAPORAN REKAPITULASI PEMINJAMAN MOBIL SEKOLAH'
      : filters.jenis === 'AULA'
      ? 'LAPORAN REKAPITULASI PENGGUNAAN RUANG AULA'
      : 'LAPORAN REKAPITULASI SARANA DAN PRASARANA';

  doc.text(judulLaporan, pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text(
    `Periode: ${filters.tanggalAwal} s.d. ${filters.tanggalAkhir} | Filter Status: ${filters.status} | Total Data: ${reportData.length}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 5;

  // Table Data
  const tableRows = reportData.map((item, idx) => [
    idx + 1,
    item.nomor,
    item.jenis,
    item.pemohon,
    item.unit,
    item.kegiatan,
    item.sarana,
    item.tanggal,
    item.waktu,
    item.status,
    item.disetujuiOleh || '-',
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [[
      'No', 'No. Pengajuan', 'Layanan', 'Pemohon', 'Unit Kerja',
      'Nama Kegiatan', 'Sarana/Ruangan', 'Tanggal', 'Waktu', 'Status', 'Penyetujui'
    ]],
    body: tableRows.length > 0 ? tableRows : [['-', '-', '-', '-', '-', 'Tidak ada data rekapitulasi pada periode ini', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 7.5,
      cellPadding: 1.6,
      textColor: [0, 0, 0],
      lineColor: [60, 60, 60],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    tableWidth: 'auto',
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26, font: 'courier', fontStyle: 'bold' },
      7: { cellWidth: 18 },
      8: { cellWidth: 20 },
      9: { cellWidth: 20, halign: 'center' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Check page overflow for signature
  if (y > 165) {
    doc.addPage();
    y = 20;
  }

  // Tanda tangan
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text('Mengetahui,', 50, y, { align: 'center' });
  doc.text(`Tegalsari, ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 50, y, { align: 'center' });
  y += 4;

  doc.setFont('times', 'bold');
  doc.text('Kepala SMK Negeri 1 Tegalsari', 50, y, { align: 'center' });
  doc.text('Waka Sarana & Prasarana', pageWidth - 50, y, { align: 'center' });
  y += 20;

  doc.setFont('times', 'bold');
  doc.text((settings?.kepalaSekolahNama || 'Drs. Gatot Kurnianta, M.M.').toUpperCase(), 50, y, { align: 'center' });
  doc.text((settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.').toUpperCase(), pageWidth - 50, y, { align: 'center' });
  y += 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NIP. ${settings?.kepalaSekolahNip || '19680715 199412 1 003'}`, 50, y, { align: 'center' });
  doc.text(`NIP. ${settings?.wakaSarprasNip || '19790412 200801 1 012'}`, pageWidth - 50, y, { align: 'center' });

  const filename = `LAPORAN_SARPRAS_SMKN1TEGALSARI_${filters.jenis}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return doc;
}

// 4. GENERATE LAPORAN DAFTAR KENDARAAN PDF
export function generateVehiclesListPDF(vehicles: Vehicle[], settings: SchoolSettings | null): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = drawLetterhead(doc, settings, false);

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('LAPORAN DATA SARANA KENDARAAN SEKOLAH', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Per Tanggal: ${new Date().toLocaleDateString('id-ID')} | Total Unit: ${vehicles.length}`, pageWidth / 2, y, { align: 'center' });
  y += 5;

  const rows = vehicles.map((v, idx) => [
    idx + 1,
    v.kode,
    v.nama,
    v.jenis,
    v.nomorPolisi,
    v.tahun,
    `${v.kapasitas} org`,
    v.status,
    v.keterangan || '-',
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['No', 'Kode', 'Nama Kendaraan', 'Jenis', 'No. Polisi', 'Tahun', 'Kapasitas', 'Status', 'Keterangan']],
    body: rows,
    theme: 'grid',
    styles: { font: 'times', fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16, font: 'courier' },
      4: { cellWidth: 24, font: 'courier', fontStyle: 'bold' },
      7: { cellWidth: 22, halign: 'center' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Tegalsari, ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 45, y, { align: 'center' });
  y += 4;
  doc.setFont('times', 'bold');
  doc.text('Waka Sarana & Prasarana', pageWidth - 45, y, { align: 'center' });
  y += 20;
  doc.text((settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.').toUpperCase(), pageWidth - 45, y, { align: 'center' });
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NIP. ${settings?.wakaSarprasNip || '19790412 200801 1 012'}`, pageWidth - 45, y, { align: 'center' });

  const filename = `LAPORAN_KENDARAAN_SMKN1TEGALSARI_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return doc;
}

// 5. GENERATE LAPORAN DAFTAR RUANGAN PDF
export function generateRoomsListPDF(rooms: Room[], settings: SchoolSettings | null): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = drawLetterhead(doc, settings, false);

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('LAPORAN DATA PRASARANA RUANGAN SEKOLAH', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Per Tanggal: ${new Date().toLocaleDateString('id-ID')} | Total Ruangan: ${rooms.length}`, pageWidth / 2, y, { align: 'center' });
  y += 5;

  const rows = rooms.map((r, idx) => [
    idx + 1,
    r.kode,
    r.nama,
    `${r.kapasitas} org`,
    r.lokasi,
    r.status,
    r.keterangan || '-',
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['No', 'Kode', 'Nama Ruangan', 'Kapasitas', 'Lokasi / Gedung', 'Status', 'Keterangan']],
    body: rows,
    theme: 'grid',
    styles: { font: 'times', fontSize: 8.5, cellPadding: 2.2, textColor: [0, 0, 0] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20, font: 'courier' },
      5: { cellWidth: 24, halign: 'center' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Tegalsari, ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 45, y, { align: 'center' });
  y += 4;
  doc.setFont('times', 'bold');
  doc.text('Waka Sarana & Prasarana', pageWidth - 45, y, { align: 'center' });
  y += 20;
  doc.text((settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.').toUpperCase(), pageWidth - 45, y, { align: 'center' });
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NIP. ${settings?.wakaSarprasNip || '19790412 200801 1 012'}`, pageWidth - 45, y, { align: 'center' });

  const filename = `LAPORAN_RUANGAN_SMKN1TEGALSARI_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return doc;
}

// 6. GENERATE LAPORAN DAFTAR FASILITAS PDF
export function generateFacilitiesListPDF(facilities: Facility[], settings: SchoolSettings | null): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = drawLetterhead(doc, settings, false);

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('LAPORAN DATA INVENTARIS FASILITAS SEKOLAH', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Per Tanggal: ${new Date().toLocaleDateString('id-ID')} | Total Item: ${facilities.length}`, pageWidth / 2, y, { align: 'center' });
  y += 5;

  const rows = facilities.map((f, idx) => [
    idx + 1,
    f.nama,
    f.jumlah,
    f.kondisi,
    f.lokasi,
    f.keterangan || '-',
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['No', 'Nama Fasilitas / Sarana', 'Jumlah', 'Kondisi', 'Lokasi Penempatan', 'Keterangan']],
    body: rows,
    theme: 'grid',
    styles: { font: 'times', fontSize: 8.5, cellPadding: 2.2, textColor: [0, 0, 0] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 26, halign: 'center' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Tegalsari, ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 45, y, { align: 'center' });
  y += 4;
  doc.setFont('times', 'bold');
  doc.text('Waka Sarana & Prasarana', pageWidth - 45, y, { align: 'center' });
  y += 20;
  doc.text((settings?.wakaSarprasNama || 'H. Moh. Khoirul Anam, S.T., M.Pd.').toUpperCase(), pageWidth - 45, y, { align: 'center' });
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NIP. ${settings?.wakaSarprasNip || '19790412 200801 1 012'}`, pageWidth - 45, y, { align: 'center' });

  const filename = `LAPORAN_FASILITAS_SMKN1TEGALSARI_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return doc;
}
