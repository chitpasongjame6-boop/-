import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, format, eachDayOfInterval, subDays } from 'date-fns'
import { th } from 'date-fns/locale'

// ─── Profit Calculations ──────────────────────────────────────────────────────
export function calcProfit(sourceAmount, rate) {
  return parseFloat(sourceAmount) * (parseFloat(rate) / 100)
}

export function filterByDateRange(items, from, to) {
  const start = startOfDay(from)
  const end = endOfDay(to)
  return items.filter(item => {
    const d = parseISO(item.createdAt)
    return isWithinInterval(d, { start, end })
  })
}

export function filterToday(items) {
  const now = new Date()
  return filterByDateRange(items, now, now)
}

export function filterThisWeek(items) {
  const now = new Date()
  return filterByDateRange(items, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }))
}

export function filterThisMonth(items) {
  const now = new Date()
  return filterByDateRange(items, startOfMonth(now), endOfMonth(now))
}

// Total profit from transactions
export function sumProfit(transactions) {
  return transactions.reduce((sum, t) => sum + (t.profit || 0), 0)
}

// Total source amount exchanged
export function sumSourceAmount(transactions) {
  return transactions.reduce((sum, t) => sum + (t.sourceAmount || 0), 0)
}

// ─── Cash Flow Calculations ───────────────────────────────────────────────────
export function calcNetCashFlow(initialCash, cashFlows) {
  let balance = parseFloat(initialCash) || 0
  for (const cf of cashFlows) {
    if (cf.type === 'โอนเก็บคลัง') balance += cf.amount
    else if (cf.type === 'โอนเข้าตู้') balance -= cf.amount
  }
  return balance
}

export function sumCashIn(cashFlows) {
  return cashFlows.filter(cf => cf.type === 'โอนเก็บคลัง').reduce((s, cf) => s + cf.amount, 0)
}

export function sumCashOut(cashFlows) {
  return cashFlows.filter(cf => cf.type === 'โอนเข้าตู้').reduce((s, cf) => s + cf.amount, 0)
}

// ─── Chart Data Builders ──────────────────────────────────────────────────────
export function buildDailyProfitChart(transactions, days = 30) {
  const now = new Date()
  const from = subDays(now, days - 1)
  const dates = eachDayOfInterval({ start: from, end: now })

  const labels = dates.map(d => format(d, 'd MMM', { locale: th }))
  const data = dates.map(d => {
    const dayTx = filterByDateRange(transactions, d, d)
    return sumProfit(dayTx)
  })

  return { labels, data }
}

export function buildTypeBreakdownChart(transactions) {
  const หลัก5 = transactions.filter(t => t.type === 'หลัก5')
  const หลัก9 = transactions.filter(t => t.type === 'หลัก9')
  return {
    labels: ['หลัก 5', 'หลัก 9'],
    data: [sumProfit(หลัก5), sumProfit(หลัก9)],
    counts: [หลัก5.length, หลัก9.length],
  }
}

export function buildWeeklyProfitChart(transactions, weeks = 8) {
  const results = []
  const now = new Date()
  for (let i = weeks - 1; i >= 0; i--) {
    const refDate = subDays(now, i * 7)
    const wStart = startOfWeek(refDate, { weekStartsOn: 1 })
    const wEnd = endOfWeek(refDate, { weekStartsOn: 1 })
    const wTx = filterByDateRange(transactions, wStart, wEnd)
    results.push({
      label: `${format(wStart, 'd MMM', { locale: th })}`,
      profit: sumProfit(wTx),
      volume: sumSourceAmount(wTx),
      count: wTx.length,
    })
  }
  return results
}

// ─── Summary Helpers ──────────────────────────────────────────────────────────
export function formatNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '0'
  return new Intl.NumberFormat('lo-LA').format(Math.round(n))
}

export function formatCurrency(n) {
  if (n === null || n === undefined || isNaN(n)) return '₭0'
  return '₭' + new Intl.NumberFormat('lo-LA').format(Math.round(n))
}

export function calcProfitRate(profit, total) {
  if (!total) return 0
  return ((profit / total) * 100).toFixed(2)
}
