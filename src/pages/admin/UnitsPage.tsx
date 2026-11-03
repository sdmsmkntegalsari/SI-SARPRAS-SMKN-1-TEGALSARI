import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { Unit } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { Layers, Plus, Edit, Trash2, Search, Power } from 'lucide-react';

export const UnitsPage: React.FC = () => {
  const { success, error } = useToast();

  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [nama, setNama] = useState('');
  const [status, setStatus] = useState<'AKTIF' | 'NONAKTIF'>('AKTIF');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getUnits();
      setUnits(res.units || []);
    } catch (err: any) {
      error(err?.message || 'Gagal memuat unit kerja');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingUnit(null);
    setNama('');
    setStatus('AKTIF');
    setIsModalOpen(true);
  };

  const openEditModal = (u: Unit) => {
    setEditingUnit(u);
    setNama(u.nama);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await api.updateUnit(editingUnit.id, { nama, status });
        success('Unit kerja berhasil diperbarui');
      } else {
        await api.createUnit({ nama, status });
        success('Unit kerja baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menyimpan unit kerja');
    }
  };

  const toggleStatus = async (u: Unit) => {
    const nextStatus = u.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
    try {
      await api.updateUnit(u.id, { status: nextStatus });
      success(`Unit ${u.nama} diubah menjadi ${nextStatus}`);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal mengubah status unit');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteUnit(deletingId);
      success('Unit kerja berhasil dihapus');
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menghapus unit kerja');
    }
  };

  const filtered = units.filter((u) => {
    if (searchTerm) {
      return u.nama.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Unit Kerja & Program Keahlian</h2>
            <p className="text-xs text-slate-500">
              Master data kejuruan, program keahlian, dan bagian tata usaha SMKN 1 Tegalsari
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Unit Kerja
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama unit kerja atau program keahlian..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Nama Unit Kerja / Program Keahlian</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terdaftar Sejak</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.nama}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={u.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`p-1.5 rounded-lg transition ${
                          u.status === 'AKTIF'
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'AKTIF' ? 'Nonaktifkan Unit' : 'Aktifkan Unit'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Unit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(u.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Unit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
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
          title={editingUnit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Unit Kerja / Program Keahlian <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Rekayasa Perangkat Lunak (RPL)"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="AKTIF">AKTIF</option>
                <option value="NONAKTIF">NONAKTIF</option>
              </select>
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
                {editingUnit ? 'Perbarui Unit' : 'Simpan Unit'}
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
          title="Hapus Unit Kerja"
          message="Apakah Anda yakin ingin menghapus data unit kerja ini?"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
