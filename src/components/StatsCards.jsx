import { BedDouble, UserCheck, CalendarClock, Sparkles } from 'lucide-react'

const stats = [
    {
        label: 'Available',
        icon: BedDouble,
        bgColor: 'bg-emerald-50',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueColor: 'text-emerald-600',
        key: 'available'
    },
    {
        label: 'Occupied',
        icon: UserCheck,
        bgColor: 'bg-rose-50',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600',
        valueColor: 'text-rose-600',
        key: 'occupied'
    },
    {
        label: 'Reserved',
        icon: CalendarClock,
        bgColor: 'bg-amber-50',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        valueColor: 'text-amber-600',
        key: 'reserved'
    },
    {
        label: 'Cleaning',
        icon: Sparkles,
        bgColor: 'bg-gray-50',
        iconBg: 'bg-gray-200',
        iconColor: 'text-gray-600',
        valueColor: 'text-gray-600',
        key: 'cleaning'
    },
]

export default function StatsCards({ counts }) {
    return (
        <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
                const count = counts[stat.key] || 0
                return (
                    <div
                        key={stat.key}
                        className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100/50 hover:shadow-md transition-all duration-300`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            <span className={`text-3xl font-bold ${stat.valueColor}`}>{count}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">{stat.label} Rooms</p>
                    </div>
                )
            })}
        </div>
    )
}
