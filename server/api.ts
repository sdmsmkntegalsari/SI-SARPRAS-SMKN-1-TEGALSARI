import express from 'express';
import { db, User, Unit, Vehicle, Room, Facility, CarBorrowing, HallBooking, NotificationItem, StatusHistoryItem, SchoolSettings } from './db.ts';

export const apiRouter = express.Router();
apiRouter.use(express.json({ limit: '25mb' }));

// Helper function to generate unique sequence number
function generateCarBorrowingNumber(): string {
  const year = new Date().getFullYear();
  const prefix = `PM-${year}-`;
  const existing = db.get('carBorrowings');
  const thisYearList = existing.filter(item => item.nomorPengajuan?.startsWith(prefix));
  
  let maxSeq = 0;
  for (const item of thisYearList) {
    const parts = item.nomorPengajuan.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  const nextSeq = (maxSeq + 1).toString().padStart(5, '0');
  return `${prefix}${nextSeq}`;
}

function generateHallBookingNumber(): string {
  const year = new Date().getFullYear();
  const prefix = `AU-${year}-`;
  const existing = db.get('hallBookings');
  const thisYearList = existing.filter(item => item.nomorPengajuan?.startsWith(prefix));
  
  let maxSeq = 0;
  for (const item of thisYearList) {
    const parts = item.nomorPengajuan.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  const nextSeq = (maxSeq + 1).toString().padStart(5, '0');
  return `${prefix}${nextSeq}`;
}

// Time overlapping check
function isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}

// ================= AUTH ROUTES =================
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email wajib diisi' });
  }

  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Pengguna dengan email tersebut tidak ditemukan' });
  }

  if (user.status === 'NONAKTIF') {
    return res.status(403).json({ error: 'Akun Anda berstatus non-aktif. Silakan hubungi Administrator.' });
  }

  // Password verification: simple check or demo fallback
  if (user.password && password && user.password !== password && password !== 'admin123' && password !== 'sarpras123' && password !== 'pemohon123') {
    return res.status(401).json({ error: 'Kata sandi tidak sesuai' });
  }

  const { password: _, ...userSafe } = user;
  return res.json({ user: userSafe });
});

apiRouter.get('/auth/users-quick', (req, res) => {
  const users = db.get('users').map(({ password, ...u }) => u);
  res.json({ users });
});

// ================= USERS ROUTES =================
apiRouter.get('/users', (req, res) => {
  const users = db.get('users').map(({ password, ...u }) => u);
  res.json({ users });
});

apiRouter.post('/users', (req, res) => {
  const { nama, email, role, unitId, status, noHp, jabatan, password } = req.body;
  if (!nama || !email || !role) {
    return res.status(400).json({ error: 'Nama, Email, dan Role wajib diisi' });
  }

  const users = db.get('users');
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email sudah terdaftar dalam sistem' });
  }

  const units = db.get('units');
  const unit = units.find(u => u.id === unitId);

  const newUser: User = {
    id: `user-${Date.now()}`,
    uid: `uid-${Date.now()}`,
    nama,
    email,
    password: password || '123456',
    role,
    unitId,
    unitNama: unit?.nama || '',
    status: status || 'AKTIF',
    noHp,
    jabatan,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  db.set('users', users);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser });
});

apiRouter.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { nama, role, unitId, status, noHp, jabatan, password } = req.body;
  const users = db.get('users');
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
  }

  const units = db.get('units');
  const unit = unitId ? units.find(u => u.id === unitId) : undefined;

  const current = users[index];
  users[index] = {
    ...current,
    nama: nama ?? current.nama,
    role: role ?? current.role,
    unitId: unitId ?? current.unitId,
    unitNama: unit ? unit.nama : current.unitNama,
    status: status ?? current.status,
    noHp: noHp ?? current.noHp,
    jabatan: jabatan ?? current.jabatan,
    password: password ? password : current.password,
    updatedAt: new Date().toISOString(),
  };

  db.set('users', users);
  const { password: _, ...safeUser } = users[index];
  res.json({ user: safeUser });
});

apiRouter.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  let users = db.get('users');
  const target = users.find(u => u.id === id);
  if (!target) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

  // Prevent deleting primary admin
  if (target.email === 'admin@smkn1tegalsari.sch.id') {
    return res.status(400).json({ error: 'Akun Administrator utama tidak dapat dihapus' });
  }

  users = users.filter(u => u.id !== id);
  db.set('users', users);
  res.json({ success: true, message: 'Pengguna berhasil dihapus' });
});

// ================= UNITS ROUTES =================
apiRouter.get('/units', (req, res) => {
  res.json({ units: db.get('units') });
});

apiRouter.post('/units', (req, res) => {
  const { nama, status } = req.body;
  if (!nama) return res.status(400).json({ error: 'Nama unit kerja wajib diisi' });

  const units = db.get('units');
  const newUnit: Unit = {
    id: `unit-${Date.now()}`,
    nama,
    status: status || 'AKTIF',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  units.push(newUnit);
  db.set('units', units);
  res.status(201).json({ unit: newUnit });
});

apiRouter.put('/units/:id', (req, res) => {
  const { id } = req.params;
  const { nama, status } = req.body;
  const units = db.get('units');
  const index = units.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'Unit kerja tidak ditemukan' });

  units[index] = {
    ...units[index],
    nama: nama ?? units[index].nama,
    status: status ?? units[index].status,
    updatedAt: new Date().toISOString(),
  };
  db.set('units', units);
  res.json({ unit: units[index] });
});

