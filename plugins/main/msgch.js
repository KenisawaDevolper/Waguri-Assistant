import { downloadContentFromMessage } from 'ourin'

let handler = async (m, { conn, text }) => {
    const idch = '120363409285330747@newsletter'
    const who = m.sender

    const q = m.quoted ? m.quoted : m
    const mime = q.mimetype || ''

    if (!text && !mime) {
        throw `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖢𝖮𝖱𝖱𝖤𝖢𝖳𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
              `      • Ejemplo :: *.msgch Hola* (o responde a una imagen/video/audio)\n\n` +
              `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    }

    let url
    try {
        url = await conn.profilePictureUrl(who, 'image')
    } catch {
        url = null
    }

    let content = {}

    try {
        const msg = q.msg || q
        const type = Object.keys(msg)[0]

        // Convierte stickers a imagen para evitar rechazos en el canal
        if (type === 'stickerMessage') {
            let stream = await downloadContentFromMessage(msg.stickerMessage, 'sticker')
            let buffer = Buffer.from([])

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            content = {
                image: buffer,
                caption: text || ''
            }

        } else if (type === 'imageMessage') {
            let media = await q.download()
            content = { image: media, caption: text || '' }

        } else if (type === 'videoMessage') {
            let media = await q.download()
            content = { video: media, caption: text || '' }

        } else if (type === 'audioMessage') {
            let media = await q.download()
            content = {
                audio: media,
                mimetype: 'audio/mpeg',
                ptt: true
            }

        } else {
            content = { text: text || '' }
        }

    } catch (e) {
        console.error(e)
        content = { text: text || '[Error al procesar el archivo multimedia]' }
    }

    content.contextInfo = {
        externalAdReplyOffOffOff: {
            thumbnailUrl: url,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false
        }
    }

    try {
        await conn.sendMessage(idch, content)

        await m.reply(
            `ꕥ 𝖬𝖤𝖭𝖲𝖠𝖩𝖤 𝖤𝖭𝖵𝖨𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El contenido ha sido publicado exitosamente en el canal. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )

    } catch (err) {
        console.error(err)

        await m.reply(
            `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖠𝖫 𝖤𝖭𝖵𝖨𝖠𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo publicar el mensaje en el canal (formato no compatible o error de permisos). »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }
}

handler.help = ['msgch']
handler.tags = ['owner']
handler.command = /^msgch$/i
handler.premium = true
handler.mods = true

export default handler
