import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CustomerManagement } from './components/CustomerManagement';
import { RoomManagement } from './components/RoomManagement';
import { RoomSelection } from './components/RoomSelection';
import { AvailabilityVerification } from './components/AvailabilityVerification';
import { CheckInProcess } from './components/CheckInProcess';
import { CheckOutProcess } from './components/CheckOutProcess';
import { AppointmentManagement } from './components/AppointmentManagement';
import { DepositManagement } from './components/DepositManagement';
import { ContractManagement } from './components/ContractManagement';
import { PaymentManagement } from './components/PaymentManagement';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':      return <Dashboard />;
      case 'customers':      return <CustomerManagement />;
      case 'rooms':          return <RoomManagement />;
      case 'roomSelection':  return <RoomSelection />;
      case 'availability':   return <AvailabilityVerification />;
      case 'checkin':        return <CheckInProcess />;
      case 'checkout':       return <CheckOutProcess />;
      case 'appointments':   return <AppointmentManagement />;
      case 'deposits':       return <DepositManagement />;
      case 'contracts':      return <ContractManagement />;
      case 'payments':       return <PaymentManagement />;
      case 'reports':        return <Reports />;
      case 'settings':       return <Settings />;
      default:               return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLogout={logout}
      />
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}