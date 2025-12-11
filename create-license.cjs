#!/usr/bin/env node
/**
 * License Key Generator for Supabase
 * 
 * Usage: node create-license.js [KEY_NAME]
 * 
 * Creates a new license key in Supabase database.
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase Credentials
const SUPABASE_URL = 'https://pskquvdcejjfiwwgxazs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza3F1dmRjZWpqZml3d2d4YXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjI4NzksImV4cCI6MjA4MDk5ODg3OX0.65Ywy7YKjdy1N3y3zg1QWEL7zLpk9ut84yrhF67OAyM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Generate random key
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = []
    for (let s = 0; s < 4; s++) {
        let segment = ''
        for (let i = 0; i < 4; i++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        segments.push(segment)
    }
    return 'HOTEL-' + segments.join('-')
}

async function createLicense(customKey) {
    const keyString = customKey || generateKey()

    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║          SUPABASE LICENSE KEY CREATOR                      ║')
    console.log('╚════════════════════════════════════════════════════════════╝\n')

    try {
        // Insert to Supabase
        const { data, error } = await supabase
            .from('licenses')
            .insert([
                {
                    key_string: keyString,
                    is_active: false,
                    machine_id: null,
                    activated_at: null
                }
            ])
            .select()

        if (error) {
            console.log('❌ Error:', error.message)
            return
        }

        console.log('  ✅ License Key Created Successfully!')
        console.log('')
        console.log('  🔑 License Key:', keyString)
        console.log('')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('  📋 สำเนา Key นี้ไปให้ลูกค้า')
        console.log('  ⚠️  Key นี้จะผูกกับเครื่องแรกที่ใช้งาน')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    } catch (err) {
        console.log('❌ Connection Error:', err.message)
    }
}

// Get custom key from command line (optional)
const customKey = process.argv[2]
createLicense(customKey)
