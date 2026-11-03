export type UserRole = 'admin' | 'sarpras' | 'pemohon';

export interface User {
  id: string;
  uid: string;
  nama: string;
  email: string;
  role: UserRole;
  unitId?: string;
  unitNama?: string;
  status: 'AKTIF' | 'NONAKTIF';
  noHp?: string;
  jabatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  nama: string;
  status: 'AKTIF' | 'NONAKTIF';
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  kode: string;
  nama: string;
  jenis: string;
  nomorPolisi: string;
  tahun: number;
  kapasitas: number;
  status: 'TERSEDIA' | 'DIGUNAKAN' | 'SERVIS' | 'TIDAK AKTIF';
  keterangan: string;
  foto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  kode: string;
  nama: string;
  kapasitas: number;
  lokasi: string;
  status: 'TERSEDIA' | 'DIGUNAKAN' | 'PERBAIKAN' | 'TIDAK AKTIF';
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  nama: string;
  jumlah: number;
  kondisi: 'BAIK' | 'RUSAK RINGAN' | 'RUSAK BERAT';
  lokasi: string;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export type BorrowingStatus =
  | 'DRAFT'
  | 'MENUNGGU PERSETUJUAN'
  | 'DISETUJUI'
  | 'DITOLAK'
  | 'SELESAI'
  | 'DIBATALKAN';

export interface CarBorrowing {
  id: string;
  nomorPengajuan: string;
  pemohonId: string;
  pemohonNama: string;
  unitId: string;
  unitNama: string;
  kegiatan: string;
  tujuanRute: string;
  kmAwal: number;
  perkiraanJarak?: string;
  hariTanggal: string;
  jamBerangkat: string;
  perkiraanKembali: string;
  vehicleId: string;
  vehicleNama: string;
  vehicleNoPol: string;
  driverNama: string;
  driverNoHp: string;
  bbmPersen: number;
  fotoDepan?: string;
  fotoKanan?: string;
  fotoKiri?: string;
  fotoBelakang?: string;
  disetujuiOleh?: string;
  jabatanPenyetujui?: string;
  tanggalDisetujui?: string;
  status: BorrowingStatus;
  catatanPetugas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HallFacilities {
  meja: boolean;
  kursi: boolean;
  lcd: boolean;
  sound: boolean;
  mic: boolean;
  acKipas: boolean;
  lainnya: string;
}

export interface HallBooking {
  id: string;
  nomorPengajuan: string;
  pemohonId: string;
  pemohonNama: string;
  unitId: string;
  unitNama: string;
  namaKegiatan: string;
  keperluan: string;
  roomId: string;
  roomNama: string;
  hariTanggal: string;
  jamMulai: string;
  jamSelesai: string;
  jumlahPeserta: number;
  fasilitas: HallFacilities;
  disetujuiOleh?: string;
  jabatanPenyetujui?: string;
  tanggalDisetujui?: string;
  status: BorrowingStatus;
  keterangan?: string;
  catatanPetugas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole?: UserRole | 'semua';
  judul: string;
  pesan: string;
  link?: string;
  tipe: 'success' | 'warning' | 'info' | 'danger';
  dibaca: boolean;
  createdAt: string;
}

export interface StatusHistoryItem {
  id: string;
  recordId: string;
  jenisPengajuan: 'MOBIL' | 'AULA';
  statusLama: string;
  statusBaru: string;
  userId: string;
  userNama: string;
  catatan?: string;
  timestamp: string;
}

export interface SchoolSettings {
  id: string;
  namaSekolah: string;
  instansi: string;
  subInstansi: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolahNama: string;
  kepalaSekolahNip: string;
  wakaSarprasNama: string;
  wakaSarprasNip: string;
  petugasSarprasNama: string;
  petugasSarprasNip: string;
  logoUrl: string;
}

export interface DashboardMetrics {
  totalPengajuan: number;
  menungguPersetujuan: number;
  disetujui: number;
  ditolak: number;
  peminjamanMobilHariIni: number;
  penggunaanAulaHariIni: number;
  totalMobil: number;
  totalRuangan: number;
  totalFasilitas: number;
}

export interface MonthlyChartData {
  bulan: string;
  mobil: number;
  aula: number;
  total: number;
}

export interface RecentApplication {
  id: string;
  tipe: 'MOBIL' | 'AULA';
  nomorPengajuan: string;
  pemohonNama: string;
  unitNama: string;
  kegiatan: string;
  itemInfo: string;
  hariTanggal: string;
  waktu: string;
  status: BorrowingStatus;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  tipe: 'MOBIL' | 'AULA';
  title: string;
  subTitle: string;
  tanggal: string;
  jam: string;
  pemohon: string;
  unit: string;
  status: BorrowingStatus;
  nomorPengajuan: string;
  raw: any;
}
