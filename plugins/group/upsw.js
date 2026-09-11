import { generateWAMessageContent, generateWAMessageFromContent } from "ourin"
import crypto from "crypto"

const pluginConfig = {
    name: 'upsw',
    alias: ['upstory','storygc', 'estadogc'],
    category: 'group',
    description: '𝖲𝗎𝖻ᧉ 𝗎𝗇 ᧉ𝗌ƚ⍺𝖽𝗈 ⍺𝗅 𝗀𝗋𝗎𝗉𝗈 (𝖻𝗈𝗋𝖽ᧉ ᥎ᧉ𝗋𝖽ᧉ)',
    usage: '.upsw <texto> / reply media',
    example: '.upsw ¡Hola a todos!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function sendGroupStatus(sock, jid, content) {
    const inside = await generateWAMessageContent(content, {
        upload: sock.waUploadToServer
    })

    const messageSecret = crypto.randomBytes(32)

    const msg = generateWAMessageFromContent(jid, {
        messageContextInfo: {
            messageSecret
        },
        groupStatusMessageV2: {
            message: {
                ...inside,
                messageContextInfo: {
                    messageSecret
                }
            }
        }
    }, {})

    await sock.relayMessage(jid, msg.message, {
        messageId: msg.key.id
    })
}

async function handler(m, { sock }) {

    if (!m.isGroup) {
        return m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `❌ *𝖤𝖱𝖱𝖮𝖱*\n\n` +
            `      ⚠️   𓈒 ◌ㅤ──    _𝖤𝗌ƚᧉ 𝖼𝗈𝗆⍺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗉𝗎ᧉ𝖽ᧉ 𝗎𝗌⍺𝗋𝗌ᧉ ᧉ𝗇 𝗀𝗋𝗎𝗉𝗈𝗌._\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }

    const text = m.text || ''
    let content = {}

    try {
        if (m.quoted && (m.quoted.isImage || m.quoted.isVideo)) {
            const buffer = await m.quoted.download()
            if (m.quoted.isImage) {
                content = {
                    image: buffer,
                    caption: text || ''
                }
            }
            if (m.quoted.isVideo) {
                content = {
                    video: buffer,
                    caption: text || ''
                }
            }
        }
        else if (m.isImage || m.isVideo) {
            const buffer = await m.download()
            if (m.isImage) {
                content = {
                    image: buffer,
                    caption: text || ''
                }
            }
            if (m.isVideo) {
                content = {
                    video: buffer,
                    caption: text || ''
                }
            }
        }
        else if (text) {
            content = {
                text: text,
                font: 0,
                backgroundColor: "#FF2E63"
            }
        }
        else {
            return m.reply(
                `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖤𝖲𝖳𝖠𝖣𝖮𝖲 𝖣𝖤 𝖦𝖱𝖴𝖯𝖮* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      ✨   𓈒 ◌ㅤ──    _¡𝖤𝗇𝗏í⍺ ⍺𝗅𝗀𝗈 𝗉⍺𝗋⍺ 𝗉𝗎𝖻𝗅ı𝖼⍺𝗋 ᧉ𝗇 ᧉ𝗅 ᧉ𝗌ƚ⍺𝖽𝗈 𝖽ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈!_\n\n` +
                `(•ૢ⚈͒⌄⚈͒•ૢ) *𝖢Ó𝖬𝖮 𝖴𝖲𝖠𝖱* 🌸\n` +
                `      💬   𓈒 ◌ㅤ──    > \`.upsw <texto>\`\n` +
                `      🖼️   𓈒 ◌ㅤ──    > 𝖱ᧉ𝗌𝗉𝗈𝗇𝖽ᧉ ⍺ 𝗎𝗇⍺ 𝗂𝗆⍺𝗀ᧉ𝗇 + \`.upsw\`\n` +
                `      🎥   𓈒 ◌ㅤ──    > 𝖱ᧉ𝗌𝗉𝗈𝗇𝖽ᧉ ⍺ 𝗎𝗇 𝗏𝗂𝖽ᧉ𝗈 + \`.upsw\`\n\n` +
                `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
            )
        }

        await sendGroupStatus(sock, m.chat, content)

        await m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `✅ *𝖤𝖲𝖳𝖠𝖣𝖮 𝖯𝖴𝖡𝖫𝖨𝖢𝖠𝖣𝖮*\n\n` +
            `      📡   𓈒 ◌ㅤ──    _¡𝖤𝗅 ᧉ𝗌ƚ⍺𝖽𝗈 𝗌ᧉ 𝗉𝗎𝖻𝗅ı𝖼ó 𝖼𝗈𝗇 é𝗑ıƚ𝗈!_\n` +
            `      💚   𓈒 ◌ㅤ──    _𝖤𝗅 í𝖼𝗈𝗇𝗈 𝖽ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈 ⍺𝗁𝗈𝗋⍺ ƚıᧉ𝗇ᧉ 𝗎𝗇 𝖻𝗈𝗋𝖽ᧉ ᥎ᧉ𝗋𝖽ᧉ._\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )

    } catch (err) {
        console.log(err)
        m.reply(
            `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
            `❌ *𝖤𝖱𝖱𝖮𝖱*\n\n` +
            `      ⚠️   𓈒 ◌ㅤ──    _𝖭𝗈 𝗌ᧉ 𝗉𝗎𝖽𝗈 𝗉𝗎𝖻𝗅ı𝖼⍺𝗋 ᧉ𝗅 ᧉ𝗌ƚ⍺𝖽𝗈._\n` +
            `      💡   𓈒 ◌ㅤ──    _𝖯𝗈𝗋 𝖿⍺𝗏𝗈𝗋, 𝗂𝗇ƚé𝗇ƚ⍺𝗅𝗈 𝖽ᧉ 𝗇𝗎ᧉ𝗏𝗈 𝗆á𝗌 ƚ⍺𝗋𝖽ᧉ._\n\n` +
            `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
        )
    }
}

export { pluginConfig as config, handler };
