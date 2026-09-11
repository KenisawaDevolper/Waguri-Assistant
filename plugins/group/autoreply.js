import { getDatabase } from '../../src/lib/rimuru-database.js';
import config from '../../config.js';
import fs from 'fs';
import path from 'path';

const pluginConfig = {
    name: 'autoreply',
    alias: ['smarttrigger', 'smarttriggers', 'ar'],
    category: 'group',
    description: 'Gestiona los triggers automáticos y respuestas inteligentes por grupo.',
    usage: '.autoreply on/off/add/del/list/private',
    example: '.autoreply on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
};

const AUTOREPLY_MEDIA_DIR = path.join(process.cwd(), 'database', 'autoreply_media');

if (!fs.existsSync(AUTOREPLY_MEDIA_DIR)) {
    fs.mkdirSync(AUTOREPLY_MEDIA_DIR, { recursive: true });
}

async function handler(m, { sock }) {
    const db = getDatabase();
    const args = m.args || [];
    const action = args[0]?.toLowerCase();
    
    const privateAutoreply = db.setting('autoreplyPrivate') ?? false;
    
    if (action === 'private') {
        if (!m.isOwner) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo el propietario puede configurar el autoreply privado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        const subAction = args[1]?.toLowerCase();
        
        if (subAction === 'on') {
            db.setting('autoreplyPrivate', true);
            try { await m.react('✅'); } catch {}
            return m.reply(
                `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖯𝖱𝖨𝖵𝖠𝖣𝖮 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot responderá automáticamente en el chat privado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        if (subAction === 'off') {
            db.setting('autoreplyPrivate', false);
            try { await m.react('❌'); } catch {}
            return m.reply(
                `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖯𝖱𝖨𝖵𝖠𝖣𝖮 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot ya no responderá automáticamente en el chat privado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        const currentStatus = db.setting('autoreplyPrivate') ?? false;
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖯𝖱𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮*\n` +
            `      • Estado :: ${currentStatus ? 'ACTIVO ✅' : 'INACTIVO ❌'}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos:\n` +
            `> \`${m.prefix}autoreply private on\`\n` +
            `> \`${m.prefix}autoreply private off\` »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (action === 'global') {
        if (!m.isOwner) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo el propietario puede gestionar los autoreplies globales. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        const subAction = args[1]?.toLowerCase();
        const globalCustomReplies = db.setting('globalCustomReplies') || [];
        
        if (subAction === 'add') {
            const fullBody = m.body || '';
            const pipeIdx = fullBody.indexOf('|');
            if (pipeIdx === -1) {
                return m.reply(
                    `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}autoreply global add trigger|reply\`\n` +
                    `Ejemplo: \`${m.prefix}autoreply global add halo|¡Hola {name}!\` »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            const triggerStart = fullBody.toLowerCase().indexOf('global add ') + 'global add '.length;
            const triggerEnd = pipeIdx;
            const trigger = fullBody.substring(triggerStart, triggerEnd).trim();
            const reply = fullBody.substring(pipeIdx + 1);
            
            if (!trigger.trim() || !reply) {
                return m.reply(
                    `ꕥ 𝖣𝖠𝖳𝖮𝖲 𝖨𝖭𝖢𝖮𝖬𝖯𝖫𝖤𝖳𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El trigger y la respuesta no pueden estar vacíos. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            const existingIndex = globalCustomReplies.findIndex(r => r.trigger.toLowerCase() === trigger.trim().toLowerCase());
            if (existingIndex !== -1) {
                globalCustomReplies[existingIndex].reply = reply;
            } else {
                globalCustomReplies.push({ trigger: trigger.trim().toLowerCase(), reply: reply });
            }
            
            db.setting('globalCustomReplies', globalCustomReplies);
            await db.save();
            
            try { await m.react('✅'); } catch {}
            return m.reply(
                `ꕥ 𝖦𝖫𝖮𝖡𝖠𝖫 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖠𝖭𝖣𝖨𝖳𝖨𝖮𝖭𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
                `      • Trigger :: ${trigger.trim()}\n` +
                `      • Total :: ${globalCustomReplies.length} respuestas\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Activo en todos los grupos y chats privados. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        if (subAction === 'del' || subAction === 'rm') {
            const trigger = args.slice(2).join(' ').toLowerCase().trim();
            if (!trigger) {
                return m.reply(
                    `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Indica el trigger que deseas eliminar. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            const index = globalCustomReplies.findIndex(r => r.trigger === trigger);
            if (index === -1) {
                return m.reply(
                    `ꕥ 𝖳𝖱𝖨𝖦𝖦𝖤𝖱 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El trigger "${trigger}" no existe en el registro global. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            globalCustomReplies.splice(index, 1);
            db.setting('globalCustomReplies', globalCustomReplies);
            await db.save();
            
            try { await m.react('🗑️'); } catch {}
            return m.reply(
                `ꕥ 𝖦𝖫𝖮𝖡𝖠𝖫 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El trigger "${trigger}" fue eliminado con éxito. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        if (subAction === 'list' || !subAction) {
            if (globalCustomReplies.length === 0) {
                return m.reply(
                    `ꕥ 𝖦𝖫𝖮𝖡𝖠𝖫 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No hay registros globales guardados.\n` +
                    `Agrega uno con: \`${m.prefix}autoreply global add trigger|reply\` »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            let text = `ꕥ 𝖦𝖫𝖮𝖡𝖠𝖫 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖫𝖨𝖲𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                       `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮𝖭*\n` +
                       `      • Total :: ${globalCustomReplies.length} respuestas\n` +
                       `      • Alcance :: Todos los grupos y DM\n\n` +
                       `      𓈒 ◌ㅤ──    *𝖳𝖱𝖨𝖦𝖦𝖤𝖱𝖲*\n`;
            
            globalCustomReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : '';
                text += `      • [${i + 1}] ${r.trigger} ${hasImage}\n` +
                        `        ↳ ${r.reply.substring(0, 30)}${r.reply.length > 30 ? '...' : ''}\n`;
            });
            
            text += `\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
            return m.reply(text);
        }
        
        return m.reply(
            `ꕥ 𝖦𝖫𝖮𝖡𝖠𝖫 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso:\n` +
            `> \`${m.prefix}autoreply global add trigger|reply\`\n` +
            `> \`${m.prefix}autoreply global del trigger\`\n` +
            `> \`${m.prefix}autoreply global list\` »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (!m.isGroup) {
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖯𝖱𝖨𝖵𝖠𝖳𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮*\n` +
            `      • Privado :: ${privateAutoreply ? 'ACTIVO ✅' : 'INACTIVO ❌'}\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Comandos disponibles:\n` +
            `> \`${m.prefix}autoreply private on/off\`\n` +
            `> \`${m.prefix}autoreply global add/del/list\`\n\n` +
            `Nota: Para configurar autoreplies de grupo, usa este comando dentro de un grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(
            `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo los administradores pueden gestionar el autoreply en este grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    const groupData = db.getGroup(m.chat) || {};
    const globalSmartTriggers = db.setting('smartTriggers') ?? config.features?.smartTriggers ?? false;
    
    if (!action || action === 'status') {
        const groupStatus = groupData.autoreply;
        const effectiveStatus = groupStatus ?? globalSmartTriggers;
        const customReplies = groupData.customReplies || [];
        
        let text = `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖦𝖱𝖴𝖯𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                   `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮*\n` +
                   `      • Global :: ${globalSmartTriggers ? 'ACTIVO ✅' : 'INACTIVO ❌'}\n` +
                   `      • Grupoo :: ${groupStatus === undefined ? 'DEFAULT' : (groupStatus ? 'ACTIVO ✅' : 'INACTIVO ❌')}\n` +
                   `      • Efectivo :: ${effectiveStatus ? 'ACTIVO ✅' : 'INACTIVO ❌'}\n` +
                   `      • Custom Replies :: ${customReplies.length}\n\n` +
                   `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲*\n` +
                   `      • \`${m.prefix}autoreply on/off\`\n` +
                   `      • \`${m.prefix}autoreply add <trigger>|<reply>\`\n` +
                   `      • \`${m.prefix}autoreply del <trigger>\`\n` +
                   `      • \`${m.prefix}autoreply list\`\n` +
                   `      • \`${m.prefix}autoreply reset\`\n\n` +
                   `      𓈒 ◌ㅤ──    *𝖯𝖫𝖠𝖢𝖤𝖧𝖮𝖫𝖣𝖤𝖱𝖲*\n` +
                   `      • {name}, {tag}, {sender}, {botname}, {time}, {date}\n\n` +
                   `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
        
        return m.reply(text);
    }
    
    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, autoreply: true });
        try { await m.react('✅'); } catch {}
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot responderá automáticamente a los triggers en este grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, autoreply: false });
        try { await m.react('❌'); } catch {}
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El bot ya no responderá de forma automática en este grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (action === 'add') {
        const fullBody = m.body || '';
        const pipeIdx = fullBody.indexOf('|');
        
        if (pipeIdx === -1) {
            return m.reply(
                `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}autoreply add trigger|reply\`\n` +
                `Puedes enviar o citar una imagen junto al comando para adjuntarla. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        const addIdx = fullBody.toLowerCase().indexOf('add ');
        const triggerStart = addIdx + 'add '.length;
        const trigger = fullBody.substring(triggerStart, pipeIdx).trim();
        const reply = fullBody.substring(pipeIdx + 1);
        
        if (!trigger) {
            return m.reply(
                `ꕥ 𝖳𝖱𝖨𝖦𝖦𝖤𝖱 𝖵𝖠𝖢𝖨𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El trigger no puede estar vacío. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        let imageBuffer = null;
        let imagePath = null;
        
        const hasQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.type === 'image');
        const hasDirectImage = m.mtype === 'imageMessage' || m.type === 'image';
        
        if (hasQuotedImage) {
            try {
                imageBuffer = await m.quoted.download();
            } catch (e) {
                console.error('[Autoreply] Failed to download quoted image:', e.message);
            }
        } else if (hasDirectImage) {
            try {
                imageBuffer = await m.download();
            } catch (e) {
                console.error('[Autoreply] Failed to download direct image:', e.message);
            }
        }
        
        if (imageBuffer) {
            const filename = `${m.chat.replace('@g.us', '')}_${trigger.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
            imagePath = path.join(AUTOREPLY_MEDIA_DIR, filename);
            fs.writeFileSync(imagePath, imageBuffer);
        }
        
        const customReplies = groupData.customReplies || [];
        const existingIndex = customReplies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase());
        
        const replyData = {
            trigger: trigger.toLowerCase(),
            reply: reply || '',
            image: imagePath || null,
            createdAt: Date.now()
        };
        
        if (existingIndex !== -1) {
            if (customReplies[existingIndex].image && customReplies[existingIndex].image !== imagePath) {
                try {
                    if (fs.existsSync(customReplies[existingIndex].image)) {
                        fs.unlinkSync(customReplies[existingIndex].image);
                    }
                } catch {}
            }
            customReplies[existingIndex] = replyData;
        } else {
            customReplies.push(replyData);
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies });
        try { await m.react('✅'); } catch {}
        
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖠𝖭𝖣𝖨𝖳𝖨𝖮𝖭𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
            `      • Trigger :: ${trigger.trim()}\n` +
            `      • Imagen :: ${imagePath ? 'Sí 🖼️' : 'No'}\n` +
            `      • Total grupo :: ${customReplies.length}\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (action === 'del' || action === 'rm' || action === 'remove') {
        const trigger = args.slice(1).join(' ').toLowerCase().trim();
        
        if (!trigger) {
            return m.reply(
                `ꕥ 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Uso: \`${m.prefix}autoreply del <trigger>\` »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        const customReplies = groupData.customReplies || [];
        const index = customReplies.findIndex(r => r.trigger === trigger);
        
        if (index === -1) {
            return m.reply(
                `ꕥ 𝖳𝖱𝖨𝖦𝖦𝖤𝖱 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El trigger "${trigger}" no existe en este grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        if (customReplies[index].image) {
            try {
                if (fs.existsSync(customReplies[index].image)) {
                    fs.unlinkSync(customReplies[index].image);
                }
            } catch {}
        }
        
        customReplies.splice(index, 1);
        db.setGroup(m.chat, { ...groupData, customReplies });
        
        try { await m.react('🗑️'); } catch {}
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Trigger "${trigger}" eliminado. Restantes: ${customReplies.length} »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    if (action === 'list') {
        const customReplies = groupData.customReplies || [];
        
        let text = `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖫𝖨𝖲𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                   `      𓈒 ◌ㅤ──    *𝖢𝖴𝖲𝖳𝖮𝖬 𝖳𝖱𝖨𝖦𝖦𝖤𝖱𝖲*\n`;
        
        if (customReplies.length > 0) {
            customReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : '';
                text += `      • [${i + 1}] ${r.trigger} ${hasImage}\n` +
                        `        ↳ ${r.reply ? r.reply.substring(0, 35) + (r.reply.length > 35 ? '...' : '') : '(Solo imagen)'}\n`;
            });
        } else {
            text += `      • (Sin triggers personalizados en este grupo)\n`;
        }
        
        text += `\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
        return m.reply(text);
    }
    
    if (action === 'reset' || action === 'clear') {
        const customReplies = groupData.customReplies || [];
        for (const r of customReplies) {
            if (r.image) {
                try {
                    if (fs.existsSync(r.image)) fs.unlinkSync(r.image);
                } catch {}
            }
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies: [] });
        try { await m.react('🗑️'); } catch {}
        return m.reply(
            `ꕥ 𝖠𝖴𝖳𝖮𝖱𝖤𝖯𝖫𝖸 𝖱𝖤𝖲𝖤𝖳𝖤𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Se han eliminado todos los custom replies de este grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    return m.reply(
        `ꕥ 𝖠𝖢𝖳𝖨𝖮𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Opciones válidas: \`on\`, \`off\`, \`private on/off\`, \`add\`, \`del\`, \`list\`, \`reset\` »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
}

export { pluginConfig as config, handler };
