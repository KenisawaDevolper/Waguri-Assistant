import { getDatabase } from '../../src/lib/rimuru-database.js';

const pluginConfig = {
    name: 'slowmode',
    alias: ['slow', 'setslowmode'],
    category: 'group',
    description: 'Configura el modo lento del grupo para limitar la velocidad de envío de mensajes.',
    usage: '.slowmode <on/off/onlycommand> [segundos]',
    example: '.slowmode on 30',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

const lastMessageTime = new Map();

const PRESETS = {
    santai: 10,
    normal: 30,
    ketat: 60,
    superketat: 120,
    max: 300,
};

const MODES = {
    all: 'Todos los mensajes y comandos son eliminados',
    onlycommand: 'Los comandos se silencian, el chat normal sigue activo',
};

async function handler(m, { sock }) {
    const db = getDatabase();
    const args = m.args || [];
    const subCmd = args[0]?.toLowerCase();
    let groupData = db.getGroup(m.chat) || {};

    if (!subCmd || subCmd === 'status') {
        const sm = groupData.slowmode || {};
        const enabled = sm.enabled;
        const delay = sm.delay || 30;
        const mode = sm.mode || 'all';
        const presetList = Object.entries(PRESETS)
            .map(([name, sec]) => `      • \`.slowmode ${name}\` — ${sec}s`)
            .join('\n');

        return m.reply(
            `ꕥ 𝖲𝖫𝖮𝖶𝖬𝖮𝖣𝖤 𝖲𝖤𝖳𝖳𝖨𝖭𝖦𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `      𓈒 ◌ㅤ──    *𝖤𝖲𝖳𝖠𝖣𝖮 𝖠𝖢𝖳𝖴𝖠𝖫*\n` +
            `      • Estado :: ${enabled ? `✅ Activado (${delay}s)` : '❌ Desactivado'}\n` +
            `      • Modo :: ${mode.toUpperCase()}\n\n` +
            `      𓈒 ◌ㅤ──    *𝖯𝖱𝖤𝖲𝖤𝖳𝖲 𝖣𝖨𝖲𝖯𝖮𝖭𝖨𝖡𝖫𝖤𝖲*\n` +
            `${presetList}\n\n` +
            `      𓈒 ◌ㅤ──    *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖴́𝖳𝖨𝖫𝖤𝖲*\n` +
            `      • \`.slowmode on 30\` — Activa para todo\n` +
            `      • \`.slowmode onlycommand 30\` — Solo comandos\n` +
            `      • \`.slowmode off\` — Desactivar\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Nota: Los administradores y creadores están exentos. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }

    if (subCmd === 'off') {
        db.setGroup(m.chat, { ...groupData, slowmode: { enabled: false } });
        try { await m.react('✅'); } catch {}
        return m.reply(
            `ꕥ 𝖲𝖫𝖮𝖶𝖬𝖮𝖣𝖤 𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El sistema de modo lento ha sido desactivado en este grupo. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }

    let mode = 'all';
    let delay;
    let delayArg;

    if (subCmd === 'onlycommand' || subCmd === 'oc') {
        mode = 'onlycommand';
        delayArg = args[1];
    } else if (subCmd === 'on' || subCmd === 'set') {
        delayArg = args[1];
    } else if (PRESETS[subCmd]) {
        delay = PRESETS[subCmd];
        mode = args[1]?.toLowerCase() === 'onlycommand' || args[1]?.toLowerCase() === 'oc'
            ? 'onlycommand' : 'all';
    } else {
        delay = parseInt(subCmd);
        if (isNaN(delay)) {
            return m.reply(
                `ꕥ 𝖲𝖮𝖴𝖱𝖢𝖤 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Formato incorrecto. Usa \`.slowmode on 30\` o \`.slowmode onlycommand 30\`. »\n\n` +
                `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
            );
        }
    }

    if (!delay) {
        if (delayArg && PRESETS[delayArg]) {
            delay = PRESETS[delayArg];
        } else {
            delay = parseInt(delayArg) || 30;
        }
    }

    if (delay < 5 || delay > 600) {
        return m.reply(
            `ꕥ 𝖫𝖨́𝖬𝖨𝖳𝖤 𝖣𝖤 𝖳𝖨𝖤𝖬𝖯𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
            `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « El retraso debe configurarse entre un rango de 5 y 600 segundos. »\n\n` +
            `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
        );
    }

    db.setGroup(m.chat, {
        ...groupData,
        slowmode: { enabled: true, delay, mode }
    });

    const presetName = Object.entries(PRESETS).find(([, v]) => v === delay)?.[0];
    const label = presetName ? ` (${presetName})` : '';
    const modeDesc = MODES[mode];

    try { await m.react('✅'); } catch {}

    await m.reply(
        `ꕥ 𝖲𝖫𝖮𝖶𝖬𝖮𝖣𝖤 𝖠𝖢𝖳𝖨𝖵𝖠𝖣𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
        `      • Retraso :: *${delay} segundos*${label}\n` +
        `      • Modo :: *${mode.toUpperCase()}*\n` +
        `      • Regla :: ${modeDesc}\n\n` +
        `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Los administradores y creadores no se ven afectados por esta restricción. »\n\n` +
        `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
}

function checkSlowmode(m, sock, db) {
    if (!m.isGroup) return false;

    const groupData = db.getGroup(m.chat) || {};
    if (!groupData.slowmode?.enabled) return false;

    const sm = groupData.slowmode;
    const mode = sm.mode || 'all';

    if (mode === 'onlycommand' && !m.isCommand) return false;

    const delay = sm.delay || 30;
    const key = `${m.chat}_${m.sender}`;
    const now = Date.now();

    const lastTime = lastMessageTime.get(key) || 0;
    const timePassed = (now - lastTime) / 1000;

    if (timePassed < delay) {
        return { remaining: Math.ceil(delay - timePassed), mode };
    }

    lastMessageTime.set(key, now);

    if (lastMessageTime.size > 5000) {
        const cutoff = now - 600_000;
        for (const [k, v] of lastMessageTime) {
            if (v < cutoff) lastMessageTime.delete(k);
        }
    }

    return false;
}

export { pluginConfig as config, handler, checkSlowmode };
