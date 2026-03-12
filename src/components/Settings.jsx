import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Settings as SettingsIcon, Plus, Trash2, Users, Lock, DollarSign, Store, Zap } from 'lucide-react'

export default function Settings() {
  const { settings, saveSettings, staff, addStaff, deleteStaff } = useApp()
  const [form, setForm] = useState({ ...settings })
  const [newStaffName, setNewStaffName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleSave = (e) => {
    e.preventDefault()
    saveSettings({ ...form })
  }

  const handleAddStaff = (e) => {
    e.preventDefault()
    if (!newStaffName.trim()) return
    addStaff(newStaffName.trim())
    setNewStaffName('')
  }

  const handleDeleteStaff = (id) => {
    if (confirmDelete === id) {
      deleteStaff(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Business Info */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-primary-400" />
          ข้อมูลธุรกิจ
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">ชื่อธุรกิจ / ร้าน</label>
            <input
              className="input"
              placeholder="เช่น ร้านแลกเงิน สยาม"
              value={form.businessName || ''}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">ເງິນສົດເລີ່ມຕົ້ນ (ກີບ)</label>
            <input
              type="number"
              className="input"
              placeholder="0"
              value={form.initialCash || ''}
              onChange={e => setForm(f => ({ ...f, initialCash: parseFloat(e.target.value) || 0 }))}
            />
            <p className="text-xs text-dark-500 mt-1">ใช้เป็นฐานในการคำนวณเงินคงเหลือในระบบ</p>
          </div>
          <button type="submit" className="btn-primary">บันทึกการตั้งค่า</button>
        </form>
      </div>

      {/* Password Settings */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          รหัสผ่าน
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">รหัสผ่าน เจ้าของ</label>
              <input
                type="text"
                className="input"
                placeholder="รหัสปัจจุบัน"
                value={form.ownerPassword || ''}
                onChange={e => setForm(f => ({ ...f, ownerPassword: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">รหัสผ่าน พนักงาน</label>
              <input
                type="text"
                className="input"
                placeholder="รหัสปัจจุบัน"
                value={form.employeePassword || ''}
                onChange={e => setForm(f => ({ ...f, employeePassword: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">บันทึกรหัสผ่าน</button>
        </form>
      </div>

      {/* Line Notify */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-400" />
          Line Notify Token
        </h3>
        <p className="text-xs text-dark-500 mb-4">
          เมื่อตั้งค่า Token แล้ว ระบบจะส่งแจ้งเตือนเข้า Line ทุกครั้งที่มีการโอนเข้าตู้
        </p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Line Notify Token</label>
            <input
              className="input"
              placeholder="ใส่ Token จาก notify-bot.line.me/th/..."
              value={form.lineToken || ''}
              onChange={e => setForm(f => ({ ...f, lineToken: e.target.value }))}
            />
          </div>
          <div className="bg-dark-800 rounded-xl p-3 text-xs text-dark-400 space-y-1">
            <p className="font-medium text-dark-300">วิธีขอ Line Notify Token:</p>
            <p>1. ไปที่ notify-bot.line.me/th/</p>
            <p>2. เข้าสู่ระบบด้วย Line Account</p>
            <p>3. กด "สร้าง Token" → เลือกกลุ่มที่ต้องการ</p>
            <p>4. คัดลอก Token มาวางที่นี่</p>
          </div>
          <button type="submit" className="btn-primary">บันทึก Token</button>
        </form>
      </div>

      {/* Staff Management */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          จัดการพนักงาน ({staff.length} คน)
        </h3>

        <form onSubmit={handleAddStaff} className="flex gap-2 mb-4">
          <input
            className="input flex-1"
            placeholder="ชื่อพนักงานใหม่..."
            value={newStaffName}
            onChange={e => setNewStaffName(e.target.value)}
          />
          <button type="submit" className="btn-primary px-4">
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-xl border border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-blue-400">
                  {s.name.charAt(0)}
                </div>
                <span className="font-medium text-dark-200">{s.name}</span>
              </div>
              <button
                onClick={() => handleDeleteStaff(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  confirmDelete === s.id
                    ? 'bg-red-600/30 border-red-500 text-red-300'
                    : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-red-500/40 hover:text-red-400'
                }`}
              >
                {confirmDelete === s.id ? 'ยืนยันลบ?' : 'ลบ'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border border-red-500/20">
        <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
          ⚠️ โซนอันตราย
        </h3>
        <p className="text-sm text-dark-500 mb-4">การกระทำเหล่านี้ไม่สามารถย้อนกลับได้</p>
        <button
          onClick={() => {
            if (window.confirm('ยืนยันการล้างข้อมูลทั้งหมด? ไม่สามารถกู้คืนได้!')) {
              ['profit_transactions', 'profit_cash_flow', 'profit_staff_tasks', 'profit_announcements'].forEach(k => localStorage.removeItem(k))
              window.location.reload()
            }
          }}
          className="btn-danger text-sm"
        >
          ล้างข้อมูลธุรกรรมทั้งหมด
        </button>
      </div>
    </div>
  )
}
