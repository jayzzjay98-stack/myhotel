import { createClient } from '@supabase/supabase-js'

// Supabase Credentials
const SUPABASE_URL = 'https://pskquvdcejjfiwwgxazs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza3F1dmRjZWpqZml3d2d4YXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjI4NzksImV4cCI6MjA4MDk5ODg3OX0.65Ywy7YKjdy1N3y3zg1QWEL7zLpk9ut84yrhF67OAyM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const args = process.argv.slice(2)
const command = args[0] || 'list'
const keyToRevoke = args[1]

async function manageLicenses() {
    console.log('=== License Management ===\n')

    if (command === 'list') {
        // List all licenses
        const { data } = await supabase
            .from('licenses')
            .select('*')
            .order('key_string')

        console.log('All Licenses:\n')
        if (data) {
            data.forEach((lic, i) => {
                const status = lic.is_active ? '✅ Active' : '⏳ Not used'
                const machine = lic.machine_id ? `Machine: ${lic.machine_id.substring(0, 10)}...` : ''
                const activated = lic.activated_at ? `Activated: ${new Date(lic.activated_at).toLocaleDateString()}` : ''
                console.log(`${i + 1}. ${lic.key_string}`)
                console.log(`   ${status} ${machine} ${activated}`)
            })
        }
    }

    if (command === 'revoke' && keyToRevoke) {
        // Revoke/delete a specific license
        console.log(`Revoking license: ${keyToRevoke}\n`)

        const { error } = await supabase
            .from('licenses')
            .delete()
            .eq('key_string', keyToRevoke)

        if (error) {
            console.error('❌ Error:', error.message)
        } else {
            console.log('✅ License revoked successfully!')
            console.log('ลูกค้าจะไม่สามารถใช้งานโปรแกรมได้เมื่อเปิดครั้งถัดไป')
        }
    }

    if (command === 'deactivate' && keyToRevoke) {
        // Deactivate (keep in DB but mark as inactive)
        console.log(`Deactivating license: ${keyToRevoke}\n`)

        const { error } = await supabase
            .from('licenses')
            .update({
                is_active: false,
                machine_id: null,
                activated_at: null
            })
            .eq('key_string', keyToRevoke)

        if (error) {
            console.error('❌ Error:', error.message)
        } else {
            console.log('✅ License deactivated!')
            console.log('Key ยังอยู่ในระบบ แต่ลูกค้าใช้ไม่ได้แล้ว')
        }
    }

    console.log('\n=== Commands ===')
    console.log('  node manage-licenses.js list              # ดูรายการ licenses ทั้งหมด')
    console.log('  node manage-licenses.js revoke KEY        # ลบ license ออก (ลูกค้าใช้ไม่ได้)')
    console.log('  node manage-licenses.js deactivate KEY    # ปิดการใช้งาน (เก็บ key ไว้)')
}

manageLicenses()
