import { createClient } from '@supabase/supabase-js'

// User's Real Credentials
const SUPABASE_URL = 'https://pskquvdcejjfiwwgxazs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza3F1dmRjZWpqZml3d2d4YXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjI4NzksImV4cCI6MjA4MDk5ODg3OX0.65Ywy7YKjdy1N3y3zg1QWEL7zLpk9ut84yrhF67OAyM'

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

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
                return { success: false, message: 'ไม่พบคีย์นี้ในระบบ (Invalid Key) - Error: ' + (error?.message || 'No data') }
            }

            // 2. Validate Logic
            // Case A: New Key (Never used) -> Activate it
            if (!data.is_active) {
                const { error: updateError } = await supabase
                    .from('licenses')
                    .update({
                        is_active: true,
                        machine_id: machineId,
                        activated_at: new Date().toISOString()
                    })
                    .eq('key_string', keyString)

                if (updateError) return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึก (Save Error)' }
                return { success: true, message: 'เปิดใช้งานสำเร็จ! (Activated)' }
            }

            // Case B: Re-install (Same Machine) -> Allow
            if (data.is_active && data.machine_id === machineId) {
                return { success: true, message: 'ยินดีต้อนรับกลับมา (Re-activated)' }
            }

            // Case C: Fraud (Different Machine) -> Block
            if (data.is_active && data.machine_id !== machineId) {
                return { success: false, message: 'คีย์นี้ถูกใช้งานกับเครื่องอื่นไปแล้ว (Key already used on another device)' }
            }

            return { success: false, message: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ' }
        } catch (err) {
            console.error('Activation Error:', err)
            return { success: false, message: 'เชื่อมต่อ Server ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต' }
        }
    }
}
