import { useState, useMemo } from 'react'
import { Search, Calendar, X, Phone, CreditCard, User, Clock, Banknote, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

const ITEMS_PER_PAGE = 8

// Guest Detail Modal
function GuestDetailModal({ guest, onClose }) {
    if (!guest) return null

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('lo-LA').format(price || 0) + ' ₭'
    }

    const getRoomTypeLabel = (roomType) => {
        const [cooling, bed] = (roomType || 'ac-single').split('-')
        return `${cooling === 'fan' ? 'ພັດລົມ' : 'ແອ'} • ${bed === 'double' ? 'ຕເຕີຍງຄູ່' : 'ຕເຕີຍງດ່ເດີ່ຍວ'}`
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                    {guest.guestName || <span className="text-rose-500">ບໍ່ມີຊື່</span>}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ຫ້ອງ {guest.roomNumber}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                <Phone className="w-4 h-4" />
                                <span className="text-xs">ເບີໂທ</span>
                            </div>
                            <p className="font-medium text-gray-800 dark:text-white">{guest.phone || '-'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-xs">ພາສປອດ/ບັດ</span>
                            </div>
                            <p className="font-medium text-gray-800 dark:text-white">{guest.passport || '-'}</p>
                        </div>
                    </div>

                    {/* Stay Info */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
                            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">ເຊັກອິນ</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(guest.checkInDate)}</p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 text-center">
                            <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">ເຊັກເອົ້າ</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(guest.checkOutDate)}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">ໄລຍະເວລາ</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{guest.stayDuration || 1} ຄືນ</p>
                        </div>
                    </div>

                    {/* Room & Price */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Room Type</p>
                                <p className="font-medium text-gray-800 dark:text-white">{getRoomTypeLabel(guest.roomType)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatPrice(guest.totalPrice)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-center">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${guest.status === 'checked-out'
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                            }`}>
                            {guest.status === 'checked-out' ? '✓ Checked Out' : '● Currently Staying'}
                        </span>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default function GuestListView({ guestHistory }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedGuest, setSelectedGuest] = useState(null)

    // Filter guests
    const filteredGuests = useMemo(() => {
        return guestHistory.filter((guest) => {
            // Search filter (name, phone, passport)
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                searchTerm === '' ||
                (guest.guestName && guest.guestName.toLowerCase().includes(searchLower)) ||
                (guest.phone && guest.phone.includes(searchTerm)) ||
                (guest.passport && guest.passport.toLowerCase().includes(searchLower))

            // Date filter
            const matchesDate =
                dateFilter === '' ||
                (guest.checkInDate && guest.checkInDate.includes(dateFilter))

            return matchesSearch && matchesDate
        })
    }, [guestHistory, searchTerm, dateFilter])

    // Pagination
    const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedGuests = filteredGuests.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        })
    }

    const getStatusColor = (status) => {
        return status === 'checked-out'
            ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ລາຍຊື່ລູກຄ້າ</h2>
                <p className="text-gray-500 dark:text-gray-400">ເບິ່ງລາຍຊື່ແຂກປັດຈຸບັນ ແລະ ແຂກໃນອະດີດ</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ຄົ້ນຫາຕາມຊື່, ເບີໂທ, ຫລື ພາສປອດ..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1) }}
                            className="pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || dateFilter) && (
                        <button
                            onClick={() => { setSearchTerm(''); setDateFilter(''); setCurrentPage(1) }}
                            className="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-700 dark:text-white">{paginatedGuests.length}</span> of{' '}
                        <span className="font-semibold text-gray-700 dark:text-white">{filteredGuests.length}</span> guests
                    </p>
                </div>
            </div>

            {/* Guest Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Guest Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Room</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Check-in Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {paginatedGuests.length > 0 ? (
                            paginatedGuests.map((guest) => (
                                <tr
                                    key={guest.id}
                                    onClick={() => setSelectedGuest(guest)}
                                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        {guest.guestName ? (
                                            <span className="font-medium text-gray-800 dark:text-white">{guest.guestName}</span>
                                        ) : (
                                            <span className="text-rose-500 font-medium">ไม่มีชื่อ</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{guest.roomNumber}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(guest.checkInDate)}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{guest.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}>
                                            {guest.status === 'checked-out' ? 'Checked Out' : 'Staying'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedGuest(guest) }}
                                            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No guests found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Guest Detail Modal */}
            {selectedGuest && (
                <GuestDetailModal guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
            )}
        </div>
    )
}
