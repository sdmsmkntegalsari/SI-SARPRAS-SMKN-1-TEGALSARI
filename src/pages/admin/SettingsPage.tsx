import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { SchoolSettings } from '../../types/index.ts';
import { getLogoJawaTimur, getLogoSekolah } from '../../utils/logos.ts';
import { Settings, Save, Upload, School, CheckCircle2, Image } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useAuth();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<SchoolSettings>({
    id: 'default',
    namaSekolah: 'SMK NEGERI 1 TEGALSARI',
    instansi: 'PEMERINTAH PROVINSI JAWA TIMUR',
    subInstansi: 'DINAS PENDIDIKAN',
    alamat: 'Jl. KH. Syafa\'at, Blokagung, Karangdoro, Kec. Tegalsari, Kab. Banyuwangi, Jawa Timur 68485',
    telepon: '(0333) 845621',
    email: 'smkn1tegalsari@gmail.com',
    website: 'https://smkn1tegalsari.sch.id',
    kepalaSekolahNama: 'Drs. Gatot Kurnianta, M.M.',
    kepalaSekolahNip: '19680715 199412 1 003',
    wakaSarprasNama: 'H. Moh. Khoirul Anam, S.T., M.Pd.',
    wakaSarprasNip: '19790412 200801 1 012',
    petugasSarprasNama: 'Ahmad Fauzi, S.Pd.',
    petugasSarprasNip: '19850914 201101 1 008',
    logoUrl: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastError('Ukuran file logo maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({
          ...prev,
          logoUrl: event.target?.result as string,
        }));
        success('Logo berhasil diunggah. Klik Simpan Pengaturan untuk menerapkan.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateSettings(form);
      success(res.message || 'Pengaturan identitas sekolah berhasil disimpan');
      await refreshSettings();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Pengaturan Identitas Sekolah</h2>
          <p className="text-xs text-slate-500">
            Konfigurasi kop surat resmi, logo sekolah, pejabat penanggung jawab, dan data instansi
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LOGO RESMI SEKOLAH */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <School className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              LOGO RESMI SEKOLAH
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Unggah file logo resmi SMK Negeri 1 Tegalsari (format PNG/JPG transparan direkomendasikan). Logo ini akan tercetak otomatis pada Kop Formulir Peminjaman Mobil dan Penggunaan Aula.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center p-2">
                  <Image className="w-6 h-6 text-slate-300 mx-auto" />
                  <span className="text-[9px] text-slate-400 font-bold block mt-1">Belum Ada</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Logo Resmi
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Maksimal ukuran 5MB. Direkomendasikan gambar rasio 1:1 resolusi tajam.
              </p>
            </div>
          </div>
        </div>

        {/* IDENTITAS INSTANSI & SEKOLAH */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <School className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              IDENTITAS INSTANSI & ALAMAT KOP SURAT
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instansi Tingkat 1 (Pemerintah Provinsi)
              </label>
              <input
                type="text"
                value={form.instansi}
                onChange={(e) => setForm({ ...form, instansi: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sub-Instansi (Dinas Pendidikan)
              </label>
              <input
                type="text"
                value={form.subInstansi}
                onChange={(e) => setForm({ ...form, subInstansi: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Resmi Sekolah
              </label>
              <input
                type="text"
                value={form.namaSekolah}
                onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-bold"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Lengkap Sekolah
              </label>
              <input
                type="text"
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon Kantor
              </label>
              <input
                type="text"
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Kedinasan
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* DATA PEJABAT PENANDATANGAN */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <School className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              PEJABAT PENANGGUNG JAWAB & PENYETUJUI DOKUMEN
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kepala Sekolah & Gelar
              </label>
              <input
                type="text"
                value={form.kepalaSekolahNama}
                onChange={(e) => setForm({ ...form, kepalaSekolahNama: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={form.kepalaSekolahNip}
                onChange={(e) => setForm({ ...form, kepalaSekolahNip: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Waka Sarana & Prasarana
              </label>
              <input
                type="text"
                value={form.wakaSarprasNama}
                onChange={(e) => setForm({ ...form, wakaSarprasNama: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Waka Sarana & Prasarana
              </label>
              <input
                type="text"
                value={form.wakaSarprasNip}
                onChange={(e) => setForm({ ...form, wakaSarprasNip: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
};
