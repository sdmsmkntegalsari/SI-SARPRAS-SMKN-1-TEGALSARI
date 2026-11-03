import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { HallBooking, StatusHistoryItem } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { StatusTimeline } from '../../components/common/StatusTimeline.tsx';
import { HallBookingPrintDoc } from '../../components/print/HallBookingPrintDoc.tsx';
import { generateHallBookingPDF } from '../../utils/pdfGenerator.ts';
import {
  Building2, Plus, Filter, Search, Printer, Download, CheckCircle,
  XCircle, Ban, Eye, Calendar, Users
} from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
  selectedDetailId?: string | null;
  onClearDetailId?: () => void;
}

export const HallBookingList: React.FC<Props> = ({
  onNavigate,
  selectedDetailId,
  onClearDetailId,
}) => {
  const { user, role, settings } = useAuth();
  const { success, error } = useToast();

  const [bookings, setBookings] = useState<HallBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & detail states
  const [activeBooking, setActiveBooking] = useState<HallBooking | null>(null);
  const [activeHistory, setActiveHistory] = useState<StatusHistoryItem[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Action dialog states
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'CANCEL' | 'COMPLETE' | null>(null);
  const [actionItem, setActionItem] = useState<HallBooking | null>(null);

  const isPrivileged = role === 'admin' || role === 'sarpras';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHallBookings({
        userId: role === 'pemohon' ? user?.id : undefined,
        role: role || undefined,
        status: filterStatus !== 'SEMUA' ? filterStatus : undefined,
      });
      setBookings(res.hallBookings || []);

      if (selectedDetailId) {
        const target = res.hallBookings.find(b => b.id === selectedDetailId);
        if (target) {
          openDetail(target);
        }
      }
    } catch (err: any) {
      error(err?.message || 'Gagal memuat data booking aula');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus, role, user?.id]);

  const openDetail = async (item: HallBooking) => {
    setActiveBooking(item);
    setIsDetailOpen(true);
    try {
      const res = await api.getHallBookingById(item.id);
      setActiveHistory(res.history || []);
    } catch {
      setActiveHistory([]);
    }
  };

  const handleActionConfirm = async (catatan: string) => {
    if (!actionType || !actionItem) return;
    try {
      const res = await api.actionHallBooking(actionItem.id, {
        action: actionType,
        userId: user?.id,
        userNama: user?.nama,
        userRole: role || 'pemohon',
        catatan,
        pejabatNama: settings?.wakaSarprasNama,
        pejabatJabatan: 'Waka Sarana & Prasarana',
      });
      success(res.message);
      setActionType(null);
      setActionItem(null);
      if (isDetailOpen) setIsDetailOpen(false);
      loadData();
    } catch (err: any) {
      error(err?.message || 'Gagal memproses aksi');
    }
  };

  const filteredList = bookings.filter((b) => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const match =
        b.nomorPengajuan.toLowerCase().includes(s) ||
        b.namaKegiatan.toLowerCase().includes(s) ||
        b.pemohonNama.toLowerCase().includes(s) ||
        b.roomNama.toLowerCase().includes(s) ||
        b.keperluan.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Submenu Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Penggunaan Ruang Aula</h2>
              <p className="text-xs text-slate-500">
                Administrasi dan permohonan penggunaan Aula Utama & ruang serbaguna SMKN 1 Tegalsari
              </p>
            </div>
          </div>
        </div>

        {/* Submenu Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('hall-calendar')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            Kalender Aula
          </button>
          <button
            onClick={() => onNavigate('hall-booking-new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Pengajuan Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor pengajuan, nama kegiatan, pemohon, atau ruangan..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {['SEMUA', 'MENUNGGU PERSETUJUAN', 'DISETUJUI', 'SELESAI', 'DITOLAK', 'DIBATALKAN'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Tentu belum ada pengajuan."
              description="Belum ada data pengajuan aula dengan filter yang dipilih."
              actionText="Buat Pengajuan Baru"
              onAction={() => onNavigate('hall-booking-new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">No. Pengajuan</th>
                  <th className="py-3 px-4">Pemohon</th>
                  <th className="py-3 px-4">Nama Kegiatan</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4">Waktu & Peserta</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {item.nomorPengajuan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{item.pemohonNama}</p>
                      <p className="text-[11px] text-slate-500">{item.unitNama}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 truncate">{item.namaKegiatan}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.keperluan}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{item.roomNama}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-700">{item.hariTanggal}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.jamMulai} - {item.jamSelesai} WIB • {item.jumlahPeserta} Peserta
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Detail */}
                        <button
                          onClick={() => openDetail(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Lihat Detail & Riwayat"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download PDF Langsung */}
                        <button
                          onClick={() => {
                            generateHallBookingPDF(item, settings);
                            success(`Dokumen PDF ${item.nomorPengajuan} berhasil dibuat & diunduh.`);
                          }}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Download Dokumen PDF (A4)"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Print Dokumen Resmi A4 */}
                        <button
                          onClick={() => {
                            setActiveBooking(item);
                            setIsPrintOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Cetak Dokumen Resmi (A4)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Petugas Approve / Reject */}
                        {isPrivileged && item.status === 'MENUNGGU PERSETUJUAN' && (
                          <>
                            <button
                              onClick={() => {
                                setActionItem(item);
                                setActionType('APPROVE');
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Setujui Pengajuan"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setActionItem(item);
                                setActionType('REJECT');
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Tolak Pengajuan"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Complete when active */}
                        {isPrivileged && item.status === 'DISETUJUI' && (
                          <button
                            onClick={() => {
                              setActionItem(item);
                              setActionType('COMPLETE');
                            }}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            title="Tandai Selesai"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Pemohon Cancel */}
                        {(item.status === 'DRAFT' || item.status === 'MENUNGGU PERSETUJUAN') && (
                          <button
                            onClick={() => {
                              setActionItem(item);
                              setActionType('CANCEL');
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Batalkan Pengajuan"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Booking Aula */}
      {isDetailOpen && activeBooking && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            if (onClearDetailId) onClearDetailId();
          }}
          title={`Detail Pengajuan Aula: ${activeBooking.nomorPengajuan}`}
          subtitle={`Diajukan pada ${new Date(activeBooking.createdAt).toLocaleDateString('id-ID')}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <StatusBadge status={activeBooking.status} size="md" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateHallBookingPDF(activeBooking, settings)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  onClick={() => setIsPrintOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Dokumen
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Pemohon</span>
                <p className="font-bold text-slate-800 text-sm">{activeBooking.pemohonNama}</p>
                <p className="text-slate-500">{activeBooking.unitNama}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Ruangan</span>
                <p className="font-bold text-slate-800 text-sm">{activeBooking.roomNama}</p>
                <p className="text-slate-500">{activeBooking.jumlahPeserta} Peserta</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Kegiatan</span>
                <p className="font-semibold text-slate-800">{activeBooking.namaKegiatan}</p>
                <p className="text-slate-600 italic">Keperluan: {activeBooking.keperluan || '-'}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Waktu Penggunaan</span>
                <p className="font-semibold text-slate-800">{activeBooking.hariTanggal}</p>
                <p className="text-slate-500">{activeBooking.jamMulai} s.d {activeBooking.jamSelesai} WIB</p>
              </div>
            </div>

            {/* Checklist Fasilitas Terpilih */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Fasilitas yang Diajukan
              </h4>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                {Object.entries({
                  Meja: activeBooking.fasilitas?.meja,
                  Kursi: activeBooking.fasilitas?.kursi,
                  'LCD Proyektor': activeBooking.fasilitas?.lcd,
                  'Sound System': activeBooking.fasilitas?.sound,
                  'Microphone': activeBooking.fasilitas?.mic,
                  'AC / Kipas': activeBooking.fasilitas?.acKipas,
                }).map(([name, checked]) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] ${
                        checked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {checked ? '✓' : '—'}
                    </span>
                    <span className={checked ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                      {name}
                    </span>
                  </div>
                ))}
              </div>
              {activeBooking.fasilitas?.lainnya && (
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <strong>Kebutuhan Lain:</strong> {activeBooking.fasilitas.lainnya}
                </p>
              )}
            </div>

            {/* Riwayat Status */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Timeline Riwayat Perubahan Status
              </h4>
              <StatusTimeline items={activeHistory} />
            </div>

            {/* Action buttons inside detail */}
            {isPrivileged && activeBooking.status === 'MENUNGGU PERSETUJUAN' && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActionItem(activeBooking);
                    setActionType('REJECT');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition"
                >
                  Tolak Pengajuan
                </button>
                <button
                  onClick={() => {
                    setActionItem(activeBooking);
                    setActionType('APPROVE');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs transition shadow-sm"
                >
                  Setujui Pengajuan
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Print Document Overlay */}
      {isPrintOpen && activeBooking && (
        <HallBookingPrintDoc
          booking={activeBooking}
          settings={settings}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      {/* Confirmation Dialogs */}
      {actionType && actionItem && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => {
            setActionType(null);
            setActionItem(null);
          }}
          type={actionType.toLowerCase() as any}
          title={
            actionType === 'APPROVE'
              ? 'Konfirmasi Persetujuan Penggunaan Aula'
              : actionType === 'REJECT'
              ? 'Konfirmasi Penolakan Penggunaan Aula'
              : actionType === 'CANCEL'
              ? 'Konfirmasi Pembatalan Booking'
              : 'Selesaikan Penggunaan Aula'
          }
          message={
            actionType === 'APPROVE'
              ? `Apakah Anda yakin ingin menyetujui penggunaan aula untuk "${actionItem.namaKegiatan}"?`
              : actionType === 'REJECT'
              ? `Tolak pengajuan booking aula "${actionItem.nomorPengajuan}". Berikan alasan penolakan.`
              : actionType === 'CANCEL'
              ? `Apakah Anda yakin ingin membatalkan pengajuan "${actionItem.nomorPengajuan}"?`
              : `Tandai bahwa kegiatan di aula telah selesai dan ruangan telah dirapikan.`
          }
          requireNote={actionType === 'REJECT'}
          notePlaceholder={
            actionType === 'REJECT'
              ? 'Alasan penolakan (misal: Ruangan sedang digunakan agenda kedinasan lain)'
              : 'Catatan tambahan (opsional)...'
          }
          onConfirm={handleActionConfirm}
        />
      )}
    </div>
  );
};