apiRouter.delete('/units/:id', (req, res) => {
  const { id } = req.params;
  let units = db.get('units');
  units = units.filter(u => u.id !== id);
  db.set('units', units);
  res.json({ success: true });
});

// ================= VEHICLES ROUTES =================
apiRouter.get('/vehicles', (req, res) => {
  res.json({ vehicles: db.get('vehicles') });
});

apiRouter.post('/vehicles', (req, res) => {
  const { kode, nama, jenis, nomorPolisi, tahun, kapasitas, status, keterangan, foto } = req.body;
  if (!kode || !nama || !nomorPolisi) {
    return res.status(400).json({ error: 'Kode, Nama Kendaraan, dan Nomor Polisi wajib diisi' });
  }

  const vehicles = db.get('vehicles');
  const newVehicle: Vehicle = {
    id: `veh-${Date.now()}`,
    kode,
    nama,
    jenis: jenis || 'Mobil Penumpang',
    nomorPolisi,
    tahun: Number(tahun) || new Date().getFullYear(),
    kapasitas: Number(kapasitas) || 7,
    status: status || 'TERSEDIA',
    keterangan: keterangan || '',
    foto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  vehicles.push(newVehicle);
  db.set('vehicles', vehicles);
  res.status(201).json({ vehicle: newVehicle });
});

apiRouter.put('/vehicles/:id', (req, res) => {
  const { id } = req.params;
  const vehicles = db.get('vehicles');
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });

  vehicles[index] = {
    ...vehicles[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.set('vehicles', vehicles);
  res.json({ vehicle: vehicles[index] });
});

apiRouter.delete('/vehicles/:id', (req, res) => {
  const { id } = req.params;
  let vehicles = db.get('vehicles');
  vehicles = vehicles.filter(v => v.id !== id);
  db.set('vehicles', vehicles);
  res.json({ success: true });
});

// ================= ROOMS ROUTES =================
apiRouter.get('/rooms', (req, res) => {
  res.json({ rooms: db.get('rooms') });
});

apiRouter.post('/rooms', (req, res) => {
  const { kode, nama, kapasitas, lokasi, status, keterangan } = req.body;
  if (!kode || !nama) return res.status(400).json({ error: 'Kode dan Nama ruangan wajib diisi' });

  const rooms = db.get('rooms');
  const newRoom: Room = {
    id: `room-${Date.now()}`,
    kode,
    nama,
    kapasitas: Number(kapasitas) || 100,
    lokasi: lokasi || '',
    status: status || 'TERSEDIA',
    keterangan: keterangan || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  rooms.push(newRoom);
  db.set('rooms', rooms);
  res.status(201).json({ room: newRoom });
});

apiRouter.put('/rooms/:id', (req, res) => {
  const { id } = req.params;
  const rooms = db.get('rooms');
  const index = rooms.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Ruangan tidak ditemukan' });

  rooms[index] = {
    ...rooms[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.set('rooms', rooms);
  res.json({ room: rooms[index] });
});

apiRouter.delete('/rooms/:id', (req, res) => {
  const { id } = req.params;
  let rooms = db.get('rooms');
  rooms = rooms.filter(r => r.id !== id);
  db.set('rooms', rooms);
  res.json({ success: true });
});

// ================= FACILITIES ROUTES =================
apiRouter.get('/facilities', (req, res) => {
  res.json({ facilities: db.get('facilities') });
});

apiRouter.post('/facilities', (req, res) => {
  const { nama, jumlah, kondisi, lokasi, keterangan } = req.body;
  if (!nama) return res.status(400).json({ error: 'Nama fasilitas wajib diisi' });

  const facilities = db.get('facilities');
  const newFacility: Facility = {
    id: `fac-${Date.now()}`,
    nama,
    jumlah: Number(jumlah) || 1,
    kondisi: kondisi || 'BAIK',
    lokasi: lokasi || '',
    keterangan: keterangan || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  facilities.push(newFacility);
  db.set('facilities', facilities);
  res.status(201).json({ facility: newFacility });
});

apiRouter.put('/facilities/:id', (req, res) => {
  const { id } = req.params;
  const facilities = db.get('facilities');
  const index = facilities.findIndex(f => f.id === id);
  if (index === -1) return res.status(404).json({ error: 'Fasilitas tidak ditemukan' });

  facilities[index] = {
    ...facilities[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.set('facilities', facilities);
  res.json({ facility: facilities[index] });
});

apiRouter.delete('/facilities/:id', (req, res) => {
  const { id } = req.params;
  let facilities = db.get('facilities');
  facilities = facilities.filter(f => f.id !== id);
  db.set('facilities', facilities);
  res.json({ success: true });
});

// ================= PEMINJAMAN MOBIL ROUTES =================
// Check car clash
apiRouter.post('/car-borrowings/check-clash', (req, res) => {
  const { vehicleId, hariTanggal, jamBerangkat, perkiraanKembali, excludeId } = req.body;
  if (!vehicleId || !hariTanggal || !jamBerangkat || !perkiraanKembali) {
    return res.status(400).json({ error: 'Parameter pengecekan tidak lengkap' });
  }

  const borrowings = db.get('carBorrowings');
  const clash = borrowings.find(b => {
    if (b.id === excludeId) return false;
    if (b.vehicleId !== vehicleId) return false;
    if (b.hariTanggal !== hariTanggal) return false;
    if (b.status === 'DITOLAK' || b.status === 'DIBATALKAN') return false;

    // Check time overlap
    return isTimeOverlapping(jamBerangkat, perkiraanKembali, b.jamBerangkat, b.perkiraanKembali);
  });

  if (clash) {
    return res.json({
      clash: true,
      message: 'Mohon maaf, kendaraan tersebut sudah digunakan pada tanggal/waktu yang dipilih. Silakan memilih kendaraan atau waktu lain.',
      clashDetail: {
        nomorPengajuan: clash.nomorPengajuan,
        kegiatan: clash.kegiatan,
        pemohonNama: clash.pemohonNama,
        jam: `${clash.jamBerangkat} - ${clash.perkiraanKembali}`,
      }
    });
  }

  res.json({ clash: false });
});

apiRouter.get('/car-borrowings', (req, res) => {
  const { userId, role, status, tanggalAwal, tanggalAkhir } = req.query;
  let borrowings = db.get('carBorrowings');

  // RBAC Filter: pemohon only sees their own
  if (role === 'pemohon' && userId) {
    borrowings = borrowings.filter(b => b.pemohonId === userId);
  }

  if (status) {
    borrowings = borrowings.filter(b => b.status === status);
  }

  if (tanggalAwal) {
    borrowings = borrowings.filter(b => b.hariTanggal >= String(tanggalAwal));
  }

  if (tanggalAkhir) {
    borrowings = borrowings.filter(b => b.hariTanggal <= String(tanggalAkhir));
  }

  // Sort by createdAt descending
  borrowings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ carBorrowings: borrowings });
});

apiRouter.get('/car-borrowings/:id', (req, res) => {
  const { id } = req.params;
  const borrowing = db.get('carBorrowings').find(b => b.id === id);
  if (!borrowing) return res.status(404).json({ error: 'Pengajuan peminjaman mobil tidak ditemukan' });

  // Riwayat status
  const history = db.get('statusHistory').filter(h => h.recordId === id && h.jenisPengajuan === 'MOBIL');
  history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  res.json({ carBorrowing: borrowing, history });
});

apiRouter.post('/car-borrowings', (req, res) => {
  const {
    pemohonId, pemohonNama, unitId, unitNama,
    kegiatan, tujuanRute, kmAwal, perkiraanJarak,
    hariTanggal, jamBerangkat, perkiraanKembali,
    vehicleId, vehicleNama, vehicleNoPol,
    driverNama, driverNoHp, bbmPersen,
    fotoDepan, fotoKanan, fotoKiri, fotoBelakang,
    disetujuiOleh, jabatanPenyetujui, isDraft
  } = req.body;

  // Validation
  if (!pemohonNama || !kegiatan || !hariTanggal || !jamBerangkat || !perkiraanKembali || !vehicleId || !driverNama || !driverNoHp) {
    return res.status(400).json({ error: 'Semua field wajib bertanda * harus diisi dengan lengkap' });
  }

  // Clash check
  const borrowings = db.get('carBorrowings');
  const clash = borrowings.find(b => {
    if (b.vehicleId !== vehicleId) return false;
    if (b.hariTanggal !== hariTanggal) return false;
    if (b.status === 'DITOLAK' || b.status === 'DIBATALKAN') return false;
    return isTimeOverlapping(jamBerangkat, perkiraanKembali, b.jamBerangkat, b.perkiraanKembali);
  });

  if (clash) {
    return res.status(400).json({
      error: 'Mohon maaf, kendaraan tersebut sudah digunakan pada tanggal/waktu yang dipilih. Silakan memilih kendaraan atau waktu lain.'
    });
  }

  const id = `cb-${Date.now()}`;
  const nomorPengajuan = generateCarBorrowingNumber();
  const initialStatus = isDraft ? 'DRAFT' : 'MENUNGGU PERSETUJUAN';

  const newBorrowing: CarBorrowing = {
    id,
    nomorPengajuan,
    pemohonId: pemohonId || 'anon',
    pemohonNama,
    unitId: unitId || '',
    unitNama: unitNama || '',
    kegiatan,
    tujuanRute,
    kmAwal: Number(kmAwal) || 0,
    perkiraanJarak: perkiraanJarak || '',
    hariTanggal,
    jamBerangkat,
    perkiraanKembali,
    vehicleId,
    vehicleNama,
    vehicleNoPol: vehicleNoPol || '',
    driverNama,
    driverNoHp,
    bbmPersen: Number(bbmPersen) || 100,
    fotoDepan: fotoDepan || '',
    fotoKanan: fotoKanan || '',
    fotoKiri: fotoKiri || '',
    fotoBelakang: fotoBelakang || '',
    disetujuiOleh: disetujuiOleh || '',
    jabatanPenyetujui: jabatanPenyetujui || '',
    status: initialStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  borrowings.unshift(newBorrowing);
  db.set('carBorrowings', borrowings);

  // Status History
  const history = db.get('statusHistory');
  const historyItem: StatusHistoryItem = {
    id: `sh-${Date.now()}`,
    recordId: id,
    jenisPengajuan: 'MOBIL',
    statusLama: 'BUAT BARU',
    statusBaru: initialStatus,
    userId: pemohonId || '',
    userNama: pemohonNama,
    catatan: isDraft ? 'Pengajuan disimpan sebagai draf.' : 'Pengajuan berhasil dibuat dan menunggu persetujuan.',
    timestamp: new Date().toISOString(),
  };
  history.push(historyItem);
  db.set('statusHistory', history);

  // Notification for Sarpras & Admin
  const notifications = db.get('notifications');
  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetRole: 'sarpras',
    judul: 'Pengajuan Mobil Baru',
    pesan: `Pengajuan peminjaman ${nomorPengajuan} (${kegiatan}) diajukan oleh ${pemohonNama}.`,
    link: `/car-borrowings`,
    tipe: 'info',
    dibaca: false,
    createdAt: new Date().toISOString(),
  });
  db.set('notifications', notifications);

  res.status(201).json({
    carBorrowing: newBorrowing,
    message: 'Pengajuan berhasil dibuat dan menunggu persetujuan.'
  });
});

// Update status (Approve, Reject, Cancel, Complete)
apiRouter.post('/car-borrowings/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, userId, userNama, userRole, catatan, pejabatNama, pejabatJabatan } = req.body;
  const borrowings = db.get('carBorrowings');
  const index = borrowings.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
  }

  const current = borrowings[index];
  const oldStatus = current.status;
  let newStatus = current.status;
  let notifMessage = '';
  let notifType: 'success' | 'danger' | 'warning' | 'info' = 'info';

  if (action === 'APPROVE') {
    if (userRole !== 'admin' && userRole !== 'sarpras') {
      return res.status(403).json({ error: 'Hanya Admin atau Petugas Sarpras yang berhak menyetujui pengajuan' });
    }
    newStatus = 'DISETUJUI';
    current.disetujuiOleh = pejabatNama || userNama || 'Waka Sarpras';
    current.jabatanPenyetujui = pejabatJabatan || 'Waka Sarana & Prasarana';
    current.tanggalDisetujui = new Date().toISOString();
    current.catatanPetugas = catatan || '';
    notifMessage = `Pengajuan ${current.nomorPengajuan} Anda telah disetujui.`;
    notifType = 'success';
  } else if (action === 'REJECT') {
    if (userRole !== 'admin' && userRole !== 'sarpras') {
      return res.status(403).json({ error: 'Hanya Admin atau Petugas Sarpras yang berhak menolak pengajuan' });
    }
    newStatus = 'DITOLAK';
    current.catatanPetugas = catatan || 'Pengajuan tidak disetujui';
    notifMessage = `Pengajuan ${current.nomorPengajuan} Anda ditolak: ${catatan || 'Kebutuhan jadwal bentrok atau unit dalam perbaikan.'}`;
    notifType = 'danger';
  } else if (action === 'CANCEL') {
    // Pemohon can cancel only if status is DRAFT or MENUNGGU PERSETUJUAN
    if (current.status !== 'DRAFT' && current.status !== 'MENUNGGU PERSETUJUAN' && userRole === 'pemohon') {
      return res.status(400).json({ error: 'Pengajuan yang sudah diproses tidak dapat dibatalkan secara mandiri' });
    }
    newStatus = 'DIBATALKAN';
    current.catatanPetugas = catatan || 'Dibatalkan oleh pemohon';
    notifMessage = `Pengajuan ${current.nomorPengajuan} telah dibatalkan.`;
    notifType = 'warning';
  } else if (action === 'COMPLETE') {
    if (userRole !== 'admin' && userRole !== 'sarpras') {
      return res.status(403).json({ error: 'Hanya petugas yang berhak menyelesaikan kegiatan' });
    }
    newStatus = 'SELESAI';
    current.catatanPetugas = catatan || 'Kegiatan telah selesai, kendaraan dikembalikan.';
    notifMessage = `Kegiatan peminjaman ${current.nomorPengajuan} telah selesai dan kendaraan kembali.`;
    notifType = 'success';
  } else {
    return res.status(400).json({ error: 'Aksi tidak valid' });
  }

  current.status = newStatus as any;
  current.updatedAt = new Date().toISOString();
  borrowings[index] = current;
  db.set('carBorrowings', borrowings);

  // Status history
  const history = db.get('statusHistory');
  history.push({
    id: `sh-${Date.now()}`,
    recordId: id,
    jenisPengajuan: 'MOBIL',
    statusLama: oldStatus,
    statusBaru: newStatus,
    userId: userId || '',
    userNama: userNama || 'Petugas',
    catatan: catatan || `Perubahan status menjadi ${newStatus}`,
    timestamp: new Date().toISOString(),
  });
  db.set('statusHistory', history);

  // Send Notification to Pemohon
  if (current.pemohonId) {
    const notifications = db.get('notifications');
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: current.pemohonId,
      judul: `Status Pengajuan ${current.nomorPengajuan}`,
      pesan: notifMessage,
      link: `/car-borrowings`,
      tipe: notifType,
      dibaca: false,
      createdAt: new Date().toISOString(),
    });
    db.set('notifications', notifications);
  }

  res.json({
    carBorrowing: current,
    message: notifMessage,
  });
});

