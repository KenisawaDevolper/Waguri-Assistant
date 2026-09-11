import { getParticipantJid } from '../../src/lib/rimuru-lid.js';
import te from '../../src/lib/rimuru-error.js';

const pluginConfig = {
    name: 'demote',
    alias: ['unadmin', 'turunkan'],
    category: 'group',
    description: 'Quita el rango de administrador a un miembro del grupo.',
    usage: '.demote @user',
    example: '.demote @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock }) {
    let target = null;

    if (m.quoted) {
        target = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
    }

    if (!target) {
        return m.reply(
            `ꕥ 𝖮𝖡𝖏𝖤𝖳𝖨𝖵𝖮 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}demote @usuario\`\n` +
            `      • Alternativa :: Responde directamente a su mensaje\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes mencionar o responder al usuario al que deseas quitarle el rango de admin. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }

    try {
        const groupMeta = m.groupMetadata;
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === target);

        if (!participant) {
            return m.reply(
                `ꕥ 𝖬𝖨𝖤𝖬𝖡𝖱𝖮 𝖭𝖮 𝖧𝖠𝖫𝖫𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El usuario especificado no se encuentra en este grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }

        if (!participant.admin) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖨𝖃𝖮́𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El usuario mencionado ya es un miembro común (no es administrador). »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }

        if (participant.admin === 'superadmin') {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No es posible degradar al creador o superadministrador principal del grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }

        await sock.groupParticipantsUpdate(m.chat, [target], 'demote');
        try { await m.react('✅'); } catch {}

        await m.reply(
            `ꕥ 𝖱𝖠𝖭𝖦𝖮 𝖱𝖤𝖳𝖨𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Usuario :: @${target.split('@')[0]}\n` +
            `      • Estado actual :: Miembro regular 👤\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El rango administrativo ha sido removido con éxito. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            { mentions: [target] }
        );

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };
