import { useState, useMemo } from 'react'
import { Search, Calendar, X, Phone, CreditCard, User, Clock, Banknote, ChevronLeft, ChevronRight, Eye, AlertTriangle, Lock, EyeOff, Check } from 'lucide-react'

const ITEMS_PER_PAGE = 8

// Dual PIN System
const MASTER_PIN = '12345'  // Owner - Full Access
const STAFF_PIN = '1111'    // Staff - Void Only

// Void reasons
const voidReasons = [
    { key: 'guest_cancelled', label: 'ແຂກຍົກເລີກ' },
    { key: 'keying_error', label: 'ພິມຜິດ' },
    { key: 'system_error', label: 'ລະບົບຜິດພາດ' },
    { key: 'duplicate', label: 'ຊ້ຳກັນ' },
    { key: 'other', label: 'ອື່ນໆ' },
]

// Void Confirmation Modal
function VoidModal({ guest, onClose, onConfirm }) {
    const [reason, setReason] = useState('')
    const [pin, setPin] = useState('')
    const [showPin, setShowPin] = useState(false)
    const [error, setError] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    if (!guest) return null

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!reason) {
            setError('ກະລຸນາເລືອກເຫດຜົນ')
            return
        }

        // Validate PIN and determine authorizer
        let authorizer = null
        if (pin === MASTER_PIN) {
            authorizer = 'ຜູ້ດູແລ'
        } else if (pin === STAFF_PIN) {
            authorizer = 'ພະນັກງານ'
        } else {
            setError('ລະຫັດ PIN ບໍ່ຖືກຕ້ອງ')
            setPin('')
            return
        }

        setIsProcessing(true)
        setTimeout(() => {
            onConfirm(guest.id, reason, authorizer)
            onClose()
        }, 300)
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="p-6 bg-rose-50 dark:bg-rose-900/30 border-b border-rose-100 dark:border-rose-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-rose-800 dark:text-rose-200">ຍົກເລີກລາຍການ (Void)</h3>
                            <p className="text-sm text-rose-600 dark:text-rose-400">ຫ້ອງ {guest.roomNumber} - {guest.guestName || 'ບໍ່ມີຊື່'}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Warning */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            ⚠️ ການຍົກເລີກຈະບໍ່ສາມາດກັບຄືນໄດ້. ລາຍການຈະຖືກບັນທຶກໃນປະຫວັດ.
                        </p>
                    </div>

                    {/* Reason Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ເຫດຜົນການຍົກເລີກ *
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => { setReason(e.target.value); setError('') }}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        >
                            <option value="">-- ເລືອກເຫດຜົນ --</option>
                            {voidReasons.map(r => (
                                <option key={r.key} value={r.key}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* PIN Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ປ້ອນລະຫັດ PIN *
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type={showPin ? 'text' : 'password'}
                                value={pin}
                                onChange={(e) => { setPin(e.target.value); setError('') }}
                                placeholder="•••••"
                                maxLength={5}
                                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-center text-xl tracking-widest font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                {showPin ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            ຍົກເລີກ
                        </button>
                        <button
                            type="submit"
                            disabled={!reason || pin.length < 4 || isProcessing}
                            className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
                        >
                            {isProcessing ? 'ກຳລັງດຳເນີນການ...' : (
                                <>
                                    <Check className="w-5 h-5" />
                                    ຢືນຢັນການຍົກເລີກ
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Guest Detail Modal
function GuestDetailModal({ guest, onClose, onVoid }) {
    if (!guest) return null

    // Lao months
    const laoMonths = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ']

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        const day = date.getDate()
        const month = laoMonths[date.getMonth()]
        const year = date.getFullYear()
        return `${day} ${month} ${year}`
    }

    const formatTime = (timeString) => {
        if (!timeString) return ''
        const date = new Date(timeString)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('lo-LA').format(price || 0) + ' ₭'
    }

    const getRoomTypeLabel = (roomType) => {
        const [cooling, bed] = (roomType || 'ac-single').split('-')
        return `${cooling === 'fan' ? 'ພັດລົມ' : 'ແອ'} • ${bed === 'double' ? 'ຕ່ຽງຄູ່' : 'ຕ່ຽງດ່ຽວ'}`
    }

    const isVoided = guest.status === 'void'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isVoided ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                                <User className={`w-6 h-6 ${isVoided ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${isVoided ? 'text-rose-600 dark:text-rose-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                                    {guest.guestName || <span className="text-rose-500">ບໍ່ມີຊື່</span>}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ຫ້ອງ {guest.roomNumber}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Void Warning Banner */}
                    {isVoided && (
                        <div className="bg-rose-100 dark:bg-rose-900/30 rounded-xl p-4 border-2 border-rose-300 dark:border-rose-700">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                <div>
                                    <p className="font-bold text-rose-700 dark:text-rose-300">ລາຍການຖືກຍົກເລີກແລ້ວ (VOID)</p>
                                    <p className="text-sm text-rose-600 dark:text-rose-400">
                                        ເຫດຜົນ: {voidReasons.find(r => r.key === guest.voidReason)?.label || guest.voidReason || 'ບໍ່ລະບຸ'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                <Phone className="w-4 h-4" />
                                <span className="text-xs">ເບີໂທ</span>
                            </div>
                            <p className={`font-medium ${isVoided ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-white'}`}>{guest.phone || '-'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-xs">ພາສປອດ/ບັດ</span>
                            </div>
                            <p className={`font-medium ${isVoided ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-white'}`}>{guest.passport || '-'}</p>
                        </div>
                    </div>

                    {/* Stay Info */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-700">
                            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">ເຊັກອິນ</p>
                            <p className={`text-base font-bold ${isVoided ? 'text-gray-400 dark:text-gray-500' : 'text-emerald-700 dark:text-emerald-300'}`}>{formatDate(guest.checkInDate)}</p>
                            {guest.checkInTime && (
                                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mt-1">
                                    🕐 {formatTime(guest.checkInTime)} ໂມງ
                                </p>
                            )}
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20 rounded-xl p-4 text-center border border-rose-200 dark:border-rose-700">
                            <Clock className="w-6 h-6 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-1">
                                {guest.status === 'staying' ? 'ກຳນົດເຊັກເອົ້າ' : 'ເຊັກເອົ້າ'}
                            </p>
                            <p className={`text-base font-bold ${isVoided ? 'text-gray-400 dark:text-gray-500' : 'text-rose-700 dark:text-rose-300'}`}>
                                {guest.checkOutDate
                                    ? formatDate(guest.checkOutDate)
                                    : guest.checkInDate && guest.stayDuration
                                        ? formatDate(new Date(new Date(guest.checkInDate).getTime() + guest.stayDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                                        : '-'
                                }
                            </p>
                            <p className="text-lg font-bold text-rose-800 dark:text-rose-200 mt-1">
                                🕐 {guest.checkOutTime ? formatTime(guest.checkOutTime) : '11:00'} ໂມງ
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-700">
                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">ໄລຍະເວລາ</p>
                            <p className={`text-xl font-bold ${isVoided ? 'text-gray-400 dark:text-gray-500' : 'text-blue-700 dark:text-blue-300'}`}>{guest.stayDuration || 1} ຄືນ</p>
                        </div>
                    </div>

                    {/* Room & Price */}
                    <div className={`rounded-xl p-4 border ${isVoided ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ປະເພດຫ້ອງ</p>
                                <p className={`font-medium ${isVoided ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-white'}`}>{getRoomTypeLabel(guest.roomType)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">ລາຄາລວມ</p>
                                <p className={`text-xl font-bold ${isVoided ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-amber-600 dark:text-amber-400'}`}>{formatPrice(guest.totalPrice)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-center">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${isVoided
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-700'
                            : guest.status === 'checked-out'
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                            }`}>
                            {isVoided ? '✕ ຍົກເລີກແລ້ວ (VOID)' : guest.status === 'checked-out' ? '✓ ເຊັກເອົ້າແລ້ວ' : '● ກຳລັງພັກ'}
                        </span>
                    </div>

                    {/* Void Button - Only show if not already voided */}
                    {!isVoided && (
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                            <button
                                onClick={() => onVoid(guest)}
                                className="w-full py-3 px-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-medium hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <AlertTriangle className="w-5 h-5" />
                                ຍົກເລີກລາຍການ (Void)
                            </button>
                        </div>
                    )}
                </div>
            </div >
        </div>
    )
}

export default function GuestListView({ guestHistory, onVoidTransaction }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedGuest, setSelectedGuest] = useState(null)
    const [voidingGuest, setVoidingGuest] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all') // Status tab filter

    // Filter guests
    const filteredGuests = useMemo(() => {
        return guestHistory.filter((guest) => {
            // Status tab filter
            let matchesStatus = true
            if (statusFilter === 'staying') {
                matchesStatus = guest.status === 'staying'
            } else if (statusFilter === 'history') {
                matchesStatus = guest.status === 'checked-out' || guest.status === 'void'
            }
            // 'all' shows everything

            // Search filter (name, phone, passport)
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                searchTerm === '' ||
                (guest.guestName && guest.guestName.toLowerCase().includes(searchLower)) ||
                (guest.phone && guest.phone.includes(searchTerm)) ||
                (guest.passport && guest.passport.toLowerCase().includes(searchLower))

            // Date filter
            const matchesDate =
                dateFilter === '' ||
                (guest.checkInDate && guest.checkInDate.includes(dateFilter))

            return matchesStatus && matchesSearch && matchesDate
        })
    }, [guestHistory, searchTerm, dateFilter, statusFilter])

    // Pagination
    const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedGuests = filteredGuests.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    // Lao months
    const laoMonths = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ']

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        const day = date.getDate()
        const month = laoMonths[date.getMonth()]
        return `${day} ${month}`
    }

    const formatTime = (timeString) => {
        if (!timeString) return ''
        const date = new Date(timeString)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const getStatusColor = (status) => {
        if (status === 'void') {
            return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
        }
        return status === 'checked-out'
            ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
    }

    const getStatusLabel = (status) => {
        if (status === 'void') return 'VOID'
        return status === 'checked-out' ? 'ເຊັກເອົ້າແລ້ວ' : 'ກຳລັງພັກ'
    }

    const handleOpenVoidModal = (guest) => {
        setSelectedGuest(null)
        setVoidingGuest(guest)
    }

    const handleVoidConfirm = (guestId, reason, authorizer) => {
        if (onVoidTransaction) {
            onVoidTransaction(guestId, reason, authorizer)
        }
        setVoidingGuest(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ລາຍຊື່ລູກຄ້າ</h2>
                <p className="text-gray-500 dark:text-gray-400">ເບິ່ງລາຍຊື່ແຂກປັດຈຸບັນ ແລະ ແຂກໃນອະດີດ</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                {/* Status Tabs */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    {[
                        { key: 'all', label: 'ທັງໝົດ', count: guestHistory.length, color: 'blue' },
                        { key: 'staying', label: 'ກຳລັງພັກ', count: guestHistory.filter(g => g.status === 'staying').length, color: 'emerald' },
                        { key: 'history', label: 'ປະຫວັດ/ອອກແລ້ວ', count: guestHistory.filter(g => g.status === 'checked-out' || g.status === 'void').length, color: 'gray' }
                    ].map(tab => {
                        const isActive = statusFilter === tab.key
                        const colorClasses = {
                            blue: isActive
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50',
                            emerald: isActive
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
                            gray: isActive
                                ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/30'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }
                        return (
                            <button
                                key={tab.key}
                                onClick={() => { setStatusFilter(tab.key); setCurrentPage(1) }}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${colorClasses[tab.color]}`}
                            >
                                {tab.label}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${isActive
                                    ? 'bg-white/20 text-white'
                                    : tab.color === 'gray'
                                        ? 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-400'
                                        : `bg-${tab.color}-100 dark:bg-${tab.color}-900/50 text-${tab.color}-600 dark:text-${tab.color}-400`
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ຄົ້ນຫາຕາມຊື່, ເບີໂທ, ຫລື ພາສປອດ..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1) }}
                            className="pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                    </div>

                    {(searchTerm || dateFilter) && (
                        <button
                            onClick={() => { setSearchTerm(''); setDateFilter(''); setCurrentPage(1) }}
                            className="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            ລ້າງ
                        </button>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ສະແດງ <span className="font-semibold text-gray-700 dark:text-white">{paginatedGuests.length}</span> ຈາກ{' '}
                        <span className="font-semibold text-gray-700 dark:text-white">{filteredGuests.length}</span> ລາຍການ
                    </p>
                </div>
            </div>

            {/* Guest Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-white">
                                <div className="flex items-center gap-2">👤 ຊື່ແຂກ</div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-white">
                                <div className="flex items-center gap-2">🚪 ຫ້ອງ</div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-white">
                                <div className="flex items-center gap-2">📅 ວັນເຊັກອິນ</div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-white">
                                <div className="flex items-center gap-2">📱 ເບີໂທ</div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-white">
                                <div className="flex items-center gap-2">📊 ສະຖານະ</div>
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-white">👁️ ເບິ່ງ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {paginatedGuests.length > 0 ? (
                            paginatedGuests.map((guest, index) => {
                                const isVoided = guest.status === 'void'
                                const isEven = index % 2 === 0
                                return (
                                    <tr
                                        key={guest.id}
                                        onClick={() => setSelectedGuest(guest)}
                                        className={`transition-all cursor-pointer border-l-4 border-transparent hover:border-l-4 hover:border-indigo-500 ${isVoided
                                            ? 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                                            : isEven
                                                ? 'bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-600'
                                                : 'bg-gray-50/50 dark:bg-slate-800/50 hover:bg-indigo-100 dark:hover:bg-slate-600'}`}
                                    >
                                        {/* ชื่อลูกค้า */}
                                        <td className="px-6 py-4">
                                            {guest.guestName ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                        {guest.guestName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={`font-semibold text-base ${isVoided ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                        {guest.guestName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-rose-500 font-medium bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full text-sm">❌ ບໍ່ມີຊື່</span>
                                            )}
                                        </td>
                                        {/* ห้อง */}
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${isVoided
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                                                🏠 {guest.roomNumber}
                                            </span>
                                        </td>
                                        {/* วันเช็คอิน */}
                                        <td className="px-6 py-4">
                                            <div className={`${isVoided ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                <div className="font-medium">{formatDate(guest.checkInDate)}</div>
                                                {guest.checkInTime && (
                                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                                        🕐 {formatTime(guest.checkInTime)} ໂມງ
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {/* เบอร์โทร */}
                                        <td className="px-6 py-4">
                                            <span className={`${isVoided ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} font-mono text-sm`}>
                                                {guest.phone || '-'}
                                            </span>
                                        </td>
                                        {/* สถานะ */}
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(guest.status)}`}>
                                                {getStatusLabel(guest.status)}
                                            </span>
                                        </td>
                                        {/* ปุ่มดู */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedGuest(guest) }}
                                                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    ບໍ່ພົບລາຍການທີ່ຕ້ອງການ
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            ໜ້າ {currentPage} ຈາກ {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                ກ່ອນໜ້າ
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                ຕໍ່ໄປ
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Guest Detail Modal */}
            {selectedGuest && (
                <GuestDetailModal
                    guest={selectedGuest}
                    onClose={() => setSelectedGuest(null)}
                    onVoid={handleOpenVoidModal}
                />
            )}

            {/* Void Confirmation Modal */}
            {voidingGuest && (
                <VoidModal
                    guest={voidingGuest}
                    onClose={() => setVoidingGuest(null)}
                    onConfirm={handleVoidConfirm}
                />
            )}
        </div>
    )
}
