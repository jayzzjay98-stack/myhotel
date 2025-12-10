import { useState } from 'react'
import {
    X, User, Phone, CreditCard, Banknote, LogIn, LogOut,
    Calendar, Clock, CheckCircle, AlertCircle, Sparkles,
    BedDouble, CalendarClock
} from 'lucide-react'

// Format price with Lao Kip
const formatPrice = (price) => {
    return new Intl.NumberFormat('lo-LA').format(price) + ' ₭'
}

// Lao date format
const laoMonths = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ']
const laoDays = ['ອາ.', 'ຈ.', 'ອ.', 'ພ.', 'ພຫ.', 'ສ.', 'ສ.']

// Format date nicely
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const dayName = laoDays[date.getDay()]
    const day = date.getDate()
    const month = laoMonths[date.getMonth()]
    const year = date.getFullYear()
    return `${dayName} ${day} ${month} ${year}`
}

// Calculate checkout date
const getCheckoutDate = (checkInDate, stayDuration) => {
    if (!checkInDate || !stayDuration) return '-'
    const date = new Date(checkInDate)
    date.setDate(date.getDate() + stayDuration)
    return formatDate(date.toISOString().split('T')[0])
}

export default function RoomActionModal({
    room,
    onClose,
    onCheckIn,
    onCheckOut,
    onMarkCleaned,
    onConfirmReservation,
    isDarkMode,
    roomTypePrices
}) {
    const [formData, setFormData] = useState({
        guestName: room.guestName || '',
        phone: room.phone || '',
        passport: room.passport || '',
        price: room.price || roomTypePrices[room.type] || 0,
        stayDuration: 1
    })
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (error) setError('')
    }

    const handleCheckIn = (e) => {
        e.preventDefault()
        if (!formData.guestName.trim()) {
            setError('ກະລຸນາປ້ອນຊື່ແຂກ')
            return
        }
        onCheckIn(room.id, {
            guestName: formData.guestName.trim(),
            phone: formData.phone.trim(),
            passport: formData.passport.trim(),
            price: Number(formData.price),
            stayDuration: Number(formData.stayDuration)
        })
    }

    // Status-specific content
    const renderContent = () => {
        switch (room.status) {
            case 'available':
                return renderCheckInForm()
            case 'occupied':
                return renderOccupiedInfo()
            case 'reserved':
                return renderReservationInfo()
            case 'cleaning':
                return renderCleaningActions()
            default:
                return null
        }
    }

    // Check-in form for Available rooms
    const renderCheckInForm = () => (
        <form onSubmit={handleCheckIn} className="p-6 space-y-4">
            {/* Guest Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ຊື່ແຂກ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleChange}
                        placeholder="ປ້ອນຊື່ແຂກ"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}
            </div>

            {/* Phone & Passport Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ເບີໂທ <span className="text-gray-400 text-xs">(ບໍ່ບັງຄັບ)</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="020 XXXX XXXX"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ພາສປອດ/ບັດປະຈຳຕົວ <span className="text-gray-400 text-xs">(ບໍ່ບັງຄັບ)</span>
                    </label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="passport"
                            value={formData.passport}
                            onChange={handleChange}
                            placeholder="ເລກບັດ"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Stay Duration & Price Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ຈຳນວນຄືນ
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            name="stayDuration"
                            value={formData.stayDuration}
                            onChange={handleChange}
                            min="1"
                            className="w-full pl-11 pr-16 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">ຄືນ</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ລາຄາຕໍ່ຄືນ
                    </label>
                    <div className="relative">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            className="w-full pl-11 pr-16 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">₭</span>
                    </div>
                </div>
            </div>

            {/* Total Price Display */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ຍອດລວມ</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(formData.price * formData.stayDuration)}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
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
                    className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                    <LogIn className="w-5 h-5" />
                    ເຊັກອິນ
                </button>
            </div>
        </form>
    )

    // Occupied room info
    const renderOccupiedInfo = () => (
        <div className="p-6 space-y-4">
            {/* Guest Info Card */}
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{room.guestName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{room.phone || 'ບໍ່ມີເບີໂທ'}</p>
                    </div>
                </div>
                {room.passport && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CreditCard className="w-4 h-4" />
                        <span>ບັດ: {room.passport}</span>
                    </div>
                )}
            </div>

            {/* Stay Details */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">ເຊັກອິນ</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(room.checkInDate)}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">ໄລຍະເວລາ</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{room.stayDuration} ຄືນ</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
                    <CalendarClock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">ເຊັກເອົ້າ</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{getCheckoutDate(room.checkInDate, room.stayDuration)}</p>
                </div>
            </div>

            {/* Price Info */}
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-100 dark:border-rose-800">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ຍອດລວມ</span>
                    <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                        {formatPrice(room.price * (room.stayDuration || 1))}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                    ປິດ
                </button>
                <button
                    type="button"
                    onClick={() => onCheckOut(room.id)}
                    className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    ເຊັກເອົ້າ
                </button>
            </div>
        </div>
    )

    // Reserved room info
    const renderReservationInfo = () => (
        <div className="p-6 space-y-4">
            {/* Guest Info */}
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white">{room.guestName || 'ແຂກ'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{room.phone || 'ບໍ່ມີເບີໂທ'}</p>
                    </div>
                    {/* Payment Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1
            ${room.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                        }`}
                    >
                        {room.paymentStatus === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {room.paymentStatus === 'Paid' ? 'ຈ່າຍແລ້ວ' : 'ຍັງບໍ່ຈ່າຍ'}
                    </span>
                </div>
            </div>

            {/* Reservation Details */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">ວັນເຂົ້າພັກ</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(room.reservationDate)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">ລາຄາຫ້ອງ</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatPrice(room.price)}/ຄືນ</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                    ປິດ
                </button>
                <button
                    type="button"
                    onClick={() => onConfirmReservation(room.id)}
                    className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                    <LogIn className="w-5 h-5" />
                    ເຊັກອິນດຽວນີ້
                </button>
            </div>
        </div>
    )

    // Cleaning room actions
    const renderCleaningActions = () => (
        <div className="p-6 space-y-4">
            {/* Status Info */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-6 text-center border border-cyan-100 dark:border-cyan-800">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-wiggle" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">ກຳລັງທຳຄວາມສະອາດ</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    ຫ້ອງນີ້ກຳລັງຖືກກຽມພ້ອມສຳລັບແຂກທ່ານຕໍ່ໄປ
                </p>
            </div>

            {/* Room Info */}
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BedDouble className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">ປະເພດຫ້ອງ</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">{room.type}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                    ປິດ
                </button>
                <button
                    type="button"
                    onClick={() => onMarkCleaned(room.id)}
                    className="flex-1 py-3 px-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    ສະອາດແລ້ວ
                </button>
            </div>
        </div>
    )

    // Get header config based on status
    const getHeaderConfig = () => {
        switch (room.status) {
            case 'available':
                return { icon: LogIn, color: 'emerald', title: 'ເຊັກອິນແຂກ' }
            case 'occupied':
                return { icon: User, color: 'rose', title: 'ຂໍ້ມູນແຂກ' }
            case 'reserved':
                return { icon: CalendarClock, color: 'amber', title: 'ລາຍລະອຽດການຈອງ' }
            case 'cleaning':
                return { icon: Sparkles, color: 'cyan', title: 'ທຳຄວາມສະອາດ' }
            default:
                return { icon: BedDouble, color: 'gray', title: 'ລາຍລະອຽດຫ້ອງ' }
        }
    }

    const headerConfig = getHeaderConfig()
    const HeaderIcon = headerConfig.icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-slate-900/50 overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-${headerConfig.color}-100 dark:bg-${headerConfig.color}-900/40 rounded-xl flex items-center justify-center`}>
                            <HeaderIcon className={`w-6 h-6 text-${headerConfig.color}-600 dark:text-${headerConfig.color}-400`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">{headerConfig.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ຫ້ອງ {room.number} • {room.type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Dynamic Content */}
                {renderContent()}
            </div>
        </div>
    )
}
