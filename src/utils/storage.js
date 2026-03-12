import { v4 as uuidv4 } from 'uuid'

const KEYS = {
  TRANSACTIONS: 'profit_transactions',
  CASH_FLOW: 'profit_cash_flow',
  STAFF_TASKS: 'profit_staff_tasks',
  ANNOUNCEMENTS: 'profit_announcements',
  STAFF: 'profit_staff',
  SETTINGS: 'profit_settings',
}

function load(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─── Staff ───────────────────────────────────────────────────────────────────
export function getStaff() {
  return load(KEYS.STAFF) || [
    { id: 'staff-1', name: 'สมชาย', role: 'employee' },
    { id: 'staff-2', name: 'สมหญิง', role: 'employee' },
    { id: 'staff-3', name: 'วิชัย', role: 'employee' },
  ]
}
export function saveStaff(staff) { save(KEYS.STAFF, staff) }
export function addStaff(name) {
  const staff = getStaff()
  const item = { id: uuidv4(), name, role: 'employee' }
  staff.push(item)
  saveStaff(staff)
  return item
}
export function deleteStaff(id) {
  const staff = getStaff().filter(s => s.id !== id)
  saveStaff(staff)
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export function getTransactions() {
  return load(KEYS.TRANSACTIONS) || []
}
export function saveTransactions(list) { save(KEYS.TRANSACTIONS, list) }
export function addTransaction(data) {
  const list = getTransactions()
  const item = {
    id: uuidv4(),
    staffId: data.staffId,
    staffName: data.staffName,
    type: data.type,         // 'หลัก5' | 'หลัก9'
    sourceAmount: parseFloat(data.sourceAmount),
    rate: parseFloat(data.rate),
    netAmount: parseFloat(data.netAmount),
    profit: parseFloat(data.sourceAmount) * (parseFloat(data.rate) / 100),
    note: data.note || '',
    createdAt: new Date().toISOString(),
  }
  list.unshift(item)
  saveTransactions(list)
  return item
}
export function deleteTransaction(id) {
  const list = getTransactions().filter(t => t.id !== id)
  saveTransactions(list)
}

// ─── Cash Flow ────────────────────────────────────────────────────────────────
export function getCashFlow() {
  return load(KEYS.CASH_FLOW) || []
}
export function saveCashFlow(list) { save(KEYS.CASH_FLOW, list) }
export function addCashFlow(data) {
  const list = getCashFlow()
  const item = {
    id: uuidv4(),
    type: data.type,         // 'โอนเข้าตู้' | 'โอนเก็บคลัง' | 'เงินเดือน'
    amount: parseFloat(data.amount),
    staffId: data.staffId || null,
    staffName: data.staffName || null,
    note: data.note || '',
    createdAt: new Date().toISOString(),
  }
  list.unshift(item)
  saveCashFlow(list)
  return item
}
export function deleteCashFlow(id) {
  const list = getCashFlow().filter(c => c.id !== id)
  saveCashFlow(list)
}

// ─── Staff Tasks ──────────────────────────────────────────────────────────────
export function getStaffTasks() {
  return load(KEYS.STAFF_TASKS) || []
}
export function saveStaffTasks(list) { save(KEYS.STAFF_TASKS, list) }
export function addStaffTask(data) {
  const list = getStaffTasks()
  const item = {
    id: uuidv4(),
    staffId: data.staffId,
    staffName: data.staffName,
    taskToday: data.taskToday || '',
    taskTomorrow: data.taskTomorrow || '',
    status: data.status || 'pending',  // 'pending' | 'in_progress' | 'done'
    priority: data.priority || 'normal', // 'low' | 'normal' | 'high'
    createdAt: new Date().toISOString(),
  }
  list.push(item)
  saveStaffTasks(list)
  return item
}
export function updateStaffTask(id, updates) {
  const list = getStaffTasks().map(t => t.id === id ? { ...t, ...updates } : t)
  saveStaffTasks(list)
}
export function deleteStaffTask(id) {
  const list = getStaffTasks().filter(t => t.id !== id)
  saveStaffTasks(list)
}

// ─── Announcements ────────────────────────────────────────────────────────────
export function getAnnouncements() {
  return load(KEYS.ANNOUNCEMENTS) || []
}
export function saveAnnouncements(list) { save(KEYS.ANNOUNCEMENTS, list) }
export function addAnnouncement(data) {
  const list = getAnnouncements()
  const item = {
    id: uuidv4(),
    title: data.title,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    description: data.description || '',
    createdAt: new Date().toISOString(),
  }
  list.unshift(item)
  saveAnnouncements(list)
  return item
}
export function deleteAnnouncement(id) {
  const list = getAnnouncements().filter(a => a.id !== id)
  saveAnnouncements(list)
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export function getSettings() {
  return load(KEYS.SETTINGS) || {
    initialCash: 0,
    ownerPassword: '1234',
    employeePassword: '0000',
    lineToken: '',
    businessName: 'ร้านแลกเงิน',
  }
}
export function saveSettings(settings) { save(KEYS.SETTINGS, settings) }
