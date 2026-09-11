import { getDatabase } from '../../src/lib/rimuru-database.js'
import { isLid, lidToJid, resolveAnyLidToJid } from '../../src/lib/rimuru-lid.js'

const pluginConfig = {
    name: 'mutemember',
    alias: ['mutmember', 'silentmember', 'bisukanmember'],
    category: 'group',
    description: 'Silencia individualmente a un miembro específico (el bot eliminará automáticamente todos sus mensajes enviados).',
    usage: '.mutemember <@tag / reply / número>',
    example: '.mutemember @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (m.mentionedJid?.length) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (isLid(raw)) raw = lidToJid(raw)
    if (!raw.includes('@')) raw = raw.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    return raw
}

async function handler(m, { sock }) {
    const targetJid = resolveTarget(m)

    if (!targetJid) {
        return m.reply(
            `ꕥ 𝖲𝖨𝖭 𝖮𝖡𝖩𝖤𝖳𝖨𝖵𝖮 𝖣𝖤𝖲𝖨𝖦𝖭𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}mutemember @user\`\n` +
            `      • Alternativas :: Responde a su mensaje o indica su número.\n\n` +
            `      𓈒 ◌ㅤ──    *ℹ️ 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖲𝖨𝖫𝖤𝖭𝖢𝖨𝖮*\n` +
            `      • Los mensajes enviados por el miembro silenciado serán borrados de inmediato por el bot.\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Proporciona un usuario válido para aplicar la restricción de silencio. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    const targetNumber = targetJid.replace(/@.+/g, '')

    if (m.isGroup) {
        const isTargetAdmin = m.groupMetadata?.participants?.some(p => {
            const pJid = (p.id || p.jid || '').replace(/@.+/g, '')
            return pJid === targetNumber && (p.admin === 'admin' || p.admin === 'superadmin')
        })
        if (isTargetAdmin) {
            return m.reply(
                `ꕥ 𝖯𝖱𝖮𝖳𝖤𝖢𝖢𝖨𝖀́𝖭 𝖣𝖤 𝖠𝖣𝖬𝖨𝖭𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No está permitido aplicar silencio individual a otros administradores del grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }
    }

    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const mutedMembers = groupData.mutedMembers || []

    const alreadyMuted = mutedMembers.some(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (alreadyMuted) {
        return m.reply(
            `ꕥ 𝖬𝖨𝖤𝖬𝖡𝖱𝖮 𝖸𝖠 𝖲𝖨𝖫𝖤𝖭𝖢𝖨𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Objetivo :: *@${targetNumber}*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este usuario ya se encuentra registrado en la lista de miembros silenciados del grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [targetJid] }
        )
    }

    mutedMembers.push(targetJid)
    db.setGroup(m.chat, { ...groupData, mutedMembers })

    try { await m.react('🔇'); } catch {}

    return m.reply(
        `ꕥ 𝖬𝖨𝖤𝖬𝖡𝖱𝖮 𝖲𝖨𝖫𝖤𝖭𝖢𝖨𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Objetivo :: *@${targetNumber}*\n` +
        `      • Estado :: *Silenciado (Muted)*\n` +
        `      • Total silenciados :: *${mutedMembers.length} usuarios*\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Todos los mensajes enviados por este usuario serán eliminados de forma automática.\n• Usa \`${m.prefix}unmutemember\` para retirar el castigo. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
        { mentions: [targetJid] }
    )
}

function isMutedMember(groupJid, senderJid, db) {
    const groupData = db.getGroup(groupJid) || {}
    const mutedMembers = groupData.mutedMembers || []
    if (mutedMembers.length === 0) return false

    const senderNumber = senderJid.replace(/@.+/g, '')
    return mutedMembers.some(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === senderNumber || c.endsWith(senderNumber) || senderNumber.endsWith(c)
    })
}

export { pluginConfig as config, handler, isMutedMember }
