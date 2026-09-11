import { getDatabase } from '../../src/lib/rimuru-database.js';

const pluginConfig = {
    name: 'deltoxic',
    alias: ['hapustoxic', 'remtoxic', 'removetoxic'],
    category: 'group',
    description: 'Elimina una palabra tóxica de la lista de moderación del grupo.',
    usage: '.deltoxic <kata>',
    example: '.deltoxic kata_kasar',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const db = getDatabase();
    const word = m.args.join(' ').trim().toLowerCase();
    
    if (!word) {
        return m.reply(
            `ꕥ 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖱 𝖯𝖠𝖫𝖠𝖡𝖱𝖠 𝖳𝖮́𝖷𝖨𝖢𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}deltoxic <palabra>\`\n` +
            `      • Ejemplo :: \`${m.prefix}deltoxic groseria\`\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes especificar la palabra que deseas remover del filtro. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    const groupData = db.getGroup(m.chat) || {};
    const toxicWords = groupData.toxicWords || [];
    
    const index = toxicWords.indexOf(word);
    
    if (index === -1) {
        return m.reply(
            `ꕥ 𝖯𝖠𝖫𝖠𝖡𝖱𝖠 𝖭𝖮 𝖤𝖃𝖨𝖲𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La palabra \`${word}\` no se encuentra registrada en la lista de este grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    toxicWords.splice(index, 1);
    db.setGroup(m.chat, { toxicWords });
    
    try { await m.react('✅'); } catch {}
    
    await m.reply(
        `ꕥ 𝖯𝖠𝖫𝖠𝖡𝖱𝖠 𝖳𝖮́𝖷𝖨𝖢𝖠 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲 𝖣𝖤𝖫 𝖥𝖨𝖫𝖳𝖱𝖮*\n` +
        `      • Palabra eliminada :: \`${word}\`\n` +
        `      • Restantes en lista :: \`${toxicWords.length}\` palabras\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El filtro de moderación ha sido actualizado correctamente. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
}

export { pluginConfig as config, handler };
