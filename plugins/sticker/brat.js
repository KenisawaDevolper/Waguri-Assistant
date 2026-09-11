import { getAssetBuffer } from "../../src/lib/rimuru-asset-manager.js";
import fs from "fs";
import config from "../../config.js";
import te from "../../src/lib/rimuru-error.js";
import rimuruApi from "../../src/lib/rimuru-apimanager.js";

const pluginConfig = {
  name: "brat",
  alias: ["bratmenu", "bratimg", "brattext"],
  category: "sticker",
  description: "𝖬ᧉ𝗇𝗎 ᥎⍺𝗋ı⍺𝗇ƚ 𝖻𝗋⍺ƚ 𝗒 𝗀ᧉ𝗇ᧉ𝗋⍺𝖽𝗈𝗋 𝖽ᧉ 𝗌ƚı𝖼𝗄ᧉ𝗋 𝖻𝗋⍺ƚ",
  usage: ".brat | .bratimg <ƚᧉ𝗑ƚ𝗈>",
  example: ".bratimg 𝖧⍺ı 𝗌ᧉ𝗆𝗎⍺",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const BRAT_VARIANTS = [
  {
    title: "Brat Default",
    description: "Sticker brat versi biasa",
    command: "bratimg",
  },
  {
    title: "Brat Green",
    description: "Variant brat warna hijau",
    command: "bratgreen",
  },
  {
    title: "Brat Cewek",
    description: "Variant brat cewek",
    command: "bratcewek",
  },
  {
    title: "Brat Vermeil",
    description: "Variant brat Vermeil",
    command: "bratvermeil",
  },
  { title: "Brat HD", description: "Variant brat HD", command: "brathd" },
  {
    title: "Brat Video",
    description: "Sticker brat animated",
    command: "bratvid",
  },
  {
    title: "Brat Video V2",
    description: "Sticker brat video v2",
    command: "bratvid2",
  },
  {
    title: "Brat Vermeil Video",
    description: "Variant brat Vermeil video",
    command: "bratvermeilvid",
  },
  {
    title: "Brat Gojo",
    description: "Variant brat Gojo",
    command: "bratgojo",
  },
  {
    title: "Brat Gojo Video",
    description: "Variant brat Gojo video",
    command: "bratgojovid",
  },
];

function buildVariantRows(prefix, text) {
  return BRAT_VARIANTS.map((item) => ({
    title: item.title,
    description: `${item.description} • .${item.command} <ƚᧉ𝗑ƚ𝗈>`,
    id: `${prefix}${item.command} ${text}`,
  }));
}

async function sendBratMenu(m, sock, text) {
  const caption =
    `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
    `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ *𝖡𝖱𝖠𝖳 𝖬𝖤𝖭𝖴* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
    `      🌿   𓈒 ◌ㅤ──    _¡𝖼⍺𝗆𝗎 𝗆⍺𝗎 𝖻𝗎⍺ƚ 𝖻𝗋⍺ƚ 𝗒⍺𝗄, 𝗌ı𝗅⍺𝗁𝗄⍺𝗇 𝗉ı𝗅ı𝗁 ᥎⍺𝗋ı⍺𝗇ƚ 𝖻𝗋⍺ƚ 𝗍𝗈𝗆𝖻𝗈𝗅 𝖽ı𝖻⍺𝗐⍺𝗁!_\n\n` +
    `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`;

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌾 𝖯ı𝗅ı𝗁 𝖵⍺𝗋ı⍺𝗇ƚ 𝖡𝗋⍺ƚ",
        sections: [
          {
            title: "𝖵⍺𝗋ı⍺𝗇ƚ 𝖡𝗋⍺ƚ",
            rows: buildVariantRows(m.prefix, text),
          },
        ],
      }),
    },
  ];

  await sock.sendButton(
    m.chat,
    getAssetBuffer("rimuru"),
    caption,
    m,
    {
      buttons,
      footer: "𝖯ı𝗅ı𝗁 ᥎⍺𝗋ı⍺𝗇ƚ 𝖻𝗋⍺ƚ 𝖿⍺𝗏𝗈𝗋ıƚ 𝗄⍺𝗆𝗎",
    },
  );
}

async function handler(m, { sock }) {
  const text = m.text;
  const command = String(m.command || "").toLowerCase();

  if (command === "brat") {
    await sendBratMenu(m, sock, text);
    return;
  }

  if (!text) {
    return m.reply(
      `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
      `❌ *𝖤𝖱𝖱𝖮𝖱* ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      🖼️   𓈒 ◌ㅤ──    *𝖡𝖱𝖠𝖳 𝖨𝖬𝖠𝖦𝖤*\n` +
      `      ⚠️   𓈒 ◌ㅤ──    _¡𝖬⍺𝗌𝗎𝗄𝗄⍺𝗇 ƚᧉ𝗑ƚ𝗈!_\n\n` +
      `> 𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: \`${m.prefix}bratimg 𝖧⍺ı 𝗌ᧉ𝗆𝗎⍺\`\n\n` +
      `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
    );
  }

  m.react("🕕");

  try {
    await sock.sendImageAsSticker(m.chat, `https://api.nexray.eu.cc/maker/brat?text=${encodeURIComponent(text)}`, m, {
      packname: config.sticker.packname,
      author: config.sticker.author,
    });

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
