import RoomCard from './RoomCard'
import { Building2 } from 'lucide-react'

export default function RoomGrid({ roomsByFloor, onRoomClick, isSelectionMode = false, selectedRooms = [] }) {
    const floors = Object.keys(roomsByFloor).sort((a, b) => Number(a) - Number(b))

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-gray-800 dark:text-white" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">ພາບລວມຫ້ອງພັກ {floors.length} ຊັ້ນ</h2>
            </div>

            {floors.map((floor) => (
                <div key={floor} className="space-y-4">
                    {/* Floor Header */}
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white uppercase tracking-wide">ຊັ້ນ {floor}</h3>
                        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700"></div>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">{roomsByFloor[floor].length} ຫ້ອງ</span>
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
