import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { sendLineNotify, buildCashInMessage, buildTransactionMessage } from '../utils/lineNotify'
import {
  getTransactions, getStaff, getCashFlow, getStaffTasks, getAnnouncements, getSettings,
  addTransaction as _addTransaction, deleteTransaction as _deleteTransaction,
  addCashFlow as _addCashFlow, deleteCashFlow as _deleteCashFlow,
  addStaffTask as _addStaffTask, updateStaffTask as _updateStaffTask, deleteStaffTask as _deleteStaffTask,
  addAnnouncement as _addAnnouncement, deleteAnnouncement as _deleteAnnouncement,
  addStaff as _addStaff, deleteStaff as _deleteStaff,
  saveSettings as _saveSettings,
} from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null) // { role: 'owner' | 'employee', name: string }
  const [transactions, setTransactions] = useState([])
  const [cashFlow, setCashFlow] = useState([])
  const [staffTasks, setStaffTasks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [staff, setStaff] = useState([])
  const [settings, setSettings] = useState({})
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [toast, setToast] = useState(null)

  const refresh = useCallback(() => {
    setTransactions(getTransactions())
    setCashFlow(getCashFlow())
    setStaffTasks(getStaffTasks())
    setAnnouncements(getAnnouncements())
    setStaff(getStaff())
    setSettings(getSettings())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const showToast = useCallback((message, type = 'success') => {
    if (!message) { setToast(null); return }
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const login = useCallback((role, name) => {
    setUser({ role, name })
    setCurrentPage('dashboard')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setCurrentPage('dashboard')
  }, [])

  // Transactions
  const addTransaction = useCallback((data) => {
    const item = _addTransaction(data)
    setTransactions(getTransactions())
    showToast('เพิ่มรายการสำเร็จ!')
    const cfg = getSettings()
    if (cfg.lineToken) {
      sendLineNotify(cfg.lineToken, buildTransactionMessage(
        data.staffName, data.type, data.sourceAmount, data.rate, item.profit
      ))
    }
    return item
  }, [showToast])

  const deleteTransaction = useCallback((id) => {
    _deleteTransaction(id)
    setTransactions(getTransactions())
    showToast('ลบรายการแล้ว', 'info')
  }, [showToast])

  // Cash flow
  const addCashFlow = useCallback((data) => {
    const item = _addCashFlow(data)
    setCashFlow(getCashFlow())
    showToast('บันทึกกระแสเงินสดสำเร็จ!')
    if (data.type === 'โอนเก็บคลัง') {
      const cfg = getSettings()
      if (cfg.lineToken) {
        sendLineNotify(cfg.lineToken, buildCashInMessage(
          data.staffName || 'ไม่ระบุ', data.amount, data.note
        ))
      }
    }
    return item
  }, [showToast])

  const deleteCashFlow = useCallback((id) => {
    _deleteCashFlow(id)
    setCashFlow(getCashFlow())
    showToast('ลบรายการแล้ว', 'info')
  }, [showToast])

  // Staff tasks
  const addStaffTask = useCallback((data) => {
    const item = _addStaffTask(data)
    setStaffTasks(getStaffTasks())
    showToast('เพิ่มงานสำเร็จ!')
    return item
  }, [showToast])

  const updateStaffTask = useCallback((id, updates) => {
    _updateStaffTask(id, updates)
    setStaffTasks(getStaffTasks())
  }, [])

  const deleteStaffTask = useCallback((id) => {
    _deleteStaffTask(id)
    setStaffTasks(getStaffTasks())
    showToast('ลบงานแล้ว', 'info')
  }, [showToast])

  // Announcements
  const addAnnouncement = useCallback((data) => {
    const item = _addAnnouncement(data)
    setAnnouncements(getAnnouncements())
    showToast('เพิ่มประกาศสำเร็จ!')
    return item
  }, [showToast])

  const deleteAnnouncement = useCallback((id) => {
    _deleteAnnouncement(id)
    setAnnouncements(getAnnouncements())
    showToast('ลบประกาศแล้ว', 'info')
  }, [showToast])

  // Staff management
  const addStaff = useCallback((name) => {
    const item = _addStaff(name)
    setStaff(getStaff())
    showToast('เพิ่มพนักงานสำเร็จ!')
    return item
  }, [showToast])

  const deleteStaff = useCallback((id) => {
    _deleteStaff(id)
    setStaff(getStaff())
    showToast('ลบพนักงานแล้ว', 'info')
  }, [showToast])

  // Settings
  const saveSettings = useCallback((s) => {
    _saveSettings(s)
    setSettings(getSettings())
    showToast('บันทึกการตั้งค่าสำเร็จ!')
  }, [showToast])

  return (
    <AppContext.Provider value={{
      user, login, logout,
      transactions, addTransaction, deleteTransaction,
      cashFlow, addCashFlow, deleteCashFlow,
      staffTasks, addStaffTask, updateStaffTask, deleteStaffTask,
      announcements, addAnnouncement, deleteAnnouncement,
      staff, addStaff, deleteStaff,
      settings, saveSettings,
      currentPage, setCurrentPage,
      toast, showToast,
      refresh,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
