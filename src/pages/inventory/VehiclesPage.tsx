import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { Vehicle } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { Truck, Plus, Edit, Trash2, Car, Search, Filter } from 'lucide-react';

export const VehiclesPage: React.FC = () => {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form Fields
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState('Mobil Penumpang (MPV)');
  const [nomorPolisi, setNomorPolisi] = useState('');
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [kapasitas, setKapasitas] = useState<number>(7);
  const [status, setStatus] = useState<'TERSEDIA' | 'DIGUNAKAN' | 'SERVIS' | 'TIDAK AKTIF'>('TERSEDIA');
  const [keterangan, setKeterangan] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isPrivileged = role === 'admin' || role === 'sarpras';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVehicles();
      setVehicles(res.vehicles || []);
    } catch (err: any) {
      error(err?.message || 'Gagal memuat kendaraan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setKode(`KB-0${vehicles.length + 1}`);
    setNama('');
    setJenis('Mobil Penumpang (MPV)');
    setNomorPolisi('');
    setTahun(new Date().getFullYear());
    setKapasitas(7);
    setStatus('TERSEDIA');
    setKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setKode(v.kode);
    setNama(v.nama);
    setJenis(v.jenis);
    setNomorPolisi(v.nomorPolisi);
    setTahun(v.tahun);
    setKapasitas(v.kapasitas);
    setStatus(v.status);
    setKeterangan(v.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, {
          kode,
          nama,
          jenis,
          nomorPolisi,
          tahun,
          kapasitas,
          status,
          keterangan,
        });
        success('Data kendaraan berhasil diperbarui');
      } else {
        await api.createVehicle({
          kode,
          nama,
          jenis,
          nomorPolisi,
          tahun,
          kapasitas,
          status,
          keterangan,
        });
        success('Kendaraan baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menyimpan data kendaraan');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteVehicle(deletingId);
      success('Kendaraan berhasil dihapus');
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menghapus kendaraan');
    }
  };

  const filtered = vehicles.filter((v) => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        v.nama.toLowerCase().includes(s) ||
        v.nomorPolisi.toLowerCase().includes(s) ||
        v.kode.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pengelolaan Data Kendaraan</h2>
            <p className="text-xs text-slate-500">
              Master data armada mobil dinas & operasional SMKN 1 Tegalsari
            </p>
          </div>
        </div>

        {isPrivileged && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Kendaraan
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari kode, nama armada, atau nomor polisi..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Armada</th>
                <th className="py-3 px-4">No. Polisi</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Tahun / Kapasitas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Keterangan</th>
                {isPrivileged && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{v.kode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{v.nama}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{v.nomorPolisi}</td>
                  <td className="py-3 px-4 text-slate-600">{v.jenis}</td>
                  <td className="py-3 px-4 text-slate-600">{v.tahun} • {v.kapasitas} Orang</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={v.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{v.keterangan || '-'}</td>
                  {isPrivileged && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Kendaraan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(v.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Kendaraan"
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

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingVehicle ? 'Edit Data Kendaraan' : 'Tambah Kendaraan Baru'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Kendaraan <span className="text-rose-500">*</span>
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
                  Nomor Polisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomorPolisi}
                  onChange={(e) => setNomorPolisi(e.target.value)}
                  placeholder="P 1234 XX"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kendaraan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Toyota Avanza / Isuzu Elf"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis</label>
                <input
                  type="text"
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun</label>
                <input
                  type="number"
                  value={tahun}
                  onChange={(e) => setTahun(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas</label>
                <input
                  type="number"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kendaraan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="TERSEDIA">TERSEDIA (Dapat Dipinjam)</option>
                <option value="DIGUNAKAN">DIGUNAKAN</option>
                <option value="SERVIS">SERVIS (Bengkel / Perawatan)</option>
                <option value="TIDAK AKTIF">TIDAK AKTIF</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Kondisi</label>
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
                {editingVehicle ? 'Perbarui Kendaraan' : 'Simpan Kendaraan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingId(null)}
          type="delete"
          title="Hapus Data Kendaraan"
          message="Apakah Anda yakin ingin menghapus data kendaraan ini dari master sarana sekolah?"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
