import { webp2mp4 } from '../../src/lib/megami/webp2mp4.js'
import { ffmpeg } from '../../src/lib/megami/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) {
        return m.reply(
            `ꕥ 𝖢𝖮𝖭𝖵𝖤𝖱𝖲𝖨𝖮𝖭 𝖠 𝖵𝖨𝖣𝖤𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Uso :: Responde a un sticker o archivo de audio con:\n` +
            `        \`${usedPrefix + command}\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    let mime = m.quoted.mimetype || ''
    if (!/webp|audio/.test(mime)) {
        return m.reply(
            `ꕥ 𝖠𝖱𝖢𝖧𝖨𝖵𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Por favor, responde únicamente a un sticker o a un archivo de audio para convertirlo en video. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    await m.react('🕕')

    try {
        let media = await m.quoted.download()
        let out = Buffer.alloc(0)

        if (/webp/.test(mime)) {
            out = await webp2mp4(media)
        } else if (/audio/.test(mime)) {
            out = await ffmpeg(media, [
                '-filter_complex', 'color',
                '-pix_fmt', 'yuv420p',
                '-crf', '51',
                '-c:a', 'copy',
                '-shortest'
            ], 'mp3', 'mp4')
        }

        let caption = 
            `ꕥ 𝖢𝖮𝖭𝖵𝖤𝖱𝖲𝖨𝖮𝖭 𝖢𝖮𝖬𝖯𝖫𝖤𝖳𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Tu archivo se ha convertido exitosamente a video! »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

        await conn.sendFile(m.chat, out, 'out.mp4', caption, m, 0, { thumbnail: out })
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        return m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al procesar y convertir el archivo multimedia. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
}

handler.help = ['tovideo']
handler.tags = ['sticker']
handler.command = ['tovideo', 'tomp4']
handler.register = true
handler.limit = 2

export default handler
