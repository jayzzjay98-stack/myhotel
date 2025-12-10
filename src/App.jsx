import { useState } from 'react'
import { Clock, Users, Settings as SettingsIcon, Wrench } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import RoomsView from './components/RoomsView'

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

// Recent activity data
const recentActivity = [
  { id: 1, action: 'Check-in', room: '102', guest: 'John Smith', time: '2 hours ago', icon: Users },
  { id: 2, action: 'Check-out', room: '201', guest: 'Alice Brown', time: '3 hours ago', icon: Users },
  { id: 3, action: 'Cleaning completed', room: '305', guest: null, time: '4 hours ago', icon: Wrench },
  { id: 4, action: 'Reservation', room: '202', guest: 'David Lee', time: '5 hours ago', icon: Clock },
  { id: 5, action: 'Check-in', room: '203', guest: 'Michael Brown', time: '6 hours ago', icon: Users },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Calculate stats
  const counts = {
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    reserved: rooms.filter((r) => r.status === 'reserved').length,
    cleaning: rooms.filter((r) => r.status === 'cleaning').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Header />

        {/* Conditional Page Rendering */}
        {activeTab === 'dashboard' && (
          <>
            <StatsCards counts={counts} />

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <activity.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {activity.action} - Room {activity.room}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.guest ? activity.guest : 'Staff action'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'rooms' && <RoomsView rooms={rooms} />}

        {activeTab === 'guests' && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Guests Management</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Guest management features coming soon. You'll be able to view guest history, profiles, and more.
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Settings</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Configure your hotel management preferences, user accounts, and system settings here.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
