import { getDatabase } from '../../src/lib/rimuru-database.js';

const pluginConfig = {
    name: 'delantilink',
    alias: ['delalink', 'delblocklink', 'remantilink'],
    category: 'group',
    description: 'Elimina un enlace o dominio de la lista de antienlaces del grupo.',
    usage: '.delantilink <dominio/patrón>',
    example: '.delantilink tiktok.com',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

function handler(m) {
    const db = getDatabase();
    const link = m.args.join(' ')?.trim()?.toLowerCase();
    
    const groupData = db.getGroup(m.chat) || {};
    const antilinkList = groupData.antilinkList || [];

    if (!link) {
        if (antilinkList.length === 0) {
            return m.reply(
                `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖵𝖠𝖢𝖨𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No hay dominios registrados en la lista de antienlaces de este grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        let txt = '';
        antilinkList.forEach((l, i) => {
            txt += `      • ${i + 1}. \`${l}\`\n`;
        });
        
        return m.reply(
            `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
            `${txt}\n` +
            `      • Total de dominios :: ${antilinkList.length}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}delantilink <dominio>\` para eliminar uno. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    const index = antilinkList.findIndex(l => l === link);
    
    if (index === -1) {
        return m.reply(
            `ꕥ 𝖫𝖨𝖭𝖪 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El enlace \`${link}\` no se encuentra en la lista de antienlaces. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    antilinkList.splice(index, 1);
    db.setGroup(m.chat, { antilinkList });
    try { m.react('✅'); } catch {}
    
    return m.reply(
        `ꕥ 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
        `      • Eliminado :: \`${link}\`\n` +
        `      • Restantes :: ${antilinkList.length} dominios\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El dominio ha sido removido con éxito de las restricciones. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
}

export { pluginConfig as config, handler };
