import { useState, useEffect } from 'react'
import { X, Lock, Eye, EyeOff, Check, AlertCircle, Pencil, Trash2, Bed, BedDouble, Fan, Snowflake, Plus, ArrowLeft, Database, Settings, ChevronRight, Key, Shield } from 'lucide-react'

// Dual PIN System
const MASTER_PIN = '12345'  // ຜູ້ດູແລ/ເຈົ້າຂອງ (Admin/Owner) - Full Access
const STAFF_PIN = '1111'    // ພະນັກງານ (Staff) - Limited Access
const CORRECT_PIN = MASTER_PIN  // For backward compatibility

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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ປະເພດຕ່ຽງ</label>
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
                                <span className={`font-medium ${bedType === 'single' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>ຕ່ຽງດ່ຽວ</span>
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
                                <span className={`font-medium ${bedType === 'double' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>ຕ່ຽງຄູ່</span>
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
    // Sub-menu navigation state: null = main menu, 'rooms' = room management, 'system' = system & data
    const [activeSection, setActiveSection] = useState(null)

    const [pinModal, setPinModal] = useState({ isOpen: false, action: '', roomId: null })
    const [editModal, setEditModal] = useState({ isOpen: false, room: null, isNew: false })
    const [pendingDelete, setPendingDelete] = useState(null)
    const [filterFloor, setFilterFloor] = useState('all') // Floor filter

    // Clear Data Modal State (requires Admin PIN)
    const [clearDataModal, setClearDataModal] = useState(false)
    const [clearDataPin, setClearDataPin] = useState('')
    const [clearDataError, setClearDataError] = useState('')
    const [showClearDataPin, setShowClearDataPin] = useState(false)

    // Change Password State
    const [changePinType, setChangePinType] = useState(null) // 'admin', 'staff', or null
    const [oldPin, setOldPin] = useState('')
    const [newPin, setNewPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [changePinError, setChangePinError] = useState('')
    const [showOldPin, setShowOldPin] = useState(false)
    const [showNewPin, setShowNewPin] = useState(false)

    // Get unique floors from rooms
    const uniqueFloors = [...new Set(rooms.map(r => r.floor || 1))].sort((a, b) => a - b)

    // Get list of existing room numbers for duplicate check
    const existingRoomNumbers = rooms.map(r => r.number)

    const handleAddClick = () => {
        setPinModal({ isOpen: true, action: 'ເພີ່ມ', roomId: null })
        setEditModal({ isOpen: false, room: null, isNew: true })
    }

    const handleEditClick = (room) => {
        setPinModal({ isOpen: true, action: 'ແກ້ໄຂ', roomId: room.id })
        setEditModal({ isOpen: false, room, isNew: false })
    }

    const handleDeleteClick = (room) => {
        setPinModal({ isOpen: true, action: 'ລົບ', roomId: room.id })
        setPendingDelete(room)
    }

    const handlePinVerify = (success) => {
        if (success) {
            if (pinModal.action === 'ເພີ່ມ') {
                setPinModal({ isOpen: false, action: '', roomId: null })
                setEditModal({ isOpen: true, room: null, isNew: true })
            } else if (pinModal.action === 'ແກ້ໄຂ' && editModal.room) {
                setPinModal({ isOpen: false, action: '', roomId: null })
                setEditModal({ isOpen: true, room: editModal.room, isNew: false })
            } else if (pinModal.action === 'ລົບ' && pendingDelete) {
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
        const coolingLabel = cooling === 'fan' ? 'ຫ້ອງພັດລົມ' : 'ຫ້ອງແອ'
        const bedLabel = bed === 'double' ? 'ຕ່ຽງຄູ່' : 'ຕ່ຽງດ່ຽວ'
        return `${coolingLabel} ${bedLabel}`
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
            {/* ===================== MAIN MENU ===================== */}
            {activeSection === null && (
                <>
                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ຕັ້ງຄ່າ</h2>
                        <p className="text-gray-500 dark:text-gray-400">ເລືອກໝວດໝູ່ທີ່ຕ້ອງການຈັດການ</p>
                    </div>

                    {/* Menu Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: Room Management */}
                        <button
                            onClick={() => setActiveSection('rooms')}
                            className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10 text-left"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                    <BedDouble className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        ຈັດການຫ້ອງພັກ
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        ເພີ່ມ, ແກ້ໄຂ, ຫລື ລົບຂໍ້ມູນຫ້ອງ
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-blue-500">
                                        <span className="text-sm font-medium">{rooms.length} ຫ້ອງ</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Card 2: System & Data */}
                        <button
                            onClick={() => setActiveSection('system')}
                            className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-all shadow-lg hover:shadow-xl hover:shadow-rose-500/10 text-left"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                                    <Database className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                        ລະບົບ & ຂໍ້ມູນ
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        ລ້າງຂໍ້ມູນ, ຕັ້ງຄ່າຄືນໃໝ່
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-rose-500">
                                        <span className="text-sm font-medium">ຈັດການລະບົບ</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Card 3: Security / Change PIN */}
                        <button
                            onClick={() => setActiveSection('security')}
                            className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all shadow-lg hover:shadow-xl hover:shadow-amber-500/10 text-left"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                    <Key className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        ຄວາມປອດໄພ
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        ປ່ຽນລະຫັດຜ່ານ Admin, Staff, Lock
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-amber-500">
                                        <span className="text-sm font-medium">ປ່ຽນລະຫັດຜ່ານ</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </>
            )}

            {/* ===================== ROOM MANAGEMENT SECTION ===================== */}
            {activeSection === 'rooms' && (
                <>
                    {/* Back Button + Header */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveSection(null)}
                            className="p-2 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ຈັດການຫ້ອງພັກ</h2>
                            <p className="text-gray-500 dark:text-gray-400">ເພີ່ມ, ແກ້ໄຂລາຍລະອຽດ, ຫລື ລົບຫ້ອງ</p>
                        </div>
                    </div>

                    {/* Room Controls */}
                    <div className="flex items-center justify-end gap-3">
                        {/* Floor Filter */}
                        <select
                            value={filterFloor}
                            onChange={(e) => setFilterFloor(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">ທຸກຊັ້ນ</option>
                            {uniqueFloors.map(floor => (
                                <option key={floor} value={floor}>ຊັ້ນ {floor}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            ເພີ່ມຫ້ອງ
                        </button>
                    </div>

                    {/* Floor-Based Admin Cards */}
                    <div className="space-y-8">
                        {Object.entries(
                            rooms
                                .filter(room => filterFloor === 'all' || (room.floor || 1) === Number(filterFloor))
                                .reduce((acc, room) => {
                                    const floor = room.floor || 1
                                    if (!acc[floor]) acc[floor] = []
                                    acc[floor].push(room)
                                    return acc
                                }, {})
                        )
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([floor, floorRooms]) => (
                                <div key={floor} className="space-y-4">
                                    {/* Floor Header */}
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">ຊັ້ນ {floor}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{floorRooms.length} ຫ້ອງ</p>
                                        </div>
                                    </div>

                                    {/* Room Cards Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {floorRooms.map((room) => {
                                            const isFan = room.roomType?.includes('fan')
                                            const isDouble = room.roomType?.includes('double')
                                            const statusLabel = room.status === 'available' ? 'ຫ້ອງວ່າງ' : room.status === 'occupied' ? 'ມີຄົນພັກ' : room.status === 'reserved' ? 'ຈອງແລ້ວ' : 'ກຳລັງທຳຄວາມສະອາດ'

                                            return (
                                                <div
                                                    key={room.id}
                                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                                                >
                                                    {/* Card Content */}
                                                    <div className="p-5">
                                                        {/* Room Number */}
                                                        <div className="text-center mb-4">
                                                            <p className="text-4xl font-extrabold text-gray-800 dark:text-white">{room.number}</p>
                                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(room.status)}`}>
                                                                {statusLabel}
                                                            </span>
                                                        </div>

                                                        {/* Room Details */}
                                                        <div className="space-y-3">
                                                            {/* Type Icons */}
                                                            <div className="flex items-center justify-center gap-3">
                                                                <div className={`p-2 rounded-lg ${isFan ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                                                    {isFan ? (
                                                                        <Fan className="w-5 h-5 text-orange-500" />
                                                                    ) : (
                                                                        <Snowflake className="w-5 h-5 text-blue-500" />
                                                                    )}
                                                                </div>
                                                                <div className={`p-2 rounded-lg ${isDouble ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                                                    {isDouble ? (
                                                                        <BedDouble className={`w-5 h-5 ${isDouble ? 'text-purple-500' : 'text-emerald-500'}`} />
                                                                    ) : (
                                                                        <Bed className="w-5 h-5 text-emerald-500" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Room Type Label */}
                                                            <p className="text-center text-base font-medium text-gray-600 dark:text-gray-400">
                                                                {getRoomTypeLabel(room.roomType)}
                                                            </p>

                                                            {/* Price */}
                                                            <p className="text-center text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                                {new Intl.NumberFormat('lo-LA').format(room.price)} ₭
                                                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ຄືນ</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Action Bar */}
                                                    <div className="flex border-t border-gray-100 dark:border-slate-700">
                                                        <button
                                                            onClick={() => handleEditClick(room)}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-medium text-sm transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                            ແກ້ໄຂ
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(room)}
                                                            disabled={room.status === 'occupied'}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-gray-100 dark:border-slate-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            ລົບ
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                    </div>
                </>
            )}

            {/* ===================== SYSTEM & DATA SECTION ===================== */}
            {activeSection === 'system' && (
                <>
                    {/* Back Button + Header */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveSection(null)}
                            className="p-2 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ລະບົບ & ຂໍ້ມູນ</h2>
                            <p className="text-gray-500 dark:text-gray-400">ຕັ້ງຄ່າລະບົບ ແລະ ລ້າງຂໍ້ມູນ</p>
                        </div>
                    </div>

                    {/* Clear Transaction Data Card */}
                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-6 border-2 border-rose-200 dark:border-rose-800">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-rose-800 dark:text-rose-200">ລ້າງຂໍ້ມູນລູກຄ້າ & ການຈອງ</h3>
                                <p className="text-base text-rose-600 dark:text-rose-400 mt-2">
                                    ລ້າງປະຫວັດລູກຄ້າທັງໝົດ ແລະ ຕັ້ງຄ່າຫ້ອງເປັນ "ຫວ່າງ" ທຸກຫ້ອງ.
                                    <br />
                                    <strong>ໝາຍເຫດ:</strong> ຈະບໍ່ລົບຫ້ອງທີ່ເພີ່ມມາ, ພຽງແຕ່ reset ສະຖານະເທົ່ານັ້ນ.
                                </p>
                                <div className="mt-4 p-4 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
                                    <p className="text-lg text-rose-700 dark:text-rose-300 font-bold">
                                        ⚠️ ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້!
                                    </p>
                                </div>
                                <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                        🔐 ຕ້ອງໃຊ້ລະຫັດຜູ້ດູແລ (Admin PIN) ເທົ່ານັ້ນ - ພະນັກງານບໍ່ສາມາດລ້າງຂໍ້ມູນໄດ້
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setClearDataModal(true)
                                        setClearDataPin('')
                                        setClearDataError('')
                                    }}
                                    className="mt-4 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/25 flex items-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    ລ້າງຂໍ້ມູນລູກຄ້າ & ການຈອງ (Clear All Transaction Data)
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===================== SECURITY SECTION ===================== */}
            {activeSection === 'security' && (
                <>
                    {/* Back Button + Header */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setActiveSection(null); setChangePinType(null); }}
                            className="p-2 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ປ່ຽນລະຫັດຜ່ານ</h2>
                            <p className="text-gray-500 dark:text-gray-400">ເລືອກປະເພດລະຫັດທີ່ຕ້ອງການປ່ຽນ</p>
                        </div>
                    </div>

                    {/* PIN Type Selection */}
                    {!changePinType && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            {/* Admin PIN */}
                            <button
                                onClick={() => { setChangePinType('admin'); setOldPin(''); setNewPin(''); setConfirmPin(''); setChangePinError(''); }}
                                className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Shield className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">ລະຫັດຜູ້ດູແລ (Admin)</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ໃຊ້ສຳລັບລ້າງຂໍ້ມູນ, ຕັ້ງຄ່າພິເສດ</p>
                                    </div>
                                </div>
                            </button>

                            {/* Staff PIN */}
                            <button
                                onClick={() => { setChangePinType('staff'); setOldPin(''); setNewPin(''); setConfirmPin(''); setChangePinError(''); }}
                                className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Key className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">ລະຫັດພະນັກງານ (Staff)</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ໃຊ້ສຳລັບເຂົ້າເຖິງທົ່ວໄປ, ປົດລັອກ</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Change PIN Form */}
                    {changePinType && (
                        <div className="mt-6 max-w-md">
                            <div className={`p-6 rounded-2xl border-2 ${changePinType === 'admin' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${changePinType === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                                        {changePinType === 'admin' ? <Shield className="w-6 h-6 text-white" /> : <Key className="w-6 h-6 text-white" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                            ປ່ຽນລະຫັດ {changePinType === 'admin' ? 'ຜູ້ດູແລ' : 'ພະນັກງານ'}
                                        </h3>
                                        <button onClick={() => setChangePinType(null)} className="text-sm text-gray-500 hover:underline">
                                            ← ກັບຄືນ
                                        </button>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {changePinError && (
                                    <div className="flex items-center gap-2 p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl mb-4 border border-rose-200 dark:border-rose-800">
                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                        <p className="text-sm text-rose-600 dark:text-rose-400">{changePinError}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Old PIN */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ລະຫັດເກົ່າ *</label>
                                        <div className="relative">
                                            <input
                                                type={showOldPin ? 'text' : 'password'}
                                                value={oldPin}
                                                onChange={(e) => { setOldPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 5)); setChangePinError(''); }}
                                                placeholder="•••••"
                                                maxLength={5}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 text-center text-xl tracking-widest font-mono"
                                            />
                                            <button type="button" onClick={() => setShowOldPin(!showOldPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showOldPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New PIN */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ລະຫັດໃໝ່ *</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPin ? 'text' : 'password'}
                                                value={newPin}
                                                onChange={(e) => { setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 5)); setChangePinError(''); }}
                                                placeholder="•••••"
                                                maxLength={5}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 text-center text-xl tracking-widest font-mono"
                                            />
                                            <button type="button" onClick={() => setShowNewPin(!showNewPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm New PIN */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ຢືນຢັນລະຫັດໃໝ່ *</label>
                                        <input
                                            type={showNewPin ? 'text' : 'password'}
                                            value={confirmPin}
                                            onChange={(e) => { setConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 5)); setChangePinError(''); }}
                                            placeholder="•••••"
                                            maxLength={5}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 text-center text-xl tracking-widest font-mono"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={() => {
                                            const currentPin = changePinType === 'admin' ? MASTER_PIN : STAFF_PIN
                                            if (oldPin !== currentPin) {
                                                setChangePinError('ລະຫັດເກົ່າບໍ່ຖືກຕ້ອງ')
                                                return
                                            }
                                            if (newPin.length < 4) {
                                                setChangePinError('ລະຫັດໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 4 ຕົວເລກ')
                                                return
                                            }
                                            if (newPin !== confirmPin) {
                                                setChangePinError('ລະຫັດໃໝ່ບໍ່ກົງກັນ')
                                                return
                                            }
                                            // TODO: Save new PIN to storage
                                            alert(`✅ ປ່ຽນລະຫັດ ${changePinType === 'admin' ? 'ຜູ້ດູແລ' : 'ພະນັກງານ'} ສຳເລັດ!\n\nໝາຍເຫດ: ໃນ version ນີ້ ລະຫັດຈະກັບຄືນເປັນຄ່າເລີ່ມຕົ້ນຫຼັງ restart. ຈະຕ້ອງເກັບໃນ database ໃນ version ຖັດໄປ.`)
                                            setChangePinType(null)
                                            setOldPin('')
                                            setNewPin('')
                                            setConfirmPin('')
                                        }}
                                        disabled={!oldPin || !newPin || !confirmPin}
                                        className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${changePinType === 'admin' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                    >
                                        <Check className="w-5 h-5" />
                                        ບັນທຶກລະຫັດໃໝ່
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Clear Data Admin PIN Modal */}
            {clearDataModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setClearDataModal(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                        <div className="p-6 bg-rose-50 dark:bg-rose-900/30 border-b border-rose-100 dark:border-rose-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-rose-800 dark:text-rose-200">ຢືນຢັນລະຫັດຜູ້ດູແລ</h3>
                                    <p className="text-sm text-rose-600 dark:text-rose-400">ປ້ອນລະຫັດ Admin PIN ເພື່ອລ້າງຂໍ້ມູນ</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    🔐 <strong>ໝາຍເຫດ:</strong> ລະຫັດພະນັກງານ (Staff PIN) ບໍ່ສາມາດໃຊ້ໄດ້
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    ລະຫັດຜູ້ດູແລ (Admin PIN) *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showClearDataPin ? 'text' : 'password'}
                                        value={clearDataPin}
                                        onChange={(e) => {
                                            setClearDataPin(e.target.value)
                                            setClearDataError('')
                                        }}
                                        placeholder="ປ້ອນລະຫັດ 5 ຕົວເລກ"
                                        className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                        maxLength={5}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowClearDataPin(!showClearDataPin)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showClearDataPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {clearDataError && (
                                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {clearDataError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setClearDataModal(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    ຍົກເລີກ
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        // Only MASTER_PIN (Admin) can clear data
                                        if (clearDataPin === MASTER_PIN) {
                                            setClearDataModal(false)
                                            if (window.electronAPI && window.electronAPI.clearData) {
                                                await window.electronAPI.clearData()
                                            } else {
                                                localStorage.clear()
                                                window.location.reload()
                                            }
                                        } else if (clearDataPin === STAFF_PIN) {
                                            setClearDataError('ລະຫັດພະນັກງານບໍ່ມີສິດລ້າງຂໍ້ມູນ! ຕ້ອງໃຊ້ລະຫັດຜູ້ດູແລເທົ່ານັ້ນ')
                                        } else {
                                            setClearDataError('ລະຫັດ PIN ບໍ່ຖືກຕ້ອງ')
                                        }
                                    }}
                                    className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    ຢືນຢັນລ້າງຂໍ້ມູນ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals (shared across all sections) */}
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
