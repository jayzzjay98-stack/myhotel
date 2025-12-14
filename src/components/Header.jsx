import { useState, useEffect, useRef } from 'react'
import { Bell, X, LogOut, Clock } from 'lucide-react'

export default function Header({ isDarkMode, checkoutCount = 0, checkoutRooms = [], onViewCheckout }) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [showNotifications, setShowNotifications] = useState(false)
    const dropdownRef = useRef(null)

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Lao day names
    const laoDays = ['ວັນອາທິດ', 'ວັນຈັນ', 'ວັນອັງຄານ', 'ວັນພຸດ', 'ວັນພະຫັດ', 'ວັນສຸກ', 'ວັນເສົາ']
    // Lao month names
    const laoMonths = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ']

    const dayName = laoDays[currentTime.getDay()]
    const day = currentTime.getDate()
    const month = laoMonths[currentTime.getMonth()]
    const year = currentTime.getFullYear()
    const formattedDate = `${dayName}, ${day} ${month} ${year}`

    // 24-hour format time
    const hours = currentTime.getHours().toString().padStart(2, '0')
    const minutes = currentTime.getMinutes().toString().padStart(2, '0')
    const formattedTime = `${hours}:${minutes}`

    return (
        <header className="flex items-center justify-between mb-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ຍິນດີຕ້ອນຮັບ, ແອັດມິນ</h1>
            </div>

            {/* Time & Date in Center */}
            <div className="text-center mr-64">
                <p className="text-5xl font-bold text-gray-800 dark:text-white tracking-wide">{formattedTime}</p>
                <p className="text-base text-gray-500 dark:text-gray-400">{formattedDate}</p>
            </div>

            {/* Notifications Bell */}
            <div className="relative mr-4" ref={dropdownRef}>
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all hover:scale-105"
                >
                    <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    {checkoutCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scaleIn">
                            {checkoutCount}
                        </span>
                    )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 animate-slideUp">
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-white" />
                                <h3 className="font-bold text-white">ການແຈ້ງເຕືອນ</h3>
                            </div>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-80 overflow-y-auto">
                            {checkoutCount > 0 ? (
                                <div className="p-3 space-y-2">
                                    {/* Checkout Today Alert */}
                                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                            <span className="font-bold text-rose-700 dark:text-rose-300">ເຊັກເອົ້າມື້ນີ້</span>
                                            <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{checkoutCount}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {checkoutRooms.slice(0, 5).map((room, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700 dark:text-gray-300">{room.guestName}</span>
                                                    <span className="text-rose-600 dark:text-rose-400 font-medium">ຫ້ອງ {room.number}</span>
                                                </div>
                                            ))}
                                            {checkoutCount > 5 && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">+{checkoutCount - 5} ຄົນອື່ນ</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* View All Button */}
                                    <button
                                        onClick={() => {
                                            setShowNotifications(false)
                                            if (onViewCheckout) onViewCheckout()
                                        }}
                                        className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        ເບິ່ງທັງໝົດ
                                    </button>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">ບໍ່ມີການແຈ້ງເຕືອນ</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
