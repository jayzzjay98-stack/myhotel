import { useState, useMemo } from 'react'
import { Search, BedDouble, Filter } from 'lucide-react'
import RoomGrid from './RoomGrid'

const statusFilters = [
    { key: 'all', label: 'All Rooms' },
    { key: 'available', label: 'Available' },
    { key: 'occupied', label: 'Occupied' },
    { key: 'reserved', label: 'Reserved' },
    { key: 'cleaning', label: 'Cleaning' },
]

export default function RoomsView({ rooms }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Filter rooms based on search term and status filter
    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            // Status filter
            const matchesStatus = statusFilter === 'all' || room.status === statusFilter

            // Search filter (room number or guest name)
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                searchTerm === '' ||
                room.number.toLowerCase().includes(searchLower) ||
                (room.guestName && room.guestName.toLowerCase().includes(searchLower))

            return matchesStatus && matchesSearch
        })
    }, [rooms, searchTerm, statusFilter])

    // Group filtered rooms by floor
    const roomsByFloor = useMemo(() => {
        return filteredRooms.reduce((acc, room) => {
            if (!acc[room.floor]) acc[room.floor] = []
            acc[room.floor].push(room)
            return acc
        }, {})
    }, [filteredRooms])

    return (
        <div className="space-y-6">
            {/* Top Bar - Search & Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by room number or guest name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                         focus:bg-white transition-all"
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-gray-400 mr-1" />
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setStatusFilter(filter.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${statusFilter === filter.key
                                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-700">{filteredRooms.length}</span> of{' '}
                        <span className="font-semibold text-gray-700">{rooms.length}</span> rooms
                    </p>
                </div>
            </div>

            {/* Room Grid or Empty State */}
            {filteredRooms.length > 0 ? (
                <RoomGrid roomsByFloor={roomsByFloor} />
            ) : (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BedDouble className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No rooms found</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                        }}
                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                       hover:bg-blue-100 transition-colors"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    )
}
