import {
  User, Unit, Vehicle, Room, Facility,
  CarBorrowing, HallBooking, NotificationItem,
  StatusHistoryItem, SchoolSettings, DashboardMetrics,
  MonthlyChartData, RecentApplication, CalendarEvent
} from '../types/index.ts';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server');
  }
  return data;
}

export const api = {
  // Auth
  login: (email: string, password?: string) =>
    request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getQuickUsers: () =>
    request<{ users: User[] }>('/auth/users-quick'),

  // Users
  getUsers: () => request<{ users: User[] }>('/users'),
  createUser: (userData: Partial<User> & { password?: string }) =>
    request<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  updateUser: (id: string, userData: Partial<User> & { password?: string }) =>
    request<{ user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean; message?: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Units
  getUnits: () => request<{ units: Unit[] }>('/units'),
  createUnit: (data: { nama: string; status?: 'AKTIF' | 'NONAKTIF' }) =>
    request<{ unit: Unit }>('/units', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUnit: (id: string, data: { nama?: string; status?: 'AKTIF' | 'NONAKTIF' }) =>
    request<{ unit: Unit }>(`/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUnit: (id: string) =>
    request<{ success: boolean }>(`/units/${id}`, { method: 'DELETE' }),

  // Vehicles
  getVehicles: () => request<{ vehicles: Vehicle[] }>('/vehicles'),
  createVehicle: (data: Partial<Vehicle>) =>
    request<{ vehicle: Vehicle }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateVehicle: (id: string, data: Partial<Vehicle>) =>
    request<{ vehicle: Vehicle }>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteVehicle: (id: string) =>
    request<{ success: boolean }>(`/vehicles/${id}`, { method: 'DELETE' }),

  // Rooms
  getRooms: () => request<{ rooms: Room[] }>('/rooms'),
  createRoom: (data: Partial<Room>) =>
    request<{ room: Room }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRoom: (id: string, data: Partial<Room>) =>
    request<{ room: Room }>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteRoom: (id: string) =>
    request<{ success: boolean }>(`/rooms/${id}`, { method: 'DELETE' }),

  // Facilities
  getFacilities: () => request<{ facilities: Facility[] }>('/facilities'),
  createFacility: (data: Partial<Facility>) =>
    request<{ facility: Facility }>('/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFacility: (id: string, data: Partial<Facility>) =>
    request<{ facility: Facility }>(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteFacility: (id: string) =>
    request<{ success: boolean }>(`/facilities/${id}`, { method: 'DELETE' }),

  // Car Borrowings
  checkCarClash: (params: {
    vehicleId: string;
    hariTanggal: string;
    jamBerangkat: string;
    perkiraanKembali: string;
    excludeId?: string;
  }) =>
    request<{
      clash: boolean;
      message?: string;
      clashDetail?: { nomorPengajuan: string; kegiatan: string; pemohonNama: string; jam: string };
    }>('/car-borrowings/check-clash', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getCarBorrowings: (query?: {
    userId?: string;
    role?: string;
    status?: string;
    tanggalAwal?: string;
    tanggalAkhir?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.userId) params.set('userId', query.userId);
    if (query?.role) params.set('role', query.role);
    if (query?.status) params.set('status', query.status);
    if (query?.tanggalAwal) params.set('tanggalAwal', query.tanggalAwal);
    if (query?.tanggalAkhir) params.set('tanggalAkhir', query.tanggalAkhir);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ carBorrowings: CarBorrowing[] }>(`/car-borrowings${qs}`);
  },

  getCarBorrowingById: (id: string) =>
    request<{ carBorrowing: CarBorrowing; history: StatusHistoryItem[] }>(`/car-borrowings/${id}`),

  createCarBorrowing: (data: any) =>
    request<{ carBorrowing: CarBorrowing; message: string }>('/car-borrowings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actionCarBorrowing: (
    id: string,
    payload: {
      action: 'APPROVE' | 'REJECT' | 'CANCEL' | 'COMPLETE';
      userId?: string;
      userNama?: string;
      userRole?: string;
      catatan?: string;
      pejabatNama?: string;
      pejabatJabatan?: string;
    }
  ) =>
    request<{ carBorrowing: CarBorrowing; message: string }>(`/car-borrowings/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Hall Bookings
  checkHallClash: (params: {
    roomId?: string;
    hariTanggal: string;
    jamMulai: string;
    jamSelesai: string;
    excludeId?: string;
  }) =>
    request<{
      clash: boolean;
      message?: string;
      clashDetail?: { nomorPengajuan: string; namaKegiatan: string; pemohonNama: string; jam: string };
    }>('/hall-bookings/check-clash', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getHallBookings: (query?: {
    userId?: string;
    role?: string;
    status?: string;
    tanggalAwal?: string;
    tanggalAkhir?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.userId) params.set('userId', query.userId);
    if (query?.role) params.set('role', query.role);
    if (query?.status) params.set('status', query.status);
    if (query?.tanggalAwal) params.set('tanggalAwal', query.tanggalAwal);
    if (query?.tanggalAkhir) params.set('tanggalAkhir', query.tanggalAkhir);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ hallBookings: HallBooking[] }>(`/hall-bookings${qs}`);
  },

  getHallBookingById: (id: string) =>
    request<{ hallBooking: HallBooking; history: StatusHistoryItem[] }>(`/hall-bookings/${id}`),

  createHallBooking: (data: any) =>
    request<{ hallBooking: HallBooking; message: string }>('/hall-bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actionHallBooking: (
    id: string,
    payload: {
      action: 'APPROVE' | 'REJECT' | 'CANCEL' | 'COMPLETE';
      userId?: string;
      userNama?: string;
      userRole?: string;
      catatan?: string;
      pejabatNama?: string;
      pejabatJabatan?: string;
    }
  ) =>
    request<{ hallBooking: HallBooking; message: string }>(`/hall-bookings/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Dashboard
  getDashboard: (params?: { userId?: string; role?: string }) => {
    const qs = params?.userId ? `?userId=${params.userId}&role=${params.role || ''}` : '';
    return request<{
      metrics: DashboardMetrics;
      monthlyData: MonthlyChartData[];
      recentList: RecentApplication[];
    }>(`/dashboard${qs}`);
  },

  // Calendar
  getCalendarEvents: (tipe?: string, status?: string) => {
    const params = new URLSearchParams();
    if (tipe) params.set('tipe', tipe);
    if (status) params.set('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ events: CalendarEvent[] }>(`/calendar-events${qs}`);
  },

  // Reports
  getReports: (filters: {
    jenis?: string;
    status?: string;
    unitId?: string;
    tanggalAwal?: string;
    tanggalAkhir?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.jenis) params.set('jenis', filters.jenis);
    if (filters.status) params.set('status', filters.status);
    if (filters.unitId) params.set('unitId', filters.unitId);
    if (filters.tanggalAwal) params.set('tanggalAwal', filters.tanggalAwal);
    if (filters.tanggalAkhir) params.set('tanggalAkhir', filters.tanggalAkhir);
    return request<{ data: any[]; summary: any }>(`/reports?${params.toString()}`);
  },

  // Notifications
  getNotifications: (userId?: string, role?: string) => {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (role) params.set('role', role);
    return request<{ notifications: NotificationItem[] }>(`/notifications?${params.toString()}`);
  },
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  // Settings
  getSettings: () => request<{ settings: SchoolSettings }>('/settings'),
  updateSettings: (data: Partial<SchoolSettings>) =>
    request<{ settings: SchoolSettings; message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
