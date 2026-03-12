import { format } from 'date-fns'
import { th } from 'date-fns/locale'

function escapeCell(val) {
  const str = String(val ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsv(headers, rows) {
  const headerRow = headers.map(escapeCell).join(',')
  const dataRows = rows.map(row => row.map(escapeCell).join(','))
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n')  // BOM for Thai characters in Excel
}

function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportTransactionsCsv(transactions, filename) {
  const headers = ['ວັນທີ່', 'ເວລາ', 'ພນັກງານ', 'ປະເພດ', 'ຍອດຕົ້ນທາງ (₭)', 'ເຣດ (%)', 'ຍອດສຸທທິ (₭)', 'ກຳໄລ (₭)', 'ຫມາຍເຫດຸ']
  const rows = transactions.map(tx => [
    format(new Date(tx.createdAt), 'dd/MM/yyyy', { locale: th }),
    format(new Date(tx.createdAt), 'HH:mm'),
    tx.staffName,
    tx.type,
    tx.sourceAmount,
    tx.rate,
    tx.netAmount,
    tx.profit,
    tx.note || '',
  ])
  downloadCsv(filename || `รายการแลกเงิน_${format(new Date(), 'yyyyMMdd')}.csv`, buildCsv(headers, rows))
}

export function exportCashFlowCsv(cashFlow, filename) {
  const headers = ['ວັນທີ່', 'ເວລາ', 'ປະເພດ', 'ຈໍານວນເງິນ (₭)', 'ພນັກງານ', 'ຫມາຍເຫດຸ']
  const rows = cashFlow.map(cf => [
    format(new Date(cf.createdAt), 'dd/MM/yyyy', { locale: th }),
    format(new Date(cf.createdAt), 'HH:mm'),
    cf.type,
    cf.amount,
    cf.staffName || '',
    cf.note || '',
  ])
  downloadCsv(filename || `กระแสเงินสด_${format(new Date(), 'yyyyMMdd')}.csv`, buildCsv(headers, rows))
}

export function exportPLReportCsv({ transactions, from, to, totalProfit, totalVolume, cashIn, cashOut }) {
  const headers = ['รายการ', 'จำนวน']
  const rows = [
    ['ช่วงเวลา', `${format(from, 'dd/MM/yyyy')} – ${format(to, 'dd/MM/yyyy')}`],
    ['', ''],
    ['กำไรจากการแลกเงิน', totalProfit],
    ['ยอดแลกรวม', totalVolume],
    ['โอนเข้าตู้', cashIn],
    ['โอนออก + เงินเดือน', cashOut],
    ['กำไรสุทธิ', totalProfit + cashIn - cashOut],
    ['', ''],
    ['จำนวนรายการ', transactions.length],
  ]
  downloadCsv(`รายงานกำไร_${format(new Date(), 'yyyyMMdd')}.csv`, buildCsv(headers, rows))
}
