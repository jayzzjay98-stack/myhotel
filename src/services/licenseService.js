import { createClient } from '@supabase/supabase-js'

// User's Real Credentials
const SUPABASE_URL = 'https://pskquvdcejjfiwwgxazs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza3F1dmRjZWpqZml3d2d4YXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjI4NzksImV4cCI6MjA4MDk5ODg3OX0.65Ywy7YKjdy1N3y3zg1QWEL7zLpk9ut84yrhF67OAyM'

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// License Types and their validity in days (based on key prefix)
const LICENSE_TYPES = {
    'TRIAL': 7,      // 7 days trial
    'HOTEL': 365,    // 1 year
    'PREM': 36500    // 100 years (lifetime)
}

// Get license type from key prefix
const getLicenseTypeFromKey = (keyString) => {
    if (keyString.startsWith('TRIAL')) return { type: 'trial', days: 7 }
    if (keyString.startsWith('HOTEL')) return { type: 'full', days: 365 }
    if (keyString.startsWith('PREM')) return { type: 'lifetime', days: 36500 }
    return { type: 'trial', days: 7 } // Default to trial
}

export const licenseService = {
    // Function to Activate License
    async activateLicense(keyString, machineId) {
        try {
            console.log('Attempting to activate with key:', keyString)
            console.log('Machine ID:', machineId)

            // 1. Find Key in DB
            const { data, error } = await supabase
                .from('licenses')
                .select('*')
                .eq('key_string', keyString)
                .single()

            console.log('Supabase response - Data:', data)
            console.log('Supabase response - Error:', error)

            if (error || !data) {
                return { success: false, message: 'ໄມ່ພົບຄີย໌ນີ້ໃນລະບົບ (Invalid Key)' }
            }

            // 2. Validate Logic
            // Case A: New Key (Never used) -> Activate it
            if (!data.is_active) {
                const activatedAt = new Date().toISOString()

                // Get license type from key prefix
                const { type: licenseType, days: validDays } = getLicenseTypeFromKey(keyString)
                const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString()

                const { error: updateError } = await supabase
                    .from('licenses')
                    .update({
                        is_active: true,
                        machine_id: machineId,
                        activated_at: activatedAt
                    })
                    .eq('key_string', keyString)

                if (updateError) return { success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ (Save Error)' }

                // Return expiry info
                const typeLabel = licenseType === 'trial' ? 'ທົດລອງ 7 ວັນ' :
                    licenseType === 'full' ? 'Full 1 ປີ' : 'Lifetime'
                return {
                    success: true,
                    message: `ເປີດໃຊ້ງານສຳເລັດ! (${typeLabel})`,
                    expiresAt: expiresAt,
                    licenseType: licenseType
                }
            }

            // Case B: Re-install (Same Machine) -> Check if should still work
            if (data.is_active && data.machine_id === machineId) {
                // Calculate expiry based on activation date and key type
                const { type: licenseType, days: validDays } = getLicenseTypeFromKey(keyString)
                const activatedAt = new Date(data.activated_at)
                const expiresAt = new Date(activatedAt.getTime() + validDays * 24 * 60 * 60 * 1000)

                if (expiresAt < new Date()) {
                    return {
                        success: false,
                        message: 'License ໝົດອາຍຸແລ້ວ ກະລຸນາຕໍ່ອາຍຸ (License Expired)',
                        expired: true
                    }
                }

                return {
                    success: true,
                    message: 'ຍິນດີຕ້ອນຮັບກັບມາ',
                    expiresAt: expiresAt.toISOString(),
                    licenseType: licenseType
                }
            }

            // Case C: Fraud (Different Machine) -> Block
            if (data.is_active && data.machine_id !== machineId) {
                return { success: false, message: 'ຄີย໌ນີ້ຖືກໃຊ້ງານກັບເຄື່ອງອື່ນໄປແລ້ວ (Key already used)' }
            }

            return { success: false, message: 'ເກີດຂໍ້ຜິດພາດທີ່ໄມ່ຮູ້ສາເຫດ' }
        } catch (err) {
            console.error('Activation Error:', err)
            return { success: false, message: 'ເຊື່ອມຕໍ່ Server ໄມ່ໄດ້ ກະລຸນາກວດສອບອິນເຕີເນັດ' }
        }
    },

    // Function to Verify License with Server (check every app launch)
    async verifyLicense(keyString, machineId) {
        try {
            console.log('Verifying license with server...')
            console.log('Key:', keyString)
            console.log('Machine ID:', machineId)

            // Check if key exists and is active for this machine
            const { data, error } = await supabase
                .from('licenses')
                .select('*')
                .eq('key_string', keyString)
                .eq('is_active', true)
                .eq('machine_id', machineId)
                .single()

            if (error || !data) {
                console.log('License verification failed - key not found or not active')
                return { valid: false, message: 'License ໄມ່ຖືກຕ້ອງ ກະລຸນາເປີດໃຊ້ງານໃໝ່' }
            }

            // Check expiry based on activation date and key type
            const { type: licenseType, days: validDays } = getLicenseTypeFromKey(keyString)
            const activatedAt = new Date(data.activated_at)
            const expiresAt = new Date(activatedAt.getTime() + validDays * 24 * 60 * 60 * 1000)
            const now = new Date()

            if (expiresAt < now) {
                console.log('License expired!')
                return {
                    valid: false,
                    message: 'License ໝົດອາຍຸແລ້ວ ກະລຸນາຕໍ່ອາຍຸ',
                    expired: true,
                    expiresAt: expiresAt.toISOString()
                }
            }

            // Calculate days remaining
            const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
            console.log(`License valid - ${daysRemaining} days remaining`)

            return {
                valid: true,
                message: `License ຖືກຕ້ອງ (ເຫຼືອ ${daysRemaining} ວັນ)`,
                daysRemaining: daysRemaining,
                expiresAt: expiresAt.toISOString()
            }
        } catch (err) {
            console.error('Verification Error:', err)
            // If server is unreachable, check local expiry (handled in main.cjs)
            console.log('Server unreachable - allowing offline usage')
            return { valid: true, message: 'ໃຊ້ງານແບບ Offline', offline: true }
        }
    }
}
