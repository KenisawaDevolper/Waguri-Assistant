import config from '../../config.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// plugins/autoclean.js
const fs = require('fs')
const path = require('path')
const pluginConfig = {
    name: 'autoclean',
    alias: ['autoclear', 'cleanstore', 'hapusstore'],
    category: 'owner',
    description: 'Elimina automáticamente el archivo baileys_store.json si supera 50MB (activable/desactivable) con la estética Waguri Assistant 🧹',
    usage: '.autoclean [on/off/status]',
    example: '.autoclean on\n.autoclean off\n.autoclean status',
    isOwner: true,      // Solo owner
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

// Path file baileys_store.json
const storePath = path.join(process.cwd(), 'store', 'baileys_store.json')
const storeDir = path.join(process.cwd(), 'store')

// Setting auto clean (disimpan di memory, bisa pindah ke database kalo mau)
let autoCleanEnabled = true  // Default ON
const MAX_SIZE_MB = 50
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

// Fungsi cek ukuran file
function getFileSizeMB(filePath) {
    try {
        if (!fs.existsSync(filePath)) return 0
        const stats = fs.statSync(filePath)
        return stats.size / (1024 * 1024)
    } catch (e) {
        console.error('[AutoClean] Error baca ukuran file:', e)
        return 0
    }
}

// Fungsi hapus file
function deleteStoreFile() {
    try {
        if (!fs.existsSync(storePath)) {
            return { success: false, message: 'File no encontrado' }
        }
        
        const oldSize = getFileSizeMB(storePath)
        fs.unlinkSync(storePath)
        
        // Crea file baru kosong
        fs.writeFileSync(storePath, JSON.stringify({ credentials: {}, state: {} }, null, 2))
        
        return { 
            success: true, 
            message: `✅ File berhasil eliminado!\n📦 Ukuran lama: ${oldSize.toFixed(2)} MB\n📄 File baru telah dibuat.`,
            oldSize: oldSize
        }
    } catch (e) {
        return { success: false, message: `❌ Error hapus file: ${e.message}` }
    }
}

// Fungsi auto clean (bisa dipanggil berkala)
function autoClean() {
    if (!autoCleanEnabled) return false
    
    const sizeMB = getFileSizeMB(storePath)
    
    if (sizeMB > MAX_SIZE_MB) {
        console.log(`[AutoClean] Ukuran file ${sizeMB.toFixed(2)}MB melebihi batas ${MAX_SIZE_MB}MB, menghapus...`)
        const result = deleteStoreFile()
        if (result.success) {
            console.log(`[AutoClean] ${result.message}`)
        }
        return result.success
    }
    
    return false
}

// Fungsi cek status
function getStatus() {
    const sizeMB = getFileSizeMB(storePath)
    const exists = fs.existsSync(storePath)
    const isOverlimit = sizeMB > MAX_SIZE_MB
    
    return {
        enabled: autoCleanEnabled,
        fileExists: exists,
        sizeMB: sizeMB.toFixed(2),
        maxSizeMB: MAX_SIZE_MB,
        isOverlimit: isOverlimit,
        filePath: storePath
    }
}

// Handler utama
async function handler(m, { sock }) {
    const args = m.text?.trim().toLowerCase() || ''
    
    // Crea folder store kalo belum ada
    if (!fs.existsSync(storeDir)) {
        fs.mkdirSync(storeDir, { recursive: true })
    }
    
    // Auto clean manual via command
    if (args === 'clean' || args === 'hapus' || args === 'delete') {
        await m.react('⏳')
        
        const sizeBefore = getFileSizeMB(storePath)
        
        if (sizeBefore === 0) {
            return m.reply(`📂 *Archivo no encontrado o vacío*\n\nPath: ${storePath}\n\nNo hay nada que eliminar, cariño~ 🗿`)
        }
        
        const result = deleteStoreFile()
        
        if (result.success) {
            await m.react('✅')
        } else {
            await m.react('❌')
        }
        
        return m.reply(result.message)
    }
    
    // ON / OFF
    if (args === 'on') {
        autoCleanEnabled = true
        await m.react('✅')
        return m.reply(`✅ *AUTO CLEAN ACTIVADO*\n\n📂 File: baileys_store.json\n📍 Lokasi: ${storePath}\n📦 Batas ukuran: ${MAX_SIZE_MB} MB\n\nFile akan otomatis eliminado jika melebihi ${MAX_SIZE_MB} MB.\n\n🦋 *Zero Two:* ¡Ya está activado, cariño~ ✨`)
    }
    
    if (args === 'off') {
        autoCleanEnabled = false
        await m.react('✅')
        return m.reply(`❌ *AUTO CLEAN DESACTIVADO*\n\nLa función de auto-eliminación está desactivada.\n\nGunakan \`.autoclean on\` untuk mengaktifkan lagi.\n\n🦋 *Zero Two:* ¡Listo, cariño~ ✨`)
    }
    
    // Muestra status (default)
    const status = getStatus()
    
    let statusText = `📂 *AUTO CLEAN STATUS*\n\n`
    statusText += `🔘 *Status:* ${status.enabled ? '✅ AKTIF' : '❌ NONAKTIF'}\n`
    statusText += `📦 *Ukuran file:* ${status.sizeMB} MB / ${status.maxSizeMB} MB\n`
    statusText += `⚠️ *Melebihi batas:* ${status.isOverlimit ? 'YA 🚨' : 'No ✅'}\n`
    statusText += `📁 *Lokasi:* ${status.filePath}\n`
    statusText += `📄 *File exists:* ${status.fileExists ? '✅ Ada' : '❌ No ada'}\n\n`
    
    if (status.isOverlimit && status.enabled) {
        statusText += `🚨 *PERINGATAN!* File melebihi batas! Bot akan segera menghapusnya.\n\n`
    }
    
    statusText += `📌 *Perintah:*\n`
    statusText += `• \`.autoclean on\` - Activar auto hapus\n`
    statusText += `• \`.autoclean off\` - Nonaktifkan\n`
    statusText += `• \`.autoclean clean\` - Elimina manual sekarang\n`
    statusText += `• \`.autoclean status\` - Lihat status ini\n\n`
    statusText += `🦋 *Zero Two:* ¿Cómo quieres configurarlo, cariño~? 💫`
    
    await m.reply(statusText)
}

// Auto check setiap 30 menit
setInterval(() => {
    if (autoCleanEnabled) {
        const result = autoClean()
        if (result) {
            console.log('[AutoClean] Auto cleanup executed')
        }
    }
}, 30 * 60 * 1000) // 30 menit

export { pluginConfig as config, handler };
