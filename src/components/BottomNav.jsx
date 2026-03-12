import React from 'react'
import { useApp } from '../context/AppContext'
import { LayoutDashboard, ArrowLeftRight, Wallet, ClipboardList, BarChart3, Megaphone, Settings, TrendingUp } from 'lucide-react'

const ownerNav = [
  { id: 'dashboard',    label: 'หน้าหลัก',  icon: LayoutDashboard },
  { id: 'transactions', label: 'รายการ',     icon: ArrowLeftRight },
  { id: 'cashflow',     label: 'เงินสด',     icon: Wallet },
  { id: 'reports',      label: 'รายงาน',     icon: BarChart3 },
  { id: 'settings',     label: 'ตั้งค่า',    icon: Settings },
]

const employeeNav = [
  { id: 'transactions', label: 'ບັດ/ໂອນ',  icon: ArrowLeftRight },
  { id: 'cashflow',     label: 'ເງິນສົດ',   icon: Wallet },
  { id: 'tasks',        label: 'ງານ',       icon: ClipboardList },
  { id: 'announcements',label: 'ຂ່າວ',      icon: Megaphone },
]

export default function BottomNav() {
  const { user, currentPage, setCurrentPage } = useApp()
  if (!user) return null
  const nav = user.role === 'owner' ? ownerNav : employeeNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-dark-900/95 backdrop-blur-md border-t border-dark-700 safe-area-bottom">
      <div className="flex items-stretch">
        {nav.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id
          return (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                active
                  ? 'text-primary-400'
                  : 'text-dark-500 active:text-dark-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-primary-500/15' : ''}`}>
                <Icon className={`transition-all ${active ? 'w-5 h-5' : 'w-5 h-5'}`} />
              </div>
              <span className={`text-[10px] font-medium leading-none ${active ? 'text-primary-400' : 'text-dark-500'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
      {/* iOS safe area spacer */}
      <div className="h-safe-bottom" />
    </nav>
  )
}