// ================= PENGGUNAAN AULA ROUTES =================
// Check aula clash
apiRouter.post('/hall-bookings/check-clash', (req, res) => {
  const { roomId, hariTanggal, jamMulai, jamSelesai, excludeId } = req.body;
  if (!hariTanggal || !jamMulai || !jamSelesai) {
    return res.status(400).json({ error: 'Parameter pengecekan tidak lengkap' });
  }

  const bookings = db.get('hallBookings');
  const clash = bookings.find(b => {
    if (b.id === excludeId) return false;
    if (roomId && b.roomId && b.roomId !== roomId) return false;
    if (b.hariTanggal !== hariTanggal) return false;
    if (b.status === 'DITOLAK' || b.status === 'DIBATALKAN') return false;

    return isTimeOverlapping(jamMulai, jamSelesai, b.jamMulai, b.jamSelesai);
  });

  if (clash) {
    return res.json({
      clash: true,
      message: 'Tanggal dan waktu aula telah digunakan. Silakan memilih waktu lain.',
      clashDetail: {
        nomorPengajuan: clash.nomorPengajuan,
        namaKegiatan: clash.namaKegiatan,
        pemohonNama: clash.pemohonNama,
        jam: `${clash.jamMulai} - ${clash.jamSelesai}`,
      }
    });
  }

  res.json({ clash: false });
});

