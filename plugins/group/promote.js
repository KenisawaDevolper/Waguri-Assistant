import { getParticipantJid } from '../../src/lib/rimuru-lid.js'
import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: 'promote',
    alias: ['jadiadmin', 'admin'],
    category: 'group',
    description: 'Asciende a un miembro del grupo al rango de administrador.',
    usage: '.promote <@tag / reply>',
    example: '.promote @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0]
    }

    if (!target) {
        return m.reply(
            `ꕥ 𝖲𝖨𝖭 𝖮𝖡𝖏𝖤𝖳𝖨𝖵𝖮 𝖣𝖤𝖲𝖨𝖦𝖭𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}promote @user\`\n` +
            `      • Alternativa :: Responde al mensaje del usuario que deseas ascender.\n\n` +
            `      𓈒 ◌ㅤ──    *ℹ️ 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖠𝖲𝖢𝖤𝖭𝖲𝖮*\n` +
            `      • Otorga privilegios de administración en el chat grupal actual.\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Por favor, menciona o responde al usuario al que deseas promover. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    const targetNumber = target.replace(/@.+/g, '')

    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === target)

        if (!participant) {
            return m.reply(
                `ꕥ 𝖴𝖲𝖴𝖠𝖱𝖨𝖮 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El usuario especificado no forma parte de este grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }

        if (participant.admin) {
            return m.reply(
                `ꕥ 𝖸𝖠 𝖤𝖲 𝖠𝖣𝖬𝖨𝖭𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      • Objetivo :: *@${targetNumber}*\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este miembro ya cuenta con privilegios de administración en el grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
                { mentions: [target] }
            )
        }

        await sock.groupParticipantsUpdate(m.chat, [target], 'promote')

        try { await m.react('👑'); } catch {}

        return m.reply(
            `ꕥ 𝖬𝖨𝖤𝖬𝖡𝖱𝖮 𝖠𝖲𝖢𝖤𝖭𝖣𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Nuevo Admin :: *@${targetNumber}*\n` +
            `      • Estado :: *Ascendido a Administrador*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El usuario ha sido promovido exitosamente con los nuevos privilegios. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [target] }
        )

    } catch (error) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
