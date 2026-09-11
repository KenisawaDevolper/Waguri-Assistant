import fs from 'fs'
import path from 'path'
import te from '../../src/lib/rimuru-error.js'
const pluginConfig = {
    name: 'clearsessions',
    alias: ['clearsession', 'delsession', 'delsessions'],
    category: 'owner',
    description: 'Gestiona la función clearsessions con la estética Waguri Assistant ⚙️',
    usage: '.clearsessions',
    example: '.clearsessions',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m)  {
    const sessionsPath = path.join(process.cwd(), 'storage', 'sessions')
    
    if (!fs.existsSync(sessionsPath)) {
        return m.reply(`❌ Folder sessions no encontrado!`)
    }
    
    await m.react('🗑️')
    
    try {
        const files = fs.readdirSync(sessionsPath)
        
        if (files.length === 0) {
            return m.reply(`📁 Folder sessions sudah kosong!`)
        }
        
        let deleted = 0
        let skipped = 0
        
        for (const file of files) {
            if (file === 'creds.json') {
                skipped++
                continue
            }
            
            const filePath = path.join(sessionsPath, file)
            try {
                const stat = fs.statSync(filePath)
                if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true })
                } else {
                    fs.unlinkSync(filePath)
                }
                deleted++
            } catch {}
        }
        
        await m.react('✅')
        await m.reply(
            `╭┈┈⬡「 🗑️ *ᴄʟᴇᴀʀ sᴇssɪᴏɴs* 」
┃
┃ ㊗ ᴅᴇʟᴇᴛᴇᴅ: *${deleted}* file
┃ ㊗ sᴋɪᴘᴘᴇᴅ: *${skipped}* file
┃ ㊗ ɴᴏᴛᴇ: creds.json no eliminado
┃
╰┈┈⬡

> _Session files berhasil dibersihkan!_
> _Restart bot jika diperlukan._`
        )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }