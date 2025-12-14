import { Clock, ArrowRight, Ban } from 'lucide-react'

// Custom SVG - Unlocked Padlock (Available)
const UnlockedIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="16" r="1.5" fill="white" />
        <rect x="11.25" y="16" width="1.5" height="3" fill="white" />
        <path d="M8 11V7a4 4 0 018 0" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
)

// Custom SVG - Person Sleeping on Bed (Occupied)
const SleepingBedIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18V8a2 2 0 012-2h1a1 1 0 011 1v3" />
        <path d="M3 18h18" />
        <path d="M7 12h14a1 1 0 011 1v5" />
        <circle cx="8" cy="10" r="2" />
        <path d="M10 12h8" />
        <text x="14" y="6" fontSize="4" fill="currentColor" stroke="none" fontWeight="bold">Z</text>
        <text x="17" y="4" fontSize="3" fill="currentColor" stroke="none" fontWeight="bold">z</text>
        <text x="19" y="2.5" fontSize="2.5" fill="currentColor" stroke="none" fontWeight="bold">z</text>
    </svg>
)

// Custom SVG - Maid/Cleaner (Cleaning)
const CleanerIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <circle cx="12" cy="3.5" r="2.5" />
        <path d="M9 7h6l1.5 8h-9L9 7z" />
        <path d="M9.5 15l-1 6h2l1-4 1 4h2l-1-6" />
        <path d="M8 8l-3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M16 8l2 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="4" y1="13" x2="7" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 18l-1 3M6 19l0 2.5M7 19.5l1 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
)

const stats = [
    {
        label: 'ຫ້ອງວ່າງ',
        description: 'ພ້ອມຮັບແຂກ',
        icon: UnlockedIcon,
        bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20',
        iconBg: 'bg-emerald-500',
        iconColor: 'text-white',
        valueColor: 'text-emerald-600 dark:text-emerald-400',
        hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600',
        key: 'available'
    },
    {
        label: 'ມີຄົນພັກ',
        description: 'ກຳລັງໃຊ້ງານ',
        icon: SleepingBedIcon,
        bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20',
        iconBg: 'bg-rose-500',
        iconColor: 'text-white',
        valueColor: 'text-rose-600 dark:text-rose-400',
        hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-600',
        key: 'occupied'
    },
    {
        label: 'ຈອງລ່ວງໜ້າ',
        description: 'ມີການຈອງແລ້ວ',
        icon: Clock,
        bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20',
        iconBg: 'bg-amber-500',
        iconColor: 'text-white',
        valueColor: 'text-amber-600 dark:text-amber-400',
        hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-600',
        key: 'reserved'
    },
    {
        label: 'ກຳລັງທຳຄວາມສະອາດ',
        description: 'ກຳລັງກຽມພ້ອມ',
        icon: CleanerIcon,
        bgColor: 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20',
        iconBg: 'bg-cyan-500',
        iconColor: 'text-white',
        valueColor: 'text-cyan-600 dark:text-cyan-400',
        hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-600',
        key: 'cleaning'
    },
    {
        label: 'ຍົກເລີກ (Void)',
        description: 'ລາຍການທີ່ຍົກເລີກ',
        icon: Ban,
        bgColor: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20',
        iconBg: 'bg-red-600',
        iconColor: 'text-white',
        valueColor: 'text-red-600 dark:text-red-400',
        hoverBorder: 'hover:border-red-300 dark:hover:border-red-600',
        key: 'void'
    },
]

export default function StatsCards({ counts, isDarkMode, onStatsClick }) {
    return (
        <div className="grid grid-cols-5 gap-6">
            {stats.map((stat) => {
                const count = counts[stat.key] || 0
                return (
                    <button
                        key={stat.key}
                        onClick={() => onStatsClick(stat.key)}
                        className={`${stat.bgColor} rounded-2xl p-6 border-2 border-transparent ${stat.hoverBorder} 
                       hover:shadow-xl dark:hover:shadow-slate-900/30 hover:-translate-y-1 
                       transition-all duration-150 cursor-pointer text-left group`}
                    >
                        {/* Header with Icon */}
                        <div className="flex items-start justify-between mb-4">
                            <div className={`${stat.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150" />
                        </div>

                        {/* Count */}
                        <div className="mb-2">
                            <span className={`text-5xl font-bold ${stat.valueColor}`}>{count}</span>
                        </div>

                        {/* Label & Description */}
                        <div>
                            <p className={`font-semibold text-gray-800 dark:text-white ${stat.key === 'cleaning' ? 'text-base' : 'text-xl truncate'}`}>{stat.label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{stat.description}</p>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
