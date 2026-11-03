import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { User, Unit, UserRole } from '../../types/index.ts';
import { RoleBadge, StatusBadge } from '../../components/common/Badge.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { Users, Plus, Edit, Trash2, Search, ShieldCheck } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('pemohon');
  const [unitId, setUnitId] = useState('');
  const [status, setStatus] = useState<'AKTIF' | 'NONAKTIF'>('AKTIF');
  const [noHp, setNoHp] = useState('');
  const [jabatan, setJabatan] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [uRes, unitRes] = await Promise.all([api.getUsers(), api.getUnits()]);
      setUsers(uRes.users || []);
      setUnits(unitRes.units || []);
    } catch (err: any) {
      error(err?.message || 'Gagal memuat pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setNama('');
    setEmail('');
    setPassword('123456');
    setRole('pemohon');
    setUnitId(units[0]?.id || '');
    setStatus('AKTIF');
    setNoHp('');
    setJabatan('');
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setNama(u.nama);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setUnitId(u.unitId || '');
    setStatus(u.status);
    setNoHp(u.noHp || '');
    setJabatan(u.jabatan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          nama,
          role,
          unitId,
          status,
          noHp,
          jabatan,
          password: password || undefined,
        });
        success('Data pengguna berhasil diperbarui');
      } else {
        await api.createUser({
          nama,
          email,
          password,
          role,
          unitId,
          status,
          noHp,
          jabatan,
        });
        success('Pengguna baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menyimpan pengguna');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteUser(deletingId);
      success('Pengguna berhasil dihapus');
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal menghapus pengguna');
    }
  };

  const filtered = users.filter((u) => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        u.nama.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.unitNama && u.unitNama.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pengelolaan Pengguna</h2>
            <p className="text-xs text-slate-500">
              Manajemen akun pengguna dan peran (Admin, Petugas Sarpras, Pemohon)
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama, email, atau unit kerja..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Email Kedinasan</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Unit Kerja / Jurusan</th>
                <th className="py-3 px-4">Kontak / HP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{u.nama}</p>
                    <p className="text-[10px] text-slate-500">{u.jabatan || '-'}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">{u.email}</td>
                  <td className="py-3 px-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.unitNama || '-'}</td>
                  <td className="py-3 px-4 text-slate-600">{u.noHp || '-'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={u.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Pengguna"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.email !== 'admin@smkn1tegalsari.sch.id' && (
                        <button
                          onClick={() => setDeletingId(u.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
          title={editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Bpk. Ahmad, S.Pd."
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Kedinasan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@smkn1tegalsari.sch.id"
                  disabled={!!editingUser}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi {editingUser && '(Kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Akses <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="pemohon">PEMOHON (Guru / Staf)</option>
                  <option value="sarpras">PETUGAS SARPRAS</option>
                  <option value="admin">ADMIN (Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Akun</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Kerja / Jurusan
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Unit --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Handphone</label>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan Kedinasan</label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Contoh: Guru Produktif RPL / Staf TU"
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
                {editingUser ? 'Perbarui Pengguna' : 'Simpan Pengguna'}
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
          title="Hapus Pengguna"
          message="Apakah Anda yakin ingin menghapus akun pengguna ini?"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
