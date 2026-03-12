import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  filterByDateRange, sumProfit, sumSourceAmount,
  buildWeeklyProfitChart, buildDailyProfitChart, buildTypeBreakdownChart,
  formatCurrency, formatNumber, calcProfitRate
} from '../utils/calculations'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, format } from 'date-fns'
import { th } from 'date-fns/locale'
import { BarChart3, Calendar, Download } from 'lucide-react'
import { exportTransactionsCsv, exportPLReportCsv } from '../utils/exportCsv'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement)

const chartBase = {
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
    }
  },
  scales: {
    x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { size: 11 }, callback: v => `₭${new Intl.NumberFormat('lo-LA').format(v)}` }
    }
  }
}

const PERIOD_OPTS = [
  { value: 'week', label: 'สัปดาห์นี้' },
  { value: 'month', label: 'เดือนนี้' },
  { value: 'last_month', label: 'เดือนที่แล้ว' },
  { value: 'custom', label: 'กำหนดเอง' },
]

export default function Reports() {
  const { transactions, cashFlow, machines, settings } = useApp()
  const [period, setPeriod] = useState('month')
  const [customFrom, setCustomFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [customTo, setCustomTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [activeTab, setActiveTab] = useState('overview')

  const dateRange = useMemo(() => {
    const now = new Date()
    if (period === 'week') return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
    if (period === 'month') return { from: startOfMonth(now), to: endOfMonth(now) }
    if (period === 'last_month') {
      const lm = subMonths(now, 1)
      return { from: startOfMonth(lm), to: endOfMonth(lm) }
    }
    return { from: new Date(customFrom), to: new Date(customTo) }
  }, [period, customFrom, customTo])

  const filteredTx = useMemo(() => filterByDateRange(transactions, dateRange.from, dateRange.to), [transactions, dateRange])
  const filteredCf = useMemo(() => filterByDateRange(cashFlow, dateRange.from, dateRange.to), [cashFlow, dateRange])

  const totalProfit = useMemo(() => sumProfit(filteredTx), [filteredTx])
  const totalVolume = useMemo(() => sumSourceAmount(filteredTx), [filteredTx])
  const profitRate = useMemo(() => calcProfitRate(totalProfit, totalVolume), [totalProfit, totalVolume])

  const cashIn = useMemo(() => filteredCf.filter(c => c.type === 'โอนเก็บคลัง').reduce((s, c) => s + c.amount, 0), [filteredCf])
  const cashOut = useMemo(() => filteredCf.filter(c => c.type === 'โอนเข้าตู้' || c.type === 'ยอดถอน').reduce((s, c) => s + c.amount, 0), [filteredCf])

  const weeklyData = useMemo(() => buildWeeklyProfitChart(transactions, 8), [transactions])
  const dailyData = useMemo(() => buildDailyProfitChart(filteredTx, 30), [filteredTx])
  const typeData = useMemo(() => buildTypeBreakdownChart(filteredTx), [filteredTx])

  // Staff performance
  const staffPerf = useMemo(() => {
    const map = {}
    filteredTx.forEach(tx => {
      if (!map[tx.staffName]) map[tx.staffName] = { name: tx.staffName, count: 0, profit: 0, volume: 0 }
      map[tx.staffName].count++
      map[tx.staffName].profit += tx.profit
      map[tx.staffName].volume += tx.sourceAmount
    })
    return Object.values(map).sort((a, b) => b.profit - a.profit)
  }, [filteredTx])

  const dailyLineData = {
    labels: dailyData.labels,
    datasets: [{
      label: 'กำไร',
      data: dailyData.data,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
    }]
  }

  const weeklyBarData = {
    labels: weeklyData.map(w => w.label),
    datasets: [{
      label: 'กำไรรายสัปดาห์',
      data: weeklyData.map(w => w.profit),
      backgroundColor: 'rgba(59,130,246,0.7)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 8,
    }]
  }

  const doughnutData = {
    labels: typeData.labels,
    datasets: [{
      data: typeData.data,
      backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(168,85,247,0.8)'],
      borderColor: ['#3b82f6', '#a855f7'],
      borderWidth: 2,
    }]
  }

  // Machine performance
  const machinePerf = useMemo(() => {
    const map = {}
    filteredTx.forEach(tx => {
      if (!tx.machineName) return
      if (!map[tx.machineName]) map[tx.machineName] = { name: tx.machineName, count: 0, profit: 0, volume: 0, cashIn: 0, cashOut: 0 }
      map[tx.machineName].count++
      map[tx.machineName].profit += tx.profit || 0
      map[tx.machineName].volume += tx.sourceAmount || 0
    })
    filteredCf.forEach(cf => {
      if (!cf.machineName) return
      if (!map[cf.machineName]) map[cf.machineName] = { name: cf.machineName, count: 0, profit: 0, volume: 0, cashIn: 0, cashOut: 0 }
      if (cf.type === 'โอนเก็บคลัง') map[cf.machineName].cashIn += cf.amount || 0
      else map[cf.machineName].cashOut += cf.amount || 0
    })
    return Object.values(map).sort((a, b) => b.profit - a.profit)
  }, [filteredTx, filteredCf])

  const tabs = [
    { id: 'overview', label: 'ພາບລວມ' },
    { id: 'charts', label: 'ກຣາຟ' },
    { id: 'machines', label: 'ຕູ້' },
    { id: 'staff', label: 'ພະນັກງານ' },
    { id: 'detail', label: 'ລາຍລະອີດ' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Period selector */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {PERIOD_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  period === opt.value
                    ? 'bg-primary-600/30 border-primary-500 text-primary-300'
                    : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <input type="date" className="input py-1.5 text-sm w-auto" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
              <span className="text-dark-500">ถึง</span>
              <input type="date" className="input py-1.5 text-sm w-auto" value={customTo} onChange={e => setCustomTo(e.target.value)} />
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-dark-500">
              {format(dateRange.from, 'd MMM yyyy', { locale: th })} – {format(dateRange.to, 'd MMM yyyy', { locale: th })}
            </span>
            <button
              onClick={() => exportTransactionsCsv(filteredTx)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-600 hover:border-primary-500/50 text-dark-300 hover:text-primary-300 rounded-xl text-xs font-medium transition-all"
              title="Export รายการแลกเงิน"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => exportPLReportCsv({ transactions: filteredTx, from: dateRange.from, to: dateRange.to, totalProfit, totalVolume, cashIn, cashOut })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600/20 border border-primary-500/30 hover:border-primary-500/60 text-primary-400 rounded-xl text-xs font-medium transition-all"
              title="Export รายงาน P&L"
            >
              <Download className="w-3.5 h-3.5" />
              P&L Report
            </button>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-dark-900 border border-dark-700 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id
                ? 'bg-primary-600/30 text-primary-300 border border-primary-600/30'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card border border-primary-500/20">
              <p className="text-xs text-dark-500 mb-1">กำไรรวม</p>
              <p className="text-2xl font-bold text-primary-400">{formatCurrency(totalProfit)}</p>
              <p className="text-xs text-dark-500 mt-1">อัตรากำไร {profitRate}%</p>
            </div>
            <div className="card">
              <p className="text-xs text-dark-500 mb-1">ยอดแลกรวม</p>
              <p className="text-2xl font-bold text-dark-100">{formatCurrency(totalVolume)}</p>
              <p className="text-xs text-dark-500 mt-1">{filteredTx.length} รายการ</p>
            </div>
            <div className="card border border-primary-500/10">
              <p className="text-xs text-dark-500 mb-1">ໂອນເກັບຄັງ (ລາຍຮັບ)</p>
              <p className="text-2xl font-bold text-primary-400">+{formatCurrency(cashIn)}</p>
            </div>
            <div className="card border border-red-500/10">
              <p className="text-xs text-dark-500 mb-1">ໂອນເຂ້າຕູ້ (ລາຍຈ່າຍ)</p>
              <p className="text-2xl font-bold text-red-400">-{formatCurrency(cashOut)}</p>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="card">
            <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-400" />
              สรุปกำไร-ขาดทุน
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-dark-800">
                <span className="text-dark-400">กำไรจากการแลกเงิน</span>
                <span className="font-bold text-primary-400">+{formatCurrency(totalProfit)}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-dark-800">
                <span className="text-dark-400">ໂອນເກັບຄັງ (ລາຍຮັບ)</span>
                <span className="font-semibold text-primary-300">+{formatCurrency(cashIn)}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-dark-800">
                <span className="text-dark-400">ໂອນເຂ້າຕູ້ (ລາຍຈ່າຍ)</span>
                <span className="font-semibold text-red-400">-{formatCurrency(cashOut)}</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-dark-800 rounded-xl px-4 mt-2">
                <span className="font-bold text-dark-100">กำไรสุทธิ (Net Profit)</span>
                <span className={`text-xl font-bold ${(totalProfit + cashIn - cashOut) >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
                  {formatCurrency(totalProfit + cashIn - cashOut)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts tab */}
      {activeTab === 'charts' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-dark-100">กำไรรายวัน</h3>
                  <p className="text-xs text-dark-500">ช่วงเวลาที่เลือก</p>
                </div>
                <span className="badge badge-green">Line Chart</span>
              </div>
              <div className="h-64">
                <Line data={dailyLineData} options={chartBase} />
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-dark-100 mb-4">แบ่งตามประเภท</h3>
              <div className="h-48">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 }
                      },
                      tooltip: {
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderWidth: 1,
                        callbacks: { label: ctx => ` ₭${formatNumber(ctx.raw)}` }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark-100">กำไรรายสัปดาห์ (8 สัปดาห์ล่าสุด)</h3>
              <span className="badge badge-blue">Bar Chart</span>
            </div>
            <div className="h-52">
              <Bar data={weeklyBarData} options={chartBase} />
            </div>
          </div>
        </div>
      )}

      {/* Machine tab */}
      {activeTab === 'machines' && (
        <div className="card animate-fade-in">
          <h3 className="font-semibold text-dark-100 mb-4">ສະຫຼຸປແຕ່ລະຕູ້</h3>
          {machinePerf.length === 0 ? (
            <div className="text-center text-dark-500 py-10">
              <p>ຍັງບໍ່ມີຂ້ອມູນ — ເພີ່ມຕູ້ໃນ Settings ແລ້ວເລືອກຕູ້ໃນຟອມ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-800">
                    <th className="table-header">ຕູ້ / ເຄື່ອງ</th>
                    <th className="table-header text-right">ລາຍການບັດ</th>
                    <th className="table-header text-right">ຍອດບັດ (₭)</th>
                    <th className="table-header text-right">ກຳໄລ (₭)</th>
                    <th className="table-header text-right">ໂອນເກັບ (₭)</th>
                    <th className="table-header text-right">ໂອນເຂ້າ (₭)</th>
                  </tr>
                </thead>
                <tbody>
                  {machinePerf.map((m, i) => (
                    <tr key={m.name} className="hover:bg-dark-800/50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-blue-400">{i+1}</div>
                          <span className="font-semibold text-dark-200">{m.name}</span>
                        </div>
                      </td>
                      <td className="table-cell text-right">{m.count}</td>
                      <td className="table-cell text-right font-mono text-dark-300">₭{formatNumber(m.volume)}</td>
                      <td className="table-cell text-right font-bold text-primary-400">₭{formatNumber(m.profit)}</td>
                      <td className="table-cell text-right text-green-400">₭{formatNumber(m.cashIn)}</td>
                      <td className="table-cell text-right text-red-400">₭{formatNumber(m.cashOut)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-dark-700">
                    <td className="py-3 px-4 text-sm font-bold text-dark-300">ຣວມ</td>
                    <td className="py-3 px-4 text-right font-bold text-dark-200">{machinePerf.reduce((s,m)=>s+m.count,0)}</td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-dark-200">₭{formatNumber(machinePerf.reduce((s,m)=>s+m.volume,0))}</td>
                    <td className="py-3 px-4 text-right font-bold text-primary-400">₭{formatNumber(machinePerf.reduce((s,m)=>s+m.profit,0))}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-400">₭{formatNumber(machinePerf.reduce((s,m)=>s+m.cashIn,0))}</td>
                    <td className="py-3 px-4 text-right font-bold text-red-400">₭{formatNumber(machinePerf.reduce((s,m)=>s+m.cashOut,0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Staff performance tab */}
      {activeTab === 'staff' && (
        <div className="card animate-fade-in">
          <h3 className="font-semibold text-dark-100 mb-4">ผลงานพนักงาน</h3>
          {staffPerf.length === 0 ? (
            <p className="text-center text-dark-500 py-10">ไม่มีข้อมูลในช่วงเวลานี้</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-800">
                    <th className="table-header">อันดับ</th>
                    <th className="table-header">พนักงาน</th>
                    <th className="table-header text-right">จำนวนรายการ</th>
                    <th className="table-header text-right">ยอดแลก</th>
                    <th className="table-header text-right">กำไร</th>
                    <th className="table-header text-right">อัตรา%</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerf.map((s, i) => (
                    <tr key={s.name} className="hover:bg-dark-800/50 transition-colors">
                      <td className="table-cell">
                        <span className={`font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-dark-300' : i === 2 ? 'text-amber-700' : 'text-dark-500'}`}>
                          #{i + 1}
                        </span>
                      </td>
                      <td className="table-cell font-medium">{s.name}</td>
                      <td className="table-cell text-right">{s.count}</td>
                      <td className="table-cell text-right font-mono">₭{formatNumber(s.volume)}</td>
                      <td className="table-cell text-right font-semibold text-primary-400">₭{formatNumber(s.profit)}</td>
                      <td className="table-cell text-right text-dark-400">{calcProfitRate(s.profit, s.volume)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail tab */}
      {activeTab === 'detail' && (
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-100">รายการทั้งหมด ({filteredTx.length})</h3>
          </div>
          {filteredTx.length === 0 ? (
            <p className="text-center text-dark-500 py-10">ไม่มีรายการในช่วงเวลานี้</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-800">
                    <th className="table-header">วันที่</th>
                    <th className="table-header">พนักงาน</th>
                    <th className="table-header">ประเภท</th>
                    <th className="table-header text-right">ยอดต้นทาง</th>
                    <th className="table-header text-right">เรท%</th>
                    <th className="table-header text-right">กำไร</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map(tx => (
                    <tr key={tx.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="table-cell text-dark-500 text-xs whitespace-nowrap">
                        {format(new Date(tx.createdAt), 'dd/MM/yy HH:mm', { locale: th })}
                      </td>
                      <td className="table-cell font-medium">{tx.staffName}</td>
                      <td className="table-cell">
                        <span className={`badge ${tx.type === 'หลัก5' ? 'badge-blue' : 'badge-purple'}`}>{tx.type}</span>
                      </td>
                      <td className="table-cell text-right font-mono">₭{formatNumber(tx.sourceAmount)}</td>
                      <td className="table-cell text-right text-dark-400">{tx.rate}%</td>
                      <td className="table-cell text-right font-semibold text-primary-400">+₭{formatNumber(tx.profit)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-dark-700">
                    <td colSpan={3} className="py-3 px-4 text-sm font-bold text-dark-300">รวม</td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-dark-200">₭{formatNumber(totalVolume)}</td>
                    <td></td>
                    <td className="py-3 px-4 text-right font-bold text-primary-400">+₭{formatNumber(totalProfit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
