import { X, AlertTriangle } from 'lucide-react'

// Void reasons mapping
const voidReasons = {
    'guest_cancelled': 'ແຂກຍົກເລີກ',
    'no_show': 'ແຂກບໍ່ມາ',
    'keying_error': 'ພິມຜິດ',
    'system_error': 'ລະບົບຜິດພາດ',
    'duplicate': 'ຊ້ຳກັນ',
    'other': 'ອື່ນໆ',
}

export default function VoidHistoryModal({ voidedTransactions, onClose }) {
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('lo-LA', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('lo-LA').format(price || 0) + ' ₭'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="p-6 bg-rose-50 dark:bg-rose-900/30 border-b border-rose-100 dark:border-rose-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-rose-800 dark:text-rose-200">ປະຫວັດການຍົກເລີກ (Void History)</h3>
                                <p className="text-sm text-rose-600 dark:text-rose-400">ລາຍການທັງໝົດທີ່ຖືກຍົກເລີກ</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                            <X className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="max-h-[60vh] overflow-auto">
                    {voidedTransactions.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ວັນທີ</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ຫ້ອງ</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ຊື່ແຂກ</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ເຫດຜົນ</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ອະນຸມັດໂດຍ</th>
                                    <th className="px-4 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">ມູນຄ່າ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {voidedTransactions.map((guest) => {
                                    const isStaffVoid = guest.voidBy === 'ພະນັກງານ'
                                    return (
                                        <tr
                                            key={guest.id}
                                            className={`transition-colors ${isStaffVoid
                                                ? 'bg-rose-100/80 dark:bg-rose-900/40 hover:bg-rose-200/80 dark:hover:bg-rose-900/60'
                                                : 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20'}`}
                                        >
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                                                {formatDate(guest.voidDate || guest.checkInDate)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-semibold text-gray-800 dark:text-white">{guest.roomNumber}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-gray-600 dark:text-gray-300 line-through">
                                                    {guest.guestName || 'ບໍ່ມີຊື່'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-full">
                                                    {voidReasons[guest.voidReason] || guest.voidReason || 'ບໍ່ລະບຸ'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${isStaffVoid
                                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}
                                                >
                                                    {guest.voidBy || 'ຜູ້ດູແລ'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-rose-600 dark:text-rose-400">
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
                            <p className="text-gray-500 dark:text-gray-400 text-sm">ຍັງບໍ່ມີລາຍການທີ່ຖືກຍົກເລີກ</p>
                        </div>
                    )}
                </div>

                {/* Footer Summary */}
                {voidedTransactions.length > 0 && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border-t border-rose-100 dark:border-rose-800">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-rose-600 dark:text-rose-400">
                                ລວມທັງໝົດ <span className="font-bold">{voidedTransactions.length}</span> ລາຍການ
                            </p>
                            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                                {new Intl.NumberFormat('lo-LA').format(voidedTransactions.reduce((sum, g) => sum + (g.totalPrice || 0), 0))} ₭
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
