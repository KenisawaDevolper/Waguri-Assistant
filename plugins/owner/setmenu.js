import { getAssetBuffer } from "../../src/lib/rimuru-asset-manager.js";
import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
const pluginConfig = {
  name: "setmenu",
  alias: ["menuvariant", "menustyle"],
  category: "owner",
  description: "Mengatur variant tampilan menu",
  usage: ".setmenu <v1-v2>",
  example: ".setmenu v2",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const VARIANTS = {
  v1: {
    id: 1,
    name: "BASIC",
    desc: "Tampilan basic bawaan Rimuru-MD",
    emoji: "🖼️",
  },
  v2: {
    id: 2,
    name: "EXECUTIVE",
    desc: "Menu Executive dengan daftar kategori dan tombol Pilih Menu",
    emoji: "◈",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();
  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANT TIDAK VALID*\n\nGunakan: *v1* atau *v2*`);
      return;
    }
    db.setting("menuVariant", selected.id);
    await db.save();
    await m.reply(
      `✅ *MENU VARIANT DIUBAH*\n\n` +
      `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
      `_${selected.desc}_`,
    );
    return;
  }

  const stored = Number(db.setting("menuVariant"));
  const configured = Number(config.ui?.menuVariant);
  const current = [1, 2].includes(stored) ? stored : ([1, 2].includes(configured) ? configured : 2);

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setmenu ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🎨 Pilih Variant Menu",
        sections: [{ title: "Daftar Variant Menu", rows }],
      }),
    },
  ];

  const bodyText =
    `🎨🖼️ *MENU VARIANT*\n\n` +
    `Atur tampilan menu utama bot ketika user mengetik perintah menu 📋✨\n` +
    `Variant aktif saat ini: *V${current} — ${VARIANTS[`v${current}`]?.name || "Unknown"}* 🎯\n\n` +
    `> Pilih variant menu dari tombol di bawah 👇`;

  await sock.sendButton(
    m.chat,
    getAssetBuffer("rimuru-mp4"),
    bodyText,
    m,
    {
      type: "video",
      mimetype: "video/mp4",
      gifPlayback: true,
      buttons,
      footer: "Rimuru • Menu Variant Selector",
    },
  );
}

export { pluginConfig as config, handler };
