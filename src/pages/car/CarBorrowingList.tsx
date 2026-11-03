import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/common/Toast.tsx';
import { api } from '../../services/api.ts';
import { CarBorrowing, StatusHistoryItem } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/Badge.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { StatusTimeline } from '../../components/common/StatusTimeline.tsx';
import { CarBorrowingPrintDoc } from '../../components/print/CarBorrowingPrintDoc.tsx';
import { generateCarBorrowingPDF } from '../../utils/pdfGenerator.ts';
import {
  Car, Plus, Filter, Search, Printer, Download, CheckCircle,
  XCircle, Ban, Eye, Calendar, Fuel, UserCheck, AlertTriangle
} from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
  selectedDetailId?: string | null;
  onClearDetailId?: () => void;
}

export const CarBorrowingList: React.FC<Props> = ({
  onNavigate,
  selectedDetailId,
  onClearDetailId,
}) => {
  const { user, role, settings } = useAuth();
  const { success, error } = useToast();

  const [borrowings, setBorrowings] = useState<CarBorrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & detail states
  const [activeBorrowing, setActiveBorrowing] = useState<CarBorrowing | null>(null);
  const [activeHistory, setActiveHistory] = useState<StatusHistoryItem[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Action dialog states
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'CANCEL' | 'COMPLETE' | null>(null);
  const [actionItem, setActionItem] = useState<CarBorrowing | null>(null);

  const isPrivileged = role === 'admin' || role === 'sarpras';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCarBorrowings({
        userId: role === 'pemohon' ? user?.id : undefined,
        role: role || undefined,
        status: filterStatus !== 'SEMUA' ? filterStatus : undefined,
      });
      setBorrowings(res.carBorrowings || []);

      // If specific detail requested by prop
      if (selectedDetailId) {
        const target = res.carBorrowings.find(b => b.id === selectedDetailId);
        if (target) {
          openDetail(target);
        }
      }
    } catch (err: any) {
      error(err?.message || 'Gagal mengambil data peminjaman mobil');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus, role, user?.id]);

  const openDetail = async (item: CarBorrowing) => {
    setActiveBorrowing(item);
    setIsDetailOpen(true);
    try {
      const res = await api.getCarBorrowingById(item.id);
      setActiveHistory(res.history || []);
    } catch {
      setActiveHistory([]);
    }
  };

  const handleActionConfirm = async (catatan: string) => {
    if (!actionType || !actionItem) return;
    try {
      const res = await api.actionCarBorrowing(actionItem.id, {
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

  const filteredList = borrowings.filter((b) => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const match =
        b.nomorPengajuan.toLowerCase().includes(s) ||
        b.kegiatan.toLowerCase().includes(s) ||
        b.pemohonNama.toLowerCase().includes(s) ||
        b.vehicleNama.toLowerCase().includes(s) ||
        b.tujuanRute.toLowerCase().includes(s);
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
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Peminjaman Mobil Sekolah</h2>
              <p className="text-xs text-slate-500">
                Administrasi dan permohonan operasional kendaraan dinas SMKN 1 Tegalsari
              </p>
            </div>
          </div>
        </div>

        {/* Submenu Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('car-calendar')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            Kalender Mobil
          </button>
          <button
            onClick={() => onNavigate('car-borrowing-new')}
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
            placeholder="Cari nomor pengajuan, kegiatan, pemohon, atau kendaraan..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
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

      {/* Borrowings List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Tentu belum ada pengajuan."
              description="Belum ada riwayat peminjaman mobil dengan filter yang dipilih."
              actionText="Buat Pengajuan Baru"
              onAction={() => onNavigate('car-borrowing-new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">No. Pengajuan</th>
                  <th className="py-3 px-4">Pemohon</th>
                  <th className="py-3 px-4">Kegiatan & Rute</th>
                  <th className="py-3 px-4">Kendaraan</th>
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {item.nomorPengajuan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{item.pemohonNama}</p>
                      <p className="text-[11px] text-slate-500">{item.unitNama}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 truncate">{item.kegiatan}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.tujuanRute}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{item.vehicleNama}</p>
                      <p className="text-[11px] font-mono text-slate-500">{item.vehicleNoPol}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-700">{item.hariTanggal}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.jamBerangkat} - {item.perkiraanKembali} WIB
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

                        {/* Download File PDF Langsung */}
                        <button
                          onClick={() => {
                            generateCarBorrowingPDF(item, settings);
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
                            setActiveBorrowing(item);
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

                        {/* Pemohon Cancel if pending or draft */}
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

      {/* Modal Detail Pengajuan */}
      {isDetailOpen && activeBorrowing && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            if (onClearDetailId) onClearDetailId();
          }}
          title={`Detail Pengajuan: ${activeBorrowing.nomorPengajuan}`}
          subtitle={`Diajukan pada ${new Date(activeBorrowing.createdAt).toLocaleDateString('id-ID')}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Status and Print button banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status Saat Ini:</span>
                <StatusBadge status={activeBorrowing.status} size="md" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateCarBorrowingPDF(activeBorrowing, settings)}
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

            {/* General Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Pemohon</span>
                <p className="font-bold text-slate-800 text-sm">{activeBorrowing.pemohonNama}</p>
                <p className="text-slate-500">{activeBorrowing.unitNama}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Kendaraan</span>
                <p className="font-bold text-slate-800 text-sm">{activeBorrowing.vehicleNama}</p>
                <p className="text-slate-500 font-mono">{activeBorrowing.vehicleNoPol}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Kegiatan & Rute</span>
                <p className="font-semibold text-slate-800">{activeBorrowing.kegiatan}</p>
                <p className="text-slate-600 italic">Rute: {activeBorrowing.tujuanRute}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Waktu Pelaksanaan</span>
                <p className="font-semibold text-slate-800">{activeBorrowing.hariTanggal}</p>
                <p className="text-slate-500">{activeBorrowing.jamBerangkat} s.d {activeBorrowing.perkiraanKembali} WIB</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Pengemudi & BBM</span>
                <p className="font-semibold text-slate-800">{activeBorrowing.driverNama} ({activeBorrowing.driverNoHp})</p>
                <p className="text-slate-500">BBM Awal: {activeBorrowing.bbmPersen}% • KM: {activeBorrowing.kmAwal.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Riwayat Status Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Timeline Riwayat Perubahan Status
              </h4>
              <StatusTimeline items={activeHistory} />
            </div>

            {/* Action buttons inside detail */}
            {isPrivileged && activeBorrowing.status === 'MENUNGGU PERSETUJUAN' && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActionItem(activeBorrowing);
                    setActionType('REJECT');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition"
                >
                  Tolak Pengajuan
                </button>
                <button
                  onClick={() => {
                    setActionItem(activeBorrowing);
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
      {isPrintOpen && activeBorrowing && (
        <CarBorrowingPrintDoc
          borrowing={activeBorrowing}
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
              ? 'Konfirmasi Persetujuan Pengajuan Mobil'
              : actionType === 'REJECT'
              ? 'Konfirmasi Penolakan Pengajuan Mobil'
              : actionType === 'CANCEL'
              ? 'Konfirmasi Pembatalan Pengajuan'
              : 'Selesaikan Peminjaman Mobil'
          }
          message={
            actionType === 'APPROVE'
              ? `Apakah Anda yakin ingin menyetujui peminjaman kendaraan untuk kegiatan "${actionItem.kegiatan}"?`
              : actionType === 'REJECT'
              ? `Tolak pengajuan peminjaman kendaraan "${actionItem.nomorPengajuan}". Berikan alasan penolakan.`
              : actionType === 'CANCEL'
              ? `Apakah Anda yakin ingin membatalkan pengajuan "${actionItem.nomorPengajuan}"?`
              : `Tandai bahwa peminjaman kendaraan telah selesai dan mobil telah dikembalikan ke sekolah.`
          }
          requireNote={actionType === 'REJECT'}
          notePlaceholder={
            actionType === 'REJECT'
              ? 'Alasan penolakan (misal: Unit sedang masa servis/bentrok kegiatan)'
              : 'Catatan tambahan (opsional)...'
          }
          onConfirm={handleActionConfirm}
        />
      )}
    </div>
  );
};
