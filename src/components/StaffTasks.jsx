import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, ClipboardList, GripVertical } from 'lucide-react'

const COLUMNS = [
  { id: 'pending', label: 'รอดำเนินการ', color: 'text-dark-400', bg: 'bg-dark-400/10', border: 'border-dark-600' },
  { id: 'in_progress', label: 'กำลังทำ', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-600/40' },
  { id: 'done', label: 'เสร็จแล้ว', color: 'text-primary-400', bg: 'bg-primary-400/10', border: 'border-primary-600/40' },
]

const PRIORITIES = [
  { value: 'low', label: 'ต่ำ', badge: 'badge-blue' },
  { value: 'normal', label: 'ปกติ', badge: 'badge-yellow' },
  { value: 'high', label: 'เร่งด่วน', badge: 'badge-red' },
]

export default function StaffTasks() {
  const { staffTasks, addStaffTask, updateStaffTask, deleteStaffTask, staff } = useApp()
  const [form, setForm] = useState({
    staffId: '', staffName: '', taskToday: '', taskTomorrow: '', status: 'pending', priority: 'normal'
  })
  const [showForm, setShowForm] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  const handleStaffChange = (e) => {
    const id = e.target.value
    const s = staff.find(s => s.id === id)
    setForm(f => ({ ...f, staffId: id, staffName: s?.name || '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.staffId || !form.taskToday) return
    addStaffTask({ ...form })
    setForm({ staffId: '', staffName: '', taskToday: '', taskTomorrow: '', status: 'pending', priority: 'normal' })
    setShowForm(false)
  }

  // Drag & Drop
  const handleDragStart = (e, id) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(colId)
  }

  const handleDrop = (e, colId) => {
    e.preventDefault()
    if (dragId && colId) {
      updateStaffTask(dragId, { status: colId })
    }
    setDragId(null)
    setDragOver(null)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOver(null)
  }

  const priorityBadge = (p) => PRIORITIES.find(x => x.value === p) || PRIORITIES[1]
  const tasksByCol = (colId) => staffTasks.filter(t => t.status === colId)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-dark-400 text-sm">
            {staffTasks.length} งานทั้งหมด ·{' '}
            <span className="text-primary-400">{tasksByCol('done').length} เสร็จแล้ว</span>
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          มอบหมายงาน
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border border-primary-500/20 animate-slide-up">
          <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary-400" />มอบหมายงานใหม่
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">พนักงาน</label>
              <select className="select" value={form.staffId} onChange={handleStaffChange} required>
                <option value="">-- เลือกพนักงาน --</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">ความสำคัญ</label>
              <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">งานวันนี้ <span className="text-red-400">*</span></label>
              <textarea
                className="input resize-none h-20"
                placeholder="อธิบายงานที่ต้องทำวันนี้..."
                value={form.taskToday}
                onChange={e => setForm(f => ({ ...f, taskToday: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">งานพรุ่งนี้</label>
              <textarea
                className="input resize-none h-16"
                placeholder="แผนงานวันพรุ่งนี้ (ถ้ามี)..."
                value={form.taskTomorrow}
                onChange={e => setForm(f => ({ ...f, taskTomorrow: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary flex-1">บันทึกงาน</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">ยกเลิก</button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const tasks = tasksByCol(col.id)
          const isOver = dragOver === col.id
          return (
            <div
              key={col.id}
              className={`kanban-col border transition-all duration-200 ${col.border} ${isOver ? 'border-primary-500/60 bg-primary-500/5' : ''}`}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={e => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between px-1 py-1 rounded-xl ${col.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${col.color}`}>{col.label}</span>
                </div>
                <span className={`w-5 h-5 ${col.bg} ${col.color} border ${col.border} rounded-full flex items-center justify-center text-xs font-bold`}>
                  {tasks.length}
                </span>
              </div>

              {/* Drop hint */}
              {isOver && dragId && (
                <div className="border-2 border-dashed border-primary-500/40 rounded-xl h-16 flex items-center justify-center text-xs text-primary-400">
                  วางที่นี่
                </div>
              )}

              {/* Task cards */}
              {tasks.length === 0 && !isOver && (
                <div className="flex-1 flex items-center justify-center py-8 text-dark-600 text-sm">
                  <div className="text-center">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>ไม่มีงาน</p>
                  </div>
                </div>
              )}

              {tasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`kanban-card group ${dragId === task.id ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-dark-600 flex-shrink-0 drag-handle" />
                      <p className="font-semibold text-sm text-dark-100 truncate">{task.staffName}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={`badge text-[10px] ${priorityBadge(task.priority).badge}`}>
                        {priorityBadge(task.priority).label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-2">
                    <div className="bg-dark-900/60 rounded-lg p-2.5">
                      <p className="text-[10px] text-dark-500 mb-1 font-medium uppercase tracking-wider">วันนี้</p>
                      <p className="text-xs text-dark-200 leading-relaxed whitespace-pre-wrap break-words">{task.taskToday}</p>
                    </div>
                    {task.taskTomorrow && (
                      <div className="bg-dark-900/40 rounded-lg p-2.5">
                        <p className="text-[10px] text-dark-600 mb-1 font-medium uppercase tracking-wider">พรุ่งนี้</p>
                        <p className="text-xs text-dark-400 leading-relaxed whitespace-pre-wrap break-words">{task.taskTomorrow}</p>
                      </div>
                    )}
                  </div>

                  {/* Quick status change */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-dark-700">
                    {COLUMNS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => updateStaffTask(task.id, { status: c.id })}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                          task.status === c.id
                            ? `${c.bg} ${c.color} ${c.border}`
                            : 'bg-dark-900 border-dark-700 text-dark-600 hover:border-dark-500'
                        }`}
                      >
                        {c.id === 'pending' ? 'รอ' : c.id === 'in_progress' ? 'กำลังทำ' : 'เสร็จ'}
                      </button>
                    ))}
                    <button
                      onClick={() => deleteStaffTask(task.id)}
                      className="p-1.5 rounded-lg bg-dark-900 border border-dark-700 text-dark-600 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
