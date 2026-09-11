import config from '../../config.js'
/**
 * @file plugins/owner/public.js
 * @description Plugin para activar el modo public (todos pueden acceder)
 */
import { getDatabase } from '../../src/lib/rimuru-database.js'
import te from '../../src/lib/rimuru-error.js'
const pluginConfig = {
    name: 'public',
    alias: ['publicmode', 'open'],
    category: 'owner',
    description: 'Gestiona la función public con la estética Waguri Assistant ⚙️',
    usage: '.public',
    example: '.public',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

/**
 * Handler para el comando public
 */
async function handler(m, { sock }) {
    try {
        const isRealOwner = validateOwner(m);
        if (!isRealOwner) {
            return await m.reply('🚫 *ᴀᴄᴄᴇsᴏ ᴅᴇɴᴇɢᴀᴅᴏ*\n\n> ¡Solo el owner puede cambiar el modo del bot!');
        }
        const currentMode = config.mode;
        if (currentMode === 'public') {
            return await m.reply('ℹ️ El bot ya está en modo *public*');
        }
        config.mode = 'public';
        const db = getDatabase();
        db.setting('botMode', 'public');
        
        const responseText = `🌐 *ᴍᴏᴅᴏ ᴘᴜʙʟɪᴄ ᴀᴄᴛɪᴠᴏ*\n\n` +
            `> ¡El bot ahora responde a todos los usuarios!\n\n` +
            `_Usa .self para cerrar el acceso_`;
        await m.reply(responseText);
        console.log(`[Mode] Changed to PUBLIC by ${m.pushName} (${m.sender})`);
    } catch (error) {
        console.error('[Public Command Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

/**
 * Validación de owner con múltiples verificaciones
 */
function validateOwner(m) {
    if (!m.isOwner) return false;
    if (m.fromMe) return true;
    const senderNumber = m.sender?.replace(/[^0-9]/g, '') || '';
    const ownerNumbers = config.owner?.number || [];
    
    const isInOwnerList = ownerNumbers.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '');
        return senderNumber.includes(cleanOwner) || cleanOwner.includes(senderNumber);
    });
    if (!isInOwnerList) return false;
    if (!m.sender || !m.sender.includes('@')) return false;
    return true;
}

export { pluginConfig as config, handler }