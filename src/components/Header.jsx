import { Calendar, Bell, Search } from 'lucide-react'

export default function Header() {
    const today = new Date()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const formattedDate = today.toLocaleDateString('en-US', options)

    return (
        <header className="flex items-center justify-between mb-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, Admin</h1>
                <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        className="w-64 pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                </button>
            </div>
        </header>
    )
}
