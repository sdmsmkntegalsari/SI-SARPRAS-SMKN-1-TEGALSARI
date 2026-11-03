import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { RoleBadge } from '../../components/common/Badge.tsx';
import { User, Mail, Phone, Building, Shield, Key, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role, updateCurrentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [nama, setNama] = useState(user?.nama || '');
  const [noHp, setNoHp] = useState(user?.noHp || '');
  const [jabatan, setJabatan] = useState(user?.jabatan || '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await api.updateUser(user.id, {
        nama,
        noHp,
        jabatan,
        password: password || undefined,
      });
      updateCurrentUser(res.user);
      success('Profil Anda berhasil diperbarui');
      setPassword('');
    } catch (err: any) {
      toastError(err?.message || 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
          {user?.nama?.charAt(0) || 'U'}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">{user?.nama}</h2>
            <RoleBadge role={role || 'pemohon'} />
          </div>
          <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
          <p className="text-xs text-slate-600">{user?.unitNama || 'SMKN 1 Tegalsari'}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          Ubah Data Akun & Sandi
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Kedinasan (Tidak Dapat Diubah)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor HP / WhatsApp
              </label>
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Kedinasan
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Staf / Guru Kejuruan"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi Baru (Kosongkan bila tidak ingin ganti)
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

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Perbarui Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
