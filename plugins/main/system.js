import config from '../../config.js'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec);

const pluginConfig = {
    name: 'system',
    alias: ['ram', 'cpu', 'disk', 'latencia', 'ping', 'sistema'],
    category: 'main',
    description: 'Muestra información del sistema (RAM, CPU, Disco, Latencia)',
    usage: '.ram | .cpu | .disk | .ping',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
};

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

async function getDiskUsage() {
    try {
        if (process.platform === 'win32') {
            const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
            const lines = stdout.trim().split('\n').slice(1);
            const drives = lines.map(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 3) {
                    const caption = parts[0];
                    const free = parseInt(parts[1]);
                    const size = parseInt(parts[2]);
                    const used = size - free;
                    return `      💿   𓈒 ◌ㅤ──    ᑯɩ𝗌𝖼𝗈 [${caption}] :: *${formatSize(used)} / ${formatSize(size)}* (Libre: ${formatSize(free)})`;
                }
                return null;
            }).filter(Boolean).join('\n');

            return `ꕥ 𝖴𝖲𝖮 𝖣𝖤𝖫 𝖣𝖨𝖲𝖢𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                   `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ⍺𝗅𝗆⍺𝖼ᧉ𝗇⍺𝗆ɩᧉ𝗇ƚ𝗈 ᑯᧉ𝗅 𝗌ɩ𝗌ƚᧉ𝗆⍺ »\n\n` +
                   drives + `\n\n` +
                   `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
        } else {
            const { stdout } = await execAsync('df -h /');
            const lines = stdout.trim().split('\n');
            const parts = lines[1].replace(/\s+/g, ' ').split(' ');
            return `ꕥ 𝖴𝖲𝖮 𝖣𝖤𝖫 𝖣𝖨𝖲𝖢𝖮 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                   `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ⍺𝗅𝗆⍺𝖼ᧉ𝗇⍺𝗆ɩᧉ𝗇ƚ𝗈 𝗉𝗋ɩ𝗇𝖼ɩ𝗉⍺𝗅 »\n\n` +
                   `      💾   𓈒 ◌ㅤ──    ƚ𝗈ƚ⍺𝗅 :: *${parts[1]}*\n` +
                   `      📊   𓈒 ◌ㅤ──    𝗎𝗌⍺ᑯ𝗈 :: *${parts[2]} (${parts[4]})*\n` +
                   `      🍃   𓈒 ◌ㅤ──    𝗅ɩ𝖻𝗋ᧉ :: *${parts[3]}*\n\n` +
                   `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
        }
    } catch (e) {
        return '✐ No se pudo obtener la información del disco ! ୧ ֹ ִ';
    }
}

async function handler(m, { sock }) {
    const command = m.command.toLowerCase();

    try {
        switch (command) {
            case 'ram': {
                const totalMem = os.totalmem();
                const freeMem = os.freemem();
                const usedMem = totalMem - freeMem;
                
                const text = 
                    `ꕥ 𝖤𝖲𝖳𝖠𝖣𝖮 𝖣𝖤 𝖫𝖠 𝖬𝖤𝖬𝖮𝖱𝖨𝖠 𝖱𝖠𝖬 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗎𝗌𝗈 ᑯᧉ 𝗆ᧉ𝗆𝗈𝗋ɩ⍺ »\n\n` +
                    `      💻   𓈒 ◌ㅤ──    ƚ𝗈ƚ⍺𝗅 :: *${formatSize(totalMem)}*\n` +
                    `      📊   𓈒 ◌ㅤ──    𝗎𝗌⍺ᑯ𝗈 :: *${formatSize(usedMem)}*\n` +
                    `      🍃   𓈒 ◌ㅤ──    𝗅ɩ𝖻𝗋ᧉ :: *${formatSize(freeMem)}*\n` +
                    `      ⚙️   𓈒 ◌ㅤ──    𝗉𝗅⍺ƚ⍺𝖿𝗈𝗋𝗆⍺ :: *${os.platform()} (${os.arch()})*\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
                m.reply(text);
            }
            break;

            case 'cpu': {
                const cpus = os.cpus();
                const model = cpus[0].model;
                const speed = cpus[0].speed;
                const cores = cpus.length;
                
                const uptime = os.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

                const text = 
                    `ꕥ 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨Ó𝖭 𝖣𝖤𝖫 𝖢𝖯𝖴 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ᑯᧉƚ⍺𝗅𝗅ᧉ𝗌 ᑯᧉ𝗅 𝗉𝗋𝗈𝖼ᧉ𝗌⍺ᑯ𝗈𝗋 »\n\n` +
                    `      🖥️   𓈒 ◌ㅤ──    𝗆𝗈ᑯᧉ𝗅𝗈 :: *${model}*\n` +
                    `      ⚡   𓈒 ◌ㅤ──    ᥎ᧉ𝗅𝗈𝖼ɩᑯ⍺ᑯ :: *${speed} MHz*\n` +
                    `      🧮   𓈒 ◌ㅤ──    𝗇ú𝖼𝗅ᧉ𝗈𝗌 :: *${cores} Núcleo(s)*\n` +
                    `      ⏱️   𓈒 ◌ㅤ──    ƚɩᧉ𝗆𝗉𝗈 ⍺𝖼ƚɩ᥎𝗈 :: *${uptimeStr}*\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
                m.reply(text);
            }
            break;

            case 'disk': {
                const diskInfo = await getDiskUsage();
                m.reply(diskInfo);
            }
            break;

            case 'ping':
            case 'latency': {
                const timestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now();
                const now = Date.now();
                const latency = Math.abs(now - timestamp);
                let speed = '';
                if (latency < 100) speed = '🚀 Rápida';
                else if (latency < 500) speed = '⚡ Buena';
                else if (latency < 1000) speed = '🐢 Normal';
                else speed = '🐌 Lenta';

                const text = 
                    `ꕥ 𝖫𝖠𝖳𝖤𝖭𝖢𝖨𝖠 𝖣𝖤𝖫 𝖲𝖤𝖱𝖵𝖨𝖣𝖮𝖱 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
                    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗉𝗈𝗇𝗀 ! »\n\n` +
                    `      📶   𓈒 ◌ㅤ──    𝗅⍺ƚᧉ𝗇𝖼ɩ⍺ :: *${latency} ms*\n` +
                    `      ⚡   𓈒 ◌ㅤ──    𝗋ᧉ𝗌𝗉𝗎ᧉ𝗌ƚ⍺ :: *${speed}*\n\n` +
                    `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
                m.reply(text);
            }
            break;
        }
    } catch (e) {
        console.error('System Plugin Error:', e);
        m.reply('✐ Ocurrió un error al obtener los datos del sistema ! ୧ ֹ ִ');
    }
}

export { pluginConfig as config, handler }
