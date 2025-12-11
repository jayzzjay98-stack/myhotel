/**
 * Reports & Analytics Dashboard
 * 
 * IMPORTANT: Before using this component, install recharts:
 * npm install recharts
 */

import { useState, useMemo } from 'react'
import { Banknote, CalendarCheck, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight, Filter, AlertTriangle, Eye, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Lao day names for chart display
const laoDayNames = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ']
const laoMonthNames = ['ມ.ກ.', 'ກ.ພ.', 'ມີ.ນ.', 'ເມ.ສ.', 'ພ.ພ.', 'ມິ.ຖ.', 'ກ.ລ.', 'ສ.ຫ.', 'ກ.ຍ.', 'ຕ.ລ.', 'ພ.ຈ.', 'ທ.ວ.']

// Process chart data from real guestHistory
const processChartData = (guests, timeRange) => {
    // Filter out voided transactions - only include checked-out and staying guests
    const validGuests = guests.filter(g => g.status === 'checked-out' || g.status === 'staying')

    const today = new Date()

    if (timeRange === 'daily') {
        // Last 7 days
        const result = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const dayName = laoDayNames[date.getDay()]

            const dayGuests = validGuests.filter(g => g.checkInDate === dateStr)
            const revenue = dayGuests.reduce((sum, g) => sum + (g.totalPrice || 0), 0)
            const bookings = dayGuests.length

            result.push({ name: dayName, revenue, bookings })
        }
        return result
    }

    if (timeRange === 'weekly') {
        // Last 4 weeks
        const result = []
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(today)
            weekStart.setDate(weekStart.getDate() - (i * 7) - today.getDay())
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekEnd.getDate() + 6)

            const weekGuests = validGuests.filter(g => {
                const checkIn = new Date(g.checkInDate)
                return checkIn >= weekStart && checkIn <= weekEnd
            })

            const revenue = weekGuests.reduce((sum, g) => sum + (g.totalPrice || 0), 0)
            const bookings = weekGuests.length

            result.push({ name: `ອາທິດ ${4 - i}`, revenue, bookings })
        }
        return result
    }

    if (timeRange === 'monthly') {
        // Last 6 months
        const result = []
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
            const monthIndex = monthDate.getMonth()
            const year = monthDate.getFullYear()

            const monthGuests = validGuests.filter(g => {
                const checkIn = new Date(g.checkInDate)
                return checkIn.getMonth() === monthIndex && checkIn.getFullYear() === year
            })

            const revenue = monthGuests.reduce((sum, g) => sum + (g.totalPrice || 0), 0)
            const bookings = monthGuests.length

            result.push({ name: laoMonthNames[monthIndex], revenue, bookings })
        }
        return result
    }

    if (timeRange === 'yearly') {
        // Last 5 years
        const result = []
        const currentYear = today.getFullYear()
        for (let i = 4; i >= 0; i--) {
            const year = currentYear - i

            const yearGuests = validGuests.filter(g => {
                const checkIn = new Date(g.checkInDate)
                return checkIn.getFullYear() === year
            })

            const revenue = yearGuests.reduce((sum, g) => sum + (g.totalPrice || 0), 0)
            const bookings = yearGuests.length

            result.push({ name: String(year), revenue, bookings })
        }
        return result
    }

    return []
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-3">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat('lo-LA').format(payload[0].value)} ₭
                </p>
                {payload[0].payload.bookings && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payload[0].payload.bookings} bookings
                    </p>
                )}
            </div>
        )
    }
    return null
}

const timeRangeOptions = [
    { key: 'daily', label: 'ລາຍວັນ' },
    { key: 'weekly', label: 'ລາຍອາທິດ' },
    { key: 'monthly', label: 'ລາຍເດືອນ' },
    { key: 'yearly', label: 'ລາຍປີ' },
]

// Void reasons mapping
const voidReasons = {
    'guest_cancelled': 'ແຂກຍົກເລີກ',
    'no_show': 'ແຂກບໍ່ມາ',
    'keying_error': 'ພິມຜິດ',
    'system_error': 'ລະບົບຜິດພາດ',
    'duplicate': 'ຊ້ຳກັນ',
    'other': 'ອື່ນໆ',
}

