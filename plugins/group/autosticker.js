import config from '../../config.js';
import { getDatabase } from '../../src/lib/rimuru-database.js';

const pluginConfig = {
    name: 'autosticker',
    alias: ['autostiker', 'as'],
    category: 'group',
    description: 'Convierte automáticamente las imágenes y videos enviados al grupo en stickers.',
    usage: '.autosticker on/off',
    example: '.autosticker on',
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
    const current = groupData.autosticker ?? false;
    const arg = args[0]?.toLowerCase();
    
    if (!arg) {
        const status = current ? 'ACTIVO ✅' : 'INACTIVO ❌';
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖲𝖳𝖨𝖢𝖪𝖤𝖱 𝖲𝖤𝖳𝖳𝖨𝖭𝖦𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮*\n` +
            `      • Estado :: ${status}\n` +
            `      • Función :: Convierte imágenes y videos en stickers automáticamente\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso:\n` +
            `> \`${m.prefix}autosticker on\` - Activar\n` +
            `> \`${m.prefix}autosticker off\` - Desactivar »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (arg === 'on' || arg === '1' || arg === 'aktif') {
        if (current) {
            return m.reply(
                `ꕥ 𝖠𝖴𝖳𝖮𝖲𝖳𝖨𝖢𝖪𝖤𝖱 𝖸𝖠 𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de autosticker ya se encuentra activo en este grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        db.setGroup(m.chat, { autosticker: true });
        await db.save();
        try { await m.react('✅'); } catch {}
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖲𝖳𝖨𝖢𝖪𝖤𝖱 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Autosticker activado con éxito. Las imágenes y videos enviados se convertirán en stickers automáticamente. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (arg === 'off' || arg === '0' || arg === 'nonaktif') {
        if (!current) {
            return m.reply(
                `ꕥ 𝖠𝖴𝖳𝖮𝖲𝖳𝖨𝖢𝖪𝖤𝖱 𝖸𝖠 𝖨𝖭𝖠𝖢𝖳𝖨𝖵𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de autosticker ya está desactivado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        db.setGroup(m.chat, { autosticker: false });
        await db.save();
        try { await m.react('❌'); } catch {}
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖲𝖳𝖨𝖢𝖪𝖤𝖱 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Autosticker desactivado con éxito. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    return m.reply(
        `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso correcto: \`${m.prefix}autosticker on/off\` »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
}

async function autoStickerHandler(m, sock) {
    try {
        if (!m) return false;
        if (!m.isGroup) return false;
        if (m.isCommand) return false;
        if (m.fromMe === true) return false;
        
        const db = getDatabase();
        const groupData = db.getGroup(m.chat) || {};
        
        if (!groupData.autosticker) return false;
        
        const msg = m.message;
        if (!msg) return false;
        
        const type = Object.keys(msg)[0];
        const content = msg[type];

        const isImage = type === 'imageMessage' || 
                        (type === 'viewOnceMessage' && content?.message?.imageMessage) ||
                        (type === 'viewOnceMessageV2' && content?.message?.imageMessage);
        
        const isVideo = type === 'videoMessage' ||
                        (type === 'viewOnceMessage' && content?.message?.videoMessage) ||
                        (type === 'viewOnceMessageV2' && content?.message?.videoMessage);
        
        if (!isImage && !isVideo) return false;
        
        const buffer = await m.download();
        if (!buffer || buffer.length === 0) return false;
        
        if (buffer.length > 10 * 1024 * 1024) return false;
        
        if (isImage) {
            await sock.sendImageAsSticker(m.chat, buffer, m, {
                packname: config.sticker?.packname || 'Waguri Assistant',
                author: config.sticker?.author || 'Bot'
            });
        } else if (isVideo) {
            const videoMsg = msg.videoMessage || content?.message?.videoMessage;
            const duration = videoMsg?.seconds || 0;
            if (duration > 10) return false;
            
            await sock.sendVideoAsSticker(m.chat, buffer, m, {
                packname: config.sticker?.packname || 'Waguri Assistant',
                author: config.sticker?.author || 'Bot'
            });
        }
        
        return true;
    } catch (err) {
        return false;
    }
}

export { pluginConfig as config, handler, autoStickerHandler };
