import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, getDoc, getDocs, query, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── Collections ─────────────────────────────────────────────────────────────
export const COLS = {
  TRANSACTIONS: 'transactions',
  CASH_FLOW: 'cashFlows',
  STAFF_TASKS: 'staffTasks',
  ANNOUNCEMENTS: 'announcements',
  STAFF: 'staff',
  ACCOUNTS: 'accounts',
  SETTINGS: 'settings',
  MACHINES: 'machines',
}

// ─── Listeners (real-time) ────────────────────────────────────────────────────
export function listenTransactions(cb) {
  const q = query(collection(db, COLS.TRANSACTIONS), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
export function listenCashFlow(cb) {
  const q = query(collection(db, COLS.CASH_FLOW), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
export function listenStaffTasks(cb) {
  return onSnapshot(collection(db, COLS.STAFF_TASKS), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
export function listenAnnouncements(cb) {
  const q = query(collection(db, COLS.ANNOUNCEMENTS), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
export function listenStaff(cb) {
  return onSnapshot(collection(db, COLS.STAFF), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
export function listenAccounts(cb) {
  return onSnapshot(collection(db, COLS.ACCOUNTS), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
export function listenMachines(cb) {
  return onSnapshot(collection(db, COLS.MACHINES), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
export function listenSettings(cb) {
  return onSnapshot(doc(db, COLS.SETTINGS, 'main'), snap => {
    if (snap.exists()) cb(snap.data())
    else cb({ initialCash: 0, lineToken: '', businessName: 'ຮ້ານແລກເງິນ' })
  })
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function addTransaction(data) {
  const item = {
    staffId: data.staffId,
    staffName: data.staffName,
    type: data.type,
    sourceAmount: parseFloat(data.sourceAmount),
    rate: parseFloat(data.rate),
    netAmount: parseFloat(data.netAmount),
    profit: parseFloat(data.sourceAmount) * (parseFloat(data.rate) / 100),
    note: data.note || '',
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(db, COLS.TRANSACTIONS), item)
  return { id: ref.id, ...item }
}
export async function deleteTransaction(id) {
  await deleteDoc(doc(db, COLS.TRANSACTIONS, id))
}

// ─── Cash Flow ────────────────────────────────────────────────────────────────
export async function addCashFlow(data) {
  const item = {
    type: data.type,
    amount: parseFloat(data.amount),
    staffId: data.staffId || null,
    staffName: data.staffName || null,
    note: data.note || '',
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(db, COLS.CASH_FLOW), item)
  return { id: ref.id, ...item }
}
export async function deleteCashFlow(id) {
  await deleteDoc(doc(db, COLS.CASH_FLOW, id))
}

// ─── Staff Tasks ──────────────────────────────────────────────────────────────
export async function addStaffTask(data) {
  const item = {
    staffId: data.staffId,
    staffName: data.staffName,
    taskToday: data.taskToday || '',
    taskTomorrow: data.taskTomorrow || '',
    status: data.status || 'pending',
    priority: data.priority || 'normal',
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(db, COLS.STAFF_TASKS), item)
  return { id: ref.id, ...item }
}
export async function updateStaffTask(id, updates) {
  await updateDoc(doc(db, COLS.STAFF_TASKS, id), updates)
}
export async function deleteStaffTask(id) {
  await deleteDoc(doc(db, COLS.STAFF_TASKS, id))
}

// ─── Announcements ────────────────────────────────────────────────────────────
export async function addAnnouncement(data) {
  const item = {
    title: data.title,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    description: data.description || '',
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(db, COLS.ANNOUNCEMENTS), item)
  return { id: ref.id, ...item }
}
export async function deleteAnnouncement(id) {
  await deleteDoc(doc(db, COLS.ANNOUNCEMENTS, id))
}

// ─── Staff (display list) ─────────────────────────────────────────────────────
export async function addStaff(name) {
  const item = { name, role: 'employee' }
  const ref = await addDoc(collection(db, COLS.STAFF), item)
  return { id: ref.id, ...item }
}
export async function deleteStaff(id) {
  await deleteDoc(doc(db, COLS.STAFF, id))
}

// ─── Machines (ตู้/เครื่อง) ───────────────────────────────────────────────────
export async function addMachine(name) {
  const item = { name }
  const ref = await addDoc(collection(db, COLS.MACHINES), item)
  return { id: ref.id, ...item }
}
export async function deleteMachine(id) {
  await deleteDoc(doc(db, COLS.MACHINES, id))
}

// ─── Accounts (login) ────────────────────────────────────────────────────────
export async function addAccount(name, pin, role = 'employee') {
  const ref = await addDoc(collection(db, COLS.ACCOUNTS), { name, pin, role })
  return { id: ref.id, name, pin, role }
}
export async function deleteAccount(id) {
  await deleteDoc(doc(db, COLS.ACCOUNTS, id))
}
export async function updateAccountPin(id, pin) {
  await updateDoc(doc(db, COLS.ACCOUNTS, id), { pin })
}
export async function initOwnerAccount(pin = '1234') {
  const snap = await getDocs(collection(db, COLS.ACCOUNTS))
  const hasOwner = snap.docs.some(d => d.data().role === 'owner')
  if (!hasOwner) {
    await setDoc(doc(db, COLS.ACCOUNTS, 'owner'), { name: 'ເຈົ້າຂອງ', pin, role: 'owner' })
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function saveSettings(settings) {
  await setDoc(doc(db, COLS.SETTINGS, 'main'), settings, { merge: true })
}
export async function initSettings() {
  const snap = await getDoc(doc(db, COLS.SETTINGS, 'main'))
  if (!snap.exists()) {
    await setDoc(doc(db, COLS.SETTINGS, 'main'), {
      initialCash: 0,
      lineToken: '',
      businessName: 'ຮ້ານແລກເງິນ',
    })
  }
}
