import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight,
  Activity, Users, ArrowLeftRight
} from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import {
  filterToday, filterThisMonth, filterThisWeek,
  sumProfit, sumSourceAmount, calcNetCashFlow,
  buildDailyProfitChart, buildTypeBreakdownChart,
  formatCurrency, formatNumber
} from '../utils/calculations'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      titleColor: '#94a3b8',
      bodyColor: '#f1f5f9',
      padding: 12,
      callbacks: {
        label: ctx => ` ₭${new Intl.NumberFormat('lo-LA').format(Math.round(ctx.raw))}`
      }
    }
  },
  scales: {
    x: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { size: 11 } }
    },
    y: {
      grid: { color: '#1e293b' },
      ticks: {
        color: '#64748b',
        font: { size: 11 },
        callback: v => `₭${new Intl.NumberFormat('lo-LA').format(v)}`
      }
    }
  }
}

function StatCard({ label, value, sub, icon: Icon, color, trend, trendLabel }) {
  const colors = {
    green: { bg: 'bg-primary-500/10', border: 'border-primary-500/20', text: 'text-primary-400', icon: 'bg-primary-500/20' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'bg-purple-500/20' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'bg-amber-500/20' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'bg-red-500/20' },
  }
  const c = colors[color] || colors.green
  return (
    <div className={`card border ${c.border} animate-slide-up`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-dark-500 text-xs font-medium mb-1">{label}</p>
          <p className={`text-2xl font-bold ${c.text} leading-tight`}>{value}</p>
          {sub && <p className="text-dark-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 ${c.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs ${trend >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{trendLabel || (trend >= 0 ? '+' + trend : trend) + '%'}</span>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { transactions, cashFlow, staff, settings, setCurrentPage } = useApp()

  const todayTx = useMemo(() => filterToday(transactions), [transactions])
  const weekTx = useMemo(() => filterThisWeek(transactions), [transactions])
  const monthTx = useMemo(() => filterThisMonth(transactions), [transactions])

  const todayProfit = useMemo(() => sumProfit(todayTx), [todayTx])
  const weekProfit = useMemo(() => sumProfit(weekTx), [weekTx])
  const monthProfit = useMemo(() => sumProfit(monthTx), [monthTx])
  const todayVolume = useMemo(() => sumSourceAmount(todayTx), [todayTx])

  const netCash = useMemo(() => calcNetCashFlow(settings.initialCash || 0, cashFlow), [cashFlow, settings])

  const dailyChart = useMemo(() => buildDailyProfitChart(transactions, 14), [transactions])
  const typeChart = useMemo(() => buildTypeBreakdownChart(monthTx), [monthTx])

  const recentTx = transactions.slice(0, 8)

  const staffPerf = useMemo(() => {
    const map = {}
    monthTx.forEach(tx => {
      if (!map[tx.staffName]) map[tx.staffName] = { name: tx.staffName, count: 0, profit: 0 }
      map[tx.staffName].count++
      map[tx.staffName].profit += tx.profit
    })
    return Object.values(map).sort((a, b) => b.profit - a.profit).slice(0, 5)
  }, [monthTx])

  const lineChartData = {
    labels: dailyChart.labels,
    datasets: [{
      data: dailyChart.data,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#0f172a',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  }

  const barChartData = {
    labels: typeChart.labels,
    datasets: [{
      data: typeChart.data,
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(168, 85, 247, 0.7)'],
      borderColor: ['#3b82f6', '#a855f7'],
      borderWidth: 1,
      borderRadius: 8,
    }]
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="กำไรวันนี้"
          value={formatCurrency(todayProfit)}
          sub={`${todayTx.length} รายการ`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="กำไรสัปดาห์นี้"
          value={formatCurrency(weekProfit)}
          sub={`${weekTx.length} รายการ`}
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="กำไรเดือนนี้"
          value={formatCurrency(monthProfit)}
          sub={`${monthTx.length} รายการ`}
          icon={BarChartIcon}
          color="purple"
        />
        <StatCard
          label="เงินในระบบ (สุทธิ)"
          value={formatCurrency(netCash)}
          sub="หลังหักโอน+เงินเดือน"
          icon={Wallet}
          color={netCash >= 0 ? 'amber' : 'red'}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-dark-500 text-xs mb-1">ยอดแลกวันนี้</p>
          <p className="text-xl font-bold text-dark-100">{formatCurrency(todayVolume)}</p>
          <p className="text-xs text-dark-500 mt-1">{todayTx.length} รายการ</p>
        </div>
        <div className="card">
          <p className="text-dark-500 text-xs mb-1">จำนวนพนักงาน</p>
          <p className="text-xl font-bold text-dark-100">{staff.length} คน</p>
          <p className="text-xs text-dark-500 mt-1">ทั้งหมดในระบบ</p>
        </div>
        <div className="card col-span-2 lg:col-span-1">
          <p className="text-dark-500 text-xs mb-1">รายการแลกเดือนนี้</p>
          <p className="text-xl font-bold text-dark-100">{formatNumber(sumSourceAmount(monthTx))}</p>
          <p className="text-xs text-dark-500 mt-1">ยอดรวมต้นทาง</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line chart - Daily Profit */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-dark-100">กำไรรายวัน</h3>
              <p className="text-xs text-dark-500">14 วันที่ผ่านมา</p>
            </div>
            <span className="badge badge-green">Line Chart</span>
          </div>
          <div className="h-52">
            <Line data={lineChartData} options={chartDefaults} />
          </div>
        </div>

        {/* Bar chart - Type Breakdown */}
        <div className="card">
          <div className="mb-4">
            <h3 className="font-semibold text-dark-100">แยกตามประเภท</h3>
            <p className="text-xs text-dark-500">กำไรเดือนนี้</p>
          </div>
          <div className="h-52">
            <Bar data={barChartData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {typeChart.labels.map((l, i) => (
              <div key={l} className="text-center">
                <p className="text-xs text-dark-500">{l}</p>
                <p className={`font-bold text-sm ${i === 0 ? 'text-blue-400' : 'text-purple-400'}`}>
                  {typeChart.counts[i]} ครั้ง
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff performance this month */}
      {staffPerf.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-dark-100">ผลงานพนักงานเดือนนี้</h3>
              <p className="text-xs text-dark-500">เรียงตามกำไรสูงสุด</p>
            </div>
            <Users className="w-4 h-4 text-dark-500" />
          </div>
          <div className="space-y-2.5">
            {staffPerf.map((s, i) => {
              const maxProfit = staffPerf[0]?.profit || 1
              const pct = Math.round((s.profit / maxProfit) * 100)
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-5 text-right flex-shrink-0 ${
                    i === 0 ? 'text-amber-400' : i === 1 ? 'text-dark-300' : 'text-dark-600'
                  }`}>#{i + 1}</span>
                  <span className="text-sm text-dark-200 w-20 truncate flex-shrink-0">{s.name}</span>
                  <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-primary-400 w-24 text-right flex-shrink-0">
                    +{formatCurrency(s.profit)}
                  </span>
                  <span className="text-xs text-dark-500 w-14 text-right flex-shrink-0">
                    {s.count} ครั้ง
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-100">รายการล่าสุด</h3>
          <button
            onClick={() => setCurrentPage('transactions')}
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            ดูทั้งหมด <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        {recentTx.length === 0 ? (
          <div className="text-center py-10 text-dark-500">
            <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>ยังไม่มีรายการ · กดเพิ่มรายการแลกเงินได้เลย</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  <th className="table-header">พนักงาน</th>
                  <th className="table-header">ประเภท</th>
                  <th className="table-header text-right">ยอดต้นทาง</th>
                  <th className="table-header text-right">เรท%</th>
                  <th className="table-header text-right">กำไร</th>
                  <th className="table-header">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="table-cell font-medium">{tx.staffName}</td>
                    <td className="table-cell">
                      <span className={`badge ${tx.type === 'หลัก5' ? 'badge-blue' : 'badge-purple'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="table-cell text-right font-mono">₭{formatNumber(tx.sourceAmount)}</td>
                    <td className="table-cell text-right text-dark-400">{tx.rate}%</td>
                    <td className="table-cell text-right font-semibold text-primary-400">
                      +₭{formatNumber(tx.profit)}
                    </td>
                    <td className="table-cell text-dark-500 text-xs">
                      {format(new Date(tx.createdAt), 'HH:mm d MMM', { locale: th })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function BarChartIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  )
}
