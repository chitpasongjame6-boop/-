import React, { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import TransactionForm from './components/TransactionForm'
import CashFlow from './components/CashFlow'
import StaffTasks from './components/StaffTasks'
import Reports from './components/Reports'
import Announcements from './components/Announcements'
import Settings from './components/Settings'
import Toast from './components/Toast'
import InstallPrompt from './components/InstallPrompt'
import BottomNav from './components/BottomNav'

function AppContent() {
  const { user, currentPage } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return <Login />

  const pages = {
    dashboard: <Dashboard />,
    transactions: <TransactionForm />,
    cashflow: <CashFlow />,
    tasks: <StaffTasks />,
    reports: <Reports />,
    announcements: <Announcements />,
    settings: user.role === 'owner' ? <Settings /> : <Dashboard />,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setMobileMenuOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-6 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {pages[currentPage] || <Dashboard />}
          </div>
        </main>
      </div>
      <Toast />
      <InstallPrompt />
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
