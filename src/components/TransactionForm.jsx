import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, Search, Calculator, ArrowLeftRight, Download } from 'lucide-react'
import { exportTransactionsCsv } from '../utils/exportCsv'
import { formatCurrency, formatNumber, filterToday, filterThisMonth, sumProfit, sumSourceAmount } from '../utils/calculations'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const RATE_PRESETS = {
  'หลัก5': [0.5, 1.0, 1.5, 2.0, 2.5, 5.0],
  'หลัก9': [0.9, 1.9, 2.9, 3.9, 4.9, 9.0],
}

export default function TransactionForm() {
  const { transactions, addTransaction, deleteTransaction, staff, machines, user } = useApp()
  const [form, setForm] = useState({
    staffId: '',
    staffName: '',
    machineId: '',
    machineName: '',
    type: 'หลัก5',
    sourceAmount: '',
    rate: '',
    netAmount: '',
    note: '',
  })
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showPreview, setShowPreview] = useState(false)

  const profit = useMemo(() => {
    const src = parseFloat(form.sourceAmount)
    const rate = parseFloat(form.rate)
    if (!src || !rate) return 0
    return src * (rate / 100)
  }, [form.sourceAmount, form.rate])

  const handleStaffChange = (e) => {
    const id = e.target.value
    const s = staff.find(s => s.id === id)
    setForm(f => ({ ...f, staffId: id, staffName: s?.name || '' }))
  }

  const handleMachineChange = (e) => {
    const id = e.target.value
    const m = machines.find(m => m.id === id)
    setForm(f => ({ ...f, machineId: id, machineName: m?.name || '' }))
  }

  const handleTypeChange = (type) => {
    setForm(f => ({ ...f, type, rate: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.staffId || !form.sourceAmount || !form.rate) return
    addTransaction({ ...form })
    setForm(f => ({ ...f, sourceAmount: '', rate: '', netAmount: '', note: '' }))
    setShowPreview(false)
  }

  const handleRatePreset = (r) => {
    const src = parseFloat(form.sourceAmount) || 0
    const net = src - src * (r / 100)
    setForm(f => ({ ...f, rate: String(r), netAmount: net.toFixed(2) }))
    setShowPreview(true)
  }

  const handleAmountChange = (e) => {
    const src = e.target.value
    const rate = parseFloat(form.rate) || 0
    const net = parseFloat(src) - parseFloat(src) * (rate / 100)
    setForm(f => ({ ...f, sourceAmount: src, netAmount: !isNaN(net) ? net.toFixed(2) : '' }))
    setShowPreview(!!src && !!form.rate)
  }

  const handleRateChange = (e) => {
    const rate = e.target.value
    const src = parseFloat(form.sourceAmount) || 0
    const net = src - src * (parseFloat(rate) / 100)
    setForm(f => ({ ...f, rate, netAmount: !isNaN(net) && src ? net.toFixed(2) : '' }))
    setShowPreview(!!form.sourceAmount && !!rate)
  }

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchType = filterType === 'all' || t.type === filterType
      const matchSearch = !search || t.staffName?.includes(search) || t.note?.includes(search)
      return matchType && matchSearch
    })
  }, [transactions, filterType, search])

  const todayTx = useMemo(() => filterToday(transactions), [transactions])
  const monthTx = useMemo(() => filterThisMonth(transactions), [transactions])
  const isOwner = user?.role === 'owner'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary row */}
      {isOwner && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card">
            <p className="text-xs text-dark-500 mb-1">กำไรวันนี้</p>
            <p className="text-lg font-bold text-primary-400">{formatCurrency(sumProfit(todayTx))}</p>
          </div>
          <div className="card">
            <p className="text-xs text-dark-500 mb-1">กำไรเดือนนี้</p>
            <p className="text-lg font-bold text-blue-400">{formatCurrency(sumProfit(monthTx))}</p>
          </div>
          <div className="card">
            <p className="text-xs text-dark-500 mb-1">ยอดแลกวันนี้</p>
            <p className="text-lg font-bold text-dark-200">{formatCurrency(sumSourceAmount(todayTx))}</p>
          </div>
          <div className="card">
            <p className="text-xs text-dark-500 mb-1">รายการทั้งหมด</p>
            <p className="text-lg font-bold text-dark-200">{transactions.length}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-400" />
              เพิ่มรายการแลกเงิน
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Staff */}
              <div>
                <label className="label">ພະນັກງານ</label>
                <select className="select" value={form.staffId} onChange={handleStaffChange} required>
                  <option value="">-- ເລືອກພະນັກງານ --</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Machine */}
              {machines.length > 0 && (
                <div>
                  <label className="label">ຕູ້ / ເຄື່ອງ</label>
                  <select className="select" value={form.machineId} onChange={handleMachineChange}>
                    <option value="">-- ເລືອກຕູ້ --</option>
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="label">ประเภท</label>
                <div className="flex gap-2">
                  {['หลัก5', 'หลัก9'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                        form.type === t
                          ? t === 'หลัก5'
                            ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                            : 'bg-purple-600/30 border-purple-500 text-purple-300'
                          : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="label">ຍອດເງິນຕົ້ນທາງ (ກີບ)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="เช่น 10000"
                  value={form.sourceAmount}
                  onChange={handleAmountChange}
                  min="0"
                  step="any"
                  required
                />
              </div>

              {/* Rate */}
              <div>
                <label className="label">เรทหัก (%)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="เช่น 1.5"
                  value={form.rate}
                  onChange={handleRateChange}
                  min="0"
                  max="100"
                  step="any"
                  required
                />
                {/* Rate presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {RATE_PRESETS[form.type].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRatePreset(r)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        parseFloat(form.rate) === r
                          ? 'bg-primary-600/30 border-primary-500 text-primary-300'
                          : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {showPreview && parseFloat(form.sourceAmount) > 0 && parseFloat(form.rate) > 0 && (
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-medium text-primary-300">ตัวอย่างคำนวณ</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-dark-500">ยอดสุทธิที่ลูกค้าได้รับ</p>
                      <p className="font-bold text-dark-100 text-sm">{formatCurrency(parseFloat(form.netAmount))}</p>
                    </div>
                    <div>
                      <p className="text-dark-500">กำไรที่ได้</p>
                      <p className="font-bold text-primary-400 text-sm">+{formatCurrency(profit)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Net amount */}
              <div>
                <label className="label">ยอดสุทธิ (ที่ลูกค้าได้รับ)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="คำนวณอัตโนมัติ"
                  value={form.netAmount}
                  onChange={e => setForm(f => ({ ...f, netAmount: e.target.value }))}
                  step="any"
                />
              </div>

              {/* Note */}
              <div>
                <label className="label">หมายเหตุ (ถ้ามี)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="บันทึกเพิ่มเติม..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                <Plus className="w-4 h-4 inline mr-2" />
                บันทึกรายการ
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  className="input pl-9"
                  placeholder="ค้นหาพนักงาน / หมายเหตุ..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="select w-auto"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="หลัก5">หลัก 5</option>
                <option value="หลัก9">หลัก 9</option>
              </select>
              {isOwner && (
                <button
                  onClick={() => exportTransactionsCsv(filtered)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-dark-800 border border-dark-600 hover:border-primary-500/50 text-dark-300 hover:text-primary-300 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-dark-500">
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>ไม่พบรายการ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-800">
                      <th className="table-header">ພະນັກງານ</th>
                      {machines.length > 0 && <th className="table-header">ຕູ້</th>}
                      <th className="table-header">ປະເພດ</th>
                      <th className="table-header text-right">ยอดต้นทาง</th>
                      <th className="table-header text-right">เรท</th>
                      {isOwner && <th className="table-header text-right">กำไร</th>}
                      <th className="table-header">เวลา</th>
                      {isOwner && <th className="table-header"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(tx => (
                      <tr key={tx.id} className="hover:bg-dark-800/50 transition-colors group">
                        <td className="table-cell font-medium">{tx.staffName}</td>
                        {machines.length > 0 && <td className="table-cell text-dark-400 text-xs">{tx.machineName || '-'}</td>}
                        <td className="table-cell">
                          <span className={`badge ${tx.type === 'หลัก5' ? 'badge-blue' : 'badge-purple'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="table-cell text-right font-mono">₭{formatNumber(tx.sourceAmount)}</td>
                        <td className="table-cell text-right text-dark-400">{tx.rate}%</td>
                        {isOwner && (
                          <td className="table-cell text-right font-semibold text-primary-400">
                            +₭{formatNumber(tx.profit)}
                          </td>
                        )}
                        <td className="table-cell text-dark-500 text-xs whitespace-nowrap">
                          {format(new Date(tx.createdAt), 'HH:mm d MMM', { locale: th })}
                          {tx.note && <p className="text-dark-600 truncate max-w-[100px]">{tx.note}</p>}
                        </td>
                        {isOwner && (
                          <td className="table-cell">
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-dark-600 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
