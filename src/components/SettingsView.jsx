import { useState, useEffect } from 'react'
import { X, Lock, Eye, EyeOff, Check, AlertCircle, Pencil, Trash2, Bed, BedDouble, Fan, Snowflake, Plus } from 'lucide-react'

const CORRECT_PIN = '12345'

// Default room prices mapping
const defaultPrices = {
    'fan-single': 150000,
    'fan-double': 200000,
    'ac-single': 250000,
    'ac-double': 350000,
}

// PIN Verification Modal
function PinModal({ isOpen, onClose, onVerify, action, roomNumber }) {
    const [pin, setPin] = useState('')
    const [showPin, setShowPin] = useState(false)
    const [error, setError] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsVerifying(true)

        setTimeout(() => {
            if (pin === CORRECT_PIN) {
                onVerify(true)
                setPin('')
                setError('')
            } else {
                setError('ລະຫັດ PIN ບໍ່ຖືກຕ້ອງ')
                setPin('')
            }
            setIsVerifying(false)
        }, 500)
    }

    const handleClose = () => {
        setPin('')
        setError('')
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">ຍືນຍັນລະຫັດ PIN</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{action} {roomNumber ? `ຫ້ອງ ${roomNumber}` : 'ຫ້ອງໃໝ່'}</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ປ້ອນລະຫັດ PIN
                        </label>
                        <div className="relative">
                            <input
                                type={showPin ? 'text' : 'password'}
                                value={pin}
                                onChange={(e) => { setPin(e.target.value); setError('') }}
                                placeholder="•••••"
                                maxLength={5}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-center text-2xl tracking-widest font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                            >
                                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {error && (
                            <p className="flex items-center gap-1 mt-2 text-sm text-rose-500">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={pin.length < 5 || isVerifying}
                        className="w-full py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                    >
                        {isVerifying ? (
                            <>ກຳລັງກວດສອບ...</>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                ຍືນຍັນ
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

// Add/Edit Room Modal
function RoomFormModal({ isOpen, room, onClose, onSave, isNew = false, existingRoomNumbers = [] }) {
    const [roomNumber, setRoomNumber] = useState(room?.number || '')
    const [floor, setFloor] = useState(room?.floor?.toString() || '1')
    const [cooling, setCooling] = useState(room?.roomType?.split('-')[0] || 'ac')
    const [bedType, setBedType] = useState(room?.roomType?.split('-')[1] || 'single')
    const [customPrice, setCustomPrice] = useState(room?.price?.toString() || '')
    const [error, setError] = useState('')

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setRoomNumber(room?.number || '')
            setFloor(room?.floor?.toString() || '1')
            setCooling(room?.roomType?.split('-')[0] || 'ac')
            setBedType(room?.roomType?.split('-')[1] || 'single')
            setCustomPrice(room?.price?.toString() || '')
            setError('')
        }
    }, [isOpen, room])

    if (!isOpen) return null

    const roomType = `${cooling}-${bedType}`
    const suggestedPrice = defaultPrices[roomType] || 250000
    const price = customPrice ? parseInt(customPrice) : suggestedPrice

    const handleSave = () => {
        // Validate room number
        if (!roomNumber.trim()) {
            setError('ກະລຸນາປ້ອນເລກຫ້ອງ')
            return
        }

        // Check for duplicate room number (only for new rooms or if number changed)
        const isDuplicate = existingRoomNumbers.some(num =>
            num.toLowerCase() === roomNumber.toLowerCase() &&
            (isNew || num !== room?.number)
        )

        if (isDuplicate) {
            setError('ຫ້ອງນີ້ມີຢູ່ແລ້ວ')
            return
        }

        // Validate price
        if (price <= 0 || isNaN(price)) {
            setError('ກະລຸນາປ້ອນລາຄາທີ່ຖືກຕ້ອງ')
            return
        }

        onSave({
            number: roomNumber,
            floor: parseInt(floor),
            roomType,
            price
        })
        onClose()
    }

    const formatPrice = (p) => new Intl.NumberFormat('lo-LA').format(p) + ' ₭'

    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        setCustomPrice(value)
        setError('')
    }

    const applySuggestedPrice = () => {
        setCustomPrice(suggestedPrice.toString())
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {isNew ? 'ເພີ່ມຫ້ອງໃໝ່' : `ແກ້ໄຂຫ້ອງ ${room?.number}`}
                        </h3>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    {/* Room Number & Floor */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ເລກຫ້ອງ *</label>
                            <input
                                type="text"
                                value={roomNumber}
                                onChange={(e) => { setRoomNumber(e.target.value); setError('') }}
                                placeholder="ເຊັ່ນ 101"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ຊັ້ນ</label>
                            <select
                                value={floor}
                                onChange={(e) => setFloor(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="1">ຊັ້ນ 1</option>
                                <option value="2">ຊັ້ນ 2</option>
                                <option value="3">ຊັ້ນ 3</option>
                                <option value="4">ຊັ້ນ 4</option>
                                <option value="5">ຊັ້ນ 5</option>
                            </select>
                        </div>
                    </div>

                    {/* Cooling Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ປະເພດເຄື່ອງປັບອາກາດ</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setCooling('fan')}
                                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${cooling === 'fan'
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                                    }`}
                            >
                                <Fan className={`w-6 h-6 ${cooling === 'fan' ? 'text-orange-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${cooling === 'fan' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>ພັດລົມ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setCooling('ac')}
                                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${cooling === 'ac'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                                    }`}
                            >
                                <Snowflake className={`w-6 h-6 ${cooling === 'ac' ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${cooling === 'ac' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>ແອ</span>
                            </button>
                        </div>
                    </div>

                    {/* Bed Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ປະເພດຕເຕີຍງ</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setBedType('single')}
                                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${bedType === 'single'
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                                    }`}
                            >
                                <Bed className={`w-6 h-6 ${bedType === 'single' ? 'text-emerald-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${bedType === 'single' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>ຕເຕີຍງດ່ເດີ່ຍວ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setBedType('double')}
                                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${bedType === 'double'
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                                    }`}
                            >
                                <BedDouble className={`w-6 h-6 ${bedType === 'double' ? 'text-purple-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${bedType === 'double' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>ຕເຕີຍງຄູ່</span>
                            </button>
                        </div>
                    </div>

                    {/* Custom Price Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ລາຄາຕໍ່ຄືນ (₭) *</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={customPrice}
                                onChange={handlePriceChange}
                                placeholder={suggestedPrice.toString()}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-20"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₭</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                ແນະນຳ: {formatPrice(suggestedPrice)}
                            </p>
                            <button
                                type="button"
                                onClick={applySuggestedPrice}
                                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                            >
                                ໃຊ້ລາຄາແນະນຳ
                            </button>
                        </div>
                    </div>

                    {/* Status Note (for new rooms) */}
                    {isNew && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                ✓ ຫ້ອງໃໝ່ຈະມີສະຖານະ "ຫ້ອງວ່າງ" ອັດຕະໂນມັດ
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                            ຍົກເລີກ
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all"
                        >
                            {isNew ? 'ເພີ່ມຫ້ອງ' : 'ບັນທຶກ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SettingsView({ rooms, onAddRoom, onEditRoom, onDeleteRoom }) {
    const [pinModal, setPinModal] = useState({ isOpen: false, action: '', roomId: null })
    const [editModal, setEditModal] = useState({ isOpen: false, room: null, isNew: false })
    const [pendingDelete, setPendingDelete] = useState(null)

    // Get list of existing room numbers for duplicate check
    const existingRoomNumbers = rooms.map(r => r.number)

    const handleAddClick = () => {
        setPinModal({ isOpen: true, action: 'Add', roomId: null })
        setEditModal({ isOpen: false, room: null, isNew: true })
    }

    const handleEditClick = (room) => {
        setPinModal({ isOpen: true, action: 'Edit', roomId: room.id })
        setEditModal({ isOpen: false, room, isNew: false })
    }

    const handleDeleteClick = (room) => {
        setPinModal({ isOpen: true, action: 'Delete', roomId: room.id })
        setPendingDelete(room)
    }

    const handlePinVerify = (success) => {
        if (success) {
            if (pinModal.action === 'Add') {
                setPinModal({ isOpen: false, action: '', roomId: null })
                setEditModal({ isOpen: true, room: null, isNew: true })
            } else if (pinModal.action === 'Edit' && editModal.room) {
                setPinModal({ isOpen: false, action: '', roomId: null })
                setEditModal({ isOpen: true, room: editModal.room, isNew: false })
            } else if (pinModal.action === 'Delete' && pendingDelete) {
                onDeleteRoom(pendingDelete.id)
                setPinModal({ isOpen: false, action: '', roomId: null })
                setPendingDelete(null)
            }
        }
    }

    const handlePinClose = () => {
        setPinModal({ isOpen: false, action: '', roomId: null })
        setEditModal({ isOpen: false, room: null, isNew: false })
        setPendingDelete(null)
    }

    const handleSaveRoom = (updates) => {
        if (editModal.isNew) {
            onAddRoom(updates)
        } else if (editModal.room) {
            onEditRoom(editModal.room.id, updates)
        }
        setEditModal({ isOpen: false, room: null, isNew: false })
    }

    const getRoomTypeLabel = (roomType) => {
        const [cooling, bed] = (roomType || 'ac-single').split('-')
        return `${cooling === 'fan' ? 'ພັດລົມ' : 'ແອ'} • ${bed === 'double' ? 'ຄູ່' : 'ດ່ເດີ່ຍວ'}`
    }

    const getStatusColor = (status) => {
        const colors = {
            available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            occupied: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
            reserved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            cleaning: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
        }
        return colors[status] || colors.available
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ຕັ້ງຄ່າຫ້ອງ</h2>
                    <p className="text-gray-500 dark:text-gray-400">ຈັດການຫ້ອງ, ແກ້ໄຂລາຍລະອເອີຍດ, ຫລື ລົບຫ້ອງ</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    ເພີ່ມຫ້ອງ
                </button>
            </div>

            {/* Room Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ຫ້ອງ</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ຊັ້ນ</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ປະເພດ</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ສະຖານະ</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ລາຄາ</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">ດຳເນີນການ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {rooms.map((room) => (
                            <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-800 dark:text-white">{room.number}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">Floor {room.floor}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {room.roomType?.includes('fan') ? (
                                            <Fan className="w-4 h-4 text-orange-500" />
                                        ) : (
                                            <Snowflake className="w-4 h-4 text-blue-500" />
                                        )}
                                        <span className="text-gray-600 dark:text-gray-400">{getRoomTypeLabel(room.roomType)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(room.status)}`}>
                                        {room.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {new Intl.NumberFormat('lo-LA').format(room.price)} ₭
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEditClick(room)}
                                            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(room)}
                                            disabled={room.status === 'occupied'}
                                            className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <PinModal
                isOpen={pinModal.isOpen}
                onClose={handlePinClose}
                onVerify={handlePinVerify}
                action={pinModal.action}
                roomNumber={editModal.room?.number || pendingDelete?.number || ''}
            />

            <RoomFormModal
                isOpen={editModal.isOpen}
                room={editModal.room}
                onClose={() => setEditModal({ isOpen: false, room: null, isNew: false })}
                onSave={handleSaveRoom}
                isNew={editModal.isNew}
                existingRoomNumbers={existingRoomNumbers}
            />
        </div>
    )
}
