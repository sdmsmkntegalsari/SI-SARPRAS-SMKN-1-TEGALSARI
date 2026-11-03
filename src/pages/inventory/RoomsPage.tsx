import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { Room } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { DoorOpen, Plus, Edit, Trash2, Search, MapPin, Users } from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kapasitas, setKapasitas] = useState<number>(100);
  const [lokasi, setLokasi] = useState('');
  const [status, setStatus] = useState<'TERSEDIA' | 'DIGUNAKAN' | 'PERBAIKAN' | 'TIDAK AKTIF'>('TERSEDIA');
  const [keterangan, setKeterangan] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isPrivileged = role === 'admin' || role === 'sarpras';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRooms();
      setRooms(res.rooms || []);
    } catch (err: any) {
      error(err?.message || 'Gagal memuat data ruangan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setKode(`RUANG-0${rooms.length + 1}`);
    setNama('');
    setKapasitas(100);
    setLokasi('Gedung Utama SMKN 1 Tegalsari');
    setStatus('TERSEDIA');
    setKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Room) => {
    setEditingRoom(r);
    setKode(r.kode);
    setNama(r.nama);
    setKapasitas(r.kapasitas);
    setLokasi(r.lokasi);
    setStatus(r.status);
    setKeterangan(r.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, {
          kode,
          nama,
          kapasitas,
          lokasi,
          status,
          keterangan,
        });
        success('Data ruangan berhasil diperbarui');
      } else {
        await api.createRoom({
          kode,
          nama,
          kapasitas,
          lokasi,
          status,
          keterangan,
        });
        success('Ruangan baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menyimpan data ruangan');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteRoom(deletingId);
      success('Ruangan berhasil dihapus');
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menghapus ruangan');
    }
  };

  const filtered = rooms.filter((r) => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        r.nama.toLowerCase().includes(s) ||
        r.kode.toLowerCase().includes(s) ||
        r.lokasi.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pengelolaan Data Ruangan</h2>
            <p className="text-xs text-slate-500">
              Master data aula, gedung serbaguna, dan ruang rapat SMKN 1 Tegalsari
            </p>
          </div>
        </div>

        {isPrivileged && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Ruangan
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama ruangan, kode, atau lokasi..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Ruangan</th>
                <th className="py-3 px-4">Kapasitas</th>
                <th className="py-3 px-4">Lokasi Gedung</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Keterangan</th>
                {isPrivileged && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{r.kode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.nama}</td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">{r.kapasitas} Orang</td>
                  <td className="py-3 px-4 text-slate-600">{r.lokasi}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{r.keterangan || '-'}</td>
                  {isPrivileged && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Ruangan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(r.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Ruangan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRoom ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kapasitas (Orang) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Ruangan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Aula Utama Graha Wiyata"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Gedung</label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Gedung Utama Lantai 2"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Ruangan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="TERSEDIA">TERSEDIA (Dapat Dipakai)</option>
                <option value="DIGUNAKAN">DIGUNAKAN</option>
                <option value="PERBAIKAN">PERBAIKAN / RENOVASI</option>
                <option value="TIDAK AKTIF">TIDAK AKTIF</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Fasilitas Ruangan</label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={2}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                {editingRoom ? 'Perbarui Ruangan' : 'Simpan Ruangan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingId(null)}
          type="delete"
          title="Hapus Ruangan"
          message="Apakah Anda yakin ingin menghapus data ruangan ini dari master sistem?"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
