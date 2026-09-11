import config from '../../config.js';
import { getDatabase } from '../../src/lib/rimuru-database.js';

const pluginConfig = {
    name: 'automedia',
    alias: ['automedi', 'am'],
    category: 'group',
    description: 'Convierte automáticamente los stickers estáticos enviados al grupo en imágenes.',
    usage: '.automedia on/off',
    example: '.automedia on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const db = getDatabase();
    const args = m.args || [];
    const groupData = db.getGroup(m.chat) || {};
    const current = groupData.automedia ?? false;
    const arg = args[0]?.toLowerCase();
    
    if (!arg) {
        const status = current ? 'ACTIVO ✅' : 'INACTIVO ❌';
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖬𝖤𝖣𝖨𝖠 𝖲𝖤𝖳𝖳𝖨𝖭𝖦𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮*\n` +
            `      • Estado :: ${status}\n` +
            `      • Función :: Convierte stickers estáticos en imágenes\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso:\n` +
            `> \`${m.prefix}automedia on\` - Activar\n` +
            `> \`${m.prefix}automedia off\` - Desactivar »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (arg === 'on' || arg === '1' || arg === 'aktif') {
        if (current) {
            return m.reply(
                `ꕥ 𝖠𝖴𝖳𝖮𝖬𝖤𝖣𝖨𝖠 𝖸𝖠 𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de automedia ya se encuentra activo en este grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        db.setGroup(m.chat, { automedia: true });
        await db.save();
        try { await m.react('✅') } catch {}
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖬𝖤𝖣𝖨𝖠 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Automedia activado con éxito. Los stickers estáticos enviados se convertirán en imagen automáticamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (arg === 'off' || arg === '0' || arg === 'nonaktif') {
        if (!current) {
            return m.reply(
                `ꕥ 𝖠𝖴𝖳𝖮𝖬𝖤𝖣𝖨𝖠 𝖸𝖠 𝖨𝖭𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de automedia ya está desactivado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        db.setGroup(m.chat, { automedia: false });
        await db.save();
        try { await m.react('❌') } catch {}
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖬𝖤𝖣𝖨𝖠 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Automedia desactivado con éxito. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    return m.reply(
        `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso correcto: \`${m.prefix}automedia on/off\` »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
}

async function autoMediaHandler(m, sock) {
    try {
        if (!m) return false;
        if (!m.isGroup) return false;
        if (m.isCommand) return false;
        if (m.fromMe === true) return false;
        
        const db = getDatabase();
        const groupData = db.getGroup(m.chat) || {};
        
        if (!groupData.automedia) return false;
        
        const msg = m.message;
        if (!msg) return false;
        
        const hasSticker = msg.stickerMessage;
        if (!hasSticker) return false;
        
        // Evitar procesar stickers animados para respetar la lógica original
        if (hasSticker.isAnimated) return false;
        
        const buffer = await m.download();
        if (!buffer || buffer.length === 0) return false;
        
        await sock.sendMedia(m.chat, buffer, null, m, { 
            type: 'image',
        });
        
        return true;
    } catch (err) {
        return false;
    }
}

export { pluginConfig as config, handler, autoMediaHandler };
