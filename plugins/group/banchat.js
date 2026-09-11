import { getDatabase } from '../../src/lib/rimuru-database.js';
import te from '../../src/lib/rimuru-error.js';

const pluginConfig = {
    name: 'banchat',
    alias: ['bangroup', 'bangrup', 'unbanchat', 'unbangroup'],
    category: 'group',
    description: 'Banea o desbanea un grupo del uso del bot (exclusivo para el propietario).',
    usage: '.banchat',
    example: '.banchat',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const db = getDatabase();
    const cmd = m.command.toLowerCase();
    const isUnban = ['unbanchat', 'unbangroup'].includes(cmd);
    
    try {
        const groupMeta = m.groupMetadata;
        const groupName = groupMeta.subject || 'Desconocido';
        const groupData = db.getGroup(m.chat) || {};
        
        if (isUnban) {
            if (!groupData.isBanned) {
                return m.reply(
                    `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖭𝖮 𝖡𝖠𝖭𝖤𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este grupo no se encuentra en estado de baneo actualmente. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            db.setGroup(m.chat, { ...groupData, isBanned: false });
            
            return sock.sendMessage(m.chat, {
                text: `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖣𝖤𝖲𝖡𝖠𝖭𝖤𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
                    `      • Grupoo :: ${groupName}\n` +
                    `      • Estado :: ACTIVO ✅\n` +
                    `      • Desbaneado por :: @${m.sender.split('@')[0]}\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Todos los miembros pueden volver a utilizar el bot en este grupo. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
                mentions: [m.sender]
            }, { quoted: m });
        }
        
        if (groupData.isBanned) {
            return m.reply(
                `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖸𝖠 𝖡𝖠𝖭𝖤𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Este grupo ya se encuentra baneado.\n` +
                `Usa \`.unbanchat\` para restaurar el acceso. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        db.setGroup(m.chat, { ...groupData, isBanned: true });
        
        await sock.sendMessage(m.chat, {
            text: `ꕥ 𝖦𝖱𝖴𝖯𝖮 𝖡𝖠𝖭𝖤𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
                `      • Grupoo :: ${groupName}\n` +
                `      • Estado :: BANEADO 🔴\n` +
                `      • Baneado por :: @${m.sender.split('@')[0]}\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los miembros comunes no podrán usar el bot aquí.\n` +
                `Solo el propietario mantiene acceso. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`,
            mentions: [m.sender]
        }, { quoted: m });
        
    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };
