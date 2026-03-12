import React from 'react'
import { useApp } from '../context/AppContext'
import { Menu, Bell, RefreshCw, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const pageTitles = {
  dashboard: 'แดชบอร์ด',
  transactions: 'รายการแลกเงิน',
  cashflow: 'กระแสเงินสด',
  tasks: 'ตารางงานพนักงาน',
  reports: 'รายงานกำไร / ขาดทุน',
  announcements: 'ประกาศ & ประชุม',
  settings: 'ตั้งค่าระบบ',
}

export default function Header({ onMenuToggle }) {
  const { currentPage, announcements, refresh, logout, user, setCurrentPage } = useApp()
  const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: th })
  const upcomingCount = announcements.filter(a => new Date(a.date) >= new Date()).length

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-sm border-b border-dark-700 flex items-center px-4 gap-4 sticky top-0 z-10">
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-dark-800 transition-colors text-dark-400"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-dark-100 text-lg leading-none truncate">
          {pageTitles[currentPage] || 'ระบบรายงาน'}
        </h1>
        <p className="text-xs text-dark-500 mt-0.5 hidden sm:block">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={refresh}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-200"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setCurrentPage('announcements')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-200"
          >
            <Bell className="w-4 h-4" />
          </button>
          {upcomingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {upcomingCount}
            </span>
          )}
        </div>

        {user && (
          <button
            onClick={logout}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-500/10 transition-colors text-dark-400 hover:text-red-400"
            title="ອອກຈາກລະບົບ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  )
}
