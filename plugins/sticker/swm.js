import config from '../../config.js'
import te from '../../src/lib/rimuru-error.js'
import { addExifToWebp, isAnimatedWebp, DEFAULT_METADATA } from '../../src/lib/rimuru-exif.js'

const pluginConfig = {
    name: 'swm',
    alias: ['wm', 'stickerwm', 'stickermark', 'colong'],
    category: 'sticker',
    description: 'Cambia el nombre del paquete y autor de un sticker estilo Waguri',
    usage: '.swm <paquete> o .swm <paquete>|<autor>',
    example: '.swm Waguri Bot|Creador',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock, config: botConfig }) {
    const quoted = m.quoted
    
    if (!quoted) {
        return m.reply(
            `ꕥ 𝖶𝖠𝖳𝖤𝖱𝖬𝖠𝖱𝖪 𝖣𝖤 𝖲𝖳𝖨𝖢𝖪𝖤𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Responde a un sticker con:\n` +
            `        \`${m.prefix}swm <paquete>\`\n` +
            `        \`${m.prefix}swm <paquete>|<autor>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
            `      • \`${m.prefix}swm Waguri Assistant\`\n` +
            `      • \`${m.prefix}swm Waguri Assistant|Bot\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    const isSticker = quoted.type === 'stickerMessage' || quoted.isSticker
    if (!isSticker) {
        return m.reply(
            `ꕥ 𝖠𝖱𝖢𝖧𝖨𝖵𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Por favor, responde únicamente a un mensaje de sticker. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    const input = m.text?.trim()
    if (!input) {
        return m.reply(
            `ꕥ 𝖥𝖠𝖫𝖳𝖠𝖭 𝖣𝖠𝖳𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ingresa el nombre del paquete o del autor que deseas asignarle al sticker. »\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
            `      • \`${m.prefix}swm Waguri Assistant\`\n` +
            `      • \`${m.prefix}swm Waguri Assistant|Bot\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
    
    let packname, author
    
    if (input.includes('|')) {
        const parts = input.split('|')
        packname = parts[0]?.trim() || ''
        author = parts[1]?.trim() || ''
    } else {
        packname = input
        author = ''
    }
    
    await m.react('🕕')
    
    try {
        const buffer = await quoted.download()
        
        if (!buffer || buffer.length === 0) {
            await m.react('❌')
            return m.reply(
                `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖣𝖤𝖲𝖢𝖠𝖱𝖦𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al descargar el sticker seleccionado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }
        
        const exifOpts = { packname, author, emojis: ['🤖'] }
        const riff = buffer.slice(0, 4).toString('ascii')
        const webpSig = buffer.length >= 12 ? buffer.slice(8, 12).toString('ascii') : ''
        const isWebp = riff === 'RIFF' && webpSig === 'WEBP'
        
        if (isWebp) {
            const stickerBuffer = await addExifToWebp(buffer, exifOpts)
            await sock.sendMessage(m.chat, {
                sticker: stickerBuffer,
                contextInfo: { isForwarded: true, forwardingScore: 1 }
            }, { quoted: m })
        } else {
            const isVideo = buffer.slice(0, 3).toString('hex') === '000000' ||
                            buffer.slice(4, 8).toString('ascii') === 'ftyp'
            
            if (isVideo) {
                await sock.sendVideoAsSticker(m.chat, buffer, m, exifOpts)
            } else {
                await sock.sendImageAsSticker(m.chat, buffer, m, exifOpts)
            }
        }
        
        await m.react('✅')
        
    } catch (error) {
        console.error('[SWM] Error:', error.message)
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
