import { useState } from 'react'
import {
    X, User, Phone, CreditCard, Banknote, LogIn, LogOut,
    Calendar, Clock, CheckCircle, AlertCircle, Sparkles,
    BedDouble, CalendarClock, AlertTriangle, Lock, Eye, EyeOff, XCircle,
    Plus, ArrowRightLeft, Bed, Home, ChevronLeft, Search, Fan, Snowflake
} from 'lucide-react'

// Dual PIN System
const MASTER_PIN = '12345'  // Owner
const STAFF_PIN = '1111'    // Staff

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

// Format time
const formatTime = (timeString) => {
    if (!timeString) return ''
    const date = new Date(timeString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

// Calculate checkout date
const getCheckoutDate = (checkInDate, stayDuration) => {
    if (!checkInDate || !stayDuration) return '-'
    const date = new Date(checkInDate)
    date.setDate(date.getDate() + stayDuration)
    return formatDate(date.toISOString().split('T')[0])
}

// Get tomorrow's date as default for reservation
const getTomorrowDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
}

export default function RoomActionModal({
    room,
    onClose,
    onCheckIn,
    onCheckOut,
    onMarkCleaned,
    onConfirmReservation,
    onCancelReservation,
    onReserveRoom,
    onExtendStay,
    onMoveRoom,
    availableRooms = [],
    isDarkMode,
    roomTypePrices
}) {
    // Tab mode for available rooms: 'checkin' or 'reserve'
    const [availableMode, setAvailableMode] = useState('checkin')

    // Move Room view state
    const [showMoveRoom, setShowMoveRoom] = useState(false)
    const [moveSearchTerm, setMoveSearchTerm] = useState('')
    const [moveFilterType, setMoveFilterType] = useState('all')
    const [selectedTargetRoom, setSelectedTargetRoom] = useState(null)

    // Extended Stay state - tracks local duration changes before confirming
    const [extendedDuration, setExtendedDuration] = useState(room.stayDuration || 1)

    const [formData, setFormData] = useState({
        guestName: room.guestName || '',
        phone: room.phone || '',
        passport: room.passport || '',
        price: room.price || roomTypePrices[room.type] || 0,
        stayDuration: 1
    })

    // Reservation form data
    const [reservationData, setReservationData] = useState({
        guestName: '',
        phone: '',
        reservationDate: getTomorrowDate(),
        paymentStatus: 'Unpaid'
    })

    const [error, setError] = useState('')

    // Cancel Reservation Modal State
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelPin, setCancelPin] = useState('')
    const [showCancelPin, setShowCancelPin] = useState(false)
    const [cancelError, setCancelError] = useState('')
    const [cancelReason, setCancelReason] = useState('')

    // Payment confirmation state for unpaid reservations
    const [markAsPaid, setMarkAsPaid] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (error) setError('')
    }

    const handleReservationChange = (e) => {
        const { name, value } = e.target
        setReservationData(prev => ({ ...prev, [name]: value }))
        if (error) setError('')
    }

    const handleCheckIn = (e) => {
        e.preventDefault()
        // guestName is optional - default to 'ບໍ່ມີຊື່' if empty
        const guestName = formData.guestName.trim() || 'ບໍ່ມີຊື່'
        onCheckIn(room.id, {
            guestName: guestName,
            phone: formData.phone.trim(),
            passport: formData.passport.trim(),
            price: Number(formData.price),
            stayDuration: Number(formData.stayDuration)
        })
    }

    const handleReserve = (e) => {
        e.preventDefault()
        // guestName is optional - default to 'ບໍ່ມີຊື່' if empty
        const guestName = reservationData.guestName.trim() || 'ບໍ່ມີຊື່'
        if (!reservationData.reservationDate) {
            setError('ກະລຸນາເລືອກວັນທີເຂົ້າພັກ')
            return
        }
        onReserveRoom(room.id, {
            guestName: guestName,
            phone: reservationData.phone.trim(),
            reservationDate: reservationData.reservationDate,
            paymentStatus: reservationData.paymentStatus
        })
    }

    // Status-specific content
    const renderContent = () => {
        switch (room.status) {
            case 'available':
                return renderAvailableContent()
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

    // Available room content with tabs
    const renderAvailableContent = () => (
        <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700">
                <button
                    type="button"
                    onClick={() => setAvailableMode('checkin')}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-all flex items-center justify-center gap-2 ${availableMode === 'checkin'
                        ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <LogIn className="w-4 h-4" />
                    ເຊັກອິນ
                </button>
                <button
                    type="button"
                    onClick={() => setAvailableMode('reserve')}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-all flex items-center justify-center gap-2 ${availableMode === 'reserve'
                        ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/20'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <CalendarClock className="w-4 h-4" />
                    ຈອງລ່ວງໜ້າ
                </button>
            </div>

            {/* Content based on active tab */}
            {availableMode === 'checkin' ? renderCheckInForm() : renderReservationForm()}
        </div>
    )

    // Reservation form for Available rooms
    const renderReservationForm = () => (
        <form onSubmit={handleReserve} className="p-6 space-y-4">
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
                        value={reservationData.guestName}
                        onChange={handleReservationChange}
                        placeholder="ປ້ອນຊື່ແຂກ"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                </div>
                {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ເບີໂທ <span className="text-gray-400 text-xs">(ບໍ່ບັງຄັບ)</span>
                </label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="tel"
                        name="phone"
                        value={reservationData.phone}
                        onChange={handleReservationChange}
                        placeholder="020 XXXX XXXX"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                </div>
            </div>

            {/* Reservation Date & Payment Status Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ວັນທີເຂົ້າພັກ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            name="reservationDate"
                            value={reservationData.reservationDate}
                            onChange={handleReservationChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ສະຖານະການຈ່າຍເງິນ
                    </label>
                    <div className="relative">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            name="paymentStatus"
                            value={reservationData.paymentStatus}
                            onChange={handleReservationChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none"
                        >
                            <option value="Paid">🟢 ຈ່າຍແລ້ວ (Paid)</option>
                            <option value="Unpaid">🔴 ຍັງບໍ່ຈ່າຍ (Unpaid)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reservation Summary */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
                <div className="flex items-center gap-3">
                    <CalendarClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ວັນທີເຂົ້າພັກ</p>
                        <p className="font-semibold text-amber-700 dark:text-amber-300">
                            {formatDate(reservationData.reservationDate)}
                        </p>
                    </div>
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
                    className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                    <CalendarClock className="w-5 h-5" />
                    ຢືນຢັນການຈອງ
                </button>
            </div>
        </form>
    )

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
    const renderOccupiedInfo = () => {
        // Move Room Selection View - 2 Step Flow
        if (showMoveRoom) {
            // Filter available rooms based on search and filter
            const filteredRooms = availableRooms.filter(r => {
                // Search by room number
                const matchesSearch = moveSearchTerm === '' || r.number.includes(moveSearchTerm)

                // Filter by type
                let matchesFilter = true
                if (moveFilterType === 'fan') matchesFilter = r.roomType.includes('fan')
                if (moveFilterType === 'ac') matchesFilter = r.roomType.includes('ac')
                if (moveFilterType === 'single') matchesFilter = r.roomType.includes('single')
                if (moveFilterType === 'double') matchesFilter = r.roomType.includes('double')

                return matchesSearch && matchesFilter
            })

            // Step 2: Confirmation View
            if (selectedTargetRoom) {
                const priceDiff = selectedTargetRoom.price - room.price
                const remainingDays = room.stayDuration || 1
                const extraCharge = priceDiff * remainingDays
                const originalTotal = room.price * remainingDays
                const newTotal = selectedTargetRoom.price * remainingDays

                return (
                    <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                onClick={() => setSelectedTargetRoom(null)}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">ຢືນຢັນການຍ້າຍຫ້ອງ</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ກວດສອບລາຍລະອຽດກ່ອນຢືນຢັນ</p>
                            </div>
                        </div>

                        {/* Room Comparison */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Current Room */}
                            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-200 dark:border-rose-700 text-center">
                                <p className="text-xs text-rose-500 dark:text-rose-400 mb-1">ຫ້ອງປັດຈຸບັນ</p>
                                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">#{room.number}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {room.roomType === 'ac-single' && 'ແອ ຕຽງດ່ຽວ'}
                                    {room.roomType === 'ac-double' && 'ແອ ຕຽງຄູ່'}
                                    {room.roomType === 'fan-single' && 'ພັດລົມ ຕຽງດ່ຽວ'}
                                    {room.roomType === 'fan-double' && 'ພັດລົມ ຕຽງຄູ່'}
                                </p>
                                <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-2">
                                    {formatPrice(room.price)}/ຄືນ
                                </p>
                            </div>

                            {/* New Room */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700 text-center">
                                <p className="text-xs text-emerald-500 dark:text-emerald-400 mb-1">ຫ້ອງໃໝ່</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">#{selectedTargetRoom.number}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {selectedTargetRoom.roomType === 'ac-single' && 'ແອ ຕຽງດ່ຽວ'}
                                    {selectedTargetRoom.roomType === 'ac-double' && 'ແອ ຕຽງຄູ່'}
                                    {selectedTargetRoom.roomType === 'fan-single' && 'ພັດລົມ ຕຽງດ່ຽວ'}
                                    {selectedTargetRoom.roomType === 'fan-double' && 'ພັດລົມ ຕຽງຄູ່'}
                                </p>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                                    {formatPrice(selectedTargetRoom.price)}/ຄືນ
                                </p>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-600 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">ລາຄາເກົ່າ ({remainingDays} ຄືນ)</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{formatPrice(originalTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">ລາຄາໃໝ່ ({remainingDays} ຄືນ)</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{formatPrice(newTotal)}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-slate-600 pt-3 flex items-center justify-between">
                                <span className={`font-bold ${extraCharge > 0 ? 'text-rose-600 dark:text-rose-400' :
                                    extraCharge < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {extraCharge > 0 ? '💸 ຕ້ອງຈ່າຍເພີ່ມ' : extraCharge < 0 ? '💰 ໄດ້ເງິນຄືນ' : '✓ ບໍ່ມີການປ່ຽນແປງ'}
                                </span>
                                <span className={`text-2xl font-bold ${extraCharge > 0 ? 'text-rose-600 dark:text-rose-400' :
                                    extraCharge < 0 ? 'text-emerald-600 dark:text-emerald-400' :
                                        'text-gray-500'
                                    }`}>
                                    {formatPrice(Math.abs(extraCharge))}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedTargetRoom(null)}
                                className="py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                ກັບຄືນ
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onMoveRoom(room.id, selectedTargetRoom.id)
                                    setSelectedTargetRoom(null)
                                    setShowMoveRoom(false)
                                }}
                                className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowRightLeft className="w-5 h-5" />
                                ຢືນຢັນຍ້າຍ #{room.number} → #{selectedTargetRoom.number}
                            </button>
                        </div>
                    </div>
                )
            }

            // Step 1: Selection View (Grid)
            return (
                <div className="p-6 space-y-4">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => {
                                setShowMoveRoom(false)
                                setMoveSearchTerm('')
                                setMoveFilterType('all')
                            }}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">ເລືອກຫ້ອງໃໝ່</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ຍ້າຍ {room.guestName} ໄປຫ້ອງໃໝ່</p>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="space-y-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ຄົ້ນຫາເລກຫ້ອງ..."
                                value={moveSearchTerm}
                                onChange={(e) => setMoveSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Filter Pills - Larger */}
                        <div className="flex gap-3 flex-wrap">
                            {[
                                { key: 'all', label: 'ທັງໝົດ' },
                                { key: 'ac', label: '❄️ ແອ' },
                                { key: 'fan', label: '🌀 ພັດລົມ' },
                                { key: 'single', label: '🛏️ ດ່ຽວ' },
                                { key: 'double', label: '🛏️🛏️ ຄູ່' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setMoveFilterType(key)}
                                    className={`px-5 py-2.5 rounded-xl text-base font-semibold transition-all ${moveFilterType === key
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Available Rooms Grid - Large Cards */}
                    {filteredRooms.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-96 overflow-y-auto p-2">
                            {filteredRooms.map((targetRoom) => {
                                const isFan = targetRoom.roomType.includes('fan')
                                const isSingle = targetRoom.roomType.includes('single')
                                const CoolingIcon = isFan ? Fan : Snowflake
                                const BedIcon = isSingle ? Bed : BedDouble

                                // Lao room type label
                                const roomTypeLabel = {
                                    'ac-single': 'ຫ້ອງແອ • ຕຽງດ່ຽວ',
                                    'ac-double': 'ຫ້ອງແອ • ຕຽງຄູ່',
                                    'fan-single': 'ຫ້ອງພັດລົມ • ຕຽງດ່ຽວ',
                                    'fan-double': 'ຫ້ອງພັດລົມ • ຕຽງຄູ່'
                                }[targetRoom.roomType] || targetRoom.roomType

                                return (
                                    <button
                                        key={targetRoom.id}
                                        onClick={() => setSelectedTargetRoom(targetRoom)}
                                        className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
                                    >
                                        {/* Large Room Number */}
                                        <p className="text-5xl font-extrabold text-emerald-700 dark:text-emerald-300 group-hover:text-emerald-600">
                                            {targetRoom.number}
                                        </p>

                                        {/* Icons Row */}
                                        <div className="flex items-center justify-center gap-4 mt-4">
                                            <div className={`p-3 rounded-xl ${isFan ? 'bg-cyan-100 dark:bg-cyan-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                                                <CoolingIcon className={`w-8 h-8 ${isFan ? 'text-cyan-600 dark:text-cyan-400' : 'text-blue-600 dark:text-blue-400'}`} />
                                            </div>
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                                                <BedIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                            </div>
                                        </div>

                                        {/* Room Type Label */}
                                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 mt-4">
                                            {roomTypeLabel}
                                        </p>

                                        {/* Price */}
                                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                                            {formatPrice(targetRoom.price)}
                                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ຄືນ</span>
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Home className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">ບໍ່ພົບຫ້ອງວ່າງ</p>
                            {moveSearchTerm || moveFilterType !== 'all' ? (
                                <button
                                    onClick={() => {
                                        setMoveSearchTerm('')
                                        setMoveFilterType('all')
                                    }}
                                    className="mt-2 text-sm text-blue-500 hover:underline"
                                >
                                    ລ້າງຕົວກອງ
                                </button>
                            ) : null}
                        </div>
                    )}

                    {/* Cancel Button */}
                    <button
                        onClick={() => {
                            setShowMoveRoom(false)
                            setMoveSearchTerm('')
                            setMoveFilterType('all')
                        }}
                        className="w-full py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        ຍົກເລີກ
                    </button>
                </div>
            )
        }

        // Normal Occupied Room Info
        return (
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
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-700">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">ເຊັກອິນ</p>
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mt-1">{formatDate(room.checkInDate)}</p>
                        {room.checkInTime && (
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                🕐 {formatTime(room.checkInTime)} ໂມງ
                            </p>
                        )}
                    </div>

                    {/* Duration with Extend Stay Button */}
                    {(() => {
                        const isExtended = extendedDuration > room.stayDuration
                        return (
                            <div className={`bg-gradient-to-br rounded-xl p-4 text-center border relative
                                ${isExtended
                                    ? 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-200 dark:border-blue-700'
                                    : 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-200 dark:border-amber-700'
                                }`}>
                                <Clock className={`w-6 h-6 mx-auto mb-2 ${isExtended ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`} />
                                <p className={`text-sm font-medium ${isExtended ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {isExtended ? 'ໄລຍະເວລາໃໝ່' : 'ໄລຍະເວລາ'}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <p className={`text-xl font-bold ${isExtended ? 'text-blue-800 dark:text-blue-200' : 'text-amber-800 dark:text-amber-200'}`}>
                                        {extendedDuration} ຄືນ
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setExtendedDuration(prev => prev + 1)}
                                        className={`p-2 text-white rounded-full transition-all shadow-lg hover:shadow-xl cursor-pointer active:scale-95
                                            ${isExtended ? 'bg-blue-500 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                                        title="ເພີ່ມມື້"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                {isExtended && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        +{extendedDuration - room.stayDuration} ຄືນຈາກເດີມ
                                    </p>
                                )}
                                {!isExtended && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">ກົດ + ເພື່ອເພີ່ມມື້</p>
                                )}
                            </div>
                        )
                    })()}

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-700">
                        <CalendarClock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">ເຊັກເອົ້າ</p>
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200 mt-1">
                            {getCheckoutDate(room.checkInDate, extendedDuration)}
                        </p>
                    </div>
                </div>

                {/* Price Info - Dynamic based on isExtended */}
                {(() => {
                    const isExtended = extendedDuration > room.stayDuration
                    const originalTotal = room.price * room.stayDuration
                    const newTotal = room.price * extendedDuration
                    const extraPayment = newTotal - originalTotal

                    if (isExtended) {
                        return (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">ຈ່າຍແລ້ວ ({room.stayDuration} ຄືນ)</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{formatPrice(originalTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">ຍອດລວມໃໝ່ ({extendedDuration} ຄືນ)</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{formatPrice(newTotal)}</span>
                                </div>
                                <div className="border-t border-blue-200 dark:border-blue-600 pt-3 flex items-center justify-between">
                                    <span className="font-bold text-blue-700 dark:text-blue-300">ຕ້ອງຈ່າຍເພີ່ມ</span>
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        +{formatPrice(extraPayment)}
                                    </span>
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-100 dark:border-rose-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ຍອດລວມ</span>
                                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                    {formatPrice(originalTotal)}
                                </span>
                            </div>
                        </div>
                    )
                })()}

                {/* Action Buttons - Dynamic based on isExtended */}
                {(() => {
                    const isExtended = extendedDuration > room.stayDuration
                    const extraDays = extendedDuration - room.stayDuration

                    if (isExtended) {
                        return (
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setExtendedDuration(room.stayDuration)}
                                    className="py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    ຍົກເລີກ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onExtendStay(room.id, extraDays)
                                        onClose()
                                    }}
                                    className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    ຢືນຢັນການຕໍ່ເວລາ (+{extraDays} ຄືນ)
                                </button>
                            </div>
                        )
                    }

                    return (
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                ປິດ
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowMoveRoom(true)}
                                className="py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowRightLeft className="w-5 h-5" />
                                ຍ້າຍຫ້ອງ
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
                    )
                })()}
            </div>
        )
    }

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

            {/* Payment Warning for Unpaid Reservations */}
            {room.paymentStatus === 'Unpaid' && (
                <div className="space-y-3">
                    {/* Warning Banner */}
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-rose-700 dark:text-rose-300">⚠️ ຍັງຄ້າງຊຳລະ (Payment Pending)</p>
                                <p className="text-sm text-rose-600 dark:text-rose-400">ລູກຄ້າຍັງບໍ່ໄດ້ຊຳລະເງິນ</p>
                            </div>
                        </div>
                    </div>

                    {/* Mark as Paid Checkbox */}
                    <label className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                        <input
                            type="checkbox"
                            checked={markAsPaid}
                            onChange={(e) => setMarkAsPaid(e.target.checked)}
                            className="w-5 h-5 text-emerald-600 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-300">💸 ຮັບຊຳລະເງິນດຽວນີ້ (Mark as Paid)</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">ຕິກເພື່ອອັບເດດສະຖານະເປັນ "ຈ່າຍແລ້ວ"</p>
                        </div>
                    </label>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 py-3 px-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-medium hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-colors flex items-center justify-center gap-2"
                >
                    <XCircle className="w-5 h-5" />
                    ຍົກເລີກການຈອງ
                </button>
                <button
                    type="button"
                    onClick={() => onConfirmReservation(room.id, markAsPaid)}
                    className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                    <LogIn className="w-5 h-5" />
                    ເຊັກອິນດຽວນີ້
                </button>
            </div>

            {/* Cancel Reservation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowCancelModal(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                        <div className="p-6 bg-rose-50 dark:bg-rose-900/30 border-b border-rose-100 dark:border-rose-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-rose-800 dark:text-rose-200">ຍົກເລີກການຈອງ</h3>
                                    <p className="text-sm text-rose-600 dark:text-rose-400">ຫ້ອງ {room.number} - {room.guestName}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ເຫດຜົນ *</label>
                                <select
                                    value={cancelReason}
                                    onChange={(e) => { setCancelReason(e.target.value); setCancelError('') }}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white"
                                >
                                    <option value="">-- ເລືອກເຫດຜົນ --</option>
                                    <option value="guest_cancelled">ແຂກຍົກເລີກ</option>
                                    <option value="no_show">ແຂກບໍ່ມາ</option>
                                    <option value="keying_error">ພິມຜິດ</option>
                                    <option value="other">ອື່ນໆ</option>
                                </select>
                            </div>
                            {/* PIN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ລະຫັດ PIN *</label>
                                <div className="relative">
                                    <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showCancelPin ? 'text' : 'password'}
                                        value={cancelPin}
                                        onChange={(e) => { setCancelPin(e.target.value); setCancelError('') }}
                                        placeholder="•••••"
                                        maxLength={5}
                                        className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-center text-xl tracking-widest font-mono text-gray-800 dark:text-white"
                                    />
                                    <button type="button" onClick={() => setShowCancelPin(!showCancelPin)} className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {showCancelPin ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                            {/* Error */}
                            {cancelError && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    <span className="text-sm text-rose-600 dark:text-rose-400">{cancelError}</span>
                                </div>
                            )}
                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowCancelModal(false); setCancelPin(''); setCancelReason(''); setCancelError('') }}
                                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                                >
                                    ປິດ
                                </button>
                                <button
                                    type="button"
                                    disabled={!cancelReason || cancelPin.length < 4}
                                    onClick={() => {
                                        let authorizer = null
                                        if (cancelPin === MASTER_PIN) authorizer = 'ຜູ້ດູແລ'
                                        else if (cancelPin === STAFF_PIN) authorizer = 'ພະນັກງານ'
                                        else {
                                            setCancelError('ລະຫັດ PIN ບໍ່ຖືກຕ້ອງ')
                                            setCancelPin('')
                                            return
                                        }
                                        if (onCancelReservation) {
                                            onCancelReservation(room.id, cancelReason, authorizer)
                                        }
                                        setShowCancelModal(false)
                                        onClose()
                                    }}
                                    className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    ຢືນຢັນການຍົກເລີກ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

            {/* Modal - Dynamic width for Move Room */}
            <div className={`relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-slate-900/50 overflow-hidden animate-slideUp
                ${room.status === 'occupied' && showMoveRoom ? 'max-w-4xl' : 'max-w-lg'}`}>
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
