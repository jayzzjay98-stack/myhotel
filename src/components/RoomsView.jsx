import { useState, useMemo, useEffect } from 'react'
import { Search, BedDouble, Filter, X, Fan, Snowflake, Bed, CheckCircle, Sparkles, Check } from 'lucide-react'
import RoomGrid from './RoomGrid'

const statusFilters = [
    { key: 'all', label: 'ທັງໝົດ' },
    { key: 'available', label: 'ຫ້ອງວ່າງ' },
    { key: 'occupied', label: 'ມີຄົນພັກ' },
    { key: 'reserved', label: 'ຈອງແລ້ວ' },
    { key: 'cleaning', label: 'ກຳລັງທຳຄວາມສະອາດ' },
]

// Get filter label for display
const getAmenityLabel = (amenityFilter) => {
    if (!amenityFilter || amenityFilter.type === 'all') return null

    const labels = {
        'cooling-fan': { label: 'ຫ້ອງພັດລົມ', icon: Fan, color: 'text-orange-600 dark:text-orange-400' },
        'cooling-ac': { label: 'ຫ້ອງແອ', icon: Snowflake, color: 'text-blue-600 dark:text-blue-400' },
        'bed-single': { label: 'ຕຽງດ່ຽວ', icon: Bed, color: 'text-emerald-600 dark:text-emerald-400' },
        'bed-double': { label: 'ຕຽງຄູ່', icon: BedDouble, color: 'text-purple-600 dark:text-purple-400' },
    }

    return labels[`${amenityFilter.type}-${amenityFilter.value}`] || null
}

