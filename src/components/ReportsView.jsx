/**
 * Reports & Analytics Dashboard
 * 
 * IMPORTANT: Before using this component, install recharts:
 * npm install recharts
 */

import { useState, useMemo } from 'react'
import { Banknote, CalendarCheck, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Mock revenue data
const generateMockData = () => {
    const dailyData = [
        { name: 'Mon', revenue: 1250000, bookings: 4 },
        { name: 'Tue', revenue: 1850000, bookings: 6 },
        { name: 'Wed', revenue: 1550000, bookings: 5 },
        { name: 'Thu', revenue: 2100000, bookings: 7 },
        { name: 'Fri', revenue: 2750000, bookings: 9 },
        { name: 'Sat', revenue: 3200000, bookings: 11 },
        { name: 'Sun', revenue: 2400000, bookings: 8 },
    ]

    const weeklyData = [
        { name: 'Week 1', revenue: 12500000, bookings: 42 },
        { name: 'Week 2', revenue: 15800000, bookings: 53 },
        { name: 'Week 3', revenue: 14200000, bookings: 48 },
        { name: 'Week 4', revenue: 16500000, bookings: 55 },
    ]

    const monthlyData = [
        { name: 'Jul', revenue: 45000000, bookings: 150 },
        { name: 'Aug', revenue: 52000000, bookings: 173 },
        { name: 'Sep', revenue: 48000000, bookings: 160 },
        { name: 'Oct', revenue: 55000000, bookings: 183 },
        { name: 'Nov', revenue: 62000000, bookings: 207 },
        { name: 'Dec', revenue: 58000000, bookings: 193 },
    ]

    const yearlyData = [
        { name: '2020', revenue: 480000000, bookings: 1600 },
        { name: '2021', revenue: 520000000, bookings: 1733 },
        { name: '2022', revenue: 610000000, bookings: 2033 },
        { name: '2023', revenue: 680000000, bookings: 2267 },
        { name: '2024', revenue: 720000000, bookings: 2400 },
    ]

    return { daily: dailyData, weekly: weeklyData, monthly: monthlyData, yearly: yearlyData }
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

export default function ReportsView({ rooms }) {
    const [timeRange, setTimeRange] = useState('weekly')
    const mockData = useMemo(() => generateMockData(), [])

    // Get current data based on time range
    const currentData = mockData[timeRange] || mockData.weekly

    // Calculate summary metrics
    const totalRevenue = currentData.reduce((sum, item) => sum + item.revenue, 0)
    const totalBookings = currentData.reduce((sum, item) => sum + item.bookings, 0)
    const totalRooms = rooms?.length || 20
    const occupancyRate = Math.round((totalBookings / (currentData.length * totalRooms)) * 100)

    // Calculate change percentage (mock)
    const revenueChange = 12.5
    const bookingsChange = 8.3
    const occupancyChange = -2.1

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('lo-LA').format(value)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ລາຍງານ ແລະ ການວິເຄາະ</h2>
                    <p className="text-gray-500 dark:text-gray-400">ຕິດຕາມຜົນການດຳເນີນງານ ແລະ ລາຍຮັບຂອງໂຮງແຮມ</p>
                </div>
            </div>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">ອັດຕາເຂົ້າພັກ</p>
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
                        <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                {currentData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === currentData.length - 1 ? '#3b82f6' : '#93c5fd'}
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
        </div>
    )
}
