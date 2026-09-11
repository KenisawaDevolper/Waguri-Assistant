import { getDatabase } from '../../src/lib/rimuru-database.js'

const pluginConfig = {
    name: 'mute',
    alias: ['bisukan'],
    category: 'group',
    description: 'Silencia el grupo de manera temporal (restringe el envío de mensajes solo a administradores).',
    usage: '.mute',
    example: '.mute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject
    const senderNumber = m.sender.split('@')[0]

    if (group.mute) {
        return m.reply(
            `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖸𝖠 𝖲𝖨𝖫𝖤𝖭𝖢𝖨𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El chat grupal ya se encuentra bajo estado de silencio (mute) activo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    db.setGroup(m.chat, { ...group, mute: true })

    try { await m.react('🔇'); } catch {}

    return m.reply(
        `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖲𝖨𝖫𝖤𝖭𝖢𝖨𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Grupo :: *${groupName}*\n` +
        `      • Ejecutado por :: *@${senderNumber}*\n` +
        `      • Restricción :: *Solo administradores pueden enviar mensajes*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Escribe \`${m.prefix}unmute\` para restablecer la comunicación libre de todos los miembros. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
        { mentions: [m.sender] }
    )
}

function isMuted(groupJid, db) {
    const group = db.getGroup(groupJid) || {}
    return !!group.mute
}

export { pluginConfig as config, handler, isMuted }
