import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Users, Lock, Store, Zap, Trash2, KeyRound } from 'lucide-react'

export default function Settings() {
  const { settings, saveSettings, staff, addStaff, deleteStaff, accounts, addAccount, deleteAccount, updateAccountPin } = useApp()
  const [form, setForm] = useState({ ...settings })
  const [newStaffName, setNewStaffName] = useState('')
  const [newAccName, setNewAccName] = useState('')
  const [newAccPin, setNewAccPin] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editPinId, setEditPinId] = useState(null)
  const [editPinVal, setEditPinVal] = useState('')

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
    if (confirmDelete === id) { deleteStaff(id); setConfirmDelete(null) }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000) }
  }

  const handleAddAccount = async (e) => {
    e.preventDefault()
    if (!newAccName.trim() || !newAccPin.trim()) return
    await addAccount(newAccName.trim(), newAccPin.trim())
    setNewAccName('')
    setNewAccPin('')
  }

  const handleDeleteAccount = (id) => {
    if (confirmDelete === `acc-${id}`) { deleteAccount(id); setConfirmDelete(null) }
    else { setConfirmDelete(`acc-${id}`); setTimeout(() => setConfirmDelete(null), 3000) }
  }

  const handleUpdatePin = async (id) => {
    if (!editPinVal.trim()) return
    await updateAccountPin(id, editPinVal.trim())
    setEditPinId(null)
    setEditPinVal('')
  }

  const employeeAccounts = accounts.filter(a => a.role === 'employee')
  const ownerAccount = accounts.find(a => a.role === 'owner')

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Business Info */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-primary-400" />
          ຂໍ້ມູນທຸລະກິດ
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">ຊື່ທຸລະກິດ / ຮ້ານ</label>
            <input className="input" placeholder="ເຊັ່ນ: ຮ້ານແລກເງິນ"
              value={form.businessName || ''}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
          </div>
          <div>
            <label className="label">ເງິນສົດເລີ່ມຕົ້ນ (ກີບ)</label>
            <input type="number" className="input" placeholder="0"
              value={form.initialCash || ''}
              onChange={e => setForm(f => ({ ...f, initialCash: parseFloat(e.target.value) || 0 }))} />
          </div>
          <button type="submit" className="btn-primary">ບັນທຶກການຕັ້ງຄ່າ</button>
        </form>
      </div>

      {/* Owner PIN */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          PIN ເຈົ້າຂອງ
        </h3>
        {ownerAccount && (
          <div className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl border border-dark-700">
            <div className="w-9 h-9 bg-amber-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-amber-400">
              {ownerAccount.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark-200">{ownerAccount.name}</p>
              <p className="text-xs text-dark-500">PIN: {'•'.repeat(ownerAccount.pin?.length || 4)}</p>
            </div>
            {editPinId === ownerAccount.id ? (
              <div className="flex gap-2">
                <input className="input w-24 text-sm" placeholder="PIN ໃໝ່"
                  value={editPinVal} onChange={e => setEditPinVal(e.target.value)} autoFocus />
                <button onClick={() => handleUpdatePin(ownerAccount.id)} className="btn-primary px-3 text-xs">ບັນທຶກ</button>
                <button onClick={() => setEditPinId(null)} className="btn-secondary px-3 text-xs">ຍົກເລີກ</button>
              </div>
            ) : (
              <button onClick={() => { setEditPinId(ownerAccount.id); setEditPinVal('') }}
                className="px-3 py-1.5 rounded-lg text-xs bg-dark-700 border border-dark-600 text-dark-400 hover:text-primary-400 transition-all flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> ປ່ຽນ PIN
              </button>
            )}
          </div>
        )}
      </div>

      {/* Employee Accounts */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          ບັນຊີພະນັກງານ ({employeeAccounts.length} ຄົນ)
        </h3>
        <p className="text-xs text-dark-500 mb-4">ສ້າງບັນຊີພ້ອມ PIN ສຳລັບພະນັກງານແຕ່ລະຄົນ — ຂໍ້ມູນ Sync ລະຫວ່າງທຸກເຄື່ອງ</p>

        <form onSubmit={handleAddAccount} className="flex gap-2 mb-4">
          <input className="input flex-1" placeholder="ຊື່ພະນັກງານ..."
            value={newAccName} onChange={e => setNewAccName(e.target.value)} />
          <input className="input w-24" placeholder="PIN" maxLength={8}
            value={newAccPin} onChange={e => setNewAccPin(e.target.value)} />
          <button type="submit" className="btn-primary px-4"><Plus className="w-4 h-4" /></button>
        </form>

        <div className="space-y-2">
          {employeeAccounts.map(acc => (
            <div key={acc.id} className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl border border-dark-700">
              <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-blue-400">
                {acc.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-dark-200">{acc.name}</p>
                <p className="text-xs text-dark-500">PIN: {'•'.repeat(acc.pin?.length || 4)}</p>
              </div>
              {editPinId === acc.id ? (
                <div className="flex gap-2">
                  <input className="input w-24 text-sm" placeholder="PIN ໃໝ່"
                    value={editPinVal} onChange={e => setEditPinVal(e.target.value)} autoFocus />
                  <button onClick={() => handleUpdatePin(acc.id)} className="btn-primary px-3 text-xs">ບັນທຶກ</button>
                  <button onClick={() => setEditPinId(null)} className="btn-secondary px-3 text-xs">ຍົກເລີກ</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditPinId(acc.id); setEditPinVal('') }}
                    className="px-2 py-1.5 rounded-lg text-xs bg-dark-700 border border-dark-600 text-dark-400 hover:text-primary-400 transition-all">
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteAccount(acc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      confirmDelete === `acc-${acc.id}`
                        ? 'bg-red-600/30 border-red-500 text-red-300'
                        : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-red-500/40 hover:text-red-400'
                    }`}>
                    {confirmDelete === `acc-${acc.id}` ? 'ຢືນຢັນລຶບ?' : 'ລຶບ'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {employeeAccounts.length === 0 && (
            <p className="text-center text-dark-600 text-sm py-4">ຍັງບໍ່ມີພະນັກງານ</p>
          )}
        </div>
      </div>

      {/* Staff Display List */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-400" />
          ລາຍຊື່ພະນັກງານ (ສຳລັບເລືອກໃນຟອມ)
        </h3>
        <form onSubmit={handleAddStaff} className="flex gap-2 mb-4">
          <input className="input flex-1" placeholder="ຊື່ພະນັກງານ..."
            value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
          <button type="submit" className="btn-primary px-4"><Plus className="w-4 h-4" /></button>
        </form>
        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-xl border border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-primary-400">
                  {s.name.charAt(0)}
                </div>
                <span className="font-medium text-dark-200">{s.name}</span>
              </div>
              <button onClick={() => handleDeleteStaff(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  confirmDelete === s.id
                    ? 'bg-red-600/30 border-red-500 text-red-300'
                    : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-red-500/40 hover:text-red-400'
                }`}>
                {confirmDelete === s.id ? 'ຢືນຢັນລຶບ?' : 'ລຶບ'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Line Notify */}
      <div className="card">
        <h3 className="font-semibold text-dark-100 mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-400" />
          Line Notify Token
        </h3>
        <p className="text-xs text-dark-500 mb-4">ແຈ້ງເຕືອນ Line ທຸກຄັ້ງທີ່ໂອນເກັບຄັງ</p>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="input" placeholder="ໃສ່ Token ຈາກ notify-bot.line.me"
            value={form.lineToken || ''}
            onChange={e => setForm(f => ({ ...f, lineToken: e.target.value }))} />
          <button type="submit" className="btn-primary">ບັນທຶກ Token</button>
        </form>
      </div>
    </div>
  )
}
