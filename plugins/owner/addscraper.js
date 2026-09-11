import fs from 'fs'
import path from 'path'
import { downloadContentFromMessage } from "ourin"

const pluginConfig = {
    name: 'addscraper',
    alias: ['addscraper', 'newscraper', 'createscraper', 'tambahscraper'],
    category: 'owner',
    description: 'Añade un nuevo scraper a src/scraper/ con la estética Waguri Assistant (Solo Owner) 🔧',
    usage: '.addscraper <nombre>',
    example: '.addscraper konchan\n\nResponde al mensaje que contiene el código del scraper',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function isValidScraperName(name) {
    return /^[a-zA-Z0-9_]+$/.test(name)
}

function getExistingScrapers(scraperDir) {
    if (!fs.existsSync(scraperDir)) return []
    const files = fs.readdirSync(scraperDir)
    return files.filter(file => file.endsWith('.js') && !file.includes('.backup')).map(file => file.replace('.js', ''))
}

async function handler(m, { sock }) {
    let code = null
    let name = null
    
    // Obtiene nama dari command
    const args = m.text?.split(/\s+/) || []
    if (args.length > 1) {
        name = args[1].toLowerCase()
    }
    
    // 🔥 PERBAIKAN: Deteksi reply con lebih baik
    let quotedMsg = m.quoted || (m.message?.extendedTextMessage?.contextInfo?.quotedMessage)
    
    if (quotedMsg) {
        console.log('[AddScraper] Ada quoted message detected')
        
        // Cek dari text message
        if (quotedMsg.conversation) {
            code = quotedMsg.conversation.trim()
            console.log('[AddScraper] Dapet dari conversation, length:', code.length)
        }
        // Cek dari extendedTextMessage
        else if (quotedMsg.extendedTextMessage?.text) {
            code = quotedMsg.extendedTextMessage.text.trim()
            console.log('[AddScraper] Dapet dari extendedTextMessage, length:', code.length)
        }
        // Cek dari documentMessage (file)
        else if (quotedMsg.documentMessage) {
            const doc = quotedMsg.documentMessage
            const fileName = doc.fileName || ''
            console.log('[AddScraper] Dapet file:', fileName)
            
            if (!fileName.endsWith('.js')) {
                return m.reply(`💔 *Error!* El archivo debe tener extensión .js, cariño~ 💫\n\nEnviaste: ${fileName}`)
            }
            
            try {
                const stream = await downloadContentFromMessage(doc, 'document')
                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                code = buffer.toString('utf-8')
                console.log('[AddScraper] File loaded, length:', code.length)
            } catch (err) {
                console.error('[AddScraper] Error download file:', err)
                return m.reply(`💔 *¡Error al descargar el archivo!*\n\n${err.message}`)
            }
        }
        // Cek dari imageMessage (gambar) -> error
        else if (quotedMsg.imageMessage) {
            return m.reply(`💔 *Error!* Debes responder con TEXTO o ARCHIVO .js, no con una imagen, cariño~ 💫`)
        }
    } else {
        console.log('[AddScraper] No ada quoted message')
    }
    
    // 🔥 PERBAIKAN: Kalo masih ga dapet code, cek dari command langsung
    // Format: .addscraper namascraper // kode disini
    if (!code && args.length > 2) {
        code = args.slice(2).join(' ')
        console.log('[AddScraper] Dapet dari command text, length:', code.length)
    }
    
    // 🔥 PERBAIKAN: Kalo masih ga dapet, cek dari m.text setelah command
    if (!code && m.text) {
        const match = m.text.match(/\.addscraper\s+\w+\s+([\s\S]+)/)
        if (match) {
            code = match[1].trim()
            console.log('[AddScraper] Dapet dari regex match, length:', code.length)
        }
    }
    
    // Muestra menu kalo kurang
    if (!code || !name) {
        const scraperDir = path.join(process.cwd(), 'src', 'scraper')
        const existingScrapers = getExistingScrapers(scraperDir)
        
        let statusMsg = !code ? '❌ Kode scraper no encontrado!' : '❌ Nombre del scraper no encontrado!'
        
        return m.reply(
`💕 *ZERO TWO - ADD SCRAPER* 💕

┌────────────────────┐
│ ⚠️ *${statusMsg}*
│
│ 📌 *Cara Pakai (Pilih salah satu):*
│
│ 1️⃣ *Reply pesan + command:*
│    [Reply kode scraper]
│    .addscraper hdvid
│
│ 2️⃣ *Command langsung + kode:*
│    .addscraper hdvid
│    const axios = require('axios')
│    async function hdvid(url) {
│        return { data: 'test' }
│    }
│    module.exports = { hdvid }
│
│ 📌 *Nama Valid:*
│ huruf, angka, _
│ Ejemplo: hdvid, anime_v2
└────────────────────┘

📁 *Scraper Aktif:*
${existingScrapers.length > 0 ? existingScrapers.slice(0, 15).map(s => `│ • ${s}.js`).join('\n') : '│ • Aún no ada'}
${existingScrapers.length > 15 ? `│ • ...dan ${existingScrapers.length - 15} lainnya` : ''}

💕 *Zero Two:* Prueba la 2ª forma, escribe el código justo después del comando, cariño~ 🦋`
        )
    }
    
    // Validasi nama
    if (!isValidScraperName(name)) {
        return m.reply(
`💔 *INVALID NAME!*

┌────────────────────┐
│ Nama hanya boleh:  │
│ • Huruf a-z        │
│ • Angka 0-9        │
│ • Underscore _     │
└────────────────────┘

❌ Nama: \`${name}\`

💕 Inténtalo de nuevo, cariño~ 🦋`
        )
    }
    
    // Validasi minimal kode (harus ada isinya)
    if (code.length < 20) {
        return m.reply(
`💔 *KODE TERLALU PENDEK!*

┌────────────────────┐
│ Tu código scraper  │
│ hanya ${code.length} karakter.│
│ Minimal 20 karakter.│
│                    │
│ Asegúrate de responder│
│ pesan yang berisi  │
│ kode scraper ya    │
└────────────────────┘

💕 Inténtalo de nuevo, cariño~ 🦋`
        )
    }
    
    await m.react('📝')
    
    try {
        const scraperDir = path.join(process.cwd(), 'src', 'scraper')
        
        if (!fs.existsSync(scraperDir)) {
            fs.mkdirSync(scraperDir, { recursive: true })
        }
        
        const filePath = path.join(scraperDir, `${name}.js`)
        const exists = fs.existsSync(filePath)
        
        // Backup kalo ada
        if (exists) {
            const backupPath = path.join(scraperDir, `${name}.backup.${Date.now()}.js`)
            fs.copyFileSync(filePath, backupPath)
            console.log(`[AddScraper] Backup created: ${backupPath}`)
        }
        
        // Format kode - pastikan ada module.exports
        let finalCode = code
        if (!code.includes('module.exports') && !code.includes('exports.')) {
            finalCode = `// Scraper: ${name}\n// Creado: ${new Date().toLocaleString()}\n\n${code}\n\nmodule.exports = { ${name} }`
        }
        
        // Tulis file
        fs.writeFileSync(filePath, finalCode, 'utf-8')
        
        const lines = finalCode.split('\n').length
        const size = (Buffer.byteLength(finalCode, 'utf-8') / 1024).toFixed(2)
        
        await m.reply(
`✅ *SCRAPER ÉXITO!*

┌────────────────────┐
│ 📋 *Info:*
│ • Nama: ${name}.js
│ • Lokasi: src/scraper/
│ • Baris: ${lines}
│ • Tamaño: ${size} KB
│ • Status: ${exists ? 'Updated' : 'New'}
└────────────────────┘

💕 *Zero Two:* ¡El scraper ${name} está listo para usar, cariño~ ✨

🦋 *Jangan lupa restart bot biar langsung aktif!*`
        )
        
        await m.react('✅')
        
    } catch (err) {
        console.error('[AddScraper] Error:', err)
        await m.react('💔')
        await m.reply(
`💔 *ERROR MENYIMPAN!*

┌────────────────────┐
│ ❌ ${err.message.substring(0, 60)}
└────────────────────┘

💕 Inténtalo de nuevo, cariño~ 🦋`
        )
    }
}

export { pluginConfig as config, handler };
