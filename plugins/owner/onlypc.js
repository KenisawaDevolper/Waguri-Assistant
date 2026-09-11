import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "onlypc",
  alias: ["onlyprivate", "privateonly"],
  category: "owner",
  description: "Alterna el modo del bot solo en chat privado con la estética Waguri Assistant 💬",
  usage: ".onlypc on/off",
  example: ".onlypc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("onlyPc") || false;
    return m.reply(
      `💬 *Only Private*\n\n` +
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}onlypc on* — Bot hanya bisa diakses en chat privado\n` +
        `> *${m.prefix}onlypc off* — Bot bisa diakses di mana saja\n\n` +
        `_Jika aktif, mode Only Group akan otomatis nonaktif_`
    );
  }

  if (option === "on") {
    db.setting("onlyPc", true);
    db.setting("onlyGc", false);
    await m.react("✅");
    return m.reply(
      `💬 *Only Private Aktif*\n\n` +
        `> Bot hanya bisa diakses en chat privado\n` +
        `> Modo Only Group dinonaktifkan`
    );
  }

  if (option === "off") {
    db.setting("onlyPc", false);
    await m.react("❌");
    return m.reply(
      `💬 *Only Private Nonaktif*\n\n` +
        `> Bot bisa diakses di mana saja`
    );
  }

  return m.reply(
    `❌ *Opsi No Valid*\n\n> Gunakan *${m.prefix}onlypc on* atau *${m.prefix}onlypc off*`
  );
}

export { pluginConfig as config, handler };
