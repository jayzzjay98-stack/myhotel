import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const Toast = ({ id, message, type = 'success', onClose }) => {
    const variants = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
            borderColor: 'border-l-emerald-500',
            iconColor: 'text-emerald-500',
            textColor: 'text-emerald-800 dark:text-emerald-200'
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-rose-50 dark:bg-rose-900/30',
            borderColor: 'border-l-rose-500',
            iconColor: 'text-rose-500',
            textColor: 'text-rose-800 dark:text-rose-200'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50 dark:bg-blue-900/30',
            borderColor: 'border-l-blue-500',
            iconColor: 'text-blue-500',
            textColor: 'text-blue-800 dark:text-blue-200'
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-amber-50 dark:bg-amber-900/30',
            borderColor: 'border-l-amber-500',
            iconColor: 'text-amber-500',
            textColor: 'text-amber-800 dark:text-amber-200'
        }
    }

    const variant = variants[type] || variants.success
    const IconComponent = variant.icon

    return (
        <div
            className={`
                flex items-center gap-3 p-4 rounded-xl shadow-lg border-l-4
                ${variant.bgColor} ${variant.borderColor}
                backdrop-blur-sm bg-opacity-90
                animate-toastSlide
                min-w-[280px] max-w-[400px]
            `}
        >
            <IconComponent className={`w-5 h-5 flex-shrink-0 ${variant.iconColor}`} />
            <p className={`flex-1 text-sm font-medium ${variant.textColor}`}>
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    )
}

const ToastContainer = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={removeToast}
                />
            ))}
        </div>
    )
}

export { Toast, ToastContainer }
