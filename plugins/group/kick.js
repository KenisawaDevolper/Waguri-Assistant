import { findParticipantByNumber } from '../../src/lib/rimuru-lid.js'
import te from '../../src/lib/rimuru-error.js'

const pluginConfig = {
    name: 'kick',
    alias: ['remove', 'tendang'],
    category: 'group',
    description: 'Expulsa de forma segura a un miembro del grupo mediante respuesta a su mensaje o mención.',
    usage: '.kick @user',
    example: '.kick @user',
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
    let targetJid = null

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0]
    }

    if (!targetJid) {
        return m.reply(
            `ꕥ 𝖮𝖡𝖩𝖤𝖳𝖨𝖵𝖮 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}kick @user\` o responde a su mensaje\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes mencionar o responder al mensaje del integrante que deseas expulsar del chat. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const targetNumber = targetJid.replace(/@.*$/, '')

    if (targetJid === botNumber || targetNumber === botNumber.replace(/@.*$/, '')) {
        return m.reply(
            `ꕥ 𝖮𝖯𝖤𝖱𝖠𝖢𝖨Ó𝖭 𝖱𝖤𝖹𝖮𝖫𝖳𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡No puedes utilizar este comando para expulsarme a mí mismo del grupo! »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    if (targetJid === m.sender) {
        return m.reply(
            `ꕥ 𝖮𝖯𝖤𝖱𝖠𝖢𝖨Ó𝖭 𝖱𝖤𝖹𝖮𝖫𝖳𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡No puedes expulsarte a ti mismo utilizando este comando! »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        )
    }

    try {
        const groupMeta = m.groupMetadata
        const targetParticipant = findParticipantByNumber(groupMeta.participants, targetJid)
        
        if (!targetParticipant) {
            return m.reply(
                `ꕥ 𝖬𝖨𝖤𝖬𝖡𝖱𝖮 𝖭𝖮 𝖧𝖠𝖫𝖫𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El usuario especificado no se encuentra registrado en este chat grupal. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }
        
        if (targetParticipant.admin) {
            return m.reply(
                `ꕥ 𝖯𝖱𝖮𝖳𝖤𝖢𝖢𝖨𝖀́𝖭 𝖣𝖤 𝖠𝖣𝖬𝖨𝖭𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No es posible expulsar a otro administrador del grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            )
        }
        
        await sock.groupParticipantsUpdate(m.chat, [targetParticipant.id], 'remove')

        try { await m.react('✅'); } catch {}

        return m.reply(
            `ꕥ 𝖬𝖨𝖤𝖬𝖡𝖱𝖮 𝖤𝖷𝖯𝖴𝖫𝖲𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Usuario afectado :: *@${targetNumber}*\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El miembro ha sido removido del grupo exitosamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`, 
            { mentions: [targetJid] }
        )

    } catch (error) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
