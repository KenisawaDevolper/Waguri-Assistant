import config from '../../config.js';
import { getDatabase } from '../../src/lib/rimuru-database.js';
const pluginConfig = {
    name: 'antipm',
    alias: ['apm', 'nopm'],
    category: 'owner',
    description: 'Anti PM - solo ciertos números pueden escribir al bot (BLOQUEO REAL) con la estética Waguri Assistant 📵',
    usage: '.antipm <on/off/status>',
    example: '.antipm on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

// Crea nyimpen pelanggar dan counter
let pmViolations = new Map()

// Obtiene nomor yang boleh chat dari config
function getAllowedNumbers() {
    const allowed = []
    
    // Nomor bot sendiri
    if (config.bot?.number) {
        const botNum = config.bot.number.replace(/[^0-9]/g, '')
        if (botNum) allowed.push(botNum)
    }
    
    // Nomor owner (bisa array atau string)
    if (config.owner?.number) {
        if (Array.isArray(config.owner.number)) {
            for (const num of config.owner.number) {
                const cleanNum = num.toString().replace(/[^0-9]/g, '')
                if (cleanNum) allowed.push(cleanNum)
            }
        } else {
            const cleanNum = config.owner.number.toString().replace(/[^0-9]/g, '')
            if (cleanNum) allowed.push(cleanNum)
        }
    }
    
    // Elimina duplikat
    return [...new Set(allowed)]
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    
    if (!db.data.antipm) {
        db.data.antipm = {
            enabled: false,
            blockedUsuarios: []
        }
    }
    
    const allowedNumbers = getAllowedNumbers()
    
    if (sub === 'on') {
        db.data.antipm.enabled = true
        db.save()
        
        let daftarAllowed = ''
        for (const num of allowedNumbers) {
            daftarAllowed += `> • wa.me/${num}\n`
        }
        
        return m.reply(
            `🦋 *ANTI PM AKTIF* 🦋\n\n` +
            `> Zero Two: "¡Listo, cariño~ Ahora solo ${allowedNumbers.length} personas pueden escribirme! ✨\n\n` +
            `📋 *Daftar yang boleh chat:*\n${daftarAllowed}\n` +
            `💀 *Siapapun selain itu bakal diblokir ASLI di WhatsApp!*\n` +
            `⚠️ *Peringatan 3x chat → BLOKIR PERMANEN!*\n\n` +
            `💫 *Yosh!* ¡Ten cuidado, cariño~ 🎐`
        )
    }
    
    if (sub === 'off') {
        db.data.antipm.enabled = false
        db.save()
        
        return m.reply(
            `❌ *ANTI PM NONAKTIF* ❌\n\n` +
            `> Zero Two: "Hmph~ Vale, ahora todos pueden escribirme. ¡Pero no hagas cosas raras, cariño~ 🦋"`
        )
    }
    
    if (sub === 'status') {
        const blockedCount = db.data.antipm.blockedUsuarios?.length || 0
        
        let daftarAllowed = ''
        for (const num of allowedNumbers) {
            daftarAllowed += `> wa.me/${num}\n`
        }
        
        return m.reply(
            `🛡️ *STATUS ANTI PM* 🛡️\n\n` +
            `📊 Status: ${db.data.antipm.enabled ? '✅ AKTIF' : '❌ NONAKTIF'}\n` +
            `👑 Yang boleh chat: ${allowedNumbers.length} orang\n` +
            `🚫 Usuario diblokir (ASLI): ${blockedCount} orang\n\n` +
            `📋 *Daftar yang boleh chat:*\n${daftarAllowed}\n` +
            `> ${m.prefix}antipm on → aktifkan\n` +
            `> ${m.prefix}antipm off → nonaktifkan\n` +
            `> ${m.prefix}antipm unblock @user → buka blokir\n` +
            `> ${m.prefix}antipm blocklist → lihat daftar blokir`
        )
    }
    
    if (sub === 'blocklist') {
        const blockedList = db.data.antipm.blockedUsuarios || []
        
        if (blockedList.length === 0) {
            return m.reply(`📋 *DAFTAR BLOKIR*\n\n> Aún no hay números bloqueados cariño~ 🦋`)
        }
        
        let text = `🚫 *DAFTAR NOMOR DIBLOKIR* 🚫\n\n`
        for (let i = 0; i < blockedList.length; i++) {
            const num = blockedList[i].split('@')[0]
            text += `${i+1}. wa.me/${num}\n`
        }
        text += `\n> Total: ${blockedList.length} nomor diblokir ASLI!\n`
        text += `> ${m.prefix}antipm unblock @user → buka blokir`
        
        return m.reply(text)
    }
    
    if (sub === 'unblock') {
        const mention = m.mentionedJid?.[0]
        const targetNumber = m.args[1]?.replace(/[^0-9]/g, '')
        let target = mention || (targetNumber ? `${targetNumber}@s.whatsapp.net` : null)
        
        if (!target) {
            return m.reply(`⚠️ ¡Menciona al usuario que deseas desbloquear: ${m.prefix}antipm unblock @user\nAtau: ${m.prefix}antipm unblock 628xxxxxx`)
        }
        
        const blockedList = db.data.antipm.blockedUsuarios || []
        const index = blockedList.indexOf(target)
        
        if (index === -1) {
            return m.reply(`❌ Usuario @${target.split('@')[0]} gak ada di daftar blokiran~`, { mentions: [target] })
        }
        
        blockedList.splice(index, 1)
        db.data.antipm.blockedUsuarios = blockedList
        db.save()
        
        try {
            await sock.updateBlockStatus(target, 'unblock')
            console.log(`✅ AntiPM: ${target} berhasil diunblock`)
            
            return m.reply(`✅ *UNBLOCK ÉXITO*\n\n> @${target.split('@')[0]} sekarang bisa chat lagi~\n> Bloquea WhatsApp telah dibuka! 🦋`, { mentions: [target] })
        } catch (err) {
            console.error('Unblock error:', err)
            return m.reply(`⚠️ *UNBLOCK ERROR*\n\n> Error: ${err.message}\n> Inténtalo manualmente en WhatsApp, cariño~ 🦋`)
        }
    }
    
    let daftarAllowed = ''
    for (const num of allowedNumbers.slice(0, 3)) {
        daftarAllowed += `> wa.me/${num}\n`
    }
    if (allowedNumbers.length > 3) daftarAllowed += `> _dan ${allowedNumbers.length - 3} lainnya_\n`
    
    return m.reply(
        `🦋 *ANTI PM BOT* 🦋\n\n` +
        `> ${m.prefix}antipm on → aktifkan\n` +
        `> ${m.prefix}antipm off → nonaktifkan\n` +
        `> ${m.prefix}antipm status → lihat status\n` +
        `> ${m.prefix}antipm blocklist → lihat daftar blokir\n` +
        `> ${m.prefix}antipm unblock @user → buka blokir\n\n` +
        `📌 *Yang boleh chat:*\n${daftarAllowed}\n` +
        `🚫 *Sanksi:* Peringatan 3x → BLOKIR ASLI WhatsApp!\n\n` +
        `💫 *Zero Two:* "Los demás no lo intenten, ¿vale, cariño~? 🎐"`
    )
}

// LISTENER buat nangkep PM
async function setupAntiPMListener(sock) {
    console.log('🦋 Starting Anti-PM Listener (BLOKIR ASLI)...')
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0]
            if (!msg.message) return
            
            const chatId = msg.key.remoteJid
            if (!chatId || chatId.includes('@g.us')) return
            
            if (msg.key.fromMe) return
            
            const db = getDatabase()
            
            if (!db.data.antipm?.enabled) return
            
            const sender = msg.key.remoteJid
            const senderNumber = sender.split('@')[0]
            
            let text = msg.message?.conversation || 
                      msg.message?.extendedTextMessage?.text || 
                      msg.message?.imageMessage?.caption ||
                      '[Media]'
            
            const allowedNumbers = getAllowedNumbers()
            const isAllowed = allowedNumbers.includes(senderNumber)
            
            const botNumber = sock.user.id?.split(':')[0] || sock.user.id?.split('@')[0] || ''
            const isBotSelf = senderNumber === botNumber
            
            if (isAllowed || isBotSelf) {
                console.log(`✅ AntiPM skip: ${senderNumber} (${isAllowed ? 'allowed' : 'bot sendiri'})`)
                return
            }
            
            const isAlreadyBlocked = db.data.antipm.blockedUsuarios?.includes(sender)
            
            if (isAlreadyBlocked) {
                await sock.sendMessage(sender, {
                    text: `🦋 *ZERO TWO*: "Heh! ${senderNumber} ¡te he *BLOQUEADO DE VERDAD* en WhatsApp! 🗿\n\nNo intentes escribirme de nuevo, tu mensaje no me llegará~\n\n💀 *¡SI QUIERES QUE TE DESBLOQUEE, ESCRIBE AL NÚMERO AUTORIZADO!* 🎐"`
                })
                return
            }
            
            let violation = pmViolations.get(sender)
            if (!violation) {
                violation = {
                    count: 0,
                    firstTime: Date.now(),
                    messages: []
                }
            }
            
            const hoursSinceFirst = (Date.now() - violation.firstTime) / (1000 * 60 * 60)
            if (hoursSinceFirst > 24) {
                violation.count = 0
                violation.firstTime = Date.now()
                violation.messages = []
            }
            
            violation.messages.push(text)
            const currentCount = violation.count
            
            if (currentCount === 0) {
                let daftarAllowed = ''
                for (const num of allowedNumbers.slice(0, 2)) {
                    daftarAllowed += `wa.me/${num} `
                }
                
                await sock.sendMessage(sender, {
                    text: `🦋 *ZERO TWO SAYS* 🦋\n\n` +
                          `"Heh! ${senderNumber} no me escribas~ 🗿\n\n` +
                          `¡Estoy en *MODO ANTI-MP*! ✨\n` +
                          `¡Solo ${allowedNumbers.length} personas pueden escribirme!\n` +
                          `Yaitu: ${daftarAllowed}\n\n` +
                          `⚠️ *PERINGATAN 1/3*\n` +
                          `¡Si me escribes 2 veces más, tu número será *BLOQUEADO DE VERDAD* en WhatsApp!\n\n` +
                          `💀 *INI PERINGATAN TERAKHIR!* 🎐`
                })
                
                violation.count++
                pmViolations.set(sender, violation)
                console.log(`⚠️ AntiPM: ${senderNumber} peringatan 1/3`)
                
            } else if (currentCount === 1) {
                violation.count++
                pmViolations.set(sender, violation)
                
                await sock.sendMessage(sender, {
                    text: `🚨 *ZERO TWO - PERINGATAN TERAKHIR* 🚨\n\n` +
                          `"${senderNumber}! GW BILANG JANGAN CHAT!! 🗿\n\n` +
                          `Ini udah *PERINGATAN KE-2*!\n` +
                          `SEKALI LAGI lo chat, nomormu bakal gw *BLOKIR ASLI*!\n\n` +
                          `⚠️ *SISA KESEMPATAN: 1 KALI SAJA!*\n` +
                          `💀 *JANGAN COBA-COBA ATAU KAMU BLOKIR PERMANEN!*`
                })
                
                console.log(`⚠️ AntiPM: ${senderNumber} peringatan 2/3`)
                
            } else if (currentCount >= 2) {
                violation.count++
                pmViolations.set(sender, violation)
                
                await sock.sendMessage(sender, {
                    text: `💀 *ZERO TWO - KAMU DIBLOKIR ASLI!* 💀\n\n` +
                          `"SUDAH GW BILANG JANGAN CHAT!! 🗿\n\n` +
                          `¡Ya me has escrito *${violation.count} veces* aunque te avisé 2 veces!\n` +
                          `¡Solo ${allowedNumbers.length} números pueden escribirme, y tú NO eres uno de ellos!\n\n` +
                          `🚫 *NOMORMU SEKARANG DIBLOKIR ASLI DI WHATSAPP!*\n` +
                          `💀 *KAMU GAK BISA CHAT KE BOT LAGI SELAMANYA!*\n\n` +
                          `¡Bye bye~ No vuelvas, cariño~ 🦋`
                })
                
                if (!db.data.antipm.blockedUsuarios) db.data.antipm.blockedUsuarios = []
                if (!db.data.antipm.blockedUsuarios.includes(sender)) {
                    db.data.antipm.blockedUsuarios.push(sender)
                    db.save()
                }
                
                try {
                    await sock.updateBlockStatus(sender, 'block')
                    console.log(`🚫 AntiPM: ${senderNumber} ÉXITO DIBLOKIR ASLI di WhatsApp!`)
                    
                    for (const allowedNum of allowedNumbers) {
                        try {
                            const allowedJid = `${allowedNum}@s.whatsapp.net`
                            await sock.sendMessage(allowedJid, {
                                text: `💀 *ANTI PM - BLOKIR ASLI* 💀\n\n` +
                                      `✅ *Usuario diblokir:* ${senderNumber}\n` +
                                      `📊 *Total chat:* ${violation.count} kali\n` +
                                      `📝 *Mensaje terakhir:* ${text.slice(0, 100)}\n` +
                                      `⏰ *Hora:* ${new Date().toLocaleString()}\n\n` +
                                      `🔒 *Status:* BLOKIR ASLI WhatsApp!\n` +
                                      `💀 *Usuario no bisa chat ke bot lagi!*\n\n` +
                                      `🦋 *Zero Two:* "¡Listo, cariño! Ya no molestará más~ 🗿🔥"`
                            })
                        } catch (err) {}
                    }
                    
                } catch (err) {
                    console.error(`Error blokir asli ${senderNumber}:`, err)
                    
                    for (const allowedNum of allowedNumbers) {
                        try {
                            const allowedJid = `${allowedNum}@s.whatsapp.net`
                            await sock.sendMessage(allowedJid, {
                                text: `⚠️ *ERROR BLOKIR ASLI* ⚠️\n\n` +
                                      `> Usuario: ${senderNumber}\n` +
                                      `> Error: ${err.message}\n\n` +
                                      `> Quizás necesites bloquear manualmente, cariño~ 🦋`
                            })
                        } catch (err) {}
                    }
                }
            }
            
        } catch (err) {
            console.error('AntiPM listener error:', err)
        }
    })
    
    const allowedNumbers = getAllowedNumbers()
    console.log('✅ Anti-PM Listener READY! 🦋')
    console.log(`   👑 Allowed users: ${allowedNumbers.join(', ')}`)
    console.log(`   🔒 Block mode: BLOKIR ASLI WHATSAPP!`)
}

export { pluginConfig as config, handler, setupAntiPMListener };
