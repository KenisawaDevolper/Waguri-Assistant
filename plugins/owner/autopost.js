import config from '../../config.js';
import { getDatabase } from '../../src/lib/rimuru-database.js';
import { getRandomCaption, addCaption, getCaptionCount, getAllCaptions } from '../../src/lib/zerotwoCaption.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require('fs')
const path = require('path')
const pluginConfig = {
    name: 'autopost',
    alias: ['apost', 'autopostchannel'],
    category: 'owner',
    description: 'Publica automáticamente imágenes aleatorias en el canal con la estética Waguri Assistant 📢',
    usage: '.autopost <on/off/set>',
    example: '.autopost on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

// ========== KONFIGURASI FOLDER ==========
// Folder gambar lo (sesuai screenshot)
const IMAGES_FOLDER = path.join(process.cwd(), 'assets', 'foto-zerotwo-random')

let intervalId = null

// Fungsi buat dapetin gambar random dari folder
function getRandomImage() {
    try {
        console.log(`[AUTOPOST] Mencari gambar di: ${IMAGES_FOLDER}`)
        
        if (!fs.existsSync(IMAGES_FOLDER)) {
            console.error(`[AUTOPOST] Folder TIDAK ADA: ${IMAGES_FOLDER}`)
            console.error(`[AUTOPOST] CWD: ${process.cwd()}`)
            return null
        }
        
        const files = fs.readdirSync(IMAGES_FOLDER)
        console.log(`[AUTOPOST] Total file di folder: ${files.length}`)
        
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase()
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)
        })
        
        console.log(`[AUTOPOST] Total gambar: ${imageFiles.length}`)
        
        if (imageFiles.length === 0) {
            console.error('[AUTOPOST] TIDAK ADA GAMBAR!')
            return null
        }
        
        const randomIndex = Math.floor(Math.random() * imageFiles.length)
        const imagePath = path.join(IMAGES_FOLDER, imageFiles[randomIndex])
        
        console.log(`[AUTOPOST] Pilih gambar: ${imageFiles[randomIndex]}`)
        
        return {
            path: imagePath,
            filename: imageFiles[randomIndex]
        }
    } catch (err) {
        console.error('[AUTOPOST] Error:', err.message)
        return null
    }
}

// Fungsi kirim gambar ke channel
async function sendRandomImage(sock, channelId) {
    try {
        const image = getRandomImage()
        if (!image) {
            console.log('[AUTOPOST] Error dapetin gambar')
            return false
        }
        
        const caption = getRandomCaption()
        const imageBuffer = fs.readFileSync(image.path)
        
        await sock.sendMessage(channelId, {
            image: imageBuffer,
            caption: caption,
            mimetype: 'image/jpeg'
        })
        
        console.log(`[AUTOPOST] ✅ ÉXITO!`)
        console.log(`   📡 Channel: ${channelId}`)
        console.log(`   📷 Gambar: ${image.filename}`)
        console.log(`   💬 Caption: ${caption.substring(0, 50)}...`)
        return true
    } catch (err) {
        console.error('[AUTOPOST] Error kirim:', err.message)
        return false
    }
}

// Fungsi start auto post
function startAutoPost(sock, db) {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
    
    const channelId = db.data.autopost?.channelId
    const intervalHours = db.data.autopost?.interval || 2
    const intervalMs = intervalHours * 60 * 60 * 1000
    
    if (!channelId) {
        console.log('[AUTOPOST] Channel ID belum diset!')
        return
    }
    
    console.log(`[AUTOPOST] ====================`)
    console.log(`[AUTOPOST] AutoPost Started!`)
    console.log(`[AUTOPOST] 📡 Channel: ${channelId}`)
    console.log(`[AUTOPOST] ⏰ Interval: ${intervalHours} jam`)
    console.log(`[AUTOPOST] 📁 Folder: ${IMAGES_FOLDER}`)
    console.log(`[AUTOPOST] ====================`)
    
    // Langsung kirim pertama kali (delay 3 detik)
    setTimeout(() => sendRandomImage(sock, channelId), 3000)
    
    // Set interval
    intervalId = setInterval(() => {
        const isEnabled = db.data.autopost?.enabled
        if (isEnabled) {
            sendRandomImage(sock, channelId)
        }
    }, intervalMs)
}

// Stop auto post
function stopAutoPost() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
        console.log('[AUTOPOST] AutoPost Stopped!')
    }
}

