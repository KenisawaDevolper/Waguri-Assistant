import config from "../../config.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import {
  addJadibotPremium,
  removeJadibotPremium,
  getJadibotPremiums,
} from "../../src/lib/rimuru-jadibot-database.js";
const pluginConfig = {
  name: "addprem",
  alias: [
    "addpremium",
    "setprem",
    "delprem",
    "delpremium",
    "listprem",
    "premlist",
  ],
  category: "owner",
  description: "Gestionar usuarios premium",
  usage:
    ".addprem <número/@tag> [días]\n.delprem <número/@tag>\n.listprem\n.cekprem <número/@tag>",
  example: ".addprem 6281234567890 30",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extractTarget(m) {
  if (!m) return "";
  if (m.quoted) return m.quoted.sender?.replace(/[^0-9]/g, "") || "";
  if (m.mentionedJid?.length)
    return m.mentionedJid[0]?.replace(/[^0-9]/g, "") || "";
  if (m.args?.length) return m.args[0].replace(/[^0-9]/g, "");
  return "";
}

function toMentionJid(value) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

async function handler(m, { sock, jadibotId, isJadibot }) {
  try {
    const db = getDatabase();
    if (!db?.data) {
      return m.reply("❌ ꕥ Base de datos no disponible ( ᴗ͈ˬᴗ͈ )");
    }

    const cmd = String(m.command || "").toLowerCase();
    if (!cmd) {
      return m.reply("❌ ꕥ Comando no detectado");
    }

  const isAdd = ["addprem", "addpremium", "setprem"].includes(cmd);
  const isDel = ["delprem", "delpremium"].includes(cmd);
  const isList = ["listprem", "premlist"].includes(cmd);

  if (!Array.isArray(db.data.premium)) {
    db.data.premium = db.data.premium && typeof db.data.premium === "object"
      ? Object.values(db.data.premium)
      : [];
  }

  if (isList) {
    if (isJadibot && jadibotId) {
      const jbPremiums = getJadibotPremiums(jadibotId);
      if (jbPremiums.length === 0) {
        return m.reply(
          `💎 ꕥ No hay usuarios premium en este jadibot\n𓈒 ◌ Usa \`${m.prefix}addprem\` para añadir ( ᴗ͈ˬᴗ͈ )`,
        );
      }
      let txt = `💎 *ʟɪsᴛᴀ ᴘʀᴇᴍɪᴜᴍ ᴊᴀᴅɪʙᴏᴛ* — ${jadibotId}\n\n`;
      const mentions = jbPremiums
        .map((p) => (typeof p === "string" ? p : p.jid))
        .map(toMentionJid)
        .filter(Boolean);
      jbPremiums.forEach((p, i) => {
        const num = typeof p === "string" ? p : p.jid;
        const number = String(num || "").replace(/[^0-9]/g, "");
        txt += `${i + 1}. @${number}\n`;
      });
      txt += `\nTotal: *${jbPremiums.length}* premium`;
      return m.reply(txt, { mentions });
    }

    if (db.data.premium.length === 0) {
      return m.reply(`💎 ꕥ No hay usuarios premium registrados ( ᴗ͈ˬᴗ͈ )`);
    }
    let txt = `💎 *ʟɪsᴛᴀ ᴘʀᴇᴍɪᴜᴍ* 𓈒 ◌\n\n`;
    const now = Date.now();
    const mentions = db.data.premium
      .map((p) => (typeof p === "string" ? p : p.id))
      .map(toMentionJid)
      .filter(Boolean);
    db.data.premium.forEach((p, i) => {
      const num = typeof p === "string" ? p : p.id;
      const remaining =
        typeof p === "object" && p.expired
          ? Math.ceil((p.expired - now) / (1000 * 60 * 60 * 24))
          : null;
      const status =
        remaining === null
          ? "Permanente"
          : remaining > 0
            ? remaining + "d"
            : "Expirado";
      const number = String(num || "").replace(/[^0-9]/g, "");
      txt += `${i + 1}. @${number} — ${status}\n`;
    });
    txt += `\nTotal: *${db.data.premium.length}* premium`;
    return m.reply(txt, { mentions });
  }

  let targetNumber = await extractTarget(m);

  if (!targetNumber) {
    return m.reply(
      `💎 *${isAdd ? "ᴀñᴀᴅɪʀ" : "ᴇʟɪᴍɪɴᴀʀ"} ᴘʀᴇᴍɪᴜᴍ* 𓈒 ◌\n\nꕥ Ingresa el número o menciona al usuario\n\`Ejemplo: ${m.prefix}${cmd} 6281234567890\``,
    );
  }

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`❌ ꕥ Formato de número no válido ( ᴗ͈ˬᴗ͈ )`);
  }

  if (isJadibot && jadibotId) {
    if (isAdd) {
      if (addJadibotPremium(jadibotId, targetNumber)) {
        await m.react("💎");
        return m.reply(
          `✅ ꕥ Usuario *${targetNumber}* añadido como premium del jadibot 𓈒 ◌ ( ᴗ͈ˬᴗ͈ )`,
        );
      } else {
        return m.reply(`❌ ꕥ \`${targetNumber}\` ya es premium en este jadibot`);
      }
    } else if (isDel) {
      if (removeJadibotPremium(jadibotId, targetNumber)) {
        await m.react("✅");
        return m.reply(
          `✅ ꕥ Usuario *${targetNumber}* eliminado del premium del jadibot`,
        );
      } else {
        return m.reply(`❌ ꕥ \`${targetNumber}\` no es premium en este jadibot`);
      }
    }
    return;
  }

  if (isAdd) {
    const existingIndex = db.data.premium.findIndex((p) =>
      typeof p === "string" ? p === targetNumber : p.id === targetNumber,
    );

    let durationMs = 30 * 24 * 60 * 60 * 1000;
    let durationLabel = "30 días";
    
    const timeArg = m.args?.find((a) => /^\d+(h|hari|j|jam|m|menit|d|detik)?$/i.test(a));
    if (timeArg) {
      const match = timeArg.toLowerCase().match(/^(\d+)(h|hari|j|jam|m|menit|d|detik)?$/);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2] || "h";
        if (unit === "d" || unit === "detik") {
          durationMs = val * 1000;
          durationLabel = `${val} segundos`;
        } else if (unit === "m" || unit === "menit") {
          durationMs = val * 60 * 1000;
          durationLabel = `${val} minutos`;
        } else if (unit === "j" || unit === "jam") {
          durationMs = val * 60 * 60 * 1000;
          durationLabel = `${val} horas`;
        } else {
          durationMs = val * 24 * 60 * 60 * 1000;
          durationLabel = `${val} días`;
        }
      }
    }

    const pushName = m.quoted?.pushName || m.pushName || "Unknown";
    const now = Date.now();

    let newExpired;

    if (existingIndex !== -1) {
      const currentData = db.data.premium[existingIndex];
      const currentExpired =
        typeof currentData === "string" ? now : currentData.expired || now;
      const baseTime = currentExpired > now ? currentExpired : now;
      newExpired = baseTime + durationMs;

      if (typeof currentData === "string") {
        db.data.premium[existingIndex] = {
          id: targetNumber,
          expired: newExpired,
          name: pushName,
          addedAt: now,
        };
      } else {
        db.data.premium[existingIndex].expired = newExpired;
        db.data.premium[existingIndex].name = pushName;
      }
    } else {
      newExpired = now + durationMs;
      db.data.premium.push({
        id: targetNumber,
        expired: newExpired,
        name: pushName,
        addedAt: now,
      });
    }

    const jid = targetNumber + "@s.whatsapp.net";
    const user = db.getUser(jid) || db.setUser(jid);
    if (!user) {
      return m.reply(`❌ ꕥ No se pudo crear al usuario *${targetNumber}* en la base de datos ( ᴗ͈ˬᴗ͈ )`);
    }

    if (user.energi !== -1) {
      user.energi = config.energi?.premium || 999999;
    }
    user.isPremium = true;

    db.setUser(jid, user);
    db.updateExp(jid, 200000);
    db.updateKoin(jid, 20000);

    await db.save();

    await m.react("💎");
    return m.reply(
      `✅ ꕥ Premium ${existingIndex !== -1 ? "extendido" : "añadido"} para *${targetNumber}* durante *${durationLabel}* 𓈒 ◌\n🌸 Expira: *${formatDate(newExpired)}* ( ᴗ͈ˬᴗ͈ )`,
    );
  } else if (isDel) {
    const index = db.data.premium.findIndex((p) =>
      typeof p === "string" ? p === targetNumber : p.id === targetNumber,
    );

    if (index === -1) {
      return m.reply(`❌ ꕥ *${targetNumber}* no es premium`);
    }

    db.data.premium.splice(index, 1);

    const jid = targetNumber + "@s.whatsapp.net";
    const user = db.getUser(jid);
    if (user) {
      user.isPremium = false;
      db.setUser(jid, user);
    }

    await db.save();
    await m.react("✅");
    return m.reply(`✅ ꕥ Usuario *${targetNumber}* eliminado del premium 𓈒 ◌`);
  }

  } catch (error) {
    // Jangan biarkan error dari plugin berubah menjadi "handler undefined".
    // Semua error dipastikan menjadi Error/string yang aman untuk logger.
    const detail =
      error instanceof Error
        ? error
        : new Error(
            typeof error === "string"
              ? error
              : error?.message || "Unknown error pada plugin addprem",
          );

    console.error("[addprem]", detail);
    try {
      await m.reply(
        `❌ ꕥ Error al ejecutar *${m?.command || "addprem"}* 𓈒 ◌\n` +
          `✨ Error: ${detail.message || "Error desconocido"}`,
      );
    } catch {}
  }
}

export { pluginConfig as config, handler };
