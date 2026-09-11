import { getDatabase } from "../../src/lib/rimuru-database.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";

const pluginConfig = {
  name: "unmutegc",
  alias: ["unmutegrup", "unmutebot", "desmuteargc", "unlockbot"],
  category: "group",
  description: "𝖣ᧉ𝗌𝖻𝗅𝗈𝗊𝗎ᧉ⍺ 𝗅𝗈𝗌 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌 𝖽ᧉ𝗅 𝖻𝗈ƚ 𝗉⍺𝗋⍺ 𝗅𝗈𝗌 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 𝖽ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈",
  usage: ".unmutegc",
  example: ".unmutegc",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const groupData = db.getGroup(m.chat) || {};

  if (!groupData.mutegc) {
    return m.reply(
      `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
      `⚠️ *𝖡𝖮𝖳 𝖸𝖠 𝖠𝖢𝖳𝖨𝖵𝖮*\n\n` +
      `      🔊   𓈒 ◌ㅤ──    _𝖫𝗈𝗌 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 𝗒⍺ 𝗉𝗎ᧉ𝖽ᧉ𝗇 𝗎𝗌⍺𝗋 𝗅𝗈𝗌 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌 ᧉ𝗇 ᧉ𝗌ƚᧉ 𝗀𝗋𝗎𝗉𝗈._\n\n` +
      `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
    );
  }

  db.setGroup(m.chat, { mutegc: false });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "ᧉ𝗌ƚᧉ 𝗀𝗋𝗎𝗉𝗈";

  return m.reply(
    `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
    `✅ *𝖡𝖮𝖳 𝖣𝖤𝖲𝖬𝖴𝖳𝖤𝖠𝖣𝖮*\n\n` +
    `      🏠   𓈒 ◌ㅤ──    *𝖦𝗋𝗎𝗉𝗈* : ${groupName}\n` +
    `      🔊   𓈒 ◌ㅤ──    *𝖤𝗌ƚ⍺𝖽𝗈* : 𝖣ᧉ𝗌𝗆𝗎ƚᧉ⍺𝖽𝗈\n` +
    `      ✨   𓈒 ◌ㅤ──    _¡𝖫𝗈𝗌 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 ⍺𝗁𝗈𝗋⍺ 𝗉𝗎ᧉ𝖽ᧉ𝗇 𝗎𝗌⍺𝗋 𝗅𝗈𝗌 𝖼𝗈𝗆⍺𝗇𝖽𝗈𝗌 𝗇𝗎ᧉ᥎⍺𝗆ᧉ𝗇ƚᧉ!_\n\n` +
    `> 𝖴𝗌⍺ \`${m.prefix}mutegc\` 𝗉⍺𝗋⍺ 𝗏𝗈𝗅᥎ᧉ𝗋 ⍺ 𝖻𝗅𝗈𝗊𝗎ᧉ⍺𝗋𝗅𝗈𝗌.\n\n` +
    `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`,
    { contextInfo: ctx }
  );
}

export { pluginConfig as config, handler };
