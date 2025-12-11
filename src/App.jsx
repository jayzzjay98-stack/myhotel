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

// Initial room data
const initialRooms = [
  // Floor 1
  { id: 1, number: '101', floor: 1, status: 'available', roomType: 'fan-single', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-single'] },
  { id: 2, number: '102', floor: 1, status: 'occupied', roomType: 'ac-double', guestName: 'ສົມຊາຍ ໃຈດີ', phone: '020 5555 1234', passport: 'LA12345', price: roomTypePrices['ac-double'], checkInDate: getDateString(-2), stayDuration: 5 },
  { id: 3, number: '103', floor: 1, status: 'occupied', roomType: 'ac-single', guestName: 'ສຸພາພອນ ສະບາຍດີ', phone: '020 7777 5678', passport: 'LA98765', price: roomTypePrices['ac-single'], checkInDate: getDateString(-1), stayDuration: 3 },
  { id: 4, number: '104', floor: 1, status: 'available', roomType: 'ac-double', guestName: null, phone: '', passport: '', price: roomTypePrices['ac-double'] },
  { id: 5, number: '105', floor: 1, status: 'cleaning', roomType: 'fan-double', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-double'] },
  // Floor 2
  { id: 6, number: '201', floor: 2, status: 'available', roomType: 'fan-single', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-single'] },
  { id: 7, number: '202', floor: 2, status: 'reserved', roomType: 'ac-double', guestName: 'ພັນທອງ ສີວົງ', phone: '020 9999 1111', passport: 'LA55555', reservationDate: getDateString(1), paymentStatus: 'Paid', price: roomTypePrices['ac-double'] },
  { id: 8, number: '203', floor: 2, status: 'occupied', roomType: 'ac-double', guestName: 'ວິໄຊ ມົງຄຸນ', phone: '020 8888 9999', passport: 'LA55555', price: roomTypePrices['ac-double'], checkInDate: getDateString(-3), stayDuration: 7 },
  { id: 9, number: '204', floor: 2, status: 'available', roomType: 'fan-double', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-double'] },
  { id: 10, number: '205', floor: 2, status: 'occupied', roomType: 'ac-single', guestName: 'ນະພາ ຮຸ່ງເຮືອງ', phone: '020 1234 5678', passport: 'LA11111', price: roomTypePrices['ac-single'], checkInDate: getDateString(-1), stayDuration: 2 },
  // Floor 3
  { id: 11, number: '301', floor: 3, status: 'reserved', roomType: 'ac-double', guestName: 'ອານຸພາ ສີສະຫວັດ', phone: '020 2222 3333', passport: 'LA12345', reservationDate: getDateString(2), paymentStatus: 'Unpaid', price: roomTypePrices['ac-double'] },
  { id: 12, number: '302', floor: 3, status: 'available', roomType: 'fan-single', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-single'] },
  { id: 13, number: '303', floor: 3, status: 'cleaning', roomType: 'ac-single', guestName: null, phone: '', passport: '', price: roomTypePrices['ac-single'] },
  { id: 14, number: '304', floor: 3, status: 'occupied', roomType: 'ac-double', guestName: 'ບຸນມາ ສຸກໃຈ', phone: '020 9999 0000', passport: 'LA77777', price: roomTypePrices['ac-double'], checkInDate: getDateString(-4), stayDuration: 5 },
  { id: 15, number: '305', floor: 3, status: 'available', roomType: 'fan-double', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-double'] },
  // Floor 4
  { id: 16, number: '401', floor: 4, status: 'occupied', roomType: 'ac-double', guestName: 'ມາລີ ດອກໄມ້', phone: '020 1111 2222', passport: 'LA88888', price: roomTypePrices['ac-double'], checkInDate: getDateString(-2), stayDuration: 4 },
  { id: 17, number: '402', floor: 4, status: 'available', roomType: 'ac-double', guestName: null, phone: '', passport: '', price: roomTypePrices['ac-double'] },
  { id: 18, number: '403', floor: 4, status: 'reserved', roomType: 'ac-double', guestName: 'ສົມພອນ ອິນທະວົງ', phone: '020 4444 5555', passport: 'LA99999', reservationDate: getDateString(3), paymentStatus: 'Paid', price: roomTypePrices['ac-double'] },
  { id: 19, number: '404', floor: 4, status: 'cleaning', roomType: 'fan-double', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-double'] },
  { id: 20, number: '405', floor: 4, status: 'available', roomType: 'fan-single', guestName: null, phone: '', passport: '', price: roomTypePrices['fan-single'] },
]

// Guest history mock data (current + past guests)
const initialGuestHistory = [
  // Current guests (staying) - ມີ checkInTime
  { id: 1, guestName: 'ສົມຊາຍ ໃຈດີ', roomNumber: '102', roomType: 'ac-double', phone: '020 5555 1234', passport: 'LA12345', checkInDate: getDateString(-2), checkInTime: '2024-12-09T14:30:00', checkOutDate: null, checkOutTime: null, stayDuration: 5, totalPrice: 1750000, status: 'staying' },
  { id: 2, guestName: 'ສຸພາພອນ ສະບາຍດີ', roomNumber: '103', roomType: 'ac-single', phone: '020 7777 5678', passport: 'LA98765', checkInDate: getDateString(-1), checkInTime: '2024-12-10T11:15:00', checkOutDate: null, checkOutTime: null, stayDuration: 3, totalPrice: 750000, status: 'staying' },
  { id: 3, guestName: 'ວິໄຊ ມົງຄຸນ', roomNumber: '203', roomType: 'ac-double', phone: '020 8888 9999', passport: 'LA55555', checkInDate: getDateString(-3), checkInTime: '2024-12-08T16:45:00', checkOutDate: null, checkOutTime: null, stayDuration: 7, totalPrice: 2450000, status: 'staying' },
  { id: 4, guestName: 'ນະພາ ຮຸ່ງເຮືອງ', roomNumber: '205', roomType: 'ac-single', phone: '020 1234 5678', passport: 'LA11111', checkInDate: getDateString(-1), checkInTime: '2024-12-10T09:00:00', checkOutDate: null, checkOutTime: null, stayDuration: 2, totalPrice: 500000, status: 'staying' },
  { id: 5, guestName: 'ບຸນມາ ສຸກໃຈ', roomNumber: '304', roomType: 'ac-double', phone: '020 9999 0000', passport: 'LA77777', checkInDate: getDateString(-4), checkInTime: '2024-12-07T20:30:00', checkOutDate: null, checkOutTime: null, stayDuration: 5, totalPrice: 1750000, status: 'staying' },
  { id: 6, guestName: 'ມາລີ ດອກໄມ້', roomNumber: '401', roomType: 'ac-double', phone: '020 1111 2222', passport: 'LA88888', checkInDate: getDateString(-2), checkInTime: '2024-12-09T18:00:00', checkOutDate: null, checkOutTime: null, stayDuration: 4, totalPrice: 1400000, status: 'staying' },

  // Past guests (checked-out) - ມີ checkInTime ແລະ checkOutTime
  { id: 7, guestName: 'ອະລຸນ ແຈ່ມໃສ', roomNumber: '101', roomType: 'fan-single', phone: '020 3333 4444', passport: 'LA99999', checkInDate: getDateString(-10), checkInTime: '2024-12-01T10:00:00', checkOutDate: getDateString(-7), checkOutTime: '2024-12-04T12:00:00', stayDuration: 3, totalPrice: 450000, status: 'checked-out' },
  { id: 8, guestName: 'ພິມໃຈ ຫວານ', roomNumber: '202', roomType: 'ac-double', phone: '020 6666 7777', passport: 'LA12345', checkInDate: getDateString(-15), checkInTime: '2024-11-26T15:30:00', checkOutDate: getDateString(-12), checkOutTime: '2024-11-29T11:00:00', stayDuration: 3, totalPrice: 1050000, status: 'checked-out' },
  { id: 9, guestName: 'ຊານໄຊ ເກັ່ງ', roomNumber: '104', roomType: 'ac-double', phone: '020 8888 1111', passport: 'LA22222', checkInDate: getDateString(-8), checkInTime: '2024-12-03T13:00:00', checkOutDate: getDateString(-6), checkOutTime: '2024-12-05T10:30:00', stayDuration: 2, totalPrice: 700000, status: 'checked-out' },
  { id: 10, guestName: 'ກິດຕິ ມະຫາຊົນ', roomNumber: '301', roomType: 'ac-double', phone: '020 2222 5555', passport: 'LA77777', checkInDate: getDateString(-12), checkInTime: '2024-11-29T17:00:00', checkOutDate: getDateString(-9), checkOutTime: '2024-12-02T09:00:00', stayDuration: 3, totalPrice: 1050000, status: 'checked-out' },
  { id: 11, guestName: 'ຣັດຕະນາ ງາມ', roomNumber: '402', roomType: 'ac-double', phone: '020 5555 8888', passport: 'LA33333', checkInDate: getDateString(-20), checkInTime: '2024-11-21T14:00:00', checkOutDate: getDateString(-17), checkOutTime: '2024-11-24T11:30:00', stayDuration: 3, totalPrice: 1050000, status: 'checked-out' },
  { id: 12, guestName: 'ສີໄພ ຊາວນາ', roomNumber: '201', roomType: 'fan-single', phone: '020 4444 3333', passport: 'LA44444', checkInDate: getDateString(-14), checkInTime: '2024-11-27T21:00:00', checkOutDate: getDateString(-13), checkOutTime: '2024-11-28T08:00:00', stayDuration: 1, totalPrice: 150000, status: 'checked-out' },
  { id: 13, guestName: 'ທະນາ ຮັ່ງມີ', roomNumber: '303', roomType: 'ac-single', phone: '020 9999 2222', passport: 'LA88888', checkInDate: getDateString(-7), checkInTime: '2024-12-04T12:30:00', checkOutDate: getDateString(-5), checkOutTime: '2024-12-06T10:00:00', stayDuration: 2, totalPrice: 500000, status: 'checked-out' },
  { id: 14, guestName: 'ນຸດຊະນາດ ສົດໃສ', roomNumber: '405', roomType: 'fan-single', phone: '020 1111 3333', passport: 'LA55555', checkInDate: getDateString(-18), checkInTime: '2024-11-23T16:00:00', checkOutDate: getDateString(-15), checkOutTime: '2024-11-26T09:30:00', stayDuration: 3, totalPrice: 450000, status: 'checked-out' },
  { id: 15, guestName: 'ບຸນມີ ສຸກສັນ', roomNumber: '204', roomType: 'fan-double', phone: '020 4444 6666', passport: 'LA22222', checkInDate: getDateString(-25), checkInTime: '2024-11-16T11:00:00', checkOutDate: getDateString(-22), checkOutTime: '2024-11-19T12:00:00', stayDuration: 3, totalPrice: 600000, status: 'checked-out' },
  { id: 16, guestName: 'ວາຣີ ນ້ຳໃສ', roomNumber: '302', roomType: 'fan-single', phone: '020 7777 9999', passport: 'LA11111', checkInDate: getDateString(-30), checkInTime: '2024-11-11T19:00:00', checkOutDate: getDateString(-28), checkOutTime: '2024-11-13T10:00:00', stayDuration: 2, totalPrice: 300000, status: 'checked-out' },
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

  // Toast Notification State
  const [toasts, setToasts] = useState([])

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

  // Confirm Reservation: Reserved -> Occupied
  const handleConfirmReservation = (roomId) => {
    setRooms(prevRooms =>
      prevRooms.map(r =>
        r.id === roomId
          ? { ...r, status: 'occupied', checkInDate: getDateString(0), stayDuration: 1, reservationDate: null, paymentStatus: null }
          : r
      )
    )
    addToast('ເຊັກອິນຈາກການຈອງສຳເລັດ!', 'success')
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
            onBulkClean={handleBulkClean}
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
          <GuestListView guestHistory={guestHistory} onVoidTransaction={handleVoidTransaction} />
        )}

        {activeTab === 'reports' && (
          <ReportsView rooms={rooms} guestHistory={guestHistory} />
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
