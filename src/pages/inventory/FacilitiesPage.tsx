import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { Facility } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { Wrench, Plus, Edit, Trash2, Search, CheckCircle, Package } from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  const [nama, setNama] = useState('');
  const [jumlah, setJumlah] = useState<number>(1);
  const [kondisi, setKondisi] = useState<'BAIK' | 'RUSAK RINGAN' | 'RUSAK BERAT'>('BAIK');
  const [lokasi, setLokasi] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isPrivileged = role === 'admin' || role === 'sarpras';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFacilities();
      setFacilities(res.facilities || []);
    } catch (err: any) {
      error(err?.message || 'Gagal memuat data fasilitas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingFacility(null);
    setNama('');
    setJumlah(10);
    setKondisi('BAIK');
    setLokasi('Gudang Sarpras SMKN 1 Tegalsari');
    setKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (f: Facility) => {
    setEditingFacility(f);
    setNama(f.nama);
    setJumlah(f.jumlah);
    setKondisi(f.kondisi);
    setLokasi(f.lokasi);
    setKeterangan(f.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFacility) {
        await api.updateFacility(editingFacility.id, {
          nama,
          jumlah,
          kondisi,
          lokasi,
          keterangan,
        });
        success('Data fasilitas berhasil diperbarui');
      } else {
        await api.createFacility({
          nama,
          jumlah,
          kondisi,
          lokasi,
          keterangan,
        });
        success('Fasilitas baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menyimpan fasilitas');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteFacility(deletingId);
      success('Fasilitas berhasil dihapus');
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menghapus fasilitas');
    }
  };

  const filtered = facilities.filter((f) => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return f.nama.toLowerCase().includes(s) || f.lokasi.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pengelolaan Fasilitas & Alat</h2>
            <p className="text-xs text-slate-500">
              Inventaris perlengkapan aula, proyektor, audio, kursi, dan sarpras penunjang kegiatan
            </p>
          </div>
        </div>

        {isPrivileged && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Fasilitas
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama fasilitas atau lokasi penyimpanan..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Nama Fasilitas / Alat</th>
                <th className="py-3 px-4">Jumlah Unit</th>
                <th className="py-3 px-4">Kondisi</th>
                <th className="py-3 px-4">Lokasi Penyimpanan</th>
                <th className="py-3 px-4">Keterangan</th>
                {isPrivileged && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{f.nama}</td>
                  <td className="py-3 px-4 font-bold text-indigo-700">{f.jumlah} Unit</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={f.kondisi} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-600">{f.lokasi}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{f.keterangan || '-'}</td>
                  {isPrivileged && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Fasilitas"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(f.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Fasilitas"
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
          title={editingFacility ? 'Edit Data Fasilitas' : 'Tambah Fasilitas Baru'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Fasilitas / Alat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Sound System Yamaha / Kursi Lipat"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Unit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kondisi</label>
                <select
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="BAIK">BAIK (Siap Pakai)</option>
                  <option value="RUSAK RINGAN">RUSAK RINGAN</option>
                  <option value="RUSAK BERAT">RUSAK BERAT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Penyimpanan</label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Gudang Aula / Ruang Multimedia"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan Tambahan</label>
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
                {editingFacility ? 'Perbarui Fasilitas' : 'Simpan Fasilitas'}
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
          title="Hapus Fasilitas"
          message="Apakah Anda yakin ingin menghapus data fasilitas ini?"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
