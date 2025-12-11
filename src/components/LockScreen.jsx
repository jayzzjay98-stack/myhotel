import { useState } from 'react'
import { Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'

// PINs - same as in other components
const MASTER_PIN = '12345'  // Admin
const STAFF_PIN = '1111'    // Staff

export default function LockScreen({ onUnlock }) {
    const [pin, setPin] = useState('')
    const [showPin, setShowPin] = useState(false)
    const [error, setError] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsVerifying(true)
        setError('')

        setTimeout(() => {
            if (pin === MASTER_PIN) {
                onUnlock('admin')
            } else if (pin === STAFF_PIN) {
                onUnlock('staff')
            } else {
                setError('ລະຫັດບໍ່ຖືກຕ້ອງ')
            }
            setIsVerifying(false)
        }, 300)
    }

    const handlePinChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        if (value.length <= 5) {
            setPin(value)
            setError('')
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative w-full max-w-sm mx-4">
                {/* Lock Icon Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/30 mb-4">
                        <Lock className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">ໜ້າຈໍຖືກລັອກ</h1>
                    <p className="text-slate-400">ກະລຸນາໃສ່ລະຫັດເພື່ອປົດລັອກ</p>
                </div>

                {/* Unlock Form */}
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            ລະຫັດ PIN
                        </label>
                        <div className="relative">
                            <input
                                type={showPin ? 'text' : 'password'}
                                value={pin}
                                onChange={handlePinChange}
                                placeholder="•••••"
                                maxLength={5}
                                className="w-full px-4 py-4 bg-slate-800/50 rounded-xl border border-slate-600 text-center text-3xl tracking-[0.5em] font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 mt-3 text-rose-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={pin.length < 4 || isVerifying}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-3"
                    >
                        {isVerifying ? (
                            <>ກຳລັງກວດສອບ...</>
                        ) : (
                            <>
                                <Shield className="w-5 h-5" />
                                ປົດລັອກ
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    StayFlow Hotel Manager
                </p>
            </div>
        </div>
    )
}
