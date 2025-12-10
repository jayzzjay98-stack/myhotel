import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import RoomGrid from './components/RoomGrid'

// Sample room data
const rooms = [
  // Floor 1
  { id: 1, number: '101', floor: 1, status: 'available', type: 'Standard', guestName: null },
  { id: 2, number: '102', floor: 1, status: 'occupied', type: 'Deluxe', guestName: 'John Smith' },
  { id: 3, number: '103', floor: 1, status: 'occupied', type: 'Standard', guestName: 'Emma Wilson' },
  { id: 4, number: '104', floor: 1, status: 'available', type: 'Suite', guestName: null },
  { id: 5, number: '105', floor: 1, status: 'cleaning', type: 'Deluxe', guestName: null },
  // Floor 2
  { id: 6, number: '201', floor: 2, status: 'available', type: 'Standard', guestName: null },
  { id: 7, number: '202', floor: 2, status: 'reserved', type: 'Deluxe', guestName: null },
  { id: 8, number: '203', floor: 2, status: 'occupied', type: 'Suite', guestName: 'Michael Brown' },
  { id: 9, number: '204', floor: 2, status: 'available', type: 'Standard', guestName: null },
  { id: 10, number: '205', floor: 2, status: 'occupied', type: 'Deluxe', guestName: 'Sarah Davis' },
  // Floor 3
  { id: 11, number: '301', floor: 3, status: 'reserved', type: 'Suite', guestName: null },
  { id: 12, number: '302', floor: 3, status: 'available', type: 'Standard', guestName: null },
  { id: 13, number: '303', floor: 3, status: 'cleaning', type: 'Deluxe', guestName: null },
  { id: 14, number: '304', floor: 3, status: 'occupied', type: 'Suite', guestName: 'Robert Johnson' },
  { id: 15, number: '305', floor: 3, status: 'available', type: 'Standard', guestName: null },
  // Floor 4
  { id: 16, number: '401', floor: 4, status: 'occupied', type: 'Premium Suite', guestName: 'Lisa Anderson' },
  { id: 17, number: '402', floor: 4, status: 'available', type: 'Premium Suite', guestName: null },
  { id: 18, number: '403', floor: 4, status: 'reserved', type: 'Premium Suite', guestName: null },
  { id: 19, number: '404', floor: 4, status: 'cleaning', type: 'Premium Suite', guestName: null },
  { id: 20, number: '405', floor: 4, status: 'available', type: 'Premium Suite', guestName: null },
]

function App() {
  // Calculate stats
  const counts = {
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    reserved: rooms.filter(r => r.status === 'reserved').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
  }

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = []
    acc[room.floor].push(room)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Header />
        <StatsCards counts={counts} />
        <RoomGrid roomsByFloor={roomsByFloor} />
      </main>
    </div>
  )
}

export default App
