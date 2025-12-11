import { LayoutDashboard, BedDouble, LogOut, Users, Settings, Hotel, Sun, Moon, BarChart3 } from 'lucide-react'

const navItems = [
    { icon: LayoutDashboard, label: 'ໜ້າຫຼັກ', key: 'dashboard' },
    { icon: BedDouble, label: 'ຫ້ອງພັກ', key: 'rooms' },
    { icon: LogOut, label: 'ເຊັກເອົ້າມື້ນີ້', key: 'checkout', showBadge: true },
    { icon: Users, label: 'ລູກຄ້າ', key: 'guests' },
    { icon: BarChart3, label: 'ລາຍງານ', key: 'reports' },
    { icon: Settings, label: 'ຕັ້ງຄ່າ', key: 'settings' },
]

export default function Sidebar({ activeTab, setActiveTab, isDarkMode, toggleTheme, checkoutCount = 0 }) {
    return (
        <aside className="w-64 h-screen bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-800/50 flex flex-col fixed left-0 top-0 z-50 border-r border-gray-100 dark:border-slate-800 transition-colors duration-300">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <Hotel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 dark:text-white text-lg">StayFlow</h1>
                        <p className="text-xs text-gray-400 dark:text-gray-500">ລະບົບຈັດການໂຮງແຮມ ແລະ ບ້ານພັກ</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">

                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.key
                        const showNotification = item.showBadge && checkoutCount > 0
                        return (
                            <li key={item.key}>
                                <button
                                    onClick={() => setActiveTab(item.key)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ease-out ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm scale-[1.02]'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-200 hover:scale-[1.01]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                        <span className={`text-xl font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                                    </div>
                                    {showNotification && (
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-rose-500 text-white animate-pulse'
                                            }`}>
                                            {checkoutCount}
                                        </span>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Theme Toggle */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300"
                >
                    {isDarkMode ? (
                        <>
                            <Sun className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">ໂໝດແຈ້ງ</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-5 h-5 text-slate-600" />
                            <span className="text-sm font-medium text-gray-700">ໂໝດມືດ</span>
                        </>
                    )}
                </button>
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                        A
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 dark:text-white">ແອັດມິນ</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">admin@stayflow.com</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
