const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { machineIdSync } = require('node-machine-id')

// Data paths
const userDataPath = app.getPath('userData')
const licensePath = path.join(userDataPath, 'license.json')
const dataPath = path.join(userDataPath, 'hotel_data.json')

// ============= DATA HELPERS =============

function loadLicense() {
    try {
        if (fs.existsSync(licensePath)) {
            const data = fs.readFileSync(licensePath, 'utf8')
            return JSON.parse(data)
        }
    } catch (error) {
        console.error('Failed to load license:', error)
    }
    return null
}

function saveLicense(licenseData) {
    try {
        fs.writeFileSync(licensePath, JSON.stringify(licenseData, null, 2), 'utf8')
        return true
    } catch (error) {
        console.error('Failed to save license:', error)
        return false
    }
}

function loadHotelData() {
    try {
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8')
            return JSON.parse(data)
        }
    } catch (error) {
        console.error('Failed to load hotel data:', error)
    }
    return { rooms: [], guestHistory: [] }
}

function saveHotelData(data) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8')
        return true
    } catch (error) {
        console.error('Failed to save hotel data:', error)
        return false
    }
}

// ============= WINDOW =============

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        icon: path.join(__dirname, '../public/vite.svg'),
        title: 'Hotel Management System',
        show: false,
    })

    const isDev = !app.isPackaged
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// ============= IPC HANDLERS =============

// License Operations
ipcMain.handle('get-machine-id', () => {
    try {
        return machineIdSync()
    } catch (error) {
        console.error('Failed to get machine ID:', error)
        return 'ERROR-GETTING-ID'
    }
})

ipcMain.handle('get-license', () => {
    return loadLicense()
})

ipcMain.handle('save-license', (event, licenseData) => {
    return saveLicense(licenseData)
})

ipcMain.handle('check-license', () => {
    const license = loadLicense()
    if (!license) return { valid: false }

    const currentMachineId = machineIdSync()

    // Check if license machineId matches current machine
    if (license.machineId === currentMachineId && license.isActive) {
        // Check local expiry date (works offline)
        if (license.expiresAt) {
            const expiresAt = new Date(license.expiresAt)
            const now = new Date()

            if (expiresAt < now) {
                console.log('License expired locally!')
                return {
                    valid: false,
                    expired: true,
                    message: 'License ໝົດອາຍຸແລ້ວ'
                }
            }
        }

        // Return key and machineId for server verification
        return {
            valid: true,
            license,
            keyString: license.keyString,
            machineId: currentMachineId,
            expiresAt: license.expiresAt
        }
    }
    return { valid: false }
})

// Data Operations
ipcMain.handle('get-data', () => {
    return loadHotelData()
})

ipcMain.handle('save-data', (event, data) => {
    return saveHotelData(data)
})

// Clear all transaction data (smart factory reset)
ipcMain.handle('clear-data', () => {
    try {
        // Load current data
        const currentData = loadHotelData()

        // Sanitize rooms - keep structure but reset guest data
        const sanitizedRooms = (currentData.rooms || []).map(room => ({
            id: room.id,
            number: room.number,
            floor: room.floor,
            roomType: room.roomType,
            price: room.price,
            status: 'available',
            guestName: null,
            phone: '',
            passport: '',
            checkInDate: null,
            checkInTime: null,
            stayDuration: null,
            paymentStatus: null,
            reservationDate: null
        }))

        // Save sanitized rooms with empty guest history
        const resetData = {
            rooms: sanitizedRooms,
            guestHistory: []
        }
        saveHotelData(resetData)

        // Reload the main window
        if (mainWindow) {
            mainWindow.reload()
        }

        return true
    } catch (error) {
        console.error('Failed to clear data:', error)
        return false
    }
})

// ============= APP LIFECYCLE =============

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
