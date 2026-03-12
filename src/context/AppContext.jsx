import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { sendLineNotify, buildCashInMessage, buildTransactionMessage } from '../utils/lineNotify'
import {
  listenTransactions, listenCashFlow, listenStaffTasks, listenAnnouncements,
  listenStaff, listenAccounts, listenMachines, listenSettings,
  addTransaction as _addTransaction, deleteTransaction as _deleteTransaction,
  addCashFlow as _addCashFlow, deleteCashFlow as _deleteCashFlow,
  addStaffTask as _addStaffTask, updateStaffTask as _updateStaffTask, deleteStaffTask as _deleteStaffTask,
  addAnnouncement as _addAnnouncement, deleteAnnouncement as _deleteAnnouncement,
  addStaff as _addStaff, deleteStaff as _deleteStaff,
  addMachine as _addMachine, deleteMachine as _deleteMachine,
  addAccount as _addAccount, deleteAccount as _deleteAccount, updateAccountPin as _updateAccountPin,
  saveSettings as _saveSettings, initOwnerAccount, initSettings,
} from '../utils/firestoreDB'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [cashFlow, setCashFlow] = useState([])
  const [staffTasks, setStaffTasks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [staff, setStaff] = useState([])
  const [machines, setMachines] = useState([])
  const [accounts, setAccounts] = useState([])
  const [settings, setSettings] = useState({ initialCash: 0, lineToken: '', businessName: 'ຮ້ານແລກເງິນ' })
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initOwnerAccount()
    initSettings()

    const unsubs = [
      listenTransactions(setTransactions),
      listenCashFlow(setCashFlow),
      listenStaffTasks(setStaffTasks),
      listenAnnouncements(setAnnouncements),
      listenStaff(setStaff),
      listenMachines(setMachines),
      listenAccounts(setAccounts),
      listenSettings((s) => { setSettings(s); setLoading(false) }),
    ]
    return () => unsubs.forEach(u => u())
  }, [])

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
  const addTransaction = useCallback(async (data) => {
    const item = await _addTransaction(data)
    showToast('ເພີ່ມລາຍການສຳເລັດ!')
    if (settings.lineToken) {
      sendLineNotify(settings.lineToken, buildTransactionMessage(
        data.staffName, data.type, data.sourceAmount, data.rate, item.profit
      ))
    }
    return item
  }, [showToast, settings])

  const deleteTransaction = useCallback(async (id) => {
    await _deleteTransaction(id)
    showToast('ລຶບລາຍການແລ້ວ', 'info')
  }, [showToast])

  // Cash flow
  const addCashFlow = useCallback(async (data) => {
    const item = await _addCashFlow(data)
    showToast('ບັນທຶກກະແສເງິນສົດສຳເລັດ!')
    if (data.type === 'โอนเก็บคลัง' && settings.lineToken) {
      sendLineNotify(settings.lineToken, buildCashInMessage(
        data.staffName || 'ບໍ່ລະບຸ', data.amount, data.note
      ))
    }
    return item
  }, [showToast, settings])

  const deleteCashFlow = useCallback(async (id) => {
    await _deleteCashFlow(id)
    showToast('ລຶບລາຍການແລ້ວ', 'info')
  }, [showToast])

  // Staff tasks
  const addStaffTask = useCallback(async (data) => {
    const item = await _addStaffTask(data)
    showToast('ເພີ່ມງານສຳເລັດ!')
    return item
  }, [showToast])

  const updateStaffTask = useCallback(async (id, updates) => {
    await _updateStaffTask(id, updates)
  }, [])

  const deleteStaffTask = useCallback(async (id) => {
    await _deleteStaffTask(id)
    showToast('ລຶບງານແລ້ວ', 'info')
  }, [showToast])

  // Announcements
  const addAnnouncement = useCallback(async (data) => {
    const item = await _addAnnouncement(data)
    showToast('ເພີ່ມປະກາດສຳເລັດ!')
    return item
  }, [showToast])

  const deleteAnnouncement = useCallback(async (id) => {
    await _deleteAnnouncement(id)
    showToast('ລຶບປະກາດແລ້ວ', 'info')
  }, [showToast])

  // Staff management
  const addStaff = useCallback(async (name) => {
    const item = await _addStaff(name)
    showToast('ເພີ່ມພະນັກງານສຳເລັດ!')
    return item
  }, [showToast])

  const deleteStaff = useCallback(async (id) => {
    await _deleteStaff(id)
    showToast('ລຶບພະນັກງານແລ້ວ', 'info')
  }, [showToast])

  // Machine management
  const addMachine = useCallback(async (name) => {
    const item = await _addMachine(name)
    showToast('ເພີ່ມຕູ້ສຳເລັດ!')
    return item
  }, [showToast])

  const deleteMachine = useCallback(async (id) => {
    await _deleteMachine(id)
    showToast('ລຶບຕູ້ແລ້ວ', 'info')
  }, [showToast])

  // Account management (login accounts with PIN)
  const addAccount = useCallback(async (name, pin) => {
    const item = await _addAccount(name, pin, 'employee')
    showToast('ເພີ່ມບັນຊີພະນັກງານສຳເລັດ!')
    return item
  }, [showToast])

  const deleteAccount = useCallback(async (id) => {
    await _deleteAccount(id)
    showToast('ລຶບບັນຊີແລ້ວ', 'info')
  }, [showToast])

  const updateAccountPin = useCallback(async (id, pin) => {
    await _updateAccountPin(id, pin)
    showToast('ອັບເດດລະຫັດສຳເລັດ!')
  }, [showToast])

  // Settings
  const saveSettings = useCallback(async (s) => {
    await _saveSettings(s)
    showToast('ບັນທຶກການຕັ້ງຄ່າສຳເລັດ!')
  }, [showToast])

  return (
    <AppContext.Provider value={{
      user, login, logout, loading,
      transactions, addTransaction, deleteTransaction,
      cashFlow, addCashFlow, deleteCashFlow,
      staffTasks, addStaffTask, updateStaffTask, deleteStaffTask,
      announcements, addAnnouncement, deleteAnnouncement,
      staff, addStaff, deleteStaff,
      machines, addMachine, deleteMachine,
      accounts, addAccount, deleteAccount, updateAccountPin,
      settings, saveSettings,
      currentPage, setCurrentPage,
      toast, showToast,
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