apiRouter.get('/hall-bookings', (req, res) => {
  const { userId, role, status, tanggalAwal, tanggalAkhir } = req.query;
  let bookings = db.get('hallBookings');

  if (role === 'pemohon' && userId) {
    bookings = bookings.filter(b => b.pemohonId === userId);
  }

  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }

  if (tanggalAwal) {
    bookings = bookings.filter(b => b.hariTanggal >= String(tanggalAwal));
  }

  if (tanggalAkhir) {
    bookings = bookings.filter(b => b.hariTanggal <= String(tanggalAkhir));
  }

  bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ hallBookings: bookings });
});

apiRouter.get('/hall-bookings/:id', (req, res) => {
  const { id } = req.params;
  const booking = db.get('hallBookings').find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Pengajuan penggunaan aula tidak ditemukan' });

  const history = db.get('statusHistory').filter(h => h.recordId === id && h.jenisPengajuan === 'AULA');
  history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  res.json({ hallBooking: booking, history });
});

apiRouter.post('/hall-bookings', (req, res) => {
  const {
    pemohonId, pemohonNama, unitId, unitNama,
    namaKegiatan, keperluan, roomId, roomNama,
    hariTanggal, jamMulai, jamSelesai, jumlahPeserta,
    fasilitas, disetujuiOleh, jabatanPenyetujui, keterangan, isDraft
  } = req.body;

  if (!pemohonNama || !namaKegiatan || !hariTanggal || !jamMulai || !jamSelesai || !jumlahPeserta) {
    return res.status(400).json({ error: 'Semua field wajib bertanda * harus diisi dengan lengkap' });
  }

  // Clash check
  const bookings = db.get('hallBookings');
  const clash = bookings.find(b => {
    if (roomId && b.roomId && b.roomId !== roomId) return false;
    if (b.hariTanggal !== hariTanggal) return false;
    if (b.status === 'DITOLAK' || b.status === 'DIBATALKAN') return false;
    return isTimeOverlapping(jamMulai, jamSelesai, b.jamMulai, b.jamSelesai);
  });

  if (clash) {
    return res.status(400).json({
      error: 'Tanggal dan waktu aula telah digunakan. Silakan memilih waktu lain.'
    });
  }

  const id = `hb-${Date.now()}`;
  const nomorPengajuan = generateHallBookingNumber();
  const initialStatus = isDraft ? 'DRAFT' : 'MENUNGGU PERSETUJUAN';

  const newBooking: HallBooking = {
    id,
    nomorPengajuan,
    pemohonId: pemohonId || 'anon',
    pemohonNama,
    unitId: unitId || '',
    unitNama: unitNama || '',
    namaKegiatan,
    keperluan: keperluan || '',
    roomId: roomId || 'room-1',
    roomNama: roomNama || 'Aula Utama "Graha Wiyata"',
    hariTanggal,
    jamMulai,
    jamSelesai,
    jumlahPeserta: Number(jumlahPeserta) || 1,
    fasilitas: fasilitas || {
      meja: false, kursi: true, lcd: true, sound: true, mic: true, acKipas: true, lainnya: ''
    },
    disetujuiOleh: disetujuiOleh || '',
    jabatanPenyetujui: jabatanPenyetujui || '',
    status: initialStatus,
    keterangan: keterangan || 'Pengguna wajib menjaga kebersihan, ketertiban, keamanan, dan mengembalikan fasilitas aula seperti semula.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookings.unshift(newBooking);
  db.set('hallBookings', bookings);

  // Status History
  const history = db.get('statusHistory');
  history.push({
    id: `sh-${Date.now()}`,
    recordId: id,
    jenisPengajuan: 'AULA',
    statusLama: 'BUAT BARU',
    statusBaru: initialStatus,
    userId: pemohonId || '',
    userNama: pemohonNama,
    catatan: isDraft ? 'Pengajuan draf penggunaan aula disimpan.' : 'Pengajuan berhasil dibuat dan menunggu persetujuan.',
    timestamp: new Date().toISOString(),
  });
  db.set('statusHistory', history);

  // Notification for Sarpras & Admin
  const notifications = db.get('notifications');
  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetRole: 'sarpras',
    judul: 'Pengajuan Aula Baru',
    pesan: `Pengajuan aula ${nomorPengajuan} (${namaKegiatan}) diajukan oleh ${pemohonNama}.`,
    link: `/hall-bookings`,
    tipe: 'info',
    dibaca: false,
    createdAt: new Date().toISOString(),
  });
  db.set('notifications', notifications);

  res.status(201).json({
    hallBooking: newBooking,
    message: 'Pengajuan berhasil dibuat dan menunggu persetujuan.'
  });
});

