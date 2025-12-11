import { useState, useMemo, useEffect } from 'react'
import { Search, BedDouble, Filter, X, Fan, Snowflake, Bed, CheckCircle, Sparkles, Check } from 'lucide-react'
import RoomGrid from './RoomGrid'

const statusFilters = [
    { key: 'all', label: 'ທັງໝົດ', color: 'blue' },
    { key: 'available', label: 'ຫ້ອງວ່າງ', color: 'emerald' },
    { key: 'occupied', label: 'ມີຄົນພັກ', color: 'rose' },
    { key: 'reserved', label: 'ຈອງແລ້ວ', color: 'amber' },
    { key: 'cleaning', label: 'ກຳລັງທຳຄວາມສະອາດ', color: 'cyan' },
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
    const [quickFindType, setQuickFindType] = useState('') // Quick find available room filter

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

    // Filter rooms based on search, status, amenity, and quickFindType
    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            // Quick Find filter - strictly available rooms of specific type
            if (quickFindType) {
                return room.status === 'available' && room.roomType === quickFindType
            }

            // Status filter
            const matchesStatus = statusFilter === 'all' || room.status === statusFilter

            // Search filter (room number, guest name, phone, passport)
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                searchTerm === '' ||
                room.number.toLowerCase().includes(searchLower) ||
                (room.guestName && room.guestName.toLowerCase().includes(searchLower)) ||
                (room.phone && room.phone.toLowerCase().includes(searchLower)) ||
                (room.passport && room.passport.toLowerCase().includes(searchLower))

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
    }, [rooms, searchTerm, statusFilter, amenityFilter, quickFindType])

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
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-150">
                <div className="flex flex-col gap-4">
                    {/* Filter Pills - Centered & Larger with Colors */}
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {statusFilters.map((filter) => {
                            const isActive = statusFilter === filter.key
                            const colorClasses = {
                                blue: isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50',
                                emerald: isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
                                rose: isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50',
                                amber: isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50',
                                cyan: isActive ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/50',
                            }
                            return (
                                <button
                                    key={filter.key}
                                    onClick={() => setStatusFilter(filter.key)}
                                    className={`px-6 py-3 rounded-full text-base font-semibold transition-all duration-100 border-2 ${isActive ? 'scale-105' : 'hover:scale-105'} ${colorClasses[filter.color]} ${isActive ? 'border-transparent' : 'border-transparent'}`}
                                >
                                    {filter.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Search Row - Guest Search + Quick Find */}
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {/* Guest Search Input */}
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ຄົ້ນຫາ ຫ້ອງ/ຊື່/ເບີໂທ/ພາສປອດ..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Quick Find Available Room Dropdown */}
                        <div className="relative w-56">
                            <select
                                value={quickFindType}
                                onChange={(e) => setQuickFindType(e.target.value)}
                                className={`w-full px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border-2 text-lg font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none font-sans ${quickFindType ? 'border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400'}`}
                            >
                                <option value="" className="text-base py-2">🔍 ຄົ້ນຫາຫ້ອງວ່າງ...</option>
                                <option value="fan-single" className="text-base py-2">🌀 ຫ້ອງພັດລົມ ຕຽງດ່ຽວ</option>
                                <option value="fan-double" className="text-base py-2">🌀 ຫ້ອງພັດລົມ ຕຽງຄູ່</option>
                                <option value="ac-single" className="text-base py-2">❄️ ຫ້ອງແອ ຕຽງດ່ຽວ</option>
                                <option value="ac-double" className="text-base py-2">❄️ ຫ້ອງແອ ຕຽງຄູ່</option>
                            </select>
                            {/* Custom dropdown arrow */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
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
            {
                isSelectionMode && cleaningRooms.length > 0 && (
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
                )
            }

            {/* Room Grid or Empty State */}
            {
                filteredRooms.length > 0 ? (
                    <RoomGrid
                        roomsByFloor={roomsByFloor}
                        onRoomClick={handleRoomClick}
                        isSelectionMode={isSelectionMode}
                        selectedRooms={selectedRooms}
                    />
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 text-center transition-colors duration-150">
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
                                setQuickFindType('')
                                if (clearAmenityFilter) clearAmenityFilter()
                            }}
                            className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            ລ້າງຕົວກອງທັງໝົດ
                        </button>
                    </div>
                )
            }
        </div>
    )
}
