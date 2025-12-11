import RoomCard from './RoomCard'
import { Building2 } from 'lucide-react'

export default function RoomGrid({ roomsByFloor, onRoomClick, isSelectionMode = false, selectedRooms = [] }) {
    const floors = Object.keys(roomsByFloor).sort((a, b) => Number(a) - Number(b))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">ພາບລວມຫ້ອງພັກ</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span>{floors.length} ຊັ້ນ</span>
                </div>
            </div>

            {floors.map((floor) => (
                <div key={floor} className="space-y-4">
                    {/* Floor Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{floor}</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ຊັ້ນ {floor}</h3>
                        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700"></div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{roomsByFloor[floor].length} ຫ້ອງ</span>
                    </div>

                    {/* Room Cards Grid */}
                    <div className="grid grid-cols-5 gap-4">
                        {roomsByFloor[floor].map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onRoomClick={onRoomClick}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedRooms.includes(room.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
