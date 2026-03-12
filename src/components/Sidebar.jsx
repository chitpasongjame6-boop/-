import React from 'react'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard, ArrowLeftRight, Wallet, ClipboardList,
  BarChart3, Megaphone, Settings, LogOut, TrendingUp, ChevronRight
} from 'lucide-react'

const ownerNav = [
  { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { id: 'transactions', label: 'รายการแลกเงิน', icon: ArrowLeftRight },
  { id: 'cashflow', label: 'กระแสเงินสด', icon: Wallet },
  { id: 'tasks', label: 'ตารางงานพนักงาน', icon: ClipboardList },
  { id: 'reports', label: 'รายงานกำไร/ขาดทุน', icon: BarChart3 },
  { id: 'announcements', label: 'ประกาศ/ประชุม', icon: Megaphone },
  { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
]

const employeeNav = [
  { id: 'transactions', label: 'ບັດ / ໂອນ', icon: ArrowLeftRight },
  { id: 'cashflow', label: 'ກະແສເງິນສົດ', icon: Wallet },
  { id: 'tasks', label: 'ງານຂອງຂ້ອຍ', icon: ClipboardList },
  { id: 'announcements', label: 'ຂ່າວ / ປະກາດ', icon: Megaphone },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, currentPage, setCurrentPage } = useApp()
  const nav = user?.role === 'owner' ? ownerNav : employeeNav

  const handleNav = (id) => {
    setCurrentPage(id)
    onClose?.()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-dark-900 border-r border-dark-700 z-30
        flex flex-col
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-400" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-dark-100 truncate">ระบบรายงานกำไร</p>
              <p className="text-xs text-dark-500 truncate">บัตร โอน & จัดวียก</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-dark-700/50 mx-3 mt-3 rounded-xl bg-dark-800/50">
          <p className="text-xs text-dark-500 mb-0.5">เข้าสู่ระบบในฐานะ</p>
          <p className="font-semibold text-sm text-dark-100">{user?.name}</p>
          <span className={`badge text-xs mt-1 ${user?.role === 'owner' ? 'badge-yellow' : 'badge-blue'}`}>
            {user?.role === 'owner' ? '👑 เจ้าของ' : '👤 พนักงาน'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`w-full ${currentPage === id ? 'nav-link-active' : 'nav-link'}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {currentPage === id && <ChevronRight className="w-3.5 h-3.5 text-primary-500" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-dark-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  )
}
