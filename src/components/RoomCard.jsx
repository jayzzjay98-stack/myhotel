import { User, Bed } from 'lucide-react'

const statusConfig = {
    available: {
        label: 'Available',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
        borderColor: 'border-l-emerald-500',
    },
    occupied: {
        label: 'Occupied',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-700',
        borderColor: 'border-l-rose-500',
    },
    reserved: {
        label: 'Reserved',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700',
        borderColor: 'border-l-amber-500',
    },
    cleaning: {
        label: 'Cleaning',
        badgeBg: 'bg-gray-200',
        badgeText: 'text-gray-700',
        borderColor: 'border-l-gray-400',
    },
}

export default function RoomCard({ room }) {
    const config = statusConfig[room.status]

    return (
        <div
            className={`bg-white rounded-2xl p-5 border border-gray-100 border-l-4 ${config.borderColor} 
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer
                  group relative overflow-hidden`}
        >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative z-10">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}>
                        {config.label}
                    </span>
                    {room.status === 'occupied' && (
                        <div className="flex items-center gap-1 text-gray-400">
                            <User className="w-3.5 h-3.5" />
                        </div>
                    )}
                </div>

                {/* Room Number */}
                <div className="mb-3">
                    <span className="text-3xl font-bold text-gray-800 tracking-tight">{room.number}</span>
                </div>

                {/* Guest Name or Room Type */}
                <div className="flex items-center gap-2 text-gray-500">
                    {room.status === 'occupied' ? (
                        <>
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium truncate">{room.guestName}</span>
                        </>
                    ) : (
                        <>
                            <Bed className="w-4 h-4" />
                            <span className="text-sm">{room.type}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
