import config from '../../config.js';
import { getDatabase } from '../../src/lib/rimuru-database.js';

const pluginConfig = {
    name: 'sider',
    alias: ['silentreader', 'deteksisider', 'srdetector'],
    category: 'group',
    description: 'Detecta y administra los miembros que no han enviado mensajes en un periodo determinado.',
    usage: '.sider <on/off/cek/set>',
    example: '.sider cek',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
};

const DEFAULT_PERIOD = 7 * 24 * 60 * 60 * 1000;

async function handler(m, { sock }) {
    const db = getDatabase();
    const args = m.args || [];
    const sub = args[0]?.toLowerCase();
    
    if (!db.data.sider) {
        db.data.sider = {
            enabled: {},
            lastActivity: {},
            settings: {}
        };
    }
    
    const groupId = m.chat;
    const isEnabled = db.data.sider.enabled[groupId] === true;
    
    // ON - Activar deteción de sider
    if (sub === 'on') {
        if (!m.isAdmin && !m.isOwner) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo los administradores pueden activar esta función. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        db.data.sider.enabled[groupId] = true;
        
        if (!db.data.sider.settings[groupId]) {
            db.data.sider.settings[groupId] = {
                period: 7,
                autoKick: false,
                warningMsg: true
            };
        }
        
        db.save();
        try { await m.react('✅'); } catch {}
        
        return m.reply(
            `ꕥ 𝖲𝖨𝖫𝖤𝖭𝖳 𝖱𝖤𝖠𝖣𝖤𝖱 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨𝖀́𝖭*\n` +
            `      • Estado :: Activado con éxito ✅\n` +
            `      • Periodo :: *${db.data.sider.settings[groupId].period} días*\n` +
            `      • Auto-kick :: *${db.data.sider.settings[groupId].autoKick ? 'Activado' : 'Desactivado'}*\n\n` +
            `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖴́𝖳𝖨𝖫𝖤𝖲*\n` +
            `      • \`${m.prefix}sider cek\` → Ver lista actual\n` +
            `      • \`${m.prefix}sider set period 5\` → Cambiar días\n` +
            `      • \`${m.prefix}sider set autokick on\` → Activar expulsión\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    // OFF - Desactivar
    if (sub === 'off') {
        if (!m.isAdmin && !m.isOwner) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo los administradores pueden desactivar esta función. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        db.data.sider.enabled[groupId] = false;
        db.save();
        try { await m.react('✅'); } catch {}
        
        return m.reply(
            `ꕥ 𝖲𝖨𝖫𝖤𝖭𝖳 𝖱𝖤𝖠𝖣𝖤𝖱 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de detección de miembros inactivos ha sido apagado. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    // CEK - Ver listado de siders
    if (sub === 'cek' || sub === 'lihat' || sub === 'check') {
        if (!isEnabled) {
            return m.reply(
                `ꕥ 𝖲𝖨𝖫𝖤𝖭𝖳 𝖱𝖤𝖠𝖣𝖤𝖱 𝖮𝖥𝖥 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « La función está desactivada. Escribe \`${m.prefix}sider on\` primero. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        try { await m.react('🕵️'); } catch {}
        await m.reply(
            `ꕥ 𝖤𝖲𝖢𝖠𝖭𝖤𝖠𝖭𝖣𝖮 𝖬𝖨𝖤𝖬𝖡𝖱𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Analizando la actividad del grupo, por favor espera un momento... »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
        
        try {
            const groupMeta = await sock.groupMetadata(groupId);
            const participants = groupMeta.participants || [];
            
            const periodMs = (db.data.sider.settings[groupId]?.period || 7) * 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            const siderList = [];
            const activeList = [];
            
            for (const participant of participants) {
                const jid = participant.id;
                const lastActive = db.data.sider.lastActivity[groupId]?.[jid] || 0;
                const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin';
                
                if (isAdmin || jid === sock.user.id) continue;
                
                const daysInactive = Math.floor((now - lastActive) / (24 * 60 * 60 * 1000));
                
                if (lastActive === 0 || (now - lastActive) > periodMs) {
                    siderList.push({
                        jid,
                        name: participant.name || jid.split('@')[0],
                        days: lastActive === 0 ? 'Nunca' : daysInactive,
                        lastActive: lastActive
                    });
                } else {
                    activeList.push({
                        jid,
                        name: participant.name || jid.split('@')[0],
                        lastActive: lastActive
                    });
                }
            }
            
            if (siderList.length === 0) {
                return m.reply(
                    `ꕥ 𝖲𝖨𝖫𝖤𝖭𝖳 𝖱𝖤𝖠𝖣𝖤𝖱𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `✨ ¡EXCELENTE! ✨\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se encontraron lectores silenciosos en este grupo. ¡Todos participan activamente! »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            let siderText = '';
            const mentionJids = [];
            
            for (let i = 0; i < siderList.length; i++) {
                const s = siderList[i];
                const displayName = s.name.length > 25 ? s.name.slice(0, 25) + '...' : s.name;
                mentionJids.push(s.jid);
                
                let hariText = '';
                if (s.days === 'Nunca') {
                    hariText = '⚰️ Nunca ha escrito';
                } else if (s.days >= 30) {
                    hariText = `💀 ${s.days} días (inactividad severa)`;
                } else if (s.days >= 14) {
                    hariText = `😴 ${s.days} días de ausencia`;
                } else {
                    hariText = `😶 ${s.days} días sin hablar`;
                }
                
                let lastSeenText = '';
                if (s.lastActive > 0) {
                    const lastDate = new Date(s.lastActive);
                    lastSeenText = ` | 📅 ${lastDate.toLocaleDateString('id-ID')}`;
                }
                
                siderText += `      • ${i+1}. @${s.jid.split('@')[0]} (${displayName})\n`;
                siderText += `         ↳ ⏰ ${hariText}${lastSeenText}\n`;
            }
            
            let messageText = 
                `ꕥ 𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖲𝖨𝖫𝖤𝖭𝖳 𝖱𝖤𝖠𝖣𝖤𝖱𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖃𝖨́𝖲𝖳𝖨𝖢𝖠𝖲*\n` +
                `      • Periodo evaluado :: ${db.data.sider.settings[groupId]?.period || 7} días\n` +
                `      • Total de miembros :: ${participants.length}\n` +
                `      • Lectores silenciosos :: ${siderList.length}\n` +
                `      • Miembros activos :: ${activeList.length}\n\n` +
                `      𓈒 ◌ㅤ──    *𝖬𝖨𝖤𝖬𝖡𝖱𝖮𝖲 𝖣𝖤𝖳𝖤𝖢𝖳𝖠𝖣𝖮𝖲*\n` +
                `${siderText}\n`;

            if (db.data.sider.settings[groupId]?.autoKick) {
                messageText += `⚠️ *Aviso:* El modo auto-kick está *ACTIVO*.\n\n`;
            } else {
                messageText += `🛡️ *Nota:* Auto-kick desactivado (modo informativo).\n\n`;
            }

            messageText += `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
            
            await sock.sendMessage(groupId, {
                text: messageText,
                mentions: mentionJids
            }, { quoted: m });
            
        } catch (err) {
            console.error('Sider cek error:', err);
            m.reply(
                `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No se pudo completar el escaneo de siders.\nDetalle: _${err.message}_ »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        return;
    }
    
    // SET - Ajustes
    if (sub === 'set') {
        if (!m.isAdmin && !m.isOwner) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo los administradores pueden cambiar la configuración. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        const setting = args[1]?.toLowerCase();
        const value = args[2]?.toLowerCase();
        
        if (!db.data.sider.settings[groupId]) {
            db.data.sider.settings[groupId] = {
                period: 7,
                autoKick: false,
                warningMsg: true
            };
        }
        
        if (setting === 'period') {
            const periodDays = parseInt(value);
            if (isNaN(periodDays) || periodDays < 1 || periodDays > 60) {
                return m.reply(
                    `ꕥ 𝖵𝖠𝖫𝖮𝖱 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El periodo debe ser un número entero entre 1 y 60 días. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            db.data.sider.settings[groupId].period = periodDays;
            db.save();
            try { await m.react('✅'); } catch {}
            
            return m.reply(
                `ꕥ 𝖯𝖤𝖱𝖨𝖮𝖣𝖮 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
                `      • Nuevo lapso :: *${periodDays} días*\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        if (setting === 'autokick') {
            if (value === 'on' || value === 'true') {
                db.data.sider.settings[groupId].autoKick = true;
                db.save();
                try { await m.react('✅'); } catch {}
                return m.reply(
                    `ꕥ 𝖠𝖴𝖳𝖮-𝖪𝖨𝖢𝖪 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ¡Cuidado! Los lectores silenciosos serán expulsados automáticamente al superar el plazo. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            } else if (value === 'off' || value === 'false') {
                db.data.sider.settings[groupId].autoKick = false;
                db.save();
                try { await m.react('✅'); } catch {}
                return m.reply(
                    `ꕥ 𝖠𝖴𝖳𝖮-𝖪𝖨𝖢𝖪 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los siders solo aparecerán en el reporte sin ser expulsados. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            } else {
                return m.reply(
                    `ꕥ 𝖮𝖯𝖢𝖨𝖮́𝖭 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Utiliza \`on\` o \`off\` después de autokick. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
        }
        
        return m.reply(
            `ꕥ 𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨𝖀́𝖭 𝖲𝖨𝖣𝖤𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • \`${m.prefix}sider set period <días>\`\n` +
            `      • \`${m.prefix}sider set autokick on/off\`\n\n` +
            `      • Periodo actual :: *${db.data.sider.settings[groupId].period} días*\n` +
            `      • Auto-kick :: *${db.data.sider.settings[groupId].autoKick ? 'ON' : 'OFF'}*\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    // KICK - Expulsar siders manualmente
    if (sub === 'kick') {
        if (!m.isAdmin && !m.isOwner) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo los administradores pueden ejecutar esta acción. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        if (!isEnabled) {
            return m.reply(
                `ꕥ 𝖲𝖨𝖫𝖤𝖭𝖳 𝖱𝖤𝖠𝖣𝖤𝖱 𝖮𝖥𝖥 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Debes activar el sistema primero con \`${m.prefix}sider on\`. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        try {
            const groupMeta = await sock.groupMetadata(groupId);
            const participants = groupMeta.participants || [];
            
            const periodMs = (db.data.sider.settings[groupId]?.period || 7) * 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            const kickList = [];
            
            for (const participant of participants) {
                const jid = participant.id;
                const lastActive = db.data.sider.lastActivity[groupId]?.[jid] || 0;
                const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin';
                
                if (isAdmin || jid === sock.user.id) continue;
                
                if (lastActive === 0 || (now - lastActive) > periodMs) {
                    kickList.push(jid);
                }
            }
            
            if (kickList.length === 0) {
                return m.reply(
                    `ꕥ 𝖲𝖨𝖭 𝖲𝖨𝖣𝖤𝖱𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No hay usuarios inactivos para expulsar en este momento. »\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
                );
            }
            
            await m.reply(
                `ꕥ 𝖤𝖷𝖯𝖴𝖫𝖲𝖬𝖨𝖮́𝖭 𝖤𝖭 𝖯𝖱𝖮𝖢𝖤𝖲𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      • Total de siders a expulsar :: ${kickList.length}\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Procesando exclusión con pausas de seguridad... »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
            
            let kicked = 0;
            let failed = 0;
            
            for (const jid of kickList) {
                try {
                    await sock.groupParticipantsUpdate(groupId, [jid], 'remove');
                    kicked++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    failed++;
                    console.error(`Error al expulsar a ${jid}:`, err);
                }
            }
            
            return m.reply(
                `ꕥ 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲 𝖣𝖤 𝖤𝖷𝖯𝖴𝖫𝖲𝖨𝖮́𝖭 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `      • Exitosos :: *${kicked}*\n` +
                `      • Fallidos :: *${failed}*\n` +
                `      • Total inicial :: *${kickList.length}*\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El grupo ha quedado depurado. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
            
        } catch (err) {
            console.error('Sider kick error:', err);
            m.reply(
                `ꕥ 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Ocurrió un error al intentar expulsar siders.\nDetalle: _${err.message}_ »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        return;
    }
    
    // RESET - Reiniciar historial de actividad
    if (sub === 'reset') {
        if (!m.isAdmin && !m.isOwner) {
            return m.reply(
                `ꕥ 𝖠𝖢𝖢𝖤𝖲𝖮 𝖣𝖤𝖭𝖤𝖦𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Solo los administradores pueden reiniciar los registros. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
        
        if (db.data.sider.lastActivity[groupId]) {
            delete db.data.sider.lastActivity[groupId];
            db.save();
            try { await m.react('✅'); } catch {}
            return m.reply(
                `ꕥ 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮𝖲 𝖱𝖤𝖨𝖭𝖨𝖢𝖨𝖠𝖣𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Se ha borrado el historial de actividad. El conteo comienza nuevamente desde este instante. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        } else {
            return m.reply(
                `ꕥ 𝖲𝖨𝖭 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « No hay datos previos registrados para este grupo. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
    }
    
    // STATUS - Ver estado general
    if (sub === 'status') {
        const settings = db.data.sider.settings[groupId] || { period: 7, autoKick: false };
        const activityCount = db.data.sider.lastActivity[groupId] ? Object.keys(db.data.sider.lastActivity[groupId]).length : 0;
        
        return m.reply(
            `ꕥ 𝖲𝖳𝖠𝖳𝖴𝖲 𝖲𝖨𝖣𝖤𝖱 𝖣𝖤𝖳𝖤𝖢𝖳𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      • Estado :: ${isEnabled ? '✅ Activado' : '❌ Desactivado'}\n` +
            `      • Periodo :: ${settings.period} días\n` +
            `      • Auto-kick :: ${settings.autoKick ? '✅ ON' : '❌ OFF'}\n` +
            `      • Registrados :: ${activityCount} miembros\n\n` +
            `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲*\n` +
            `      • \`${m.prefix}sider on / off\`\n` +
            `      • \`${m.prefix}sider cek\`\n` +
            `      • \`${m.prefix}sider kick\`\n` +
            `      • \`${m.prefix}sider reset\`\n` +
            `      • \`${m.prefix}sider set period <dias>\`\n` +
            `      • \`${m.prefix}sider set autokick on/off\`\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }
    
    // MENÚ PRINCIPAL
    return m.reply(
        `ꕥ 𝖲𝖨𝖫𝖤𝖭𝖳 𝖱𝖤𝖠𝖣𝖤𝖱 𝖬𝖤𝖭𝖴́ ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      • Estado en grupo :: ${isEnabled ? '✅ Activado' : '❌ Desactivado'}\n\n` +
        `      𓈒 ◌ㅤ──    *𝖮𝖯𝖢𝖨𝖮𝖭𝖤𝖲 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲*\n` +
        `      • \`${m.prefix}sider on\` → Activar detector\n` +
        `      • \`${m.prefix}sider off\` → Desactivar detector\n` +
        `      • \`${m.prefix}sider cek\` → Listar siders con etiquetas\n` +
        `      • \`${m.prefix}sider kick\` → Expulsar siders detectados\n` +
        `      • \`${m.prefix}sider status\` → Ver parámetros\n` +
        `      • \`${m.prefix}sider reset\` → Limpiar historial\n` +
        `      • \`${m.prefix}sider set period <n>\` → Cambiar lapso\n` +
        `      • \`${m.prefix}sider set autokick on/off\` → Auto-expulsión\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Sistema avanzado de vigilancia para control de inactividad. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
}

// LISTENER para registrar actividad de chat
async function setupSiderListener(sock) {
    console.log('🕵️ Starting Sider (Silent Reader) Listener...');
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            
            if (msg.key.fromMe) return;
            
            const chatId = msg.key.remoteJid;
            if (!chatId || !chatId.endsWith('@g.us')) return;
            
            const sender = msg.key.participant || msg.key.remoteJid;
            if (!sender) return;
            
            const db = getDatabase();
            
            if (!db.data.sider) {
                db.data.sider = {
                    enabled: {},
                    lastActivity: {},
                    settings: {}
                };
            }
            
            if (!db.data.sider.lastActivity[chatId]) {
                db.data.sider.lastActivity[chatId] = {};
            }
            db.data.sider.lastActivity[chatId][sender] = Date.now();
            // no db.save() cada mensaje para evitar I/O, se guarda con autosave
        } catch (e) {
            console.error('Sider listener error:', e);
        }
    });
}

export { pluginConfig as config, handler, setupSiderListener };