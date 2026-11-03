import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { ShieldCheck, HardHat, User, ArrowRight, Lock, Mail, School } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, settings } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Email wajib diisi');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(email, password);
      toastSuccess('Berhasil masuk ke SISARPRAS SMKN 1 Tegalsari');
    } catch (err: any) {
      const msg = err?.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setErrorMessage('');
    try {
      await login(demoEmail, demoPass);
      toastSuccess(`Berhasil masuk sebagai ${demoEmail.split('@')[0]}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal login demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Card Header & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-3">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo SMKN 1 Tegalsari"
                className="w-14 h-14 object-contain"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-xl shadow-inner">
                <School className="w-8 h-8" />
              </div>
            )}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            {settings?.subInstansi || 'DINAS PENDIDIKAN PROVINSI JAWA TIMUR'}
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            {settings?.namaSekolah || 'SMK NEGERI 1 TEGALSARI'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            SISARPRAS — Sistem Informasi Sarana dan Prasarana
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Masuk ke Sistem</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan akun kedinasan SMK Negeri 1 Tegalsari Anda.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Kedinasan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@smkn1tegalsari.sch.id"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                'Memverifikasi...'
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              PILIH AKUN SIMULASI ROLE (1-KLIK)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@smkn1tegalsari.sch.id', 'admin')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-purple-950 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Admin Utama</p>
                    <p className="text-[10px] text-purple-700">admin@smkn1tegalsari.sch.id</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-purple-200 text-purple-800">
                  Role: ADMIN
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('sarpras@smkn1tegalsari.sch.id', 'sarpras')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 text-blue-950 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Petugas Sarpras</p>
                    <p className="text-[10px] text-blue-700">sarpras@smkn1tegalsari.sch.id</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800">
                  Role: PETUGAS
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('kaprog.rpl@smkn1tegalsari.sch.id', 'pemohon')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-teal-100 bg-teal-50/50 hover:bg-teal-100/70 text-teal-950 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-600 text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Pemohon (Kaprog RPL)</p>
                    <p className="text-[10px] text-teal-700">kaprog.rpl@smkn1tegalsari.sch.id</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-800">
                  Role: PEMOHON
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          © {new Date().getFullYear()} SMK Negeri 1 Tegalsari — Administrasi Sarana & Prasarana
        </p>
      </div>
    </div>
  );
};
