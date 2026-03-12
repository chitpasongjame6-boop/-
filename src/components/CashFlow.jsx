import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle, Wallet, Download } from 'lucide-react'
import { exportCashFlowCsv } from '../utils/exportCsv'
import { formatCurrency, formatNumber, calcNetCashFlow, sumCashIn, sumCashOut } from '../utils/calculations'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const TYPES = ['โอนเก็บคลัง', 'โอนเข้าตู้']

export default function CashFlow() {
  const { cashFlow, addCashFlow, deleteCashFlow, staff, settings } = useApp()
  const [form, setForm] = useState({ type: 'โอนเก็บคลัง', amount: '', staffId: '', staffName: '', note: '' })

  const netCash = useMemo(() => calcNetCashFlow(settings.initialCash || 0, cashFlow), [cashFlow, settings])
  const totalIn = useMemo(() => sumCashIn(cashFlow), [cashFlow])
  const totalOut = useMemo(() => sumCashOut(cashFlow), [cashFlow])

  const handleStaffChange = (e) => {
    const id = e.target.value
    const s = staff.find(s => s.id === id)
    setForm(f => ({ ...f, staffId: id, staffName: s?.name || '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return
    addCashFlow({ ...form })
    setForm(f => ({ ...f, amount: '', staffId: '', staffName: '', note: '' }))
  }

  const typeColor = (type) => {
    if (type === 'โอนเก็บคลัง') return 'badge-green'
    return 'badge-red'
  }

  const typeIcon = (type) => {
    if (type === 'โอนเก็บคลัง') return <ArrowDownCircle className="w-4 h-4 text-primary-400" />
    return <ArrowUpCircle className="w-4 h-4 text-red-400" />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border border-primary-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-dark-500">โอนเก็บคลัง (รวม)</p>
              <p className="text-xl font-bold text-primary-400">{formatCurrency(totalIn)}</p>
            </div>
          </div>
        </div>
        <div className="card border border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-dark-500">โอนเข้าตู้ (รวม)</p>
              <p className="text-xl font-bold text-red-400">{formatCurrency(totalOut)}</p>
            </div>
          </div>
        </div>
        <div className={`card border ${netCash >= 0 ? 'border-amber-500/20' : 'border-red-500/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${netCash >= 0 ? 'bg-amber-500/20' : 'bg-red-500/20'} rounded-xl flex items-center justify-center`}>
              <Wallet className={`w-5 h-5 ${netCash >= 0 ? 'text-amber-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-xs text-dark-500">เงินคงเหลือสุทธิ</p>
              <p className={`text-xl font-bold ${netCash >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {formatCurrency(netCash)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-400" />
              บันทึกกระแสเงินสด
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">ประเภท</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.type === t
                          ? t === 'โอนเข้าตู้'
                            ? 'bg-primary-600/30 border-primary-500 text-primary-300'
                            : t === 'โอนเก็บคลัง'
                            ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                            : 'bg-amber-600/30 border-amber-500 text-amber-300'
                          : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">ຈໍານວນເງິນ (ກີບ)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  min="0"
                  step="any"
                  required
                />
              </div>

              {(form.type === 'โอนเข้าตู้' || form.type === 'เงินเดือน') && (
                <div>
                  <label className="label">พนักงาน {form.type === 'เงินเดือน' ? '(ผู้รับ)' : '(ผู้โอน)'}</label>
                  <select className="select" value={form.staffId} onChange={handleStaffChange}>
                    <option value="">-- เลือกพนักงาน --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label">หมายเหตุ</label>
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
                บันทึก
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark-100">ประวัติกระแสเงินสด</h3>
              <button
                onClick={() => exportCashFlowCsv(cashFlow)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-600 hover:border-primary-500/50 text-dark-300 hover:text-primary-300 rounded-xl text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
            {cashFlow.length === 0 ? (
              <div className="text-center py-16 text-dark-500">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>ยังไม่มีรายการ</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {cashFlow.map(cf => (
                  <div
                    key={cf.id}
                    className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl border border-dark-700 hover:border-dark-600 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      cf.type === 'โอนเก็บคลัง' ? 'bg-primary-500/20' : 'bg-red-500/20'
                    }`}>
                      {typeIcon(cf.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`badge text-xs ${typeColor(cf.type)}`}>{cf.type}</span>
                        {cf.staffName && <span className="text-xs text-dark-400">{cf.staffName}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`font-bold ${cf.type === 'โอนเก็บคลัง' ? 'text-primary-400' : 'text-red-400'}`}>
                          {cf.type === 'โอนเก็บคลัง' ? '+' : '-'}₭{formatNumber(cf.amount)}
                        </p>
                        <p className="text-xs text-dark-500">
                          {format(new Date(cf.createdAt), 'HH:mm d MMM', { locale: th })}
                        </p>
                      </div>
                      {cf.note && <p className="text-xs text-dark-600 truncate">{cf.note}</p>}
                    </div>
                    <button
                      onClick={() => deleteCashFlow(cf.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-dark-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
