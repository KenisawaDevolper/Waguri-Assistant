import { getDatabase } from '../../src/lib/rimuru-database.js';

const pluginConfig = {
    name: 'setrulesgrup',
    alias: ['setgrouprules', 'setaturangrup'],
    category: 'group',
    description: 'Establece y personaliza las reglas o normas oficiales del grupo (solo administradores).',
    usage: '.setrulesgrup <texto>',
    example: '.setrulesgrup 1. No hacer spam\n2. Respetar a los miembros',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const db = getDatabase();
    const text = m.fullArgs?.trim() || m.args.join(' ') || (m.quoted?.body || m.quoted?.text || '');

    if (!text) {
        return m.reply(
            `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖱 𝖱𝖤𝖦𝖫𝖠𝖲 𝖣𝖤𝖫 𝖦𝖱𝖴𝖯O ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Uso correcto :: \`${m.prefix}setrulesgrup <tus reglas>\`\n` +
            `      • Ver reglas actuales :: \`${m.prefix}rulesgrup\`\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
            `      \`${m.prefix}setrulesgrup 1. No spam\n2. Respetar a todos\`\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes ingresar el texto con las nuevas normativas para el grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }

    db.setGroup(m.chat, { groupRules: text });
    try { await m.react('✅'); } catch {}

    await m.reply(
        `ꕥ 𝖱𝖤𝖦𝖫𝖠𝖲 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖭𝖴𝖤𝖵𝖠𝖲 𝖭𝖮𝖱𝖬𝖠𝖲*\n` +
        `${text}\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Las normativas del grupo han sido actualizadas. Usa \`${m.prefix}rulesgrup\` para consultarlas en cualquier momento. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
}

export { pluginConfig as config, handler };