apiRouter.post('/hall-bookings/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, userId, userNama, userRole, catatan, pejabatNama, pejabatJabatan } = req.body;
  const bookings = db.get('hallBookings');
  const index = bookings.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Pengajuan aula tidak ditemukan' });
  }

  const current = bookings[index];
  const oldStatus = current.status;
  let newStatus = current.status;
  let notifMessage = '';
  let notifType: 'success' | 'danger' | 'warning' | 'info' = 'info';

  if (action === 'APPROVE') {
    if (userRole !== 'admin' && userRole !== 'sarpras') {
      return res.status(403).json({ error: 'Hanya Admin atau Petugas Sarpras yang berhak menyetujui pengajuan' });
    }
    newStatus = 'DISETUJUI';
    current.disetujuiOleh = pejabatNama || userNama || 'Waka Sarpras';
    current.jabatanPenyetujui = pejabatJabatan || 'Waka Sarana & Prasarana';
    current.tanggalDisetujui = new Date().toISOString();
    current.catatanPetugas = catatan || '';
    notifMessage = `Pengajuan ${current.nomorPengajuan} Anda telah disetujui.`;
    notifType = 'success';
  } else if (action === 'REJECT') {
    if (userRole !== 'admin' && userRole !== 'sarpras') {
      return res.status(403).json({ error: 'Hanya Admin atau Petugas Sarpras yang berhak menolak pengajuan' });
    }
    newStatus = 'DITOLAK';
    current.catatanPetugas = catatan || 'Pengajuan aula ditolak';
    notifMessage = `Pengajuan ${current.nomorPengajuan} Anda ditolak: ${catatan || 'Jadwal bertabrakan atau ruangan dipakai dinas.'}`;
    notifType = 'danger';
  } else if (action === 'CANCEL') {
    if (current.status !== 'DRAFT' && current.status !== 'MENUNGGU PERSETUJUAN' && userRole === 'pemohon') {
      return res.status(400).json({ error: 'Pengajuan yang sudah diproses tidak dapat dibatalkan secara mandiri' });
    }
    newStatus = 'DIBATALKAN';
    current.catatanPetugas = catatan || 'Dibatalkan oleh pemohon';
    notifMessage = `Pengajuan ${current.nomorPengajuan} telah dibatalkan.`;
    notifType = 'warning';
  } else if (action === 'COMPLETE') {
    if (userRole !== 'admin' && userRole !== 'sarpras') {
      return res.status(403).json({ error: 'Hanya petugas yang berhak menyelesaikan kegiatan' });
    }
    newStatus = 'SELESAI';
    current.catatanPetugas = catatan || 'Kegiatan telah selesai, fasilitas telah dirapikan.';
    notifMessage = `Kegiatan ${current.nomorPengajuan} di aula telah selesai.`;
    notifType = 'success';
  } else {
    return res.status(400).json({ error: 'Aksi tidak valid' });
  }

  current.status = newStatus as any;
  current.updatedAt = new Date().toISOString();
  bookings[index] = current;
  db.set('hallBookings', bookings);

  // Status history
  const history = db.get('statusHistory');
  history.push({
    id: `sh-${Date.now()}`,
    recordId: id,
    jenisPengajuan: 'AULA',
    statusLama: oldStatus,
    statusBaru: newStatus,
    userId: userId || '',
    userNama: userNama || 'Petugas',
    catatan: catatan || `Perubahan status menjadi ${newStatus}`,
    timestamp: new Date().toISOString(),
  });
  db.set('statusHistory', history);

  // Notification to Pemohon
  if (current.pemohonId) {
    const notifications = db.get('notifications');
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: current.pemohonId,
      judul: `Status Pengajuan ${current.nomorPengajuan}`,
      pesan: notifMessage,
      link: `/hall-bookings`,
      tipe: notifType,
      dibaca: false,
      createdAt: new Date().toISOString(),
    });
    db.set('notifications', notifications);
  }

  res.json({
    hallBooking: current,
    message: notifMessage,
  });
});

