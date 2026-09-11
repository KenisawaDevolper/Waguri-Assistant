import { getParticipantJids } from '../../src/lib/rimuru-lid.js'
import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: ['ht', 'hidetag', 'notify'],
    category: 'group',
    description: 'Difunde mensajes u ocultas etiquetas (hidetag) a todos los miembros con soporte para texto y archivos multimedia por respuesta.',
    usage: '.ht [texto] o responde a un mensaje',
    example: '.ht Buenos días a todos',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const mentions = getParticipantJids(participants)

        const quoted = m.quoted
        const text = m.fullArgs?.trim()

        // ===== MODO RESPUESTA (QUOTED) =====
        if (quoted) {
            const qMsg = quoted.message || {}
            const type = Object.keys(qMsg)[0]

            // ===== IMAGEN =====
            if (type === 'imageMessage') {
                const media = await quoted.download()
                const caption = qMsg.imageMessage?.caption || text || ''

                return sock.sendMessage(m.chat, {
                    image: media,
                    caption,
                    mentions
                })
            }

            // ===== VIDEO =====
            if (type === 'videoMessage') {
                const media = await quoted.download()
                const caption = qMsg.videoMessage?.caption || text || ''

                return sock.sendMessage(m.chat, {
                    video: media,
                    caption,
                    mentions
                })
            }

            // ===== STICKER =====
            if (type === 'stickerMessage') {
                const media = await quoted.download()

                await sock.sendMessage(m.chat, {
                    sticker: media,
                    mentions
                })

                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
                }
                return
            }

            // ===== AUDIO =====
            if (type === 'audioMessage') {
                const media = await quoted.download()
                const audioMsg = qMsg.audioMessage || {}

                await sock.sendMessage(m.chat, {
                    audio: media,
                    mimetype: audioMsg.mimetype,
                    ptt: audioMsg.ptt || false,
                    mentions
                })

                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
                }
                return
            }

            // ===== DOCUMENTO =====
            if (type === 'documentMessage') {
                const media = await quoted.download()
                const docMsg = qMsg.documentMessage || {}

                await sock.sendMessage(m.chat, {
                    document: media,
                    mimetype: docMsg.mimetype,
                    fileName: docMsg.fileName || 'archivo',
                    mentions
                })

                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
                }
                return
            }

            // ===== TEXTO / OTROS =====
            const quotedText =
                quoted.text ||
                qMsg.conversation ||
                qMsg.extendedTextMessage?.text ||
                ''

            const finalText = text || quotedText

            if (!finalText) {
                return m.reply(
                    `ꕥ 𝖢𝖮𝖭𝖳𝖤𝖭𝖨𝖣𝖮 𝖵𝖠𝖢𝖨𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El mensaje citado o de texto adjunto se encuentra completamente vacío. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                )
            }

            return sock.sendMessage(m.chat, {
                text: finalText,
                mentions
            })
        }

        if (!text) {
            return m.reply(
                `ꕥ 𝖲𝖨𝖭 𝖳𝖤𝖷𝖳𝖮 𝖣𝖤 𝖣𝖨𝖥𝖴𝖲𝖨𝖀́𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      • Uso por comando :: \`${m.prefix}ht <tu mensaje>\`\n` +
                `      • Uso por respuesta :: Responde a cualquier mensaje multimedia o texto + \`${m.prefix}ht\`\n\n` +
                `      𓈒 ◌ㅤ──    *𝖥𝖮𝖱𝖬𝖠𝖳𝖮𝖲 𝖲𝖮𝖯𝖮𝖱𝖳𝖠𝖣𝖮𝖲*\n` +
                `      • Texto plano, Imágenes, Vídeos, Stickers, Audios/VN y Documentos.\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Proporciona texto o un contenido multimedia para realizar la notificación masiva. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }

        await sock.sendMessage(m.chat, {
            text,
            mentions
        }, { quoted: m })

    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
