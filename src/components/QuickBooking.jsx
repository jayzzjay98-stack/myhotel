import { Fan, Snowflake, Bed, BedDouble, ArrowRight } from 'lucide-react'

// Custom SVG - Single Bed (ຕຽງດ່ຽວ)
const SingleBedIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16a1 1 0 011 1v5H3V5a1 1 0 011-1z" />
        <rect x="8" y="5.5" width="8" height="3" rx="1" />
        <path d="M3 10h18v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-7z" />
        <path d="M5 18h14" />
        <path d="M6 18v2" />
        <path d="M18 18v2" />
    </svg>
)

// Custom SVG - Double Bed (ຕຽງຄູ່ - Twin beds)
const DoubleBedIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6h8a1 1 0 011 1v3H1V7a1 1 0 010-1z" />
        <path d="M3 6.5h4a0.5 0.5 0 010 1H3a0.5 0.5 0 010-1z" />
        <rect x="1" y="10" width="9" height="5" rx="0.5" />
        <path d="M2 15v2" />
        <path d="M9 15v2" />
        <path d="M14 6h8a1 1 0 011 1v3h-9V7a1 1 0 010-1z" />
        <path d="M16 6.5h4a0.5 0.5 0 010 1h-4a0.5 0.5 0 010-1z" />
        <rect x="14" y="10" width="9" height="5" rx="0.5" />
        <path d="M15 15v2" />
        <path d="M22 15v2" />
    </svg>
)

const quickBookOptions = [
    {
        key: 'fan',
        label: 'ຫ້ອງພັດລົມ',
        icon: Fan,
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        iconBg: 'bg-orange-500',
        iconColor: 'text-white',
        hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-600',
        filterType: 'cooling',
        filterValue: 'fan',
    },
    {
        key: 'ac',
        label: 'ຫ້ອງແອ',
        icon: Snowflake,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        iconBg: 'bg-blue-500',
        iconColor: 'text-white',
        hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-600',
        filterType: 'cooling',
        filterValue: 'ac',
    },
    {
        key: 'single',
        label: 'ຫ້ອງຕຽງດ່ຽວ',
        icon: SingleBedIcon,
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconBg: 'bg-emerald-500',
        iconColor: 'text-white',
        hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600',
        filterType: 'bed',
        filterValue: 'single',
    },
    {
        key: 'double',
        label: 'ຫ້ອງຕຽງຄູ່',
        icon: DoubleBedIcon,
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        iconBg: 'bg-purple-500',
        iconColor: 'text-white',
        hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-600',
        filterType: 'bed',
        filterValue: 'double',
    },
]

export default function QuickBooking({ rooms, onQuickBook }) {
    // Calculate available count for each type
    const getAvailableCount = (filterType, filterValue) => {
        return rooms.filter(room => {
            if (room.status !== 'available') return false

            const [cooling, bed] = (room.roomType || 'ac-single').split('-')

            if (filterType === 'cooling') {
                return cooling === filterValue
            } else if (filterType === 'bed') {
                return bed === filterValue
            }
            return false
        }).length
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">ຈອງຫ້ອງດ່ວນ</h2>
            <div className="grid grid-cols-4 gap-4">
                {quickBookOptions.map((option) => {
                    const count = getAvailableCount(option.filterType, option.filterValue)
                    const IconComponent = option.icon

                    return (
                        <button
                            key={option.key}
                            onClick={() => onQuickBook(option.filterType, option.filterValue)}
                            className={`${option.bgColor} rounded-xl p-5 border-2 border-transparent ${option.hoverBorder} 
                         hover:shadow-lg dark:hover:shadow-slate-900/30 hover:-translate-y-1 
                         transition-all duration-150 cursor-pointer text-left group`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`${option.iconBg} w-11 h-11 rounded-xl flex items-center justify-center shadow-md`}>
                                    <IconComponent className={`w-6 h-6 ${option.iconColor}`} />
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150" />
                            </div>

                            <p className="text-xl font-bold text-gray-800 dark:text-white mb-2">{option.label}</p>

                            <div className="flex items-center gap-2">
                                <span className="text-5xl font-bold text-gray-800 dark:text-white">{count}</span>
                                <span className="text-xl text-gray-500 dark:text-gray-400">ຫ້ອງວ່າງ</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