// ================= DASHBOARD & STATS ROUTES =================
apiRouter.get('/dashboard', (req, res) => {
  const { userId, role } = req.query;
  const today = new Date().toISOString().split('T')[0];

  let carBorrowings = db.get('carBorrowings');
  let hallBookings = db.get('hallBookings');

  // If role is pemohon, stats can also focus on their filings or school stats
  const totalPengajuanMobil = carBorrowings.length;
  const totalPengajuanAula = hallBookings.length;
  const totalPengajuan = totalPengajuanMobil + totalPengajuanAula;

  const allItems = [
    ...carBorrowings.map(c => ({ ...c, tipe: 'MOBIL' })),
    ...hallBookings.map(h => ({ ...h, tipe: 'AULA' })),
  ];

  const menungguPersetujuan = allItems.filter(i => i.status === 'MENUNGGU PERSETUJUAN').length;
  const disetujui = allItems.filter(i => i.status === 'DISETUJUI').length;
  const ditolak = allItems.filter(i => i.status === 'DITOLAK').length;

  const peminjamanMobilHariIni = carBorrowings.filter(c => c.hariTanggal === today && (c.status === 'DISETUJUI' || c.status === 'SELESAI')).length;
  const penggunaanAulaHariIni = hallBookings.filter(h => h.hariTanggal === today && (h.status === 'DISETUJUI' || h.status === 'SELESAI')).length;

  // Monthly stats for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();
  const monthlyData = months.map((m, idx) => {
    const monthPrefix = `${currentYear}-${(idx + 1).toString().padStart(2, '0')}`;
    const carCount = carBorrowings.filter(c => c.hariTanggal.startsWith(monthPrefix)).length;
    const hallCount = hallBookings.filter(h => h.hariTanggal.startsWith(monthPrefix)).length;
    return {
      bulan: m,
      mobil: carCount,
      aula: hallCount,
      total: carCount + hallCount,
    };
  });

  // Recent applications (up to 7)
  let recentList = [
    ...carBorrowings.map(c => ({
      id: c.id,
      tipe: 'MOBIL' as const,
      nomorPengajuan: c.nomorPengajuan,
      pemohonNama: c.pemohonNama,
      unitNama: c.unitNama,
      kegiatan: c.kegiatan,
      itemInfo: `${c.vehicleNama} (${c.vehicleNoPol})`,
      hariTanggal: c.hariTanggal,
      waktu: `${c.jamBerangkat} - ${c.perkiraanKembali}`,
      status: c.status,
      createdAt: c.createdAt,
    })),
    ...hallBookings.map(h => ({
      id: h.id,
      tipe: 'AULA' as const,
      nomorPengajuan: h.nomorPengajuan,
      pemohonNama: h.pemohonNama,
      unitNama: h.unitNama,
      kegiatan: h.namaKegiatan,
      itemInfo: h.roomNama,
      hariTanggal: h.hariTanggal,
      waktu: `${h.jamMulai} - ${h.jamSelesai}`,
      status: h.status,
      createdAt: h.createdAt,
    }))
  ];

  if (role === 'pemohon' && userId) {
    recentList = recentList.filter(item => {
      const orig = carBorrowings.find(c => c.id === item.id) || hallBookings.find(h => h.id === item.id);
      return orig?.pemohonId === userId;
    });
  }

  recentList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    metrics: {
      totalPengajuan,
      menungguPersetujuan,
      disetujui,
      ditolak,
      peminjamanMobilHariIni,
      penggunaanAulaHariIni,
      totalMobil: db.get('vehicles').length,
      totalRuangan: db.get('rooms').length,
      totalFasilitas: db.get('facilities').length,
    },
    monthlyData,
    recentList: recentList.slice(0, 7),
  });
});

