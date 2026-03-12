import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, Megaphone, Calendar, Clock } from 'lucide-react'
import { format, isPast, isToday, isFuture } from 'date-fns'
import { th } from 'date-fns/locale'

export default function Announcements() {
  const { announcements, addAnnouncement, deleteAnnouncement, user } = useApp()
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', description: '' })
  const [showForm, setShowForm] = useState(false)
  const isOwner = user?.role === 'owner'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title || !form.date) return
    addAnnouncement({ ...form })
    setForm({ title: '', date: '', startTime: '', endTime: '', description: '' })
    setShowForm(false)
  }

  const getStatus = (dateStr) => {
    const d = new Date(dateStr)
    if (isToday(d)) return { label: 'วันนี้!', color: 'badge-yellow' }
    if (isFuture(d)) return { label: 'กำลังจะมาถึง', color: 'badge-green' }
    return { label: 'ผ่านแล้ว', color: 'text-dark-600 bg-dark-700/50 badge' }
  }

  const sorted = [...announcements].sort((a, b) => new Date(b.date) - new Date(a.date))
  const upcoming = sorted.filter(a => !isPast(new Date(a.date)) || isToday(new Date(a.date)))
  const past = sorted.filter(a => isPast(new Date(a.date)) && !isToday(new Date(a.date)))

  return (
    <div className="space-y-5 animate-fade-in">
      {isOwner && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            เพิ่มประกาศ / ประชุม
          </button>
        </div>
      )}

      {showForm && isOwner && (
        <div className="card border border-primary-500/20 animate-slide-up">
          <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary-400" />
            เพิ่มประกาศใหม่
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">หัวข้อประชุม / ประกาศ <span className="text-red-400">*</span></label>
              <input
                className="input"
                placeholder="เช่น ประชุมประจำสัปดาห์..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">วันที่ <span className="text-red-400">*</span></label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">เวลาเริ่ม</label>
                <input
                  type="time"
                  className="input"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">เวลาจบ</label>
                <input
                  type="time"
                  className="input"
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">รายละเอียดเพิ่มเติม</label>
              <textarea
                className="input resize-none h-20"
                placeholder="รายละเอียด วาระการประชุม หรือสิ่งที่ต้องเตรียม..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary flex-1">บันทึกประกาศ</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">ยกเลิก</button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="font-semibold text-dark-300 text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            กำลังจะมาถึง ({upcoming.length})
          </h3>
          <div className="space-y-3">
            {upcoming.map(a => {
              const st = getStatus(a.date)
              return (
                <div key={a.id} className="card border border-primary-500/20 hover:border-primary-500/40 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Megaphone className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-dark-100">{a.title}</h4>
                          <span className={`badge text-xs ${st.color}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-dark-400">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(a.date), 'EEEE d MMMM yyyy', { locale: th })}
                          </span>
                          {(a.startTime || a.endTime) && (
                            <span className="flex items-center gap-1 text-xs text-dark-400">
                              <Clock className="w-3 h-3" />
                              {a.startTime}{a.endTime ? ` – ${a.endTime}` : ''} น.
                            </span>
                          )}
                        </div>
                        {a.description && (
                          <p className="text-sm text-dark-400 mt-2 leading-relaxed">{a.description}</p>
                        )}
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => deleteAnnouncement(a.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-dark-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="font-semibold text-dark-600 text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            ที่ผ่านมา ({past.length})
          </h3>
          <div className="space-y-2">
            {past.map(a => (
              <div key={a.id} className="card opacity-60 hover:opacity-80 transition-opacity group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 bg-dark-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-4 h-4 text-dark-500" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-dark-300">{a.title}</h4>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-dark-500">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(a.date), 'd MMM yyyy', { locale: th })}
                        </span>
                        {(a.startTime || a.endTime) && (
                          <span className="flex items-center gap-1 text-xs text-dark-500">
                            <Clock className="w-3 h-3" />
                            {a.startTime}{a.endTime ? ` – ${a.endTime}` : ''} น.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => deleteAnnouncement(a.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-dark-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {announcements.length === 0 && (
        <div className="text-center py-20 text-dark-500">
          <Megaphone className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-medium">ยังไม่มีประกาศ</p>
          {isOwner && <p className="text-sm mt-1">กดปุ่ม "เพิ่มประกาศ" เพื่อสร้างการประชุมหรือประกาศใหม่</p>}
        </div>
      )}
    </div>
  )
}
