import { useState, useMemo } from 'react'
import { Bell, Clock, LogOut, User, Calendar, Phone, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react'

// Check if current time is past checkout time (11:00)
const isCheckoutTime = () => {
    const now = new Date()
    return now.getHours() >= 11
}

// Get time until checkout
const getTimeInfo = () => {
    const now = new Date()
    const checkoutHour = 11
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    if (currentHour >= checkoutHour) {
        const hoursPast = currentHour - checkoutHour
        return { isPast: true, text: `ເກີນເວລາ ${hoursPast} ຊມ. ${currentMinute} ນທ.` }
    }

    const hoursLeft = checkoutHour - currentHour - (currentMinute > 0 ? 1 : 0)
    const minutesLeft = currentMinute > 0 ? 60 - currentMinute : 0

    if (hoursLeft === 0) {
        return { isPast: false, text: `ອີກ ${minutesLeft} ນາທີ` }
    }
    return { isPast: false, text: `ອີກ ${hoursLeft} ຊມ. ${minutesLeft} ນທ.` }
}

export default function CheckoutView({ rooms, onRoomClick }) {
    const timeInfo = getTimeInfo()

    // Get rooms due for checkout today
    const dueRooms = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return rooms.filter(room => {
            if (room.status !== 'occupied' || !room.checkInDate || !room.stayDuration) {
                return false
            }

            const checkIn = new Date(room.checkInDate)
            checkIn.setHours(0, 0, 0, 0)
            const checkoutDate = new Date(checkIn)
            checkoutDate.setDate(checkoutDate.getDate() + room.stayDuration)

            return checkoutDate.getTime() === today.getTime()
        })
    }, [rooms])

    // Lao date format
    const laoMonths = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ']
    const laoDays = ['ອາ.', 'ຈ.', 'ອ.', 'ພ.', 'ພຫ.', 'ສ.', 'ສ.']

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        const dayName = laoDays[date.getDay()]
        const day = date.getDate()
        const month = laoMonths[date.getMonth()]
        return `${dayName} ${day} ${month}`
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('lo-LA').format(price || 0) + ' ₭'
    }

    const formatTodayDate = () => {
        const today = new Date()
        const day = today.getDate()
        const month = laoMonths[today.getMonth()]
        const year = today.getFullYear()
        return `${day} ${month} ${year}`
    }

    return (
        <div className="space-y-6 animate-pageFade">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ເຊັກເອົ້າມື້ນີ້</h2>
                    <p className="text-gray-500 dark:text-gray-400">ຫ້ອງທີ່ຕ້ອງເຊັກເອົ້າພາຍໃນເວລາ 11:00 ໂມງ</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeInfo.isPast
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{timeInfo.text}</span>
                </div>
            </div>

            {/* Status Banner */}
            {timeInfo.isPast && dueRooms.length > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-700 rounded-2xl p-4 flex items-center gap-4 animate-slideUp">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 animate-wiggle" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-rose-700 dark:text-rose-300">ເກີນເວລາເຊັກເອົ້າແລ້ວ!</h3>
                        <p className="text-sm text-rose-600 dark:text-rose-400">ກະລຸນາຕິດຕໍ່ແຂກເພື່ອດຳເນີນການເຊັກເອົ້າ</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-2xl p-5 border-2 ${dueRooms.length > 0
                    ? (timeInfo.isPast ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700')
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className={`w-6 h-6 ${dueRooms.length > 0
                            ? (timeInfo.isPast ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')
                            : 'text-emerald-600 dark:text-emerald-400'
                            }`} />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ລໍຖ້າເຊັກເອົ້າ</span>
                    </div>
                    <p className={`text-4xl font-bold ${dueRooms.length > 0
                        ? (timeInfo.isPast ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300')
                        : 'text-emerald-700 dark:text-emerald-300'
                        }`}>{dueRooms.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ຫ້ອງ</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-5 border-2 border-blue-300 dark:border-blue-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ເວລາເຊັກເອົ້າ</span>
                    </div>
                    <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">11:00</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ໂມງ</p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 border-2 border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ວັນທີ</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {formatTodayDate()}
                    </p>
                </div>
            </div>

            {/* Room List */}
            {dueRooms.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="font-semibold text-gray-800 dark:text-white">ລາຍການຫ້ອງ ({dueRooms.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                        {dueRooms.map(room => (
                            <div
                                key={room.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Room Info */}
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${timeInfo.isPast
                                            ? 'bg-rose-100 dark:bg-rose-900/30'
                                            : 'bg-amber-100 dark:bg-amber-900/30'
                                            }`}>
                                            <span className={`text-xl font-bold ${timeInfo.isPast
                                                ? 'text-rose-700 dark:text-rose-300'
                                                : 'text-amber-700 dark:text-amber-300'
                                                }`}>{room.number}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {room.guestName || <span className="text-rose-500">ບໍ່ມີຊື່</span>}
                                                </span>
                                                {/* Paid Badge */}
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                                                    <CheckCircle className="w-3 h-3" />
                                                    ຈ່າຍແລ້ວ
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                {room.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {room.phone}
                                                    </span>
                                                )}
                                                {room.passport && (
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                        {room.passport}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stay Info */}
                                    <div className="text-center hidden md:block">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">ເຊັກອິນ</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{formatDate(room.checkInDate)}</p>
                                    </div>

                                    <div className="text-center hidden md:block">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">ໄລຍະເວລາ</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{room.stayDuration} ຄືນ</p>
                                    </div>

                                    <div className="text-center hidden md:block">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">ຍອດລວມ</p>
                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatPrice(room.price * room.stayDuration)}
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => onRoomClick && onRoomClick(room)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105 ${timeInfo.isPast
                                            ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25'
                                            : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25'
                                            }`}
                                    >
                                        <LogOut className="w-5 h-5" />
                                        ເຊັກເອົ້າ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-8 border-2 border-emerald-300 dark:border-emerald-700 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                        ບໍ່ມີຫ້ອງທີ່ຕ້ອງເຊັກເອົ້າມື້ນີ້
                    </h3>
                    <p className="text-emerald-600 dark:text-emerald-400">
                        ທຸກຫ້ອງຍັງບໍ່ຄົບກຳນົດເຊັກເອົ້າ
                    </p>
                </div>
            )}
        </div>
    )
}
