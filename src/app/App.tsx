import { useState } from 'react';
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

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomerManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'roomSelection':
        return <RoomSelection />;
      case 'availability':
        return <AvailabilityVerification />;
      case 'checkin':
        return <CheckInProcess />;
      case 'checkout':
        return <CheckOutProcess />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'deposits':
        return <DepositManagement />;
      case 'contracts':
        return <ContractManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}