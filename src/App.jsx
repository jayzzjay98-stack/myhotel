import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import QuickBooking from './components/QuickBooking'
import RoomsView from './components/RoomsView'
import RoomActionModal from './components/RoomActionModal'
import SettingsView from './components/SettingsView'
import GuestListView from './components/GuestListView'
import ReportsView from './components/ReportsView'
import CheckoutView from './components/CheckoutView'
import VoidListView from './components/VoidListView'
import ActivationScreen from './components/ActivationScreen'
import { ToastContainer } from './components/Toast'

// Room Type Pricing (LAK)
const roomTypePrices = {
  'fan-single': 150000,
  'fan-double': 200000,
  'ac-single': 250000,
  'ac-double': 350000,
}

// Helper to calculate dates
const getDateString = (daysOffset = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

// Initial room data (clean state - all rooms available)
const initialRooms = [
  // Floor 1
  { id: 1, number: '101', floor: 1, status: 'available', roomType: 'fan-single', price: roomTypePrices['fan-single'] },
  { id: 2, number: '102', floor: 1, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 3, number: '103', floor: 1, status: 'available', roomType: 'ac-single', price: roomTypePrices['ac-single'] },
  { id: 4, number: '104', floor: 1, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 5, number: '105', floor: 1, status: 'available', roomType: 'fan-double', price: roomTypePrices['fan-double'] },
  // Floor 2
  { id: 6, number: '201', floor: 2, status: 'available', roomType: 'fan-single', price: roomTypePrices['fan-single'] },
  { id: 7, number: '202', floor: 2, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 8, number: '203', floor: 2, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 9, number: '204', floor: 2, status: 'available', roomType: 'fan-double', price: roomTypePrices['fan-double'] },
  { id: 10, number: '205', floor: 2, status: 'available', roomType: 'ac-single', price: roomTypePrices['ac-single'] },
  // Floor 3
  { id: 11, number: '301', floor: 3, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 12, number: '302', floor: 3, status: 'available', roomType: 'fan-single', price: roomTypePrices['fan-single'] },
  { id: 13, number: '303', floor: 3, status: 'available', roomType: 'ac-single', price: roomTypePrices['ac-single'] },
  { id: 14, number: '304', floor: 3, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 15, number: '305', floor: 3, status: 'available', roomType: 'fan-double', price: roomTypePrices['fan-double'] },
  // Floor 4
  { id: 16, number: '401', floor: 4, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 17, number: '402', floor: 4, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 18, number: '403', floor: 4, status: 'available', roomType: 'ac-double', price: roomTypePrices['ac-double'] },
  { id: 19, number: '404', floor: 4, status: 'available', roomType: 'fan-double', price: roomTypePrices['fan-double'] },
  { id: 20, number: '405', floor: 4, status: 'available', roomType: 'fan-single', price: roomTypePrices['fan-single'] },
]

// Guest history (empty - clean state)
const initialGuestHistory = []

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [rooms, setRooms] = useState(initialRooms)
  const [guestHistory, setGuestHistory] = useState(initialGuestHistory)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [defaultFilter, setDefaultFilter] = useState('all')
  const [amenityFilter, setAmenityFilter] = useState({ type: 'all', value: 'all' })

  // Electron License State
  const [isActivated, setIsActivated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isElectron = typeof window !== 'undefined' && window.electronAPI

  // Toast Notification State
  const [toasts, setToasts] = useState([])

  // Check license and load data on startup
  useEffect(() => {
    const initialize = async () => {
      if (!isElectron) {
        // Running in browser - skip license check
        setIsActivated(true)
        setIsLoading(false)
        return
      }

      try {
        // Check if license is valid
        const licenseResult = await window.electronAPI.checkLicense()

        if (licenseResult.valid) {
          setIsActivated(true)

          // Load saved data
          const savedData = await window.electronAPI.loadData()
          if (savedData.rooms && savedData.rooms.length > 0) {
            setRooms(savedData.rooms)
          }
          if (savedData.guestHistory && savedData.guestHistory.length > 0) {
            setGuestHistory(savedData.guestHistory)
          }
        } else {
          setIsActivated(false)
        }
      } catch (error) {
        console.error('Initialization failed:', error)
        setIsActivated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  // Save data to Electron store whenever rooms change
  useEffect(() => {
    if (!isElectron || !isActivated || isLoading) return
    window.electronAPI.saveData({ rooms, guestHistory })
  }, [rooms, isActivated, isLoading])

  // Save data to Electron store whenever guestHistory changes
  useEffect(() => {
    if (!isElectron || !isActivated || isLoading) return
    window.electronAPI.saveData({ rooms, guestHistory })
  }, [guestHistory, isActivated, isLoading])

  // Add toast notification
  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  // Remove toast manually
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Sync selectedRoom with rooms state so modal updates when room data changes
  useEffect(() => {
    if (selectedRoom && isModalOpen) {
      const updatedRoom = rooms.find(r => r.id === selectedRoom.id)
      if (updatedRoom && (
        updatedRoom.stayDuration !== selectedRoom.stayDuration ||
        updatedRoom.status !== selectedRoom.status ||
        updatedRoom.guestName !== selectedRoom.guestName
      )) {
        setSelectedRoom(updatedRoom)
      }
    }
  }, [rooms, selectedRoom, isModalOpen])

  const handleRoomClick = (room) => {
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  // Check-in: Available -> Occupied
  // Uses "Business Day Cutoff" logic (06:00 AM)
  // - If Current Hour < 6 (00:00 - 05:59): "Late Night Arrival" - checkInDate = Yesterday
  // - If Current Hour >= 6 (06:00 onwards): "New Day Arrival" - checkInDate = Today
  const handleCheckIn = (roomId, guestData) => {
    const room = rooms.find(r => r.id === roomId)

    // Business Day Cutoff Logic
    const now = new Date()
    const currentHour = now.getHours()
    const BUSINESS_DAY_CUTOFF = 6 // 06:00 AM

    // Calculate business check-in date
    let checkInDate = new Date()
    if (currentHour < BUSINESS_DAY_CUTOFF) {
      // Late Night Arrival (00:00 - 05:59) -> Consider as previous night
      checkInDate.setDate(checkInDate.getDate() - 1)
    }
    // Else: New Day Arrival (06:00+) -> Use today's date (no change needed)

    const checkInDateString = checkInDate.toISOString().split('T')[0]

    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === roomId
          ? {
            ...r,
            status: 'occupied',
            guestName: guestData.guestName,
            phone: guestData.phone,
            passport: guestData.passport,
            price: guestData.price,
            checkInDate: checkInDateString,
            checkInTime: now.toISOString(),
            stayDuration: guestData.stayDuration || 1
          }
          : r
      )
    )
    // Add to guest history
    setGuestHistory(prev => [{
      id: Date.now(),
      guestName: guestData.guestName,
      roomNumber: room.number,
      roomType: room.roomType,
      phone: guestData.phone,
      passport: guestData.passport,
      checkInDate: checkInDateString,
      checkInTime: now.toISOString(),
      checkOutDate: null,
      checkOutTime: null,
      stayDuration: guestData.stayDuration || 1,
      totalPrice: guestData.price * (guestData.stayDuration || 1),
      status: 'staying'
    }, ...prev])
    addToast('ເຊັກອິນສຳເລັດ! ຍິນດີຕ້ອນຮັບ ' + guestData.guestName, 'success')
    closeModal()
  }

  // Check-out: Occupied -> Cleaning
  const handleCheckOut = (roomId) => {
    const room = rooms.find(r => r.id === roomId)
    // Update guest history with checkout time
    setGuestHistory(prev => prev.map(g =>
      g.roomNumber === room.number && g.status === 'staying'
        ? { ...g, status: 'checked-out', checkOutDate: getDateString(0), checkOutTime: new Date().toISOString() }
        : g
    ))
    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === roomId
          ? { ...r, status: 'cleaning', guestName: null, phone: '', passport: '', checkInDate: null, stayDuration: null }
          : r
      )
    )
    addToast('ເຊັກເອົ້າສຳເລັດ! ຂອບໃຈທີ່ໃຊ້ບໍລິການ', 'success')
    closeModal()
  }

  // Mark Cleaned: Cleaning -> Available
  const handleMarkCleaned = (roomId) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId ? { ...room, status: 'available' } : room
      )
    )
    addToast('ທຳຄວາມສະອາດສຳເລັດ! ຫ້ອງພ້ອມໃຊ້ງານ', 'success')
    closeModal()
  }

  // Bulk Clean: Mark multiple rooms as Available
  const handleBulkClean = (roomIds) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        roomIds.includes(room.id) ? { ...room, status: 'available' } : room
      )
    )
    addToast(`ທຳຄວາມສະອາດ ${roomIds.length} ຫ້ອງສຳເລັດ!`, 'success')
  }

  // Extend Stay: Add days to current stay
  // Price: NewTotal = OldTotal + (RoomPrice * daysToAdd)
  const handleExtendStay = (roomId, daysToAdd) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return

    const newDuration = (room.stayDuration || 1) + daysToAdd
    const additionalCost = room.price * daysToAdd

    // Update room duration
    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === roomId
          ? { ...r, stayDuration: newDuration }
          : r
      )
    )

    // Update guest history - add cost for extra nights
    setGuestHistory(prev => prev.map(g =>
      g.roomNumber === room.number && g.status === 'staying'
        ? {
          ...g,
          stayDuration: newDuration,
          totalPrice: g.totalPrice + additionalCost // OldTotal + (RoomPrice * daysToAdd)
        }
        : g
    ))
    addToast(`ເພີ່ມໄລຍະເວລາສຳເລັດ! ຕອນນີ້ ${newDuration} ຄືນ`, 'success')
  }

  // Move Room: Transfer guest from one room to another
  // Price Adjustment: NewTotal = OldTotal + ((NewPrice - OldPrice) * RemainingDays)
  const handleMoveRoom = (oldRoomId, newRoomId) => {
    const oldRoom = rooms.find(r => r.id === oldRoomId)
    const newRoom = rooms.find(r => r.id === newRoomId)

    if (!oldRoom || !newRoom || newRoom.status !== 'available') return

    // Calculate remaining days: assume they're staying the rest of their booking
    const remainingDays = oldRoom.stayDuration || 1
    const priceDiff = newRoom.price - oldRoom.price
    const extraCharge = priceDiff * remainingDays

    // Update rooms
    setRooms(prevRooms =>
      prevRooms.map(r => {
        if (r.id === newRoomId) {
          // Move guest to new room with NEW room's price
          return {
            ...r,
            status: 'occupied',
            guestName: oldRoom.guestName,
            phone: oldRoom.phone,
            passport: oldRoom.passport,
            checkInDate: oldRoom.checkInDate,
            checkInTime: oldRoom.checkInTime,
            stayDuration: oldRoom.stayDuration,
            price: newRoom.price // Use new room's price
          }
        }
        if (r.id === oldRoomId) {
          // Mark old room for cleaning
          return {
            ...r,
            status: 'cleaning',
            guestName: null,
            phone: '',
            passport: '',
            checkInDate: null,
            checkInTime: null,
            stayDuration: null
          }
        }
        return r
      })
    )

    // Update guest history with new room info and adjusted price
    setGuestHistory(prev => prev.map(g =>
      g.roomNumber === oldRoom.number && g.status === 'staying'
        ? {
          ...g,
          roomNumber: newRoom.number,
          roomType: newRoom.roomType,
          totalPrice: g.totalPrice + extraCharge // OldTotal + PriceDiff * RemainingDays
        }
        : g
    ))

    addToast(`ຍ້າຍຫ້ອງສຳເລັດ! ຈາກ #${oldRoom.number} → #${newRoom.number}`, 'success')
    closeModal()
  }

  // Reserve Room: Available -> Reserved
  const handleReserveRoom = (roomId, reservationData) => {
    const room = rooms.find(r => r.id === roomId)
    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === roomId
          ? {
            ...r,
            status: 'reserved',
            guestName: reservationData.guestName,
            phone: reservationData.phone,
            reservationDate: reservationData.reservationDate,
            paymentStatus: reservationData.paymentStatus
          }
          : r
      )
    )
    addToast(`ຈອງຫ້ອງສຳເລັດ! ${reservationData.guestName}`, 'success')
    closeModal()
  }

  // Confirm Reservation: Reserved -> Occupied (Early Check-in Support)
  const handleConfirmReservation = (roomId, markAsPaid = false) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return

    // Business Day Cutoff Logic (same as handleCheckIn)
    const now = new Date()
    const hour = now.getHours()
    let checkInDate
    if (hour < 6) {
      // Before 6 AM = yesterday's business day
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      checkInDate = yesterday.toISOString().split('T')[0]
    } else {
      checkInDate = now.toISOString().split('T')[0]
    }

    // Preserve stayDuration from reservation (default to 1 if not set)
    const stayDuration = room.stayDuration || 1
    const totalPrice = (room.price || 0) * stayDuration

    // Determine final payment status
    const finalPaymentStatus = markAsPaid ? 'Paid' : room.paymentStatus

    // Update room state - PRESERVE stayDuration, optionally update paymentStatus
    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === roomId
          ? {
            ...r,
            status: 'occupied',
            checkInDate: checkInDate,
            stayDuration: stayDuration, // PRESERVE
            paymentStatus: finalPaymentStatus, // UPDATE if marked as paid
            reservationDate: null // Clear since now staying
          }
          : r
      )
    )

    // Add to guest history
    const guestRecord = {
      id: Date.now(),
      guestName: room.guestName,
      roomNumber: room.number,
      roomType: room.roomType,
      phone: room.phone,
      passport: room.passport,
      checkInDate: checkInDate,
      checkInTime: new Date().toISOString(),
      checkOutDate: null,
      checkOutTime: null,
      stayDuration: stayDuration,
      totalPrice: totalPrice,
      status: 'staying',
      paymentStatus: finalPaymentStatus
    }
    setGuestHistory(prev => [guestRecord, ...prev])

    // Show appropriate toast message
    if (markAsPaid && room.paymentStatus === 'Unpaid') {
      addToast('ເຊັກອິນສຳເລັດ ແລະ ຮັບຊຳລະເງິນແລ້ວ!', 'success')
    } else {
      addToast('ເຊັກອິນຈາກການຈອງສຳເລັດ!', 'success')
    }
    closeModal()
  }

  // Add new room (from Settings)
  const handleAddRoom = (roomData) => {
    const newRoom = {
      id: Date.now(),
      number: roomData.number,
      floor: roomData.floor,
      status: 'available',
      roomType: roomData.roomType,
      guestName: null,
      phone: '',
      passport: '',
      price: roomData.price
    }
    setRooms(prevRooms => [...prevRooms, newRoom].sort((a, b) => a.number.localeCompare(b.number)))
    addToast('ເພີ່ມຫ້ອງໃໝ່ສຳເລັດ!', 'success')
  }

  // Edit room (from Settings)
  const handleEditRoom = (roomId, updates) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? { ...room, number: updates.number, floor: updates.floor, roomType: updates.roomType, price: updates.price }
          : room
      )
    )
    addToast('ແກ້ໄຂຂໍ້ມູນຫ້ອງສຳເລັດ!', 'success')
  }

  // Delete room (from Settings)
  const handleDeleteRoom = (roomId) => {
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId))
    addToast('ລົບຫ້ອງສຳເລັດ!', 'success')
  }

  // Void Transaction - mark guest as void and reset room status
  const handleVoidTransaction = (guestId, reason, voidBy = 'ຜູ້ດູແລ') => {
    // Find the guest
    const guest = guestHistory.find(g => g.id === guestId)
    if (!guest) return

    // Update guest status to void with timestamp and authorizer
    setGuestHistory(prev => prev.map(g =>
      g.id === guestId
        ? {
          ...g,
          status: 'void',
          voidReason: reason,
          voidBy: voidBy,
          voidDate: new Date().toISOString().split('T')[0]
        }
        : g
    ))

    // If guest was staying, reset room to cleaning
    if (guest.status === 'staying') {
      const room = rooms.find(r => r.number === guest.roomNumber)
      if (room) {
        setRooms(prevRooms => prevRooms.map(r =>
          r.number === guest.roomNumber
            ? { ...r, status: 'cleaning', guestName: null, phone: '', passport: '', checkInDate: null, stayDuration: null }
            : r
        ))
      }
    }
    addToast('ຍົກເລີກລາຍການສຳເລັດ (Void)!', 'success')
  }

  // Cancel Reservation - reset room and add void record
  const handleCancelReservation = (roomId, reason, voidBy = 'ຜູ້ດູແລ') => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return

    // Add void record to guestHistory
    const voidRecord = {
      id: Date.now(),
      roomNumber: room.number,
      guestName: room.guestName,
      phone: room.phone,
      passport: room.passport,
      totalPrice: room.price || 0,
      status: 'void',
      voidReason: reason,
      voidBy: voidBy,
      voidDate: new Date().toISOString().split('T')[0],
      checkInDate: room.reservationDate || new Date().toISOString().split('T')[0]
    }
    setGuestHistory(prev => [voidRecord, ...prev])

    // Reset room to available
    setRooms(prevRooms => prevRooms.map(r =>
      r.id === roomId
        ? { ...r, status: 'available', guestName: null, phone: '', passport: '', reservationDate: null, paymentStatus: null }
        : r
    ))
    addToast('ຍົກເລີກການຈອງສຳເລັດ!', 'success')
    closeModal()
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRoom(null)
  }

  const handleStatsClick = (statusKey) => {
    if (statusKey === 'void') {
      setActiveTab('voids')
      return
    }
    setDefaultFilter(statusKey)
    setAmenityFilter({ type: 'all', value: 'all' })
    setActiveTab('rooms')
  }

  const handleQuickBook = (filterType, filterValue) => {
    setDefaultFilter('available')
    setAmenityFilter({ type: filterType, value: filterValue })
    setActiveTab('rooms')
  }

  const clearAmenityFilter = () => {
    setAmenityFilter({ type: 'all', value: 'all' })
  }

  const counts = {
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    reserved: rooms.filter((r) => r.status === 'reserved').length,
    cleaning: rooms.filter((r) => r.status === 'cleaning').length,
    void: guestHistory.filter((g) => g.status === 'void').length,
  }

  // Calculate rooms due for checkout today
  const getCheckoutCount = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return rooms.filter(room => {
      if (room.status !== 'occupied' || !room.checkInDate || !room.stayDuration) {
        return false
      }
      const checkIn = new Date(room.checkInDate)
      checkIn.setHours(0, 0, 0, 0)
      const checkoutDate = new Date(checkIn)
      checkoutDate.setDate(checkoutDate.getDate() + room.stayDuration)
      return checkoutDate.getTime() === today.getTime()
    }).length
  }

  const checkoutCount = getCheckoutCount()

  // Show loading while checking license
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">ກຳລັງໂຫລດ...</p>
        </div>
      </div>
    )
  }

  // Show activation screen if not activated
  if (!isActivated && isElectron) {
    return (
      <ActivationScreen
        onActivationSuccess={() => setIsActivated(true)}
      />
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        checkoutCount={checkoutCount}
      />

      <main className="ml-64 p-8">
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        {activeTab === 'dashboard' && (
          <>
            <StatsCards counts={counts} isDarkMode={isDarkMode} onStatsClick={handleStatsClick} />
            <QuickBooking rooms={rooms} onQuickBook={handleQuickBook} />
          </>
        )}

        {activeTab === 'rooms' && (
          <RoomsView
            rooms={rooms}
            isDarkMode={isDarkMode}
            onRoomClick={handleRoomClick}
            onBulkClean={handleBulkClean}
            defaultFilter={defaultFilter}
            setDefaultFilter={setDefaultFilter}
            amenityFilter={amenityFilter}
            clearAmenityFilter={clearAmenityFilter}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutView
            rooms={rooms}
            onRoomClick={handleRoomClick}
          />
        )}

        {activeTab === 'guests' && (
          <GuestListView
            guestHistory={guestHistory}
            setGuestHistory={setGuestHistory}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            rooms={rooms}
            guestHistory={guestHistory}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            rooms={rooms}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        )}

        {activeTab === 'voids' && (
          <VoidListView guestHistory={guestHistory} />
        )}
      </main>

      {isModalOpen && selectedRoom && (
        <RoomActionModal
          room={selectedRoom}
          onClose={closeModal}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onMarkCleaned={handleMarkCleaned}
          onConfirmReservation={handleConfirmReservation}
          onCancelReservation={handleCancelReservation}
          onReserveRoom={handleReserveRoom}
          onExtendStay={handleExtendStay}
          onMoveRoom={handleMoveRoom}
          availableRooms={rooms.filter(r => r.status === 'available')}
          isDarkMode={isDarkMode}
          roomTypePrices={roomTypePrices}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default App
