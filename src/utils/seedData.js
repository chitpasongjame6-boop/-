import { v4 as uuidv4 } from 'uuid'
import { subDays, subHours, format } from 'date-fns'

const SEED_KEY = 'profit_seeded_v1'

export function seedDemoData() {
  if (localStorage.getItem(SEED_KEY)) return

  const staff = [
    { id: 'staff-1', name: 'สมชาย', role: 'employee' },
    { id: 'staff-2', name: 'สมหญิง', role: 'employee' },
    { id: 'staff-3', name: 'วิชัย', role: 'employee' },
  ]
  localStorage.setItem('profit_staff', JSON.stringify(staff))

  // Generate transactions for past 30 days
  const transactions = []
  const types = ['หลัก5', 'หลัก9']
  const rateMap = { 'หลัก5': [0.5, 1.0, 1.5, 2.0], 'หลัก9': [0.9, 1.9, 2.9] }

  for (let day = 0; day < 30; day++) {
    const count = Math.floor(Math.random() * 6) + 2
    for (let i = 0; i < count; i++) {
      const staffMember = staff[Math.floor(Math.random() * staff.length)]
      const type = types[Math.floor(Math.random() * 2)]
      const rates = rateMap[type]
      const rate = rates[Math.floor(Math.random() * rates.length)]
      const sourceAmount = (Math.floor(Math.random() * 20) + 1) * 1000 + Math.random() * 500
      const profit = sourceAmount * (rate / 100)
      const netAmount = sourceAmount - profit

      transactions.push({
        id: uuidv4(),
        staffId: staffMember.id,
        staffName: staffMember.name,
        type,
        sourceAmount: parseFloat(sourceAmount.toFixed(2)),
        rate,
        netAmount: parseFloat(netAmount.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        note: '',
        createdAt: subHours(subDays(new Date(), day), Math.floor(Math.random() * 10)).toISOString(),
      })
    }
  }
  localStorage.setItem('profit_transactions', JSON.stringify(transactions))

  // Generate cash flow entries
  const cashFlow = []
  for (let day = 0; day < 14; day++) {
    // Some days have transfers in
    if (Math.random() > 0.4) {
      cashFlow.push({
        id: uuidv4(),
        type: 'โอนเข้าตู้',
        amount: (Math.floor(Math.random() * 10) + 2) * 5000,
        staffId: staff[Math.floor(Math.random() * staff.length)].id,
        staffName: staff[Math.floor(Math.random() * staff.length)].name,
        note: '',
        createdAt: subHours(subDays(new Date(), day), 2).toISOString(),
      })
    }
    // Some days have vault withdrawals
    if (Math.random() > 0.6) {
      cashFlow.push({
        id: uuidv4(),
        type: 'โอนเก็บคลัง',
        amount: (Math.floor(Math.random() * 5) + 1) * 10000,
        staffId: null,
        staffName: null,
        note: 'โอนเก็บคลังประจำวัน',
        createdAt: subHours(subDays(new Date(), day), 1).toISOString(),
      })
    }
  }
  localStorage.setItem('profit_cash_flow', JSON.stringify(cashFlow))

  // Generate staff tasks
  const taskData = [
    { today: 'ดูแลลูกค้าหน้าร้าน และบันทึกรายการแลกเงิน', tomorrow: 'ตรวจสอบยอดเงินคงเหลือในตู้', status: 'in_progress', priority: 'high' },
    { today: 'อัปเดตรายงานยอดแลกรายวัน', tomorrow: 'ประสานงานกับผู้จัดการ', status: 'pending', priority: 'normal' },
    { today: 'จัดเตรียมเงินสำรองสำหรับวันพรุ่งนี้', tomorrow: '', status: 'done', priority: 'low' },
    { today: 'ฝึกพนักงานใหม่เรื่องการแลกเงิน', tomorrow: 'ทำรายงานสรุปประจำสัปดาห์', status: 'pending', priority: 'normal' },
  ]
  const tasks = taskData.map((t, i) => ({
    id: uuidv4(),
    staffId: staff[i % staff.length].id,
    staffName: staff[i % staff.length].name,
    taskToday: t.today,
    taskTomorrow: t.tomorrow,
    status: t.status,
    priority: t.priority,
    createdAt: subDays(new Date(), i).toISOString(),
  }))
  localStorage.setItem('profit_staff_tasks', JSON.stringify(tasks))

  // Generate announcements
  const announcements = [
    {
      id: uuidv4(),
      title: 'ประชุมทีมประจำสัปดาห์',
      date: format(subDays(new Date(), -2), 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '11:30',
      description: 'สรุปยอดขายประจำสัปดาห์ และวางแผนงานสัปดาห์หน้า',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'อบรมระบบใหม่',
      date: format(subDays(new Date(), -5), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '12:00',
      description: 'อบรมการใช้ระบบรายงานกำไรใหม่สำหรับพนักงานทุกคน',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'ประกาศ: ปรับเรทอัตราแลกเปลี่ยน',
      date: format(subDays(new Date(), -1), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      description: 'เรทหลัก5 ปรับเป็น 1.5% สำหรับยอดเกิน 50,000 บาท มีผลตั้งแต่วันนี้เป็นต้นไป',
      createdAt: subDays(new Date(), 1).toISOString(),
    },
    {
      id: uuidv4(),
      title: 'ประชุมสรุปยอดประจำเดือน',
      date: format(subDays(new Date(), -14), 'yyyy-MM-dd'),
      startTime: '14:00',
      endTime: '16:00',
      description: 'รีวิวยอดกำไร-ขาดทุนประจำเดือน และวางแผนเดือนหน้า',
      createdAt: new Date().toISOString(),
    },
  ]
  localStorage.setItem('profit_announcements', JSON.stringify(announcements))

  // Settings
  localStorage.setItem('profit_settings', JSON.stringify({
    initialCash: 500000,
    ownerPassword: '1234',
    employeePassword: '0000',
    lineToken: '',
    businessName: 'ร้านแลกเงิน สยาม',
  }))

  localStorage.setItem(SEED_KEY, '1')
}