// ================= KALENDER CONSOLIDATED =================
apiRouter.get('/calendar-events', (req, res) => {
  const { tipe, status } = req.query;
  const carBorrowings = db.get('carBorrowings');
  const hallBookings = db.get('hallBookings');

  let events: any[] = [];

  if (!tipe || tipe === 'SEMUA' || tipe === 'MOBIL') {
    for (const c of carBorrowings) {
      if (status && status !== 'SEMUA' && c.status !== status) continue;
      events.push({
        id: c.id,
        tipe: 'MOBIL',
        title: `[Mobil] ${c.kegiatan}`,
        subTitle: `${c.vehicleNama} (${c.vehicleNoPol})`,
        tanggal: c.hariTanggal,
        jam: `${c.jamBerangkat} - ${c.perkiraanKembali}`,
        pemohon: c.pemohonNama,
        unit: c.unitNama,
        status: c.status,
        nomorPengajuan: c.nomorPengajuan,
        raw: c,
      });
    }
  }

  if (!tipe || tipe === 'SEMUA' || tipe === 'AULA') {
    for (const h of hallBookings) {
      if (status && status !== 'SEMUA' && h.status !== status) continue;
      events.push({
        id: h.id,
        tipe: 'AULA',
        title: `[Aula] ${h.namaKegiatan}`,
        subTitle: h.roomNama,
        tanggal: h.hariTanggal,
        jam: `${h.jamMulai} - ${h.jamSelesai}`,
        pemohon: h.pemohonNama,
        unit: h.unitNama,
        status: h.status,
        nomorPengajuan: h.nomorPengajuan,
        raw: h,
      });
    }
  }

  // Sort by date then jam
  events.sort((a, b) => {
    if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal);
    return a.jam.localeCompare(b.jam);
  });

  res.json({ events });
});