export default function RoomsView({ rooms, isDarkMode, onRoomClick, onBulkClean, defaultFilter, setDefaultFilter, amenityFilter, clearAmenityFilter }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState(defaultFilter || 'all')
    const [selectedRooms, setSelectedRooms] = useState([])

    // Sync with defaultFilter from parent
    useEffect(() => {
        if (defaultFilter && defaultFilter !== 'all') {
            setStatusFilter(defaultFilter)
            if (setDefaultFilter) {
                setDefaultFilter('all')
            }
        }
    }, [defaultFilter, setDefaultFilter])

    // Clear selection when filter changes
    useEffect(() => {
        setSelectedRooms([])
    }, [statusFilter])

    // Filter rooms based on search, status, and amenity
    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            // Status filter
            const matchesStatus = statusFilter === 'all' || room.status === statusFilter

            // Search filter
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                searchTerm === '' ||
                room.number.toLowerCase().includes(searchLower) ||
                (room.guestName && room.guestName.toLowerCase().includes(searchLower))

            // Amenity filter (cooling or bed type)
            let matchesAmenity = true
            if (amenityFilter && amenityFilter.type !== 'all') {
                const [cooling, bed] = (room.roomType || 'ac-single').split('-')

                if (amenityFilter.type === 'cooling') {
                    matchesAmenity = cooling === amenityFilter.value
                } else if (amenityFilter.type === 'bed') {
                    matchesAmenity = bed === amenityFilter.value
                }
            }

            return matchesStatus && matchesSearch && matchesAmenity
        })
    }, [rooms, searchTerm, statusFilter, amenityFilter])

    // Group filtered rooms by floor
    const roomsByFloor = useMemo(() => {
        return filteredRooms.reduce((acc, room) => {
            if (!acc[room.floor]) acc[room.floor] = []
            acc[room.floor].push(room)
            return acc
        }, {})
    }, [filteredRooms])

    const amenityLabel = getAmenityLabel(amenityFilter)

    // Selection mode is active when filtering by cleaning
    const isSelectionMode = statusFilter === 'cleaning'
    const cleaningRooms = filteredRooms.filter(r => r.status === 'cleaning')

    // Toggle room selection
    const toggleRoomSelection = (roomId) => {
        setSelectedRooms(prev =>
            prev.includes(roomId)
                ? prev.filter(id => id !== roomId)
                : [...prev, roomId]
        )
    }

    // Select all cleaning rooms
    const selectAllRooms = () => {
        setSelectedRooms(cleaningRooms.map(r => r.id))
    }

    // Deselect all rooms
    const deselectAllRooms = () => {
        setSelectedRooms([])
    }

    // Handle bulk clean action
    const handleBulkClean = () => {
        if (selectedRooms.length > 0 && onBulkClean) {
            onBulkClean(selectedRooms)
            setSelectedRooms([])
        }
    }

    // Handle room click - either select or open modal
    const handleRoomClick = (room) => {
        if (isSelectionMode && room.status === 'cleaning') {
            toggleRoomSelection(room.id)
        } else {
            onRoomClick(room)
        }
    }

    return (
        <div className="space-y-6">
            {/* Top Bar - Search & Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <div className="flex flex-col gap-4">
                    {/* Filter Pills - Centered & Larger */}
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setStatusFilter(filter.key)}
                                className={`px-6 py-3 rounded-full text-base font-semibold transition-all duration-200
                  ${statusFilter === filter.key
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 hover:scale-105'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input - Smaller */}
                    <div className="relative max-w-xs mx-auto w-full">
                        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ຄົ້ນຫາເລກຫ້ອງ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        />
                    </div>
                </div>

                {/* Active Amenity Filter Badge */}
                {amenityLabel && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">ກອງຕາມ:</span>
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-slate-700 ${amenityLabel.color}`}>
                            <amenityLabel.icon className="w-4 h-4" />
                            {amenityLabel.label}
                            <button
                                onClick={clearAmenityFilter}
                                className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    </div>
                )}

                {/* Results count */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ສະແດງ <span className="font-semibold text-gray-700 dark:text-white">{filteredRooms.length}</span> ຈາກທັງໝົດ{' '}
                        <span className="font-semibold text-gray-700 dark:text-white">{rooms.length}</span> ຫ້ອງ
                    </p>
                </div>
            </div>

            {/* Bulk Action Bar - Only visible when filtering by Cleaning */}
            {isSelectionMode && cleaningRooms.length > 0 && (
                <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-2xl p-4 border-2 border-cyan-200 dark:border-cyan-800 animate-slideUp">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-cyan-800 dark:text-cyan-200">ໂໝດເລືອກຫຼາຍຫ້ອງ</p>
                                <p className="text-sm text-cyan-600 dark:text-cyan-400">
                                    ຄລິກທີ່ຫ້ອງເພື່ອເລືອກ • ເລືອກແລ້ວ {selectedRooms.length} ຈາກ {cleaningRooms.length} ຫ້ອງ
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={selectAllRooms}
                                className="px-4 py-2 bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 rounded-xl font-medium border border-cyan-200 dark:border-cyan-700 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-all"
                            >
                                ເລືອກທັງໝົດ
                            </button>
                            <button
                                onClick={deselectAllRooms}
                                disabled={selectedRooms.length === 0}
                                className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                ຍົກເລີກ
                            </button>
                            <button
                                onClick={handleBulkClean}
                                disabled={selectedRooms.length === 0}
                                className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                ເຮັດເປັນຫ້ອງວ່າງ ({selectedRooms.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Grid or Empty State */}
            {filteredRooms.length > 0 ? (
                <RoomGrid
                    roomsByFloor={roomsByFloor}
                    onRoomClick={handleRoomClick}
                    isSelectionMode={isSelectionMode}
                    selectedRooms={selectedRooms}
                />
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 text-center transition-colors duration-300">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BedDouble className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">ບໍ່ພົບຫ້ອງ</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                        ລອງປັບປ່ຽນການຄົ້ນຫາ ຫຼື ຕົວກອງເພື່ອຄົ້ນຫາສິ່ງທີ່ທ່ານຕ້ອງການ
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            if (clearAmenityFilter) clearAmenityFilter()
                        }}
                        className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        ລ້າງຕົວກອງທັງໝົດ
                    </button>
                </div>
            )}
        </div>
    )
}
