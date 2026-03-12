import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, Shield, Users, Eye, EyeOff, Lock, Loader } from 'lucide-react'

export default function Login() {
  const { login, settings, accounts, loading } = useApp()
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = () => {
    setError('')
    if (!selectedAccount) return
    if (password !== selectedAccount.pin) {
      setError('ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ ລອງໃໝ່')
      return
    }
    login(selectedAccount.role, selectedAccount.name)
  }

  const ownerAccounts = accounts.filter(a => a.role === 'owner')
  const employeeAccounts = accounts.filter(a => a.role === 'employee')

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-primary-400 animate-spin mx-auto mb-3" />
          <p className="text-dark-400 text-sm">ກຳລັງໂຫຼດ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600/20 border border-primary-500/30 rounded-3xl mb-4 glow-green">
            <TrendingUp className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-1">{settings.businessName || 'ຮ້ານແລກເງິນ'}</h1>
          <p className="text-dark-400 text-sm">ລະບົບຈັດການກຳໄລ ບັດ & ໂອນ</p>
        </div>

        {!selectedAccount ? (
          <div className="space-y-3">
            <p className="text-center text-dark-400 text-sm mb-4">ເລືອກບັນຊີຂອງທ່ານ</p>

            {ownerAccounts.map(acc => (
              <button key={acc.id} onClick={() => setSelectedAccount(acc)}
                className="w-full card-hover flex items-center gap-4 p-5 text-left group">
                <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-dark-100">{acc.name}</p>
                  <p className="text-sm text-dark-400">ເຈົ້າຂອງ · ເຂົ້າເຖິງຂໍ້ມູນທັງໝົດ</p>
                </div>
              </button>
            ))}

            {employeeAccounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-dark-500 text-xs px-1 pt-2">ພະນັກງານ</p>
                {employeeAccounts.map(acc => (
                  <button key={acc.id} onClick={() => setSelectedAccount(acc)}
                    className="w-full card-hover flex items-center gap-4 p-4 text-left group">
                    <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark-100">{acc.name}</p>
                      <p className="text-sm text-dark-400">ພະນັກງານ</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {accounts.length === 0 && (
              <p className="text-center text-dark-500 text-sm py-4">ກຳລັງໂຫຼດບັນຊີ...</p>
            )}
          </div>
        ) : (
          <div className="card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAccount.role === 'owner' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                {selectedAccount.role === 'owner'
                  ? <Shield className="w-5 h-5 text-amber-400" />
                  : <Users className="w-5 h-5 text-blue-400" />}
              </div>
              <div>
                <p className="font-semibold">{selectedAccount.name}</p>
                <p className="text-xs text-dark-400">ກະລຸນາໃສ່ລະຫັດ PIN</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <Lock className="w-3.5 h-3.5 inline mr-1.5" />ລະຫັດ PIN
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-11"
                    placeholder="ໃສ່ລະຫັດ PIN"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-1.5">⚠ {error}</p>}
              </div>
              <button onClick={handleLogin} className="btn-primary w-full">ເຂົ້າສູ່ລະບົບ</button>
              <button onClick={() => { setSelectedAccount(null); setPassword(''); setError('') }}
                className="btn-secondary w-full">ຍ້ອນກັບ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
