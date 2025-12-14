import { useState, useEffect } from 'react'
import { Shield, Key, Copy, CheckCircle, XCircle, Loader2, Monitor, Wifi, WifiOff } from 'lucide-react'
import { licenseService } from '../services/licenseService'

export default function ActivationScreen({ onActivationSuccess }) {
    const [machineId, setMachineId] = useState('')
    const [productKey, setProductKey] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [copied, setCopied] = useState(false)
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    // Get Machine ID on mount
    useEffect(() => {
        const getMachineId = async () => {
            if (window.electronAPI) {
                const id = await window.electronAPI.getMachineId()
                setMachineId(id)
            } else {
                setMachineId('BROWSER-MODE-' + Date.now())
            }
        }
        getMachineId()

        // Listen for online/offline
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const handleCopyMachineId = async () => {
        try {
            await navigator.clipboard.writeText(machineId)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleActivate = async () => {
        if (!productKey.trim()) {
            setError('ກະລຸນາປ້ອນລະຫັດເປີດໃຊ້ງານ')
            return
        }

        if (!isOnline) {
            setError('ບໍ່ມີການເຊື່ອມຕໍ່ອິນເຕີເນັດ ກະລຸນາກວດສອບ')
            return
        }

        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            // Call Supabase license service
            const result = await licenseService.activateLicense(productKey.trim(), machineId)

            if (result.success) {
                setSuccess(result.message)

                // Save license locally via Electron (include expiresAt for offline expiry check)
                if (window.electronAPI) {
                    await window.electronAPI.saveLicense({
                        keyString: productKey.trim(),
                        machineId: machineId,
                        isActive: true,
                        activatedAt: new Date().toISOString(),
                        expiresAt: result.expiresAt,
                        licenseType: result.licenseType || 'trial'
                    })
                }

                // Wait a moment then trigger success
                setTimeout(() => {
                    onActivationSuccess()
                }, 1500)
            } else {
                setError(result.message)
            }
        } catch (err) {
            console.error('Activation error:', err)
            setError('ເກີດຂໍ້ຜິດພາດ: ' + err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleActivate()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm-20 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative w-full max-w-md">
                {/* Online/Offline Indicator */}
                <div className={`absolute -top-10 right-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isOnline ? 'ອອນລາຍ' : 'ອອບລາຍ'}
                </div>

                {/* Card */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Hotel Management System</h1>
                        <p className="text-blue-100 text-sm">ລະບົບຈັດການໂຮງແຮມ - Activation</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Product Key Input */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                                <Key className="w-4 h-4" />
                                ລະຫັດເປີດໃຊ້ງານ (Product Key)
                            </label>
                            <input
                                type="text"
                                value={productKey}
                                onChange={(e) => { setProductKey(e.target.value.toUpperCase()); setError(''); setSuccess('') }}
                                onKeyDown={handleKeyDown}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase text-center text-lg"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Machine ID - Hidden for cleaner UI */}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                                <p className="text-rose-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <p className="text-emerald-400 text-sm">{success}</p>
                            </div>
                        )}

                        {/* Activate Button */}
                        <button
                            onClick={handleActivate}
                            disabled={isLoading || !productKey.trim() || !isOnline}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    ກຳລັງກວດສອບ...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    ເປີດໃຊ້ງານ (Activate)
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 bg-slate-900/50 border-t border-slate-700/50 text-center">
                        <p className="text-xs text-slate-500">
                            © 2025 Hotel Management System. ສະຫງວນລິຂະສິດ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
