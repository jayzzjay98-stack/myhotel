import { Fan, Snowflake } from 'lucide-react'

// Custom SVG - Single Bed (ຕຽງດ່ຽວ - front view with one pillow)
const SingleBedIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Headboard */}
        <path d="M4 4h16a1 1 0 011 1v5H3V5a1 1 0 011-1z" />
        {/* Single pillow in center */}
        <rect x="8" y="5.5" width="8" height="3" rx="1" />
        {/* Mattress/bed body */}
        <path d="M3 10h18v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-7z" />
        {/* Bed frame bottom line */}
        <path d="M5 18h14" />
        {/* Legs */}
        <path d="M6 18v2" />
        <path d="M18 18v2" />
    </svg>
)

// Custom SVG - Double Bed (ຕຽງຄູ່ - two beds side by side / Twin beds)
const DoubleBedIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Left bed - headboard */}
        <path d="M1 6h8a1 1 0 011 1v3H1V7a1 1 0 010-1z" />
        <path d="M3 6.5h4a0.5 0.5 0 010 1H3a0.5 0.5 0 010-1z" />
        {/* Left bed - body */}
        <rect x="1" y="10" width="9" height="5" rx="0.5" />
        <path d="M2 15v2" />
        <path d="M9 15v2" />

        {/* Right bed - headboard */}
        <path d="M14 6h8a1 1 0 011 1v3h-9V7a1 1 0 010-1z" />
        <path d="M16 6.5h4a0.5 0.5 0 010 1h-4a0.5 0.5 0 010-1z" />
        {/* Right bed - body */}
        <rect x="14" y="10" width="9" height="5" rx="0.5" />
        <path d="M15 15v2" />
        <path d="M22 15v2" />
    </svg>
)

// Status configuration for styling
const statusConfig = {
    available: {
        label: 'ຫ້ອງວ່າງ',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-400 dark:border-emerald-500',
        cardBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    occupied: {
        label: 'ມີຄົນພັກ',
        badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
        badgeText: 'text-rose-700 dark:text-rose-300',
        borderColor: 'border-rose-400 dark:border-rose-500',
        cardBg: 'bg-rose-50 dark:bg-rose-950/60',
    },
    reserved: {
        label: 'ຈອງແລ້ວ',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
        badgeText: 'text-amber-700 dark:text-amber-300',
        borderColor: 'border-amber-400 dark:border-amber-500',
        cardBg: 'bg-amber-50 dark:bg-amber-950/60',
    },
    cleaning: {
        label: 'ກຳລັງທຳຄວາມສະອາດ',
        badgeBg: 'bg-cyan-100 dark:bg-cyan-900/40',
        badgeText: 'text-cyan-700 dark:text-cyan-300',
        borderColor: 'border-cyan-400 dark:border-cyan-500',
        cardBg: 'bg-cyan-50 dark:bg-cyan-950/60',
    },
}

// Parse roomType to get cooling and bed info
const parseRoomType = (roomType) => {
    if (!roomType) return { cooling: 'ac', bed: 'single' }
    const [cooling, bed] = roomType.split('-')
    return { cooling: cooling || 'ac', bed: bed || 'single' }
}

export default function RoomCard({ room, onRoomClick }) {
    const status = statusConfig[room.status] || statusConfig.available
    const { cooling, bed } = parseRoomType(room.roomType)

    // Cooling icon config
    const isFan = cooling === 'fan'
    const CoolingIcon = isFan ? Fan : Snowflake
    const coolingColor = isFan
        ? 'text-orange-500 dark:text-orange-400'
        : 'text-blue-500 dark:text-blue-400'
    const coolingAnimation = isFan ? 'animate-spin-slow' : 'animate-snowflake-pulse'

    // Bed icon config - using custom SVG icons
    const isDouble = bed === 'double'
    const BedIcon = isDouble ? DoubleBedIcon : SingleBedIcon
    const bedLabel = isDouble ? 'ຕຽງຄູ່' : 'ຕຽງດ່ຽວ'

    const handleClick = () => {
        if (onRoomClick) onRoomClick(room)
    }

    return (
        <div
            onClick={handleClick}
            className={`${status.cardBg} rounded-2xl p-4 border-2 ${status.borderColor} 
                  hover:shadow-lg dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer
                  group relative overflow-hidden`}
        >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-50/50 dark:from-slate-700/0 dark:to-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative z-10">
                {/* TOP: Status Badge (Left) + Cooling Icon (Right) */}
                <div className="flex items-center justify-between mb-4">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.badgeBg} ${status.badgeText}`}>
                        {status.label}
                    </span>

                    {/* Cooling Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isFan ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        <CoolingIcon className={`w-5 h-5 ${coolingColor} ${coolingAnimation}`} />
                    </div>
                </div>

                {/* MIDDLE: Room Number (Large, Centered) */}
                <div className="text-center py-3">
                    <span className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
                        {room.number}
                    </span>
                </div>

                {/* BOTTOM: Bed Icon + Bed Type Text */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <BedIcon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{bedLabel}</span>
                </div>
            </div>
        </div>
    )
}