// Void History Modal
function VoidHistoryModal({ voidedTransactions, onClose }) {
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('lo-LA', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('lo-LA').format(price || 0) + ' ₭'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="p-6 bg-rose-50 dark:bg-rose-900/30 border-b border-rose-100 dark:border-rose-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-rose-800 dark:text-rose-200">ປະຫວັດການຍົກເລີກ (Void History)</h3>
                                <p className="text-sm text-rose-600 dark:text-rose-400">ລາຍການທັງໝົດທີ່ຖືກຍົກເລີກ</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                            <X className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="max-h-[60vh] overflow-auto">
                    {voidedTransactions.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ວັນທີ</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ຫ້ອງ</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ຊື່ແຂກ</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ເຫດຜົນ</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ອະນຸມັດໂດຍ</th>
                                    <th className="px-4 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">ມູນຄ່າ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {voidedTransactions.map((guest) => {
                                    const isStaffVoid = guest.voidBy === 'ພະນັກງານ'
                                    return (
                                        <tr
                                            key={guest.id}
                                            className={`transition-colors ${isStaffVoid
                                                ? 'bg-rose-100/80 dark:bg-rose-900/40 hover:bg-rose-200/80 dark:hover:bg-rose-900/60'
                                                : 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20'}`}
                                        >
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                                                {formatDate(guest.voidDate || guest.checkInDate)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-semibold text-gray-800 dark:text-white">{guest.roomNumber}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-gray-600 dark:text-gray-300 line-through">
                                                    {guest.guestName || 'ບໍ່ມີຊື່'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-full">
                                                    {voidReasons[guest.voidReason] || guest.voidReason || 'ບໍ່ລະບຸ'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${isStaffVoid
                                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}
                                                >
                                                    {guest.voidBy || 'ຜູ້ດູແລ'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-rose-600 dark:text-rose-400">
                                                    {formatPrice(guest.totalPrice)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">ບໍ່ມີລາຍການຍົກເລີກ</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">ຍັງບໍ່ມີລາຍການທີ່ຖືກຍົກເລີກ</p>
                        </div>
                    )}
                </div>

                {/* Footer Summary */}
                {voidedTransactions.length > 0 && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border-t border-rose-100 dark:border-rose-800">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-rose-600 dark:text-rose-400">
                                ລວມທັງໝົດ <span className="font-bold">{voidedTransactions.length}</span> ລາຍການ
                            </p>
                            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                                {new Intl.NumberFormat('lo-LA').format(voidedTransactions.reduce((sum, g) => sum + (g.totalPrice || 0), 0))} ₭
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ReportsView({ rooms, guestHistory = [] }) {
    const [timeRange, setTimeRange] = useState('weekly')
    const [showVoidHistory, setShowVoidHistory] = useState(false)

    // Process chart data from real guestHistory based on time range
    const chartData = useMemo(() => processChartData(guestHistory, timeRange), [guestHistory, timeRange])

    // Calculate voided transactions from real data
    const voidedTransactions = useMemo(() => {
        return guestHistory.filter(g => g.status === 'void')
    }, [guestHistory])

    const voidedAmount = useMemo(() => {
        return voidedTransactions.reduce((sum, g) => sum + (g.totalPrice || 0), 0)
    }, [voidedTransactions])

    // Count staff voids (suspicious activity)
    const staffVoids = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        return voidedTransactions.filter(g => g.voidBy === 'ພະນັກງານ' && g.voidDate === today)
    }, [voidedTransactions])

    // Calculate summary metrics from REAL chart data
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
    const totalBookings = chartData.reduce((sum, item) => sum + item.bookings, 0)
    const totalRooms = rooms?.length || 20

    // Calculate occupancy rate based on current staying guests vs total rooms
    const currentlyStaying = guestHistory.filter(g => g.status === 'staying').length
    const occupancyRate = Math.round((currentlyStaying / totalRooms) * 100)

    // Calculate change percentage based on comparing current vs previous period data
    const calculateChange = useMemo(() => {
        if (chartData.length < 2) return { revenue: 0, bookings: 0 }

        const lastPeriod = chartData[chartData.length - 1]
        const prevPeriod = chartData[chartData.length - 2]

        const revenueChange = prevPeriod.revenue > 0
            ? ((lastPeriod.revenue - prevPeriod.revenue) / prevPeriod.revenue * 100).toFixed(1)
            : (lastPeriod.revenue > 0 ? 100 : 0)

        const bookingsChange = prevPeriod.bookings > 0
            ? ((lastPeriod.bookings - prevPeriod.bookings) / prevPeriod.bookings * 100).toFixed(1)
            : (lastPeriod.bookings > 0 ? 100 : 0)

        return { revenue: parseFloat(revenueChange), bookings: parseFloat(bookingsChange) }
    }, [chartData])

    const revenueChange = calculateChange.revenue
    const bookingsChange = calculateChange.bookings
    const occupancyChange = occupancyRate > 50 ? 5.2 : -3.1 // Simple logic for demo

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('lo-LA').format(value)
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ລາຍງານ ແລະ ການວິເຄາະ</h2>
                        <p className="text-gray-500 dark:text-gray-400">ຕິດຕາມຜົນການດຳເນີນງານ ແລະ ລາຍຮັບຂອງໂຮງແຮມ</p>
                    </div>
                </div>

                {/* Suspicious Activity Alert - Staff Voids Today */}
                {staffVoids.length > 0 && (
                    <div
                        onClick={() => setShowVoidHistory(true)}
                        className="bg-rose-100 dark:bg-rose-900/40 rounded-2xl p-4 border-2 border-rose-400 dark:border-rose-700 cursor-pointer hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-all animate-pulse"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-200 dark:bg-rose-800 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-rose-800 dark:text-rose-200">
                                        ⚠️ ມີການຍົກເລີກໂດຍພະນັກງານ {staffVoids.length} ລາຍການ (Staff Voids Detected)
                                    </p>
                                    <p className="text-sm text-rose-600 dark:text-rose-400">ຄວນກວດສອບ - ຄລິກເພື່ອເບິ່ງລາຍລະອຽດ</p>
                                </div>
                            </div>
                            <Eye className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                )}

                {/* Section A: Time Range Selector */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1">
                            {timeRangeOptions.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => setTimeRange(option.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === option.key
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section B: Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                <Banknote className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${revenueChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(revenueChange)}%
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                            {formatCurrency(totalRevenue)} <span className="text-lg font-normal text-gray-500">₭</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ລາຍຮັບລວມ</p>
                    </div>

                    {/* Bookings Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${bookingsChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {bookingsChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(bookingsChange)}%
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                            {formatCurrency(totalBookings)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ການຈອງລວມ</p>
                    </div>

                    {/* Occupancy Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <PieChart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${occupancyChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {occupancyChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(occupancyChange)}%
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                            {Math.min(occupancyRate, 100)}<span className="text-lg font-normal text-gray-500">%</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ອັດຕາການເຂົ້າພັກ</p>
                    </div>

                    {/* Voided Amount Card - Clickable */}
                    <div
                        onClick={() => setShowVoidHistory(true)}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-rose-200 dark:border-rose-800 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full">
                                    {voidedTransactions.length} ລາຍການ
                                </span>
                                <Eye className="w-5 h-5 text-rose-400 dark:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">
                            {formatCurrency(voidedAmount)} <span className="text-lg font-normal">₭</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            ຍອດທີ່ຍົກເລີກ (Voided)
                            <span className="text-xs text-rose-400 group-hover:underline">ຄລິກເພື່ອເບິ່ງລາຍລະອຽດ</span>
                        </p>
                    </div>
                </div>

                {/* Section C: Revenue Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ແນວໂນ້ມລາຍຮັບ</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {timeRange === 'daily' && '7 ມື້ທີ່ຜ່ານມາ'}
                                {timeRange === 'weekly' && '4 ອາທິດທີ່ຜ່ານມາ'}
                                {timeRange === 'monthly' && '6 ເດືອນທີ່ຜ່ານມາ'}
                                {timeRange === 'yearly' && '5 ປີທີ່ຜ່ານມາ'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm font-medium">+{revenueChange}% ຈາກຄັ້ງກ່ອນ</span>
                        </div>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000000) return `${(value / 1000000000).toFixed(0)}B`
                                        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
                                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                                        return value
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#colorGradient)"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={60}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === chartData.length - 1 ? '#3b82f6' : '#93c5fd'}
                                        />
                                    ))}
                                </Bar>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#93c5fd" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Void History Modal */}
                {showVoidHistory && (
                    <VoidHistoryModal
                        voidedTransactions={voidedTransactions}
                        onClose={() => setShowVoidHistory(false)}
                    />
                )}
            </div>
        </>
    )
}
