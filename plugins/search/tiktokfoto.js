import axios from 'axios'
import crypto from 'crypto'
import { generateWAMessage, generateWAMessageFromContent, jidNormalizedUsuario } from 'ourin'
import config from '../../config.js'
import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: 'tiktokfoto',
    alias: ['ttfoto', 'ttphotosearch', 'searchtiktokfoto'],
    category: 'search',
    description: 'Busca fotografías/carruseles de TikTok y envía el álbum apilado con estilo Waguri Assistant',
    usage: '.tiktokfoto <búsqueda>',
    example: '.tiktokfoto cosplay',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const CUKI_APIKEY = config.APIkey?.cuki || 'cuki-x'

function formatNumber(n) {
    const value = Number(n) || 0
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
    return value.toString()
}

function trimText(text, max = 180) {
    const value = (text || '').replace(/\s+/g, ' ').trim()
    if (!value) return '-'
    if (value.length <= max) return value
    return value.slice(0, max) + '...'
}

async function fetchTiktokFoto(query) {
    const { data } = await axios.get(
        `https://api.cuki.biz.id/api/search/tiktokfoto?apikey=${encodeURIComponent(CUKI_APIKEY)}&query=${encodeURIComponent(query)}`,
        {
            timeout: 30000,
            headers: {
                'x-api-key': CUKI_APIKEY,
                'user-agent': 'Mozilla/5.0'
            }
        }
    )

    if (!data?.success || !data?.data?.results?.length) {
        throw new Error(data?.message || 'Fotos de TikTok no encontradas')
    }

    return data.data
}

async function handler(m, { sock }) {
    const query = m.args?.join(' ')?.trim() || m.text?.trim()

    if (!query) {
        return m.reply(
            `ꕥ 𝖡𝖴𝖲𝖰𝖴𝖤𝖣𝖠 𝖣𝖤 𝖥𝖮𝖳𝖮𝖲 𝖣𝖤 𝖳𝖨𝖪𝖳𝖮𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      • Comando :: \`${m.prefix}tiktokfoto <texto>\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
            `      • \`${m.prefix}tiktokfoto cosplay\`\n` +
            `      • \`${m.prefix}tiktokfoto aesthetic wallpaper\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    await m.react('🕕')

    try {
        const result = await fetchTiktokFoto(query)
        const post = result.results[0]
        const images = Array.isArray(post?.images) ? post.images.slice(0, 10) : []

        if (!post || images.length === 0) {
            await m.react('❌')
            return m.reply(
                `ꕥ 𝖲𝖨𝖭 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se encontraron fotografías de TikTok para tu búsqueda. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }

        const caption = 
            `ꕥ 𝖳𝖨𝖪𝖳𝖮𝖪 𝖯𝖧𝖮𝖳𝖮 𝖲𝖤𝖠𝖱𝖢𝖧 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
            `      • Búsqueda :: ${result.query || query}\n` +
            `      • Título :: ${trimText(post.title || post.description, 100)}\n` +
            `      • Creador :: ${post.author?.nickname || 'Anónimo'}\n` +
            `      • Región :: ${post.region || 'Desconocida'}\n` +
            `      • Fotos :: ${post.image_count || images.length}\n` +
            `      • Me gusta :: ${formatNumber(post.stats?.like)}\n` +
            `      • Comentarios :: ${formatNumber(post.stats?.comment)}\n` +
            `      • Compartidos :: ${formatNumber(post.stats?.share)}\n` +
            `      • ID :: ${post.id || '-'}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ${trimText(post.description || post.title, 200)} »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`

        await m.reply(caption)

        const mediaList = []
        for (const url of images) {
            try {
                const imageRes = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 20000,
                    headers: {
                        'user-agent': 'Mozilla/5.0'
                    }
                })
                const buffer = Buffer.from(imageRes.data)
                if (buffer.length > 1000) {
                    mediaList.push({ image: buffer })
                }
            } catch {}
        }

        if (mediaList.length === 0) {
            await m.react('❌')
            return m.reply(
                `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `gh៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudieron descargar las imágenes de la publicación. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }

        try {
            const opener = generateWAMessageFromContent(
                m.chat,
                {
                    messageContextInfo: { messageSecret: crypto.randomBytes(32) },
                    albumMessage: {
                        expectedImageCount: mediaList.length,
                        expectedVideoCount: 0
                    }
                },
                {
                    userJid: jidNormalizedUsuario(sock.user.id),
                    quoted: m,
                    upload: sock.waUploadToServer
                }
            )

            await sock.relayMessage(opener.key.remoteJid, opener.message, {
                messageId: opener.key.id
            })

            for (const content of mediaList) {
                const msg = await generateWAMessage(opener.key.remoteJid, content, {
                    upload: sock.waUploadToServer
                })

                msg.message.messageContextInfo = {
                    messageSecret: crypto.randomBytes(32),
                    messageAssociation: {
                        associationType: 1,
                        parentMessageKey: opener.key
                    }
                }

                await sock.relayMessage(msg.key.remoteJid, msg.message, {
                    messageId: msg.key.id
                })
            }
        } catch {
            for (const content of mediaList) {
                await sock.sendMessage(m.chat, content, { quoted: m })
            }
        }

        await m.react('✅')
    } catch (error) {
        console.error('[TikTok Foto Search Error]:', error?.message || error)
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
