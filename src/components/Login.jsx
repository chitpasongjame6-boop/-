import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, Shield, Users, Eye, EyeOff, Lock } from 'lucide-react'

export default function Login() {
  const { login, settings } = useApp()
  const [selectedRole, setSelectedRole] = useState(null)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = () => {
    setError('')
    const expected = selectedRole === 'owner' ? settings.ownerPassword : settings.employeePassword
    if (password !== expected) {
      setError('รหัสผ่านไม่ถูกต้อง ลองอีกครั้ง')
      return
    }
    login(selectedRole, selectedRole === 'owner' ? 'เจ้าของ' : 'พนักงาน')
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600/20 border border-primary-500/30 rounded-3xl mb-4 glow-green">
            <TrendingUp className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-1">{settings.businessName || 'ร้านแลกเงิน'}</h1>
          <p className="text-dark-400 text-sm">ระบบจัดการกำไร บัตร & โอน</p>
        </div>

        {!selectedRole ? (
          <div className="space-y-4">
            <p className="text-center text-dark-400 text-sm mb-6">เลือกบทบาทของคุณ</p>
            <button
              onClick={() => setSelectedRole('owner')}
              className="w-full card-hover flex items-center gap-4 p-5 text-left group"
            >
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-dark-100">เจ้าของ</p>
                <p className="text-sm text-dark-400">เข้าถึงข้อมูลทั้งหมด · รายงานกำไร · การตั้งค่า</p>
              </div>
            </button>
            <button
              onClick={() => setSelectedRole('employee')}
              className="w-full card-hover flex items-center gap-4 p-5 text-left group"
            >
              <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-dark-100">พนักงาน</p>
                <p className="text-sm text-dark-400">กรอกรายการ · งานวันนี้ · ประกาศ</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'owner' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                {selectedRole === 'owner' ? <Shield className="w-5 h-5 text-amber-400" /> : <Users className="w-5 h-5 text-blue-400" />}
              </div>
              <div>
                <p className="font-semibold">{selectedRole === 'owner' ? 'เจ้าของ' : 'พนักงาน'}</p>
                <p className="text-xs text-dark-400">กรอกรหัสผ่านเพื่อเข้าสู่ระบบ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <Lock className="w-3.5 h-3.5 inline mr-1.5" />รหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-11"
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1.5">⚠ {error}</p>}
              </div>

              <button onClick={handleLogin} className="btn-primary w-full">
                เข้าสู่ระบบ
              </button>
              <button onClick={() => { setSelectedRole(null); setPassword(''); setError('') }} className="btn-secondary w-full">
                ย้อนกลับ
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-dark-600 text-xs mt-8">
          รหัส Owner: 1234 · รหัส Employee: 0000 (เปลี่ยนได้ในการตั้งค่า)
        </p>
      </div>
    </div>
  )
}
