import { getDatabase } from "../../src/lib/rimuru-database.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "anticall",
  alias: ["antitelpon", "antitelp", "rejectcall"],
  category: "owner",
  description: "Rechaza automáticamente las llamadas entrantes con la estética Waguri Assistant 📵",
  usage: ".anticall on/off",
  example: ".anticall on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("antiCall") ?? config.features?.antiCall ?? true;
    return m.reply(
      `📞 *Anti Call*\n\n` +
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}anticall on* — Activar\n` +
        `> *${m.prefix}anticall off* — Nonaktifkan\n\n` +
        `_Bot akan otomatis menolak panggilan masuk_`
    );
  }

  if (option === "on") {
    db.setting("antiCall", true);
    const ctx = saluranCtx();
    return m.reply(
      `📞 *Anti Call Aktif*\n\n` +
        `> Bot akan otomatis menolak panggilan masuk`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("antiCall", false);
    return m.reply(
      `📞 *Anti Call Nonaktif*\n\n` +
        `> Bot no akan menolak panggilan masuk`
    );
  }

  return m.reply(
    `❌ *Opsi No Valid*\n\n> Gunakan *${m.prefix}anticall on* atau *${m.prefix}anticall off*`
  );
}

export { pluginConfig as config, handler };
