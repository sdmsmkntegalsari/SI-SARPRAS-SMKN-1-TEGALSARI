import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  uid: string;
  nama: string;
  email: string;
  password?: string;
  role: 'admin' | 'sarpras' | 'pemohon';
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

export interface CarBorrowing {
  id: string;
  nomorPengajuan: string; // e.g. PM-2026-00001
  pemohonId: string;
  pemohonNama: string;
  unitId: string;
  unitNama: string;
  kegiatan: string;
  tujuanRute: string;
  kmAwal: number;
  perkiraanJarak?: string;
  hariTanggal: string; // YYYY-MM-DD
  jamBerangkat: string; // HH:mm
  perkiraanKembali: string; // HH:mm
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
  status: 'DRAFT' | 'MENUNGGU PERSETUJUAN' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI' | 'DIBATALKAN';
  catatanPetugas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HallBooking {
  id: string;
  nomorPengajuan: string; // e.g. AU-2026-00001
  pemohonId: string;
  pemohonNama: string;
  unitId: string;
  unitNama: string;
  namaKegiatan: string;
  keperluan: string;
  roomId: string;
  roomNama: string;
  hariTanggal: string; // YYYY-MM-DD
  jamMulai: string; // HH:mm
  jamSelesai: string; // HH:mm
  jumlahPeserta: number;
  fasilitas: {
    meja: boolean;
    kursi: boolean;
    lcd: boolean;
    sound: boolean;
    mic: boolean;
    acKipas: boolean;
    lainnya: string;
  };
  disetujuiOleh?: string;
  jabatanPenyetujui?: string;
  tanggalDisetujui?: string;
  status: 'DRAFT' | 'MENUNGGU PERSETUJUAN' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI' | 'DIBATALKAN';
  keterangan?: string;
  catatanPetugas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole?: 'admin' | 'sarpras' | 'pemohon' | 'semua';
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

export interface DatabaseSchema {
  users: User[];
  units: Unit[];
  vehicles: Vehicle[];
  rooms: Room[];
  facilities: Facility[];
  carBorrowings: CarBorrowing[];
  hallBookings: HallBooking[];
  notifications: NotificationItem[];
  statusHistory: StatusHistoryItem[];
  settings: SchoolSettings;
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'db.json');

const INITIAL_SETTINGS: SchoolSettings = {
  id: 'default',
  namaSekolah: 'SMK NEGERI 1 TEGALSARI',
  instansi: 'PEMERINTAH PROVINSI JAWA TIMUR',
  subInstansi: 'DINAS PENDIDIKAN',
  alamat: 'Jl. KH. Syafa\'at, Dusun Blokagung, RT.01/RW.02, Karangdoro, Kec. Tegalsari, Kabupaten Banyuwangi, Jawa Timur 68485',
  telepon: '(0333) 845621',
  email: 'smkn1tegalsari@gmail.com',
  website: 'https://smkn1tegalsari.sch.id',
  kepalaSekolahNama: 'Drs. Gatot Kurnianta, M.M.',
  kepalaSekolahNip: '19680715 199412 1 003',
  wakaSarprasNama: 'H. Moh. Khoirul Anam, S.T., M.Pd.',
  wakaSarprasNip: '19790412 200801 1 012',
  petugasSarprasNama: 'Ahmad Fauzi, S.Pd.',
  petugasSarprasNip: '19850914 201101 1 008',
  logoUrl: '', // Dapat di-upload atau menggunakan lambang default
};

const INITIAL_UNITS: Unit[] = [
  { id: 'unit-1', nama: 'Teknik Kendaraan Ringan Otomotif (TKRO)', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'unit-2', nama: 'Teknik dan Bisnis Sepeda Motor (TBSM)', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'unit-3', nama: 'Rekayasa Perangkat Lunak (RPL)', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'unit-4', nama: 'Teknik Komputer dan Jaringan (TKJ)', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'unit-5', nama: 'Akuntansi dan Keuangan Lembaga (AKL)', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'unit-6', nama: 'Bagian Tata Usaha (TU)', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'unit-7', nama: 'Urusan Kesiswaan & OSIS', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'unit-8', nama: 'Urusan Kurikulum', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'unit-9', nama: 'Tim Sarana & Prasarana', status: 'AKTIF', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    uid: 'uid-admin-01',
    nama: 'Administrator Sarpras SMKN 1 Tegalsari',
    email: 'admin@smkn1tegalsari.sch.id',
    password: 'admin',
    role: 'admin',
    unitId: 'unit-9',
    unitNama: 'Tim Sarana & Prasarana',
    status: 'AKTIF',
    noHp: '081234567890',
    jabatan: 'Koordinator Sistem Informasi Sarpras',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'user-sarpras',
    uid: 'uid-sarpras-01',
    nama: 'H. Moh. Khoirul Anam, S.T., M.Pd.',
    email: 'sarpras@smkn1tegalsari.sch.id',
    password: 'sarpras',
    role: 'sarpras',
    unitId: 'unit-9',
    unitNama: 'Tim Sarana & Prasarana',
    status: 'AKTIF',
    noHp: '081234567891',
    jabatan: 'Waka Sarana & Prasarana',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'user-pemohon1',
    uid: 'uid-pemohon-01',
    nama: 'Ibu Nurul Hidayati, S.Kom',
    email: 'kaprog.rpl@smkn1tegalsari.sch.id',
    password: 'pemohon',
    role: 'pemohon',
    unitId: 'unit-3',
    unitNama: 'Rekayasa Perangkat Lunak (RPL)',
    status: 'AKTIF',
    noHp: '085234567892',
    jabatan: 'Ketua Program Keahlian RPL',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'user-pemohon2',
    uid: 'uid-pemohon-02',
    nama: 'Bpk. Hendra Saputra, S.Pd.',
    email: 'kesiswaan@smkn1tegalsari.sch.id',
    password: 'pemohon',
    role: 'pemohon',
    unitId: 'unit-7',
    unitNama: 'Urusan Kesiswaan & OSIS',
    status: 'AKTIF',
    noHp: '087834567893',
    jabatan: 'Staf Urusan Kesiswaan',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    kode: 'KB-01',
    nama: 'Toyota Kijang Innova Reborn 2.4 G',
    jenis: 'Minibus / MPV',
    nomorPolisi: 'P 1823 XA',
    tahun: 2021,
    kapasitas: 7,
    status: 'TERSEDIA',
    keterangan: 'Kendaraan dinas kepala sekolah & operasional pimpinan, kondisi prima ber-AC.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'veh-2',
    kode: 'KB-02',
    nama: 'Isuzu Elf Microbus Sekolah',
    jenis: 'Microbus',
    nomorPolisi: 'P 7044 VQ',
    tahun: 2020,
    kapasitas: 16,
    status: 'TERSEDIA',
    keterangan: 'Kendaraan rombongan guru/siswa untuk lomba, workshop, dan studi industri.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'veh-3',
    kode: 'KB-03',
    nama: 'Toyota Avanza 1.3 G M/T',
    jenis: 'MPV',
    nomorPolisi: 'P 1405 WT',
    tahun: 2022,
    kapasitas: 7,
    status: 'TERSEDIA',
    keterangan: 'Mobil dinas operasional umum untuk dinas luar kantor dan koordinasi cabang dinas.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'veh-4',
    kode: 'KB-04',
    nama: 'Daihatsu Gran Max Pick Up 1.5',
    jenis: 'Pick Up / Pengangkut Sarana',
    nomorPolisi: 'P 8192 YZ',
    tahun: 2019,
    kapasitas: 3,
    status: 'TERSEDIA',
    keterangan: 'Mobil angkutan logistik, perlengkapan pameran, barang bengkel, dan inventaris.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
];

const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    kode: 'AULA-01',
    nama: 'Aula Utama "Graha Wiyata"',
    kapasitas: 400,
    lokasi: 'Gedung Utama Lantai 2, SMKN 1 Tegalsari',
    status: 'TERSEDIA',
    keterangan: 'Dilengkapi panggung kehormatan, sound system terintegrasi, proyektor ganda, dan sirkulasi sejuk.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room-2',
    kode: 'RAPAT-01',
    nama: 'Ruang Pertemuan / Rapat Pimpinan',
    kapasitas: 45,
    lokasi: 'Gedung Tata Usaha Lantai 1',
    status: 'TERSEDIA',
    keterangan: 'Meja konferensi oval, kursi eksekutif, Smart TV display, AC pendingin.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room-3',
    kode: 'AULA-02',
    nama: 'Gedung Serbaguna & Expo Siswa',
    kapasitas: 250,
    lokasi: 'Kompleks Bengkel Otomotif Selatan',
    status: 'TERSEDIA',
    keterangan: 'Ruang terbuka luas untuk pameran hasil karya kejuruan, ujian praktik, dan gladi bersih.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
];

const INITIAL_FACILITIES: Facility[] = [
  { id: 'fac-1', nama: 'Kursi Lipat Pesta Chitose', jumlah: 350, kondisi: 'BAIK', lokasi: 'Gudang Aula Graha Wiyata', keterangan: 'Siap pakai untuk acara resmi', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'fac-2', nama: 'Meja Rapat Panjang Lipat', jumlah: 30, kondisi: 'BAIK', lokasi: 'Gudang Aula Graha Wiyata', keterangan: 'Kondisi rapih terawat', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'fac-3', nama: 'Sound System Yamaha 1000W + Mixer', jumlah: 2, kondisi: 'BAIK', lokasi: 'Ruang Operator Sarpras', keterangan: 'Kualitas suara prima', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'fac-4', nama: 'Wireless Microphone Shure (Pair)', jumlah: 6, kondisi: 'BAIK', lokasi: 'Gudang Sarpras', keterangan: 'Baterai rechargeable', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'fac-5', nama: 'Proyektor LCD Epson 4200 ANSI Lumens', jumlah: 3, kondisi: 'BAIK', lokasi: 'Ruang Multimedia & Sarpras', keterangan: 'Lengkap kabel HDMI 20m & remote', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
  { id: 'fac-6', nama: 'AC Standing Portable Daikin 3 PK', jumlah: 4, kondisi: 'BAIK', lokasi: 'Aula Utama Graha Wiyata', keterangan: 'Dingin dan bersih', createdAt: '2026-01-01T08:00:00.000Z', updatedAt: '2026-01-01T08:00:00.000Z' },
];

// Helper to seed initial sample borrowings so dashboard and reports have realistic data
const todayStr = new Date().toISOString().split('T')[0];

const INITIAL_CAR_BORROWINGS: CarBorrowing[] = [
  {
    id: 'cb-1',
    nomorPengajuan: 'PM-2026-00001',
    pemohonId: 'user-pemohon1',
    pemohonNama: 'Ibu Nurul Hidayati, S.Kom',
    unitId: 'unit-3',
    unitNama: 'Rekayasa Perangkat Lunak (RPL)',
    kegiatan: 'Kunjungan Industri & Sinkronisasi Kurikulum IT di Surabaya',
    tujuanRute: 'SMKN 1 Tegalsari - PT Telkom Surabaya - SMKN 1 Tegalsari',
    kmAwal: 45210,
    perkiraanJarak: '600 KM (PP)',
    hariTanggal: todayStr,
    jamBerangkat: '07:30',
    perkiraanKembali: '18:00',
    vehicleId: 'veh-1',
    vehicleNama: 'Toyota Kijang Innova Reborn 2.4 G',
    vehicleNoPol: 'P 1823 XA',
    driverNama: 'Bpk. Sugeng Waluyo',
    driverNoHp: '081234889900',
    bbmPersen: 85,
    fotoDepan: '',
    fotoKanan: '',
    fotoKiri: '',
    fotoBelakang: '',
    disetujuiOleh: 'H. Moh. Khoirul Anam, S.T., M.Pd.',
    jabatanPenyetujui: 'Waka Sarana & Prasarana',
    tanggalDisetujui: `${todayStr}T06:45:00.000Z`,
    status: 'DISETUJUI',
    catatanPetugas: 'Pastikan cek oli dan tekanan angin ban sebelum perjalanan tol.',
    createdAt: `${todayStr}T06:00:00.000Z`,
    updatedAt: `${todayStr}T06:45:00.000Z`,
  },
  {
    id: 'cb-2',
    nomorPengajuan: 'PM-2026-00002',
    pemohonId: 'user-pemohon2',
    pemohonNama: 'Bpk. Hendra Saputra, S.Pd.',
    unitId: 'unit-7',
    unitNama: 'Urusan Kesiswaan & OSIS',
    kegiatan: 'Pengantaran Kontingen LKS Tingkat Wilayah Kerja',
    tujuanRute: 'SMKN 1 Tegalsari - Cabang Dinas Pendidikan Banyuwangi',
    kmAwal: 32150,
    perkiraanJarak: '90 KM (PP)',
    hariTanggal: todayStr,
    jamBerangkat: '08:00',
    perkiraanKembali: '15:00',
    vehicleId: 'veh-2',
    vehicleNama: 'Isuzu Elf Microbus Sekolah',
    vehicleNoPol: 'P 7044 VQ',
    driverNama: 'Bpk. Joko Santoso',
    driverNoHp: '085733221100',
    bbmPersen: 70,
    status: 'MENUNGGU PERSETUJUAN',
    createdAt: `${todayStr}T07:15:00.000Z`,
    updatedAt: `${todayStr}T07:15:00.000Z`,
  }
];

const INITIAL_HALL_BOOKINGS: HallBooking[] = [
  {
    id: 'hb-1',
    nomorPengajuan: 'AU-2026-00001',
    pemohonId: 'user-pemohon1',
    pemohonNama: 'Ibu Nurul Hidayati, S.Kom',
    unitId: 'unit-3',
    unitNama: 'Rekayasa Perangkat Lunak (RPL)',
    namaKegiatan: 'Workshop Pengembangan AI & Cloud Computing untuk Guru dan Siswa',
    keperluan: 'Peningkatan kompetensi kejuruan bidang Rekayasa Perangkat Lunak',
    roomId: 'room-1',
    roomNama: 'Aula Utama "Graha Wiyata"',
    hariTanggal: todayStr,
    jamMulai: '08:30',
    jamSelesai: '13:00',
    jumlahPeserta: 180,
    fasilitas: {
      meja: true,
      kursi: true,
      lcd: true,
      sound: true,
      mic: true,
      acKipas: true,
      lainnya: 'Kabel roll listrik 5 titik untuk laptop peserta',
    },
    disetujuiOleh: 'H. Moh. Khoirul Anam, S.T., M.Pd.',
    jabatanPenyetujui: 'Waka Sarana & Prasarana',
    tanggalDisetujui: `${todayStr}T06:50:00.000Z`,
    status: 'DISETUJUI',
    keterangan: 'Pengguna wajib menjaga kebersihan, ketertiban, keamanan, dan mengembalikan fasilitas aula seperti semula.',
    createdAt: `${todayStr}T06:10:00.000Z`,
    updatedAt: `${todayStr}T06:50:00.000Z`,
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-pemohon1',
    targetRole: 'pemohon',
    judul: 'Pengajuan Mobil Disetujui',
    pesan: 'Pengajuan peminjaman mobil PM-2026-00001 telah disetujui oleh Waka Sarpras.',
    link: '/car-borrowings',
    tipe: 'success',
    dibaca: false,
    createdAt: `${todayStr}T06:45:00.000Z`,
  },
  {
    id: 'notif-2',
    targetRole: 'sarpras',
    judul: 'Pengajuan Mobil Baru',
    pesan: 'Pengajuan peminjaman mobil PM-2026-00002 dari Urusan Kesiswaan menunggu persetujuan Anda.',
    link: '/car-borrowings',
    tipe: 'info',
    dibaca: false,
    createdAt: `${todayStr}T07:15:00.000Z`,
  }
];

const INITIAL_STATUS_HISTORY: StatusHistoryItem[] = [
  {
    id: 'sh-1',
    recordId: 'cb-1',
    jenisPengajuan: 'MOBIL',
    statusLama: 'DRAFT',
    statusBaru: 'MENUNGGU PERSETUJUAN',
    userId: 'user-pemohon1',
    userNama: 'Ibu Nurul Hidayati, S.Kom',
    catatan: 'Pengajuan berhasil dibuat dan menunggu persetujuan.',
    timestamp: `${todayStr}T06:00:00.000Z`,
  },
  {
    id: 'sh-2',
    recordId: 'cb-1',
    jenisPengajuan: 'MOBIL',
    statusLama: 'MENUNGGU PERSETUJUAN',
    statusBaru: 'DISETUJUI',
    userId: 'user-sarpras',
    userNama: 'H. Moh. Khoirul Anam, S.T., M.Pd.',
    catatan: 'Pengajuan disetujui. Kendaraan dalam kondisi bersih dan bahan bakar siap.',
    timestamp: `${todayStr}T06:45:00.000Z`,
  },
  {
    id: 'sh-3',
    recordId: 'hb-1',
    jenisPengajuan: 'AULA',
    statusLama: 'DRAFT',
    statusBaru: 'MENUNGGU PERSETUJUAN',
    userId: 'user-pemohon1',
    userNama: 'Ibu Nurul Hidayati, S.Kom',
    catatan: 'Pengajuan berhasil diajukan.',
    timestamp: `${todayStr}T06:10:00.000Z`,
  },
  {
    id: 'sh-4',
    recordId: 'hb-1',
    jenisPengajuan: 'AULA',
    statusLama: 'MENUNGGU PERSETUJUAN',
    statusBaru: 'DISETUJUI',
    userId: 'user-sarpras',
    userNama: 'H. Moh. Khoirul Anam, S.T., M.Pd.',
    catatan: 'Pengajuan penggunaan aula disetujui.',
    timestamp: `${todayStr}T06:50:00.000Z`,
  }
];

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || INITIAL_USERS,
          units: parsed.units || INITIAL_UNITS,
          vehicles: parsed.vehicles || INITIAL_VEHICLES,
          rooms: parsed.rooms || INITIAL_ROOMS,
          facilities: parsed.facilities || INITIAL_FACILITIES,
          carBorrowings: parsed.carBorrowings || INITIAL_CAR_BORROWINGS,
          hallBookings: parsed.hallBookings || INITIAL_HALL_BOOKINGS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          statusHistory: parsed.statusHistory || INITIAL_STATUS_HISTORY,
          settings: parsed.settings || INITIAL_SETTINGS,
        };
      }
    } catch (err) {
      console.error('Failed to read db.json, using defaults:', err);
    }

    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      units: INITIAL_UNITS,
      vehicles: INITIAL_VEHICLES,
      rooms: INITIAL_ROOMS,
      facilities: INITIAL_FACILITIES,
      carBorrowings: INITIAL_CAR_BORROWINGS,
      hallBookings: INITIAL_HALL_BOOKINGS,
      notifications: INITIAL_NOTIFICATIONS,
      statusHistory: INITIAL_STATUS_HISTORY,
      settings: INITIAL_SETTINGS,
    };
    this.save(initial);
    return initial;
  }

  public save(data?: DatabaseSchema) {
    if (data) {
      this.data = data;
    }
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.data[key] = value;
    this.save();
  }

  public getAll(): DatabaseSchema {
    return this.data;
  }
}

export const db = new DatabaseStore();