// Handler command
async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    
    // Initialize data
    if (!db.data.autopost) {
        db.data.autopost = {
            enabled: false,
            channelId: '',
            interval: 2
        }
    }
    
    // ========== ON ==========
    if (sub === 'on') {
        if (!db.data.autopost.channelId) {
            return m.reply(
                `❌ *CHANNEL BELUM DISET*\n\n` +
                `> Ketik: ${m.prefix}autopost set 120363xxxxxx@newsletter\n\n` +
                `📌 *Cara dapat JID Saluran:*\n` +
                `> 1. Buka saluran lo\n` +
                `> 2. Ketik ${m.prefix}getjid\n` +
                `> 3. Copy JID yang muncul (format @newsletter)\n\n` +
                `🦋 *Zero Two:* "¡Configúralo primero, cariño~ 🎐"`
            )
        }
        
        // Cek folder dan gambar
        if (!fs.existsSync(IMAGES_FOLDER)) {
            return m.reply(
                `❌ *FOLDER TIDAK DITEMUKAN*\n\n` +
                `📁 Folder: \`${IMAGES_FOLDER}\`\n\n` +
                `💡 *Solusi:*\n` +
                `> 1. Buat folder: \`assets/zerotwo-random/\`\n` +
                `> 2. Ingresa gambar ke dalamnya\n` +
                `> 3. Coba lagi\n\n` +
                `🦋 *Zero Two:* "¡Crea primero la carpeta, cariño~ 🎐"`
            )
        }
        
        const files = fs.readdirSync(IMAGES_FOLDER)
        const imageFiles = files.filter(f => {
            const ext = path.extname(f).toLowerCase()
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)
        })
        
        if (imageFiles.length === 0) {
            return m.reply(
                `❌ *TIDAK ADA GAMBAR*\n\n` +
                `📁 Folder: \`${IMAGES_FOLDER}\`\n` +
                `📊 Total file: ${files.length} file\n` +
                `🖼️ Gambar: 0 file\n\n` +
                `💡 *Ingresa gambar* (jpg/png/gif/webp) ke folder tersebut.\n\n` +
                `🦋 *Zero Two:* "¡Añade primero las imágenes, cariño~ 🎐"`
            )
        }
        
        db.data.autopost.enabled = true
        db.save()
        
        startAutoPost(sock, db)
        
        const channelType = db.data.autopost.channelId.includes('@newsletter') ? 'SALURAN (NEWSLETTER)' : 'GRUP'
        
        return m.reply(
            `✅ *AUTOPOST AKTIF*\n\n` +
            `📡 Channel: ${db.data.autopost.channelId}\n` +
            `📌 Tipe: ${channelType}\n` +
            `⏰ Interval: ${db.data.autopost.interval} jam una vez\n` +
            `🖼️ Gambar: ${imageFiles.length} file ditemukan\n` +
            `📁 Folder: assets/zerotwo-random/\n` +
            `💬 Caption: ${getCaptionCount()} caption tersedia\n\n` +
            `> ${m.prefix}autopost off → matikan\n` +
            `> ${m.prefix}autopost test → kirim manual\n\n` +
            `🦋 *Zero Two:* "¡Listo, cariño~ ¡Tu canal se llenará de vida! 🎐"`
        )
    }
    
    // ========== OFF ==========
    if (sub === 'off') {
        db.data.autopost.enabled = false
        db.save()
        
        stopAutoPost()
        
        return m.reply(
            `❌ *AUTOPOST NONAKTIF*\n\n` +
            `> Bot berhenti kirim gambar otomatis.\n` +
            `> Ketik ${m.prefix}autopost on untuk aktifkan lagi.\n\n` +
            `🦋 *Zero Two:* "Vale, cariño, será para la próxima~ 🎐"`
        )
    }
    
    // ========== SET ==========
    if (sub === 'set') {
        const value = args[1]
        
        // Set channel
        if (value && (value.includes('@g.us') || value.includes('@newsletter'))) {
            db.data.autopost.channelId = value
            db.save()
            
            const channelType = value.includes('@newsletter') ? 'SALURAN (NEWSLETTER)' : 'GRUP'
            
            if (db.data.autopost.enabled) {
                startAutoPost(sock, db)
            }
            
            return m.reply(
                `✅ *CHANNEL DISET*\n\n` +
                `📡 ID: ${value}\n` +
                `📌 Tipe: ${channelType}\n` +
                `> Ketik ${m.prefix}autopost on untuk memulai.\n\n` +
                `🦋 *Zero Two:* "¡Vale, cariño, ya está listo~ 🎐"`
            )
        }
        
        // Set interval
        const interval = parseInt(value)
        if (!isNaN(interval) && interval >= 1 && interval <= 24) {
            db.data.autopost.interval = interval
            db.save()
            
            if (db.data.autopost.enabled) {
                startAutoPost(sock, db)
            }
            
            return m.reply(
                `✅ *INTERVAL DIUBAH*\n\n` +
                `⏰ Menjadi ${interval} jam una vez\n` +
                `> Akan kirim gambar setiap ${interval} jam.\n\n` +
                `🦋 *Zero Two:* "¡Listo, cariño, ya no estará vacío~ 🔥"`
            )
        }
        
        return m.reply(
            `⚠️ *CARA SET:*\n\n` +
            `> Set channel: ${m.prefix}autopost set 120363xxxxxx@newsletter\n` +
            `> Set interval: ${m.prefix}autopost set 2 (jam)\n\n` +
            `🦋 *Zero Two:* "¡Así es, cariño~ 🎐"`
        )
    }
    
    // ========== STATUS ==========
    if (sub === 'status') {
        const enabled = db.data.autopost.enabled
        const channelId = db.data.autopost.channelId || 'Aún no diset'
        const interval = db.data.autopost.interval || 2
        const channelType = channelId.includes('@newsletter') ? 'SALURAN' : (channelId.includes('@g.us') ? 'GRUP' : 'BELUM DISET')
        
        // Cek folder
        let folderExists = fs.existsSync(IMAGES_FOLDER)
        let imageCount = 0
        let imageFiles = []
        
        if (folderExists) {
            const files = fs.readdirSync(IMAGES_FOLDER)
            imageFiles = files.filter(f => {
                const ext = path.extname(f).toLowerCase()
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)
            })
            imageCount = imageFiles.length
        }
        
        const captionCount = getCaptionCount()
        
        let statusText = `📊 *STATUS AUTOPOST* 📊\n\n`
        statusText += `📡 Status: ${enabled ? '✅ AKTIF' : '❌ NONAKTIF'}\n`
        statusText += `🎯 Channel: ${channelId}\n`
        statusText += `📌 Tipe: ${channelType}\n`
        statusText += `⏰ Interval: ${interval} jam\n`
        statusText += `🖼️ Gambar: ${imageCount} file\n`
        statusText += `💬 Caption: ${captionCount} buah\n`
        statusText += `📁 Folder: ${IMAGES_FOLDER}\n`
        statusText += `📁 Folder exist: ${folderExists ? '✅' : '❌'}\n\n`
        
        if (imageCount > 0) {
            statusText += `📋 *Preview gambar:*\n`
            for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
                statusText += `> ${i+1}. ${imageFiles[i]}\n`
            }
            if (imageFiles.length > 5) {
                statusText += `> ...dan ${imageFiles.length - 5} lainnya\n`
            }
        }
        
        statusText += `\n> ${m.prefix}autopost test → kirim manual\n`
        
        return m.reply(statusText)
    }
    
    // ========== TEST ==========
    if (sub === 'test') {
        const channelId = db.data.autopost.channelId
        if (!channelId) {
            return m.reply(`❌ Channel belum diset! Pakai ${m.prefix}autopost set <jid>`)
        }
        
        await m.reply(`🕹️ *TESTING...*\n> Mencari gambar di folder: assets/zerotwo-random/`)
        
        const success = await sendRandomImage(sock, channelId)
        
        if (success) {
            return m.reply(`✅ *TEST ÉXITO*\n> Revisa tu canal, cariño~ 🦋`)
        } else {
            return m.reply(
                `❌ *TEST ERROR*\n\n` +
                `📁 *Folder:* assets/zerotwo-random/\n\n` +
                `💡 *Solusi:*\n` +
                `> 1. Cek apakah folder \`assets/zerotwo-random/\` ada\n` +
                `> 2. Cek apakah ada gambar (jpg/png/gif/webp) di dalamnya\n` +
                `> 3. Coba upload ulang gambarnya\n\n` +
                `🦋 *Zero Two:* "Inténtalo de nuevo, cariño~ 🎐"`
            )
        }
    }
    
    // ========== CAPTION ADD ==========
    if (sub === 'caption' && args[1] === 'add') {
        const newCaption = args.slice(2).join(' ')
        if (!newCaption) {
            return m.reply(`⚠️ Ingresa caption: ${m.prefix}autopost caption add "¡Hola, cariño~ ✨"`)
        }
        
        addCaption(newCaption)
        return m.reply(`✅ *CAPTION DITAMBAHKAN*\n\n> "${newCaption}"\n> Total caption: ${getCaptionCount()} buah 🦋`)
    }
    
    // ========== CAPTION LIST ==========
    if (sub === 'caption' && args[1] === 'list') {
        const allCaptions = getAllCaptions()
        let text = `💬 *DAFTAR CAPTION* 💬\n\n`
        
        for (let i = 0; i < Math.min(allCaptions.length, 20); i++) {
            text += `${i+1}. ${allCaptions[i].substring(0, 60)}${allCaptions[i].length > 60 ? '...' : ''}\n`
        }
        
        if (allCaptions.length > 20) {
            text += `\n> ...dan ${allCaptions.length - 20} caption lainnya`
        }
        
        text += `\n\n📊 Total: ${allCaptions.length} caption`
        return m.reply(text)
    }
    
    // ========== MENU DEFAULT ==========
    return m.reply(
        `🦋 *AUTO POST CHANNEL* 🦋\n\n` +
        `> ${m.prefix}autopost on → aktifkan\n` +
        `> ${m.prefix}autopost off → nonaktifkan\n` +
        `> ${m.prefix}autopost set <jid> → set channel\n` +
        `> ${m.prefix}autopost set <jam> → ubah interval\n` +
        `> ${m.prefix}autopost status → lihat status\n` +
        `> ${m.prefix}autopost test → kirim manual\n` +
        `> ${m.prefix}autopost caption add "teks" → tambah caption\n` +
        `> ${m.prefix}autopost caption list → lihat caption\n\n` +
        `📁 *Folder gambar:*\n` +
        `> assets/zerotwo-random/\n\n` +
        `💫 *Zero Two:* "¡Tu canal se llenará de vida, cariño~ 🎐"`
    )
}

export { pluginConfig as config, handler, startAutoPost, stopAutoPost };
