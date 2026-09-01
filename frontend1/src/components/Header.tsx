import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Calendar,
  Gauge,
  QrCode,
  Activity,
  Server
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'fleet' | 'rentals' | 'usage' | 'scanner' | 'health';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Rental Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Your Rented Equipment', icon: Truck },
    { id: 'rentals', label: 'Rental Contracts', icon: Calendar },
    { id: 'usage', label: 'Telemetry & Logs', icon: Gauge },
    { id: 'scanner', label: 'QR / RFID Scanner', icon: QrCode },
    { id: 'health', label: 'Diagnostics & Demo', icon: Activity }
  ];

  return (
    <header className="border-b-2 border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="bg-cat-yellow text-black font-black px-3.5 py-1.5 rounded-xl tracking-wider flex items-center shadow-soft border-2 border-slate-900">
              <span className="text-lg leading-none font-black tracking-tight">CAT</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">
                  Smart Rental Tracking System
                </h1>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Phase 5: Verified Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-600 hidden sm:block font-semibold">
                Customer Rental Intelligence &bull; Track &rarr; Analyze &rarr; Detect &rarr; Predict &rarr; Recommend &rarr; Decide
              </p>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="hidden lg:flex items-center space-x-2.5 text-xs font-bold">
            <div className="flex items-center space-x-2 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-800 shadow-2xs">
              <Server className="w-4 h-4 text-amber-600" />
              <span>Customer Portal API</span>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-900 shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>PostgreSQL Connected</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto pb-2.5 scrollbar-none text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as ActiveTab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-cat-yellow text-slate-950 shadow-soft border-2 border-slate-900 font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
