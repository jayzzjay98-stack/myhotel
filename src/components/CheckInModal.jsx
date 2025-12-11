import { useState } from 'react'
import { X, User, Phone, CreditCard, Banknote, LogIn } from 'lucide-react'

export default function CheckInModal({ room, onClose, onConfirm, isDarkMode }) {
    const [formData, setFormData] = useState({
        guestName: '',
        phone: '',
        passport: '',
        price: ''
    })
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (error) setError('')
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validate guest name
        if (!formData.guestName.trim()) {
            setError('Guest name is required')
            return
        }

        onConfirm(room.id, {
            guestName: formData.guestName.trim(),
            phone: formData.phone.trim(),
            passport: formData.passport.trim(),
            price: formData.price ? Number(formData.price) : 0
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-slate-900/50 overflow-hidden animate-in fade-in zoom-in duration-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                            <LogIn className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Check In Guest</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Room {room.number} • {room.type}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Guest Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Guest Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                name="guestName"
                                value={formData.guestName}
                                onChange={handleChange}
                                placeholder="Enter guest name"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number <span className="text-gray-400 dark:text-gray-500">(Optional)</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="020 XXXX XXXX"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Passport ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Passport / ID <span className="text-gray-400 dark:text-gray-500">(Optional)</span>
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                name="passport"
                                value={formData.passport}
                                onChange={handleChange}
                                placeholder="Passport or ID number"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Room Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Room Price
                        </label>
                        <div className="relative">
                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="w-full pl-11 pr-16 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                ₭ LAK
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            Check In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
