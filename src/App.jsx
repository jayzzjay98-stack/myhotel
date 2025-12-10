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

// Initial room data
const initialRooms = [
  // Floor 1
  { id: 1, number: '101', floor: 1, status: 'available', roomType: 'fan-single', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-single'] },
  { id: 2, number: '102', floor: 1, status: 'occupied', roomType: 'ac-double', guestName: 'John Smith', phone: '020 5555 1234', passport: 'US12345', price: roomTypePrices['ac-double'], checkInDate: getDateString(-2), stayDuration: 5 },
  { id: 3, number: '103', floor: 1, status: 'occupied', roomType: 'ac-single', guestName: 'Emma Wilson', phone: '020 7777 5678', passport: 'UK98765', price: roomTypePrices['ac-single'], checkInDate: getDateString(-1), stayDuration: 3 },
  { id: 4, number: '104', floor: 1, status: 'available', roomType: 'ac-double', guestName: null, phone: '', passport: '', price: roomTypePrices['ac-double'] },
  { id: 5, number: '105', floor: 1, status: 'cleaning', roomType: 'fan-double', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-double'] },
  // Floor 2
  { id: 6, number: '201', floor: 2, status: 'available', roomType: 'fan-single', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-single'] },
  { id: 7, number: '202', floor: 2, status: 'reserved', roomType: 'ac-double', guestName: 'David Lee', phone: '020 9999 1111', passport: 'CN55555', reservationDate: getDateString(1), paymentStatus: 'Paid', price: roomTypePrices['ac-double'] },
  { id: 8, number: '203', floor: 2, status: 'occupied', roomType: 'ac-double', guestName: 'Michael Brown', phone: '020 8888 9999', passport: 'CA55555', price: roomTypePrices['ac-double'], checkInDate: getDateString(-3), stayDuration: 7 },
  { id: 9, number: '204', floor: 2, status: 'available', roomType: 'fan-double', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-double'] },
  { id: 10, number: '205', floor: 2, status: 'occupied', roomType: 'ac-single', guestName: 'Sarah Davis', phone: '020 1234 5678', passport: 'AU11111', price: roomTypePrices['ac-single'], checkInDate: getDateString(-1), stayDuration: 1 },
  // Floor 3
  { id: 11, number: '301', floor: 3, status: 'reserved', roomType: 'ac-double', guestName: 'Anna Kim', phone: '020 2222 3333', passport: 'KR12345', reservationDate: getDateString(2), paymentStatus: 'Unpaid', price: roomTypePrices['ac-double'] },
  { id: 12, number: '302', floor: 3, status: 'available', roomType: 'fan-single', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-single'] },
  { id: 13, number: '303', floor: 3, status: 'cleaning', roomType: 'ac-single', guestName: null, phone: '', passport: '', price: roomTypePrices['ac-single'] },
  { id: 14, number: '304', floor: 3, status: 'occupied', roomType: 'ac-double', guestName: 'Robert Johnson', phone: '020 9999 0000', passport: 'JP77777', price: roomTypePrices['ac-double'], checkInDate: getDateString(-4), stayDuration: 5 },
  { id: 15, number: '305', floor: 3, status: 'available', roomType: 'fan-double', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-double'] },
  // Floor 4
  { id: 16, number: '401', floor: 4, status: 'occupied', roomType: 'ac-double', guestName: 'Lisa Anderson', phone: '020 1111 2222', passport: 'DE88888', price: roomTypePrices['ac-double'], checkInDate: getDateString(-2), stayDuration: 4 },
  { id: 17, number: '402', floor: 4, status: 'available', roomType: 'ac-double', guestName: null, phone: '', passport: '', price: roomTypePrices['ac-double'] },
  { id: 18, number: '403', floor: 4, status: 'reserved', roomType: 'ac-double', guestName: 'James Wilson', phone: '020 4444 5555', passport: 'FR99999', reservationDate: getDateString(3), paymentStatus: 'Paid', price: roomTypePrices['ac-double'] },
  { id: 19, number: '404', floor: 4, status: 'cleaning', roomType: 'fan-double', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-double'] },
  { id: 20, number: '405', floor: 4, status: 'available', roomType: 'fan-single', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-single'] },
]

// Guest history mock data (current + past guests)
const initialGuestHistory = [
  // Current guests (staying)
  { id: 1, guestName: 'John Smith', roomNumber: '102', roomType: 'ac-double', phone: '020 5555 1234', passport: 'US12345', checkInDate: getDateString(-2), checkOutDate: null, stayDuration: 5, totalPrice: 1750000, status: 'staying' },
  { id: 2, guestName: 'Emma Wilson', roomNumber: '103', roomType: 'ac-single', phone: '020 7777 5678', passport: 'UK98765', checkInDate: getDateString(-1), checkOutDate: null, stayDuration: 3, totalPrice: 750000, status: 'staying' },
  { id: 3, guestName: 'Michael Brown', roomNumber: '203', roomType: 'ac-double', phone: '020 8888 9999', passport: 'CA55555', checkInDate: getDateString(-3), checkOutDate: null, stayDuration: 7, totalPrice: 2450000, status: 'staying' },
  { id: 4, guestName: 'Sarah Davis', roomNumber: '205', roomType: 'ac-single', phone: '020 1234 5678', passport: 'AU11111', checkInDate: getDateString(-1), checkOutDate: null, stayDuration: 2, totalPrice: 500000, status: 'staying' },
  { id: 5, guestName: 'Robert Johnson', roomNumber: '304', roomType: 'ac-double', phone: '020 9999 0000', passport: 'JP77777', checkInDate: getDateString(-4), checkOutDate: null, stayDuration: 5, totalPrice: 1750000, status: 'staying' },
  { id: 6, guestName: 'Lisa Anderson', roomNumber: '401', roomType: 'ac-double', phone: '020 1111 2222', passport: 'DE88888', checkInDate: getDateString(-2), checkOutDate: null, stayDuration: 4, totalPrice: 1400000, status: 'staying' },

  // Past guests (checked-out)
  { id: 7, guestName: 'Thomas White', roomNumber: '101', roomType: 'fan-single', phone: '020 3333 4444', passport: 'US99999', checkInDate: getDateString(-10), checkOutDate: getDateString(-7), stayDuration: 3, totalPrice: 450000, status: 'checked-out' },
  { id: 8, guestName: 'Jennifer Chen', roomNumber: '202', roomType: 'ac-double', phone: '020 6666 7777', passport: 'TW12345', checkInDate: getDateString(-15), checkOutDate: getDateString(-12), stayDuration: 3, totalPrice: 1050000, status: 'checked-out' },
  { id: 9, guestName: null, roomNumber: '104', roomType: 'ac-double', phone: '020 8888 1111', passport: '', checkInDate: getDateString(-8), checkOutDate: getDateString(-6), stayDuration: 2, totalPrice: 700000, status: 'checked-out' },
  { id: 10, guestName: 'Alex Martinez', roomNumber: '301', roomType: 'ac-double', phone: '020 2222 5555', passport: 'ES77777', checkInDate: getDateString(-12), checkOutDate: getDateString(-9), stayDuration: 3, totalPrice: 1050000, status: 'checked-out' },
  { id: 11, guestName: 'Maria Garcia', roomNumber: '402', roomType: 'ac-double', phone: '020 5555 8888', passport: 'MX33333', checkInDate: getDateString(-20), checkOutDate: getDateString(-17), stayDuration: 3, totalPrice: 1050000, status: 'checked-out' },
  { id: 12, guestName: '', roomNumber: '201', roomType: 'fan-single', phone: '', passport: '', checkInDate: getDateString(-14), checkOutDate: getDateString(-13), stayDuration: 1, totalPrice: 150000, status: 'checked-out' },
  { id: 13, guestName: 'Kevin Lee', roomNumber: '303', roomType: 'ac-single', phone: '020 9999 2222', passport: 'KR88888', checkInDate: getDateString(-7), checkOutDate: getDateString(-5), stayDuration: 2, totalPrice: 500000, status: 'checked-out' },
  { id: 14, guestName: 'Sophie Brown', roomNumber: '405', roomType: 'fan-single', phone: '020 1111 3333', passport: 'UK55555', checkInDate: getDateString(-18), checkOutDate: getDateString(-15), stayDuration: 3, totalPrice: 450000, status: 'checked-out' },
  { id: 15, guestName: 'James Taylor', roomNumber: '204', roomType: 'fan-double', phone: '020 4444 6666', passport: 'US22222', checkInDate: getDateString(-25), checkOutDate: getDateString(-22), stayDuration: 3, totalPrice: 600000, status: 'checked-out' },
  { id: 16, guestName: null, roomNumber: '302', roomType: 'fan-single', phone: '020 7777 9999', passport: 'TH11111', checkInDate: getDateString(-30), checkOutDate: getDateString(-28), stayDuration: 2, totalPrice: 300000, status: 'checked-out' },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [rooms, setRooms] = useState(initialRooms)
  const [guestHistory, setGuestHistory] = useState(initialGuestHistory)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [defaultFilter, setDefaultFilter] = useState('all')
  const [amenityFilter, setAmenityFilter] = useState({ type: 'all', value: 'all' })

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleRoomClick = (room) => {
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  // Check-in: Available -> Occupied
  const handleCheckIn = (roomId, guestData) => {
    const room = rooms.find(r => r.id === roomId)
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
            checkInDate: getDateString(0),
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
      checkInDate: getDateString(0),
      checkOutDate: null,
      stayDuration: guestData.stayDuration || 1,
      totalPrice: guestData.price * (guestData.stayDuration || 1),
      status: 'staying'
    }, ...prev])
    closeModal()
  }

  // Check-out: Occupied -> Cleaning
  const handleCheckOut = (roomId) => {
    const room = rooms.find(r => r.id === roomId)
    // Update guest history
    setGuestHistory(prev => prev.map(g =>
      g.roomNumber === room.number && g.status === 'staying'
        ? { ...g, status: 'checked-out', checkOutDate: getDateString(0) }
        : g
    ))
    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === roomId
          ? { ...r, status: 'cleaning', guestName: null, phone: '', passport: '', checkInDate: null, stayDuration: null }
          : r
      )
    )
    closeModal()
  }

  // Mark Cleaned: Cleaning -> Available
  const handleMarkCleaned = (roomId) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId ? { ...room, status: 'available' } : room
      )
    )
    closeModal()
  }

  // Confirm Reservation: Reserved -> Occupied
  const handleConfirmReservation = (roomId) => {
    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === roomId
          ? { ...r, status: 'occupied', checkInDate: getDateString(0), stayDuration: 1, reservationDate: null, paymentStatus: null }
          : r
      )
    )
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
  }

  // Delete room (from Settings)
  const handleDeleteRoom = (roomId) => {
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId))
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRoom(null)
  }

  const handleStatsClick = (statusKey) => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} toggleTheme={toggleTheme} checkoutCount={checkoutCount} />

      <main className="ml-64 p-8">
        {activeTab === 'dashboard' && (
          <>
            <Header isDarkMode={isDarkMode} checkoutCount={checkoutCount} onNotificationClick={() => setActiveTab('checkout')} />
            <StatsCards counts={counts} isDarkMode={isDarkMode} onStatsClick={handleStatsClick} />
            <QuickBooking rooms={rooms} onQuickBook={handleQuickBook} />
          </>
        )}

        {activeTab === 'rooms' && (
          <RoomsView
            rooms={rooms}
            isDarkMode={isDarkMode}
            onRoomClick={handleRoomClick}
            defaultFilter={defaultFilter}
            setDefaultFilter={setDefaultFilter}
            amenityFilter={amenityFilter}
            clearAmenityFilter={clearAmenityFilter}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutView rooms={rooms} onRoomClick={handleRoomClick} />
        )}

        {activeTab === 'guests' && (
          <GuestListView guestHistory={guestHistory} />
        )}

        {activeTab === 'reports' && (
          <ReportsView rooms={rooms} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            rooms={rooms}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
          />
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
          isDarkMode={isDarkMode}
          roomTypePrices={roomTypePrices}
        />
      )}
    </div>
  )
}

export default App
