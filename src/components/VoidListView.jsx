import { useState, useMemo } from 'react'
import { Search, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react'

// Void reasons mapping
const voidReasons = {
    'guest_cancelled': 'ແຂກຍົກເລີກ',
    'no_show': 'ແຂກບໍ່ມາ',
    'keying_error': 'ພິມຜິດ',
    'system_error': 'ລະບົບຜິດພາດ',
    'duplicate': 'ຊ້ຳກັນ',
    'other': 'ອື່ນໆ',
}

const ITEMS_PER_PAGE = 10

// Lao month names
const laoMonths = [
    { value: '', label: 'ທຸກເດືອນ' },
    { value: '01', label: 'ມັງກອນ' },
    { value: '02', label: 'ກຸມພາ' },
    { value: '03', label: 'ມີນາ' },
    { value: '04', label: 'ເມສາ' },
    { value: '05', label: 'ພຶດສະພາ' },
    { value: '06', label: 'ມິຖຸນາ' },
    { value: '07', label: 'ກໍລະກົດ' },
    { value: '08', label: 'ສິງຫາ' },
    { value: '09', label: 'ກັນຍາ' },
    { value: '10', label: 'ຕຸລາ' },
    { value: '11', label: 'ພະຈິກ' },
    { value: '12', label: 'ທັນວາ' },
]

export default function VoidListView({ guestHistory }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterMonth, setFilterMonth] = useState('')
    const [filterYear, setFilterYear] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Get all voided transactions
    const voidedTransactions = useMemo(() => {
        return guestHistory.filter(g => g.status === 'void')
    }, [guestHistory])

    // Get unique years from data
    const availableYears = useMemo(() => {
        const years = new Set()
        voidedTransactions.forEach(g => {
            const date = g.voidDate || g.checkInDate
            if (date) {
                years.add(new Date(date).getFullYear())
            }
        })
        return Array.from(years).sort((a, b) => b - a) // Descending
    }, [voidedTransactions])

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return voidedTransactions.filter(guest => {
            // Search filter
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch = searchTerm === '' ||
                (guest.guestName && guest.guestName.toLowerCase().includes(searchLower)) ||
                (guest.roomNumber && guest.roomNumber.toLowerCase().includes(searchLower)) ||
                (guest.voidReason && guest.voidReason.toLowerCase().includes(searchLower)) ||
                (voidReasons[guest.voidReason] && voidReasons[guest.voidReason].toLowerCase().includes(searchLower))

            // Month filter
            const date = guest.voidDate || guest.checkInDate
            const guestMonth = date ? new Date(date).toISOString().slice(5, 7) : ''
            const matchesMonth = filterMonth === '' || guestMonth === filterMonth

            // Year filter
            const guestYear = date ? new Date(date).getFullYear().toString() : ''
            const matchesYear = filterYear === '' || guestYear === filterYear

            return matchesSearch && matchesMonth && matchesYear
        })
    }, [voidedTransactions, searchTerm, filterMonth, filterYear])

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Summary stats based on filtered data
    const totalCount = filteredTransactions.length
    const totalAmount = filteredTransactions.reduce((sum, g) => sum + (g.totalPrice || 0), 0)

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('lo-LA', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('lo-LA').format(price || 0) + ' ₭'
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilterMonth('')
        setFilterYear('')
        setCurrentPage(1)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ປະຫວັດການຍົກເລີກ (Void History)</h2>
                        <p className="text-gray-500 dark:text-gray-400">ລາຍການທັງໝົດທີ່ຖືກຍົກເລີກ</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-800">
                    <p className="text-rose-600 dark:text-rose-400 text-sm font-medium mb-2">ຈຳນວນລາຍການຍົກເລີກ</p>
                    <p className="text-4xl font-bold text-rose-700 dark:text-rose-300">{totalCount}</p>
                    <p className="text-rose-500 dark:text-rose-400 text-sm mt-1">ລາຍການ</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-800">
                    <p className="text-rose-600 dark:text-rose-400 text-sm font-medium mb-2">ມູນຄ່າລວມທີ່ຍົກເລີກ</p>
                    <p className="text-4xl font-bold text-rose-700 dark:text-rose-300">{formatPrice(totalAmount)}</p>
                    <p className="text-rose-500 dark:text-rose-400 text-sm mt-1">ກີບ</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            placeholder="ຄົ້ນຫາຊື່ແຂກ, ຫ້ອງ, ເຫດຜົນ..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                    </div>

                    {/* Month Filter */}
                    <select
                        value={filterMonth}
                        onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1) }}
                        className="px-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    >
                        {laoMonths.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>

                    {/* Year Filter */}
                    <select
                        value={filterYear}
                        onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1) }}
                        className="px-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    >
                        <option value="">ທຸກປີ</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    {/* Clear Filters */}
                    {(searchTerm || filterMonth || filterYear) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            ລ້າງ
                        </button>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                {paginatedTransactions.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-rose-50 dark:bg-rose-900/30 border-b border-rose-100 dark:border-rose-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-base font-semibold text-rose-700 dark:text-rose-300">ວັນທີ</th>
                                <th className="px-6 py-4 text-left text-base font-semibold text-rose-700 dark:text-rose-300">ຫ້ອງ</th>
                                <th className="px-6 py-4 text-left text-base font-semibold text-rose-700 dark:text-rose-300">ຊື່ແຂກ</th>
                                <th className="px-6 py-4 text-left text-base font-semibold text-rose-700 dark:text-rose-300">ເຫດຜົນ</th>
                                <th className="px-6 py-4 text-left text-base font-semibold text-rose-700 dark:text-rose-300">ອະນຸມັດໂດຍ</th>
                                <th className="px-6 py-4 text-right text-base font-semibold text-rose-700 dark:text-rose-300">ມູນຄ່າ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {paginatedTransactions.map((guest) => {
                                const isStaffVoid = guest.voidBy === 'ພະນັກງານ'
                                return (
                                    <tr
                                        key={guest.id}
                                        className={`transition-colors ${isStaffVoid
                                            ? 'bg-rose-100/80 dark:bg-rose-900/40 hover:bg-rose-200/80 dark:hover:bg-rose-900/60'
                                            : 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20'}`}
                                    >
                                        <td className="px-6 py-4 text-base text-gray-600 dark:text-gray-400">
                                            {formatDate(guest.voidDate || guest.checkInDate)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-gray-800 dark:text-white">{guest.roomNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-base text-gray-600 dark:text-gray-300 line-through">
                                                {guest.guestName || 'ບໍ່ມີຊື່'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-full">
                                                {voidReasons[guest.voidReason] || guest.voidReason || 'ບໍ່ລະບຸ'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${isStaffVoid
                                                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}
                                            >
                                                {guest.voidBy || 'ຜູ້ດູແລ'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                                                {formatPrice(guest.totalPrice)}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">ບໍ່ມີລາຍການຍົກເລີກ</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">ບໍ່ພົບຂໍ້ມູນຕາມເງື່ອນໄຂທີ່ກຳນົດ</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ສະແດງ {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} ຈາກ {filteredTransactions.length} ລາຍການ
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                                pageNum = i + 1
                            } else if (currentPage <= 3) {
                                pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                            } else {
                                pageNum = currentPage - 2 + i
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === pageNum
                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
