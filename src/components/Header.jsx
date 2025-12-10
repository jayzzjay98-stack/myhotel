import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

export default function Header({ isDarkMode, checkoutCount = 0, onNotificationClick }) {
    const [currentTime, setCurrentTime] = useState(new Date())

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
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
            <button
                onClick={onNotificationClick}
                className="relative p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all hover:scale-105"
            >
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {checkoutCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scaleIn">
                        {checkoutCount}
                    </span>
                )}
            </button>
        </header>
    )
}
