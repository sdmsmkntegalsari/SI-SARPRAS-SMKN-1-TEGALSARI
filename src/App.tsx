/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './components/common/Toast.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { CarBorrowingList } from './pages/car/CarBorrowingList.tsx';
import { CarBorrowingForm } from './pages/car/CarBorrowingForm.tsx';
import { CarCalendar } from './pages/car/CarCalendar.tsx';
import { HallBookingList } from './pages/hall/HallBookingList.tsx';
import { HallBookingForm } from './pages/hall/HallBookingForm.tsx';
import { HallCalendar } from './pages/hall/HallCalendar.tsx';
import { SarprasCalendar } from './pages/calendar/SarprasCalendar.tsx';
import { VehiclesPage } from './pages/inventory/VehiclesPage.tsx';
import { RoomsPage } from './pages/inventory/RoomsPage.tsx';
import { FacilitiesPage } from './pages/inventory/FacilitiesPage.tsx';
import { ReportsPage } from './pages/reports/ReportsPage.tsx';
import { PrintCenterPage } from './pages/print/PrintCenterPage.tsx';
import { UsersPage } from './pages/admin/UsersPage.tsx';
import { UnitsPage } from './pages/admin/UnitsPage.tsx';
import { SettingsPage } from './pages/admin/SettingsPage.tsx';
import { ProfilePage } from './pages/profile/ProfilePage.tsx';

function MainRouter() {
  const { user, role, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300">Memuat SISARPRAS SMKN 1 Tegalsari...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> LoginPage
  if (!user) {
    return <LoginPage />;
  }

  // Routing render
  const renderPage = () => {
    // Car details
    if (currentPage.startsWith('car-detail-')) {
      const id = currentPage.replace('car-detail-', '');
      return (
        <CarBorrowingList
          onNavigate={setCurrentPage}
          selectedDetailId={id}
          onClearDetailId={() => setCurrentPage('car-borrowings')}
        />
      );
    }

    // Hall details
    if (currentPage.startsWith('hall-detail-')) {
      const id = currentPage.replace('hall-detail-', '');
      return (
        <HallBookingList
          onNavigate={setCurrentPage}
          selectedDetailId={id}
          onClearDetailId={() => setCurrentPage('hall-bookings')}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;

      // Car Borrowing Module
      case 'car-borrowings':
        return <CarBorrowingList onNavigate={setCurrentPage} />;
      case 'car-borrowing-new':
        return <CarBorrowingForm onNavigate={setCurrentPage} />;
      case 'car-calendar':
        return <CarCalendar onNavigate={setCurrentPage} />;

      // Hall Booking Module
      case 'hall-bookings':
        return <HallBookingList onNavigate={setCurrentPage} />;
      case 'hall-booking-new':
        return <HallBookingForm onNavigate={setCurrentPage} />;
      case 'hall-calendar':
        return <HallCalendar onNavigate={setCurrentPage} />;

      // Consolidated Calendar
      case 'calendar':
        return <SarprasCalendar onNavigate={setCurrentPage} />;

      // Print Center
      case 'print-center':
      case 'print-documents':
        return <PrintCenterPage onNavigate={setCurrentPage} />;

      // Sarana & Prasarana
      case 'vehicles':
        return <VehiclesPage />;
      case 'rooms':
        return <RoomsPage />;
      case 'facilities':
        return <FacilitiesPage />;

      // Reports
      case 'reports-car':
        return <ReportsPage initialType="MOBIL" />;
      case 'reports-hall':
        return <ReportsPage initialType="AULA" />;
      case 'reports-rekap':
        return <ReportsPage initialType="SEMUA" />;

      // Administrasi
      case 'users':
        return role === 'admin' ? <UsersPage /> : <Dashboard onNavigate={setCurrentPage} />;
      case 'units':
        return role === 'admin' ? <UnitsPage /> : <Dashboard onNavigate={setCurrentPage} />;
      case 'settings':
        return role === 'admin' ? <SettingsPage /> : <Dashboard onNavigate={setCurrentPage} />;

      // Profile
      case 'profile':
        return <ProfilePage />;

      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainRouter />
      </ToastProvider>
    </AuthProvider>
  );
}
