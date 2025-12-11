const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // License Operations
    getMachineId: () => ipcRenderer.invoke('get-machine-id'),
    getLicense: () => ipcRenderer.invoke('get-license'),
    saveLicense: (licenseData) => ipcRenderer.invoke('save-license', licenseData),
    checkLicense: () => ipcRenderer.invoke('check-license'),

    // Data Operations
    loadData: () => ipcRenderer.invoke('get-data'),
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    clearData: () => ipcRenderer.invoke('clear-data'),
})
