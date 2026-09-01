import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { FleetView } from './components/views/FleetView';
import { EquipmentDetailView } from './components/views/EquipmentDetailView';
import { RentalsView } from './components/views/RentalsView';
import { UsageView } from './components/views/UsageView';
import { ScannerView } from './components/views/ScannerView';
import { HealthStatusCard } from './components/HealthStatusCard';
import { PhaseNavigation } from './components/PhaseNavigation';
import { CheckoutModal } from './components/modals/CheckoutModal';
import { CheckinModal } from './components/modals/CheckinModal';
import { LogUsageModal } from './components/modals/LogUsageModal';
import { CreateEquipmentModal } from './components/modals/CreateEquipmentModal';
import { EquipmentResponse, fetchEquipmentList } from './api/equipment';
import { RentalResponse } from './api/rentals';
import { CheckCircle, X, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState<boolean>(false);
  const [isLogUsageOpen, setIsLogUsageOpen] = useState<boolean>(false);
  const [isCreateEquipmentOpen, setIsCreateEquipmentOpen] = useState<boolean>(false);

  const [selectedEquipmentForAction, setSelectedEquipmentForAction] = useState<EquipmentResponse | null>(null);
  const [selectedRentalForCheckin, setSelectedRentalForCheckin] = useState<RentalResponse | null>(null);
  const [allEquipments, setAllEquipments] = useState<EquipmentResponse[]>([]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    triggerRefresh();
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Load equipments for dropdowns
  useEffect(() => {
    fetchEquipmentList()
      .then((data) => setAllEquipments(data))
      .catch((err) => console.error('Failed to load fleet equipments:', err));
  }, [refreshTrigger]);

  // Handlers
  const handleNavigateToEquipment = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setActiveTab('fleet');
  };

  const handleOpenCheckout = (equipment?: EquipmentResponse | string) => {
    if (typeof equipment === 'string') {
      const found = allEquipments.find((e) => e.equipment_id === equipment);
      setSelectedEquipmentForAction(found || null);
    } else if (equipment) {
      setSelectedEquipmentForAction(equipment);
    } else {
      setSelectedEquipmentForAction(null);
    }
    setIsCheckoutOpen(true);
  };

  const handleOpenCheckin = (rental: RentalResponse) => {
    setSelectedRentalForCheckin(rental);
    setIsCheckinOpen(true);
  };

  const handleOpenLogUsage = (equipment?: EquipmentResponse | string) => {
    if (typeof equipment === 'string') {
      const found = allEquipments.find((e) => e.equipment_id === equipment);
      setSelectedEquipmentForAction(found || null);
    } else if (equipment) {
      setSelectedEquipmentForAction(equipment);
    } else {
      setSelectedEquipmentForAction(null);
    }
    setIsLogUsageOpen(true);
  };

  const availableEquipments = allEquipments.filter(
    (e) => e.status === 'AVAILABLE' || e.status === 'UNASSIGNED'
  );

  return (
    <div className="min-h-screen cat-ambient-bg text-slate-900 flex flex-col antialiased selection:bg-amber-200 selection:text-slate-950 font-sans">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'fleet') {
            setSelectedEquipmentId(null);
          }
          setActiveTab(tab);
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white border-2 border-emerald-500 text-slate-900 px-5 py-3.5 rounded-2xl shadow-soft-lg flex items-center space-x-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="font-bold text-slate-900">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateToEquipment={handleNavigateToEquipment}
            onOpenCheckout={handleOpenCheckout}
            onOpenScanner={() => setActiveTab('scanner')}
            onOpenLogUsage={handleOpenLogUsage}
            onOpenCreateEquipment={() => setIsCreateEquipmentOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'fleet' && (
          selectedEquipmentId ? (
            <EquipmentDetailView
              equipmentId={selectedEquipmentId}
              onBack={() => setSelectedEquipmentId(null)}
              onOpenCheckout={(id) => handleOpenCheckout(id)}
              onOpenCheckin={handleOpenCheckin}
              onOpenLogUsage={(id) => handleOpenLogUsage(id)}
              refreshTrigger={refreshTrigger}
            />
          ) : (
            <FleetView
              onNavigateToEquipment={handleNavigateToEquipment}
              onOpenCheckout={handleOpenCheckout}
              onOpenLogUsage={handleOpenLogUsage}
              onOpenCreateEquipment={() => setIsCreateEquipmentOpen(true)}
              refreshTrigger={refreshTrigger}
            />
          )
        )}

        {activeTab === 'rentals' && (
          <RentalsView
            onOpenCheckout={() => handleOpenCheckout()}
            onOpenCheckin={handleOpenCheckin}
            onNavigateToEquipment={handleNavigateToEquipment}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'usage' && (
          <UsageView
            onOpenLogUsage={handleOpenLogUsage}
            onNavigateToEquipment={handleNavigateToEquipment}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerView
            onNavigateToEquipment={handleNavigateToEquipment}
            onOpenCheckout={handleOpenCheckout}
            onOpenCheckin={handleOpenCheckin}
            onOpenLogUsage={handleOpenLogUsage}
          />
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <PhaseNavigation />
            <HealthStatusCard />
          </div>
        )}
      </main>

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={showToast}
        preselectedEquipment={selectedEquipmentForAction}
        availableEquipments={availableEquipments}
      />

      <CheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onSuccess={showToast}
        rental={selectedRentalForCheckin}
      />

      <LogUsageModal
        isOpen={isLogUsageOpen}
        onClose={() => setIsLogUsageOpen(false)}
        onSuccess={showToast}
        preselectedEquipment={selectedEquipmentForAction}
        equipments={allEquipments}
      />

      <CreateEquipmentModal
        isOpen={isCreateEquipmentOpen}
        onClose={() => setIsCreateEquipmentOpen(false)}
        onSuccess={showToast}
      />

      {/* Footer */}
      <footer className="border-t border-slate-300 bg-white/90 backdrop-blur-md py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-3 font-medium">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900">Smart Rental Tracking System</span>
            <span>&bull;</span>
            <span className="text-slate-600">Caterpillar Hiring Hackathon Platform</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Enterprise Architecture
            </span>
            <span>&bull;</span>
            <span className="font-semibold">FastAPI + PostgreSQL 16 + React</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
