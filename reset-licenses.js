import { createClient } from '@supabase/supabase-js'

// Supabase Credentials
const SUPABASE_URL = 'https://pskquvdcejjfiwwgxazs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza3F1dmRjZWpqZml3d2d4YXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjI4NzksImV4cCI6MjA4MDk5ODg3OX0.65Ywy7YKjdy1N3y3zg1QWEL7zLpk9ut84yrhF67OAyM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Get command line arguments
const args = process.argv.slice(2)
const licenseType = args[0] || 'trial'  // 'trial', 'full', or 'lifetime'
const count = parseInt(args[1]) || 10

async function resetAndGenerateLicenses() {
    console.log('=== License Reset & Generate Script ===\n')
    console.log(`License Type: ${licenseType}`)
    console.log(`Count: ${count}\n`)

    // Step 1: Delete all existing licenses
    console.log('1. Deleting all existing licenses...')
    const { error: deleteError } = await supabase
        .from('licenses')
        .delete()
        .neq('key_string', '')

    if (deleteError) {
        console.error('   Error deleting:', deleteError.message)
    } else {
        console.log('   ✅ All old licenses deleted!')
    }

    // Step 2: Generate new license keys
    console.log('\n2. Generating new license keys...')

    const generateKey = (type) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const segments = []
        for (let s = 0; s < 4; s++) {
            let segment = ''
            for (let i = 0; i < 4; i++) {
                segment += chars[Math.floor(Math.random() * chars.length)]
            }
            segments.push(segment)
        }
        // Prefix based on type
        const prefix = type === 'trial' ? 'TRIAL' : type === 'full' ? 'HOTEL' : 'PREM'
        return `${prefix}-${segments.join('-')}`
    }

    // Generate new keys (only use existing columns)
    const newKeys = []
    for (let i = 0; i < count; i++) {
        newKeys.push({
            key_string: generateKey(licenseType),
            is_active: false,
            machine_id: null,
            activated_at: null
        })
    }

    // Step 3: Insert new keys
    console.log('\n3. Inserting new license keys...')
    const { data, error: insertError } = await supabase
        .from('licenses')
        .insert(newKeys)
        .select()

    if (insertError) {
        console.error('   Error inserting:', insertError.message)
    } else {
        console.log('   ✅ New licenses created!\n')
    }

    // Step 4: Show all new keys
    console.log('=== NEW LICENSE KEYS ===\n')
    const { data: allKeys } = await supabase
        .from('licenses')
        .select('key_string, is_active')
        .order('key_string')

    if (allKeys) {
        allKeys.forEach((key, index) => {
            // Determine type from prefix
            const type = key.key_string.startsWith('TRIAL') ? '🎁 Trial 7 days' :
                key.key_string.startsWith('HOTEL') ? '✅ Full 1 year' : '💎 Lifetime'
            console.log(`${index + 1}. ${key.key_string} | ${type}`)
        })
    }

    console.log('\n=== DONE ===')
    console.log('\nUsage:')
    console.log('  node reset-licenses.js trial 10    # Create 10 trial keys (7 days)')
    console.log('  node reset-licenses.js full 5      # Create 5 full keys (1 year)')
    console.log('  node reset-licenses.js lifetime 1  # Create 1 lifetime key')
    console.log('\n⚠️  Note: License type is determined by key prefix (TRIAL/HOTEL/PREM)')
}

resetAndGenerateLicenses()
