import os from "os";
import te from "../../src/lib/rimuru-error.js";

const pluginConfig = {
  name: "stats",
  alias: ["botstats", "status", "stat", "estadisticas", "estado"],
  category: "main",
  description: "Muestra las estadísticas y estado del bot",
  usage: ".stats",
  example: ".stats",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

async function handler(m, { sock, db, uptime, config: botConfig }) {
  try {
    const users = db.db?.data?.users || db.data?.users || {};
    const groups = db.db?.data?.groups || db.data?.groups || {};
    const memUsed = process.memoryUsage();
    const cpuUsage = os.loadavg()[0].toFixed(2);
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const totalUsuarios = Object.keys(users).length;
    const totalGroups = Object.keys(groups).length;
    const premiumUsuarios = Object.values(users).filter((u) => u.premium || u.isPremium).length;

    const botName = botConfig?.bot?.name || "Waguri Bot";
    const botVersion = `v${botConfig?.bot?.version || "1.0.0"}`;
    const uptimeStr = formatUptime(uptime);
    const updatedTime = new Date().toLocaleTimeString("es-ES", { hour12: false });

    const caption =
      `ꕥ 𝖤𝖲𝖳𝖠𝖣𝖨𝖲𝖳𝖨𝖢𝖠𝖲 𝖣𝖤𝖫 𝖡𝖮𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « ɩ𝗇𝖿𝗈𝗋𝗆⍺𝖼ɩó𝗇 𝗀ᧉ𝗇ᧉ𝗋⍺𝗅 »\n\n` +
      `        𓈒 ◌ㅤ──    𝖻𝗈ƚ :: *${botName}*\n` +
      `        𓈒 ◌ㅤ──    ᥎ᧉ𝗋𝗌ɩó𝗇 :: *${botVersion}*\n` +
      `        𓈒 ◌ㅤ──    ƚɩᧉ𝗆𝗉𝗈 ⍺𝖼ƚɩ᥎𝗈 :: *${uptimeStr}*\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝖻⍺𝗌ᧉ ᑯᧉ ᑯ⍺ƚ𝗈𝗌 »\n\n` +
      `        𓈒 ◌ㅤ──    𝗎𝗌𝗎⍺𝗋ɩ𝗈𝗌 :: *${totalUsuarios}*\n` +
      `        𓈒 ◌ㅤ──    𝗉𝗋ᧉ𝗆ɩ𝗎𝗆 :: *${premiumUsuarios}*\n` +
      `        𓈒 ◌ㅤ──    𝗀𝗋𝗎𝗉𝗈𝗌 :: *${totalGroups}*\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « 𝗋ᧉ𝗇ᑯɩ𝗆ɩᧉ𝗇ƚ𝗈 ᑯᧉ𝗅 𝗌ɩ𝗌ƚᧉ𝗆⍺ »\n\n` +
      `        𓈒 ◌ㅤ──    𝗉𝗅⍺ƚ⍺𝖿𝗈𝗋𝗆⍺ :: *${os.platform()} ${os.arch()}*\n` +
      `        𓈒 ◌ㅤ──    𝗇𝗈ᑯ𝗈 :: *${process.version}*\n` +
      `        𓈒 ◌ㅤ──    𝖼⍺𝗋𝗀⍺ 𝖼𝗉𝗎 :: *${cpuUsage}%*\n` +
      `        𓈒 ◌ㅤ──    𝗆ᧉ𝗆𝗈𝗋ɩ⍺ 𝗋⍺𝗆 :: *${formatBytes(usedMem)} / ${formatBytes(totalMem)}*\n` +
      `        𓈒 ◌ㅤ──    𝗆ᧉ𝗆𝗈𝗋ɩ⍺ 𝗁ᧉ⍺𝗉 :: *${formatBytes(memUsed.heapUsed)} / ${formatBytes(memUsed.heapTotal)}*\n` +
      `        𓈒 ◌ㅤ──    ⍺𝖼ƚ𝗎⍺𝗅ɩ𝗭⍺ᑯ𝗈 :: *${updatedTime}*\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    return m.reply(caption);
  } catch (error) {
    console.error("Stats Plugin Error:", error);
    m.reply(te?.(m.prefix, m.command, m.pushName) || "✐ Ocurrió un error al obtener las estadísticas ! ୧ ֹ ִ");
  }
}

export { pluginConfig as config, handler };
