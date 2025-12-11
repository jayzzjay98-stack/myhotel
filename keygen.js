#!/usr/bin/env node
/**
 * License Key Generator for Hotel Management System
 * 
 * Usage: node keygen.js <MACHINE_ID>
 * 
 * This generates a license key for the given machine ID.
 * Keep this script secure - only the seller should have access.
 */

const crypto = require('crypto-js')

// Secret salt - MUST match the one in electron/main.js
const SECRET_SALT = 'HOTEL_PMS_2025_LAO'

function generateKey(machineId) {
    if (!machineId) {
        console.error('❌ Error: Machine ID is required')
        console.log('\nUsage: node keygen.js <MACHINE_ID>')
        console.log('Example: node keygen.js abc123def456')
        process.exit(1)
    }

    const key = crypto.MD5(machineId + SECRET_SALT).toString().toUpperCase()

    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║          HOTEL PMS LICENSE KEY GENERATOR                   ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('')
    console.log('  📋 Machine ID:    ', machineId)
    console.log('')
    console.log('  🔑 Activation Key:', key)
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  ⚠️  Keep this key secure! Send only to the customer.')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')

    return key
}

// Get machine ID from command line
const machineId = process.argv[2]
generateKey(machineId)