// ================= NOTIFICATIONS =================
apiRouter.get('/notifications', (req, res) => {
  const { userId, role } = req.query;
  let notifications = db.get('notifications');

  // Filter based on userId or targetRole
  notifications = notifications.filter(n => {
    if (n.userId && n.userId === userId) return true;
    if (n.targetRole === 'semua') return true;
    if (role && n.targetRole === role) return true;
    if (role === 'admin') return true;
    return false;
  });

  res.json({ notifications });
});

apiRouter.post('/notifications/mark-read', (req, res) => {
  const { id } = req.body;
  const notifications = db.get('notifications');
  if (id === 'all') {
    notifications.forEach(n => { n.dibaca = true; });
  } else {
    const item = notifications.find(n => n.id === id);
    if (item) item.dibaca = true;
  }
  db.set('notifications', notifications);
  res.json({ success: true });
});

// ================= SETTINGS =================
apiRouter.get('/settings', (req, res) => {
  res.json({ settings: db.get('settings') });
});

apiRouter.put('/settings', (req, res) => {
  const current = db.get('settings');
  const updated: SchoolSettings = {
    ...current,
    ...req.body,
  };
  db.set('settings', updated);
  res.json({ settings: updated, message: 'Pengaturan sekolah berhasil diperbarui' });
});

// ================= REPORT SUMMARY =================
apiRouter.get('/reports', (req, res) => {
  const { jenis, status, unitId, tanggalAwal, tanggalAkhir } = req.query;
  const carBorrowings = db.get('carBorrowings');
  const hallBookings = db.get('hallBookings');

  let list: any[] = [];

  if (!jenis || jenis === 'SEMUA' || jenis === 'MOBIL') {
    let filteredCars = carBorrowings;
    if (status && status !== 'SEMUA') filteredCars = filteredCars.filter(c => c.status === status);
    if (unitId && unitId !== 'SEMUA') filteredCars = filteredCars.filter(c => c.unitId === unitId);
    if (tanggalAwal) filteredCars = filteredCars.filter(c => c.hariTanggal >= String(tanggalAwal));
    if (tanggalAkhir) filteredCars = filteredCars.filter(c => c.hariTanggal <= String(tanggalAkhir));

    list.push(...filteredCars.map(c => ({
      id: c.id,
      jenis: 'Peminjaman Mobil',
      tipe: 'MOBIL',
      nomor: c.nomorPengajuan,
      pemohon: c.pemohonNama,
      unit: c.unitNama,
      kegiatan: c.kegiatan,
      sarana: `${c.vehicleNama} (${c.vehicleNoPol})`,
      tanggal: c.hariTanggal,
      waktu: `${c.jamBerangkat} - ${c.perkiraanKembali}`,
      status: c.status,
      disetujuiOleh: c.disetujuiOleh || '-',
    })));
  }

  if (!jenis || jenis === 'SEMUA' || jenis === 'AULA') {
    let filteredHalls = hallBookings;
    if (status && status !== 'SEMUA') filteredHalls = filteredHalls.filter(h => h.status === status);
    if (unitId && unitId !== 'SEMUA') filteredHalls = filteredHalls.filter(h => h.unitId === unitId);
    if (tanggalAwal) filteredHalls = filteredHalls.filter(h => h.hariTanggal >= String(tanggalAwal));
    if (tanggalAkhir) filteredHalls = filteredHalls.filter(h => h.hariTanggal <= String(tanggalAkhir));

    list.push(...filteredHalls.map(h => ({
      id: h.id,
      jenis: 'Penggunaan Aula',
      tipe: 'AULA',
      nomor: h.nomorPengajuan,
      pemohon: h.pemohonNama,
      unit: h.unitNama,
      kegiatan: h.namaKegiatan,
      sarana: h.roomNama,
      tanggal: h.hariTanggal,
      waktu: `${h.jamMulai} - ${h.jamSelesai}`,
      status: h.status,
      disetujuiOleh: h.disetujuiOleh || '-',
    })));
  }

  // Sort by date descending
  list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  // Summary counts
  const summary = {
    total: list.length,
    disetujui: list.filter(l => l.status === 'DISETUJUI').length,
    menunggu: list.filter(l => l.status === 'MENUNGGU PERSETUJUAN').length,
    ditolak: list.filter(l => l.status === 'DITOLAK').length,
    selesai: list.filter(l => l.status === 'SELESAI').length,
  };

  res.json({ data: list, summary });
});
