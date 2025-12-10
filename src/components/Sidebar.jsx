import { LayoutDashboard, BedDouble, Users, Settings, Hotel } from 'lucide-react'

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
    { icon: BedDouble, label: 'Rooms', key: 'rooms' },
    { icon: Users, label: 'Guests', key: 'guests' },
    { icon: Settings, label: 'Settings', key: 'settings' },
]

export default function Sidebar({ activeTab, setActiveTab }) {
    return (
        <aside className="w-64 h-screen bg-white shadow-sm flex flex-col fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <Hotel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 text-lg">StayFlow</h1>
                        <p className="text-xs text-gray-400">Hotel Management</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Menu</p>
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.key
                        return (
                            <li key={item.key}>
                                <button
                                    onClick={() => setActiveTab(item.key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                        A
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">Admin User</p>
                        <p className="text-xs text-gray-400">admin@stayflow.com</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
