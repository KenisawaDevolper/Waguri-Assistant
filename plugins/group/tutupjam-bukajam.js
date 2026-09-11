import { getDatabase } from "../../src/lib/rimuru-database.js";

let handler = async (m, { text, command, sock }) => {
  try {
    let [jm, mnt] = (text || "").split(":");

    if (!jm || !mnt) {
      return m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `⚠️ *𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖢𝖮𝖱𝖱𝖤𝖢𝖳𝖮*\n\n` +
        `      ⏰   𓈒 ◌ㅤ──    _𝖯𝗈𝗋 𝖿⍺𝗏𝗈𝗋, 𝗂𝗇𝗀𝗋ᧉ𝗌⍺ 𝗎𝗇 𝗁𝗈𝗋⍺𝗋ı𝗈 𝗏á𝗅ı𝖽𝗈._\n\n` +
        `(•ૢ⚈͒⌄⚈͒•ૢ) *𝖤𝖩𝖤𝖬𝖯𝖫𝖮* 🌸\n` +
        `      💬   𓈒 ◌ㅤ──    > \`${m.prefix}${command} 18:00\`\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      );
    }

    jm = parseInt(jm);
    mnt = parseInt(mnt);

    if (isNaN(jm) || jm < 0 || jm > 23) {
      return m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `❌ *𝖧𝖮𝖱𝖠 𝖨𝖭𝖵Á𝖫𝖨𝖣𝖠*\n\n` +
        `      ⚠️   𓈒 ◌ㅤ──    _𝖫⍺ 𝗁𝗈𝗋⍺ 𝖽ᧉ𝖻ᧉ ᧉ𝗌ƚ⍺𝗋 ᧉ𝗇ƚ𝗋ᧉ 𝟢 𝗒 𝟤𝟥._\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      );
    }

    if (isNaN(mnt) || mnt < 0 || mnt > 59) {
      return m.reply(
        `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
        `❌ *𝖬𝖤𝖭𝖨𝖳 𝖨𝖭𝖵Á𝖫𝖨𝖣𝖮*\n\n` +
        `      ⚠️   𓈒 ◌ㅤ──    _𝖤𝗅 𝗆ᧉ𝗇ıƚ 𝖽ᧉ𝖻ᧉ ᧉ𝗌ƚ⍺𝗋 ᧉ𝗇ƚ𝗋ᧉ 𝟢 𝗒 𝟱𝟿._\n\n` +
        `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
      );
    }

    // Hora actual y objetivo basada en la zona horaria local de Argentina
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Tucuman" }));
    const target = new Date(now);
    target.setHours(jm);
    target.setMinutes(mnt);
    target.setSeconds(0);

    // Si el tiempo objetivo ya pasó hoy, se programa para mañana
    if (target < now) target.setDate(now.getDate() + 1);

    const delay = target - now;
    const actionText = command === "autoclose" ? "𝖼ᧉ𝗋𝗋⍺𝗋á" : "⍺𝖻𝗋ı𝗋á";

    m.reply(
      `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
      `⏰ *𝖦𝖱𝖴𝖯𝖮 𝖯𝖱𝖮𝖦𝖱𝖠𝖬𝖠𝖣𝖮*\n\n` +
      `      🏠   𓈒 ◌ㅤ──    *𝖤𝗌ƚ⍺𝖽𝗈* : 𝖲ᧉ ${actionText} ⍺ 𝗅⍺𝗌 ${jm.toString().padStart(2, "0")}:${mnt.toString().padStart(2, "0")}\n\n` +
      `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
    );

    setTimeout(async () => {
      try {
        if (command === "autoclose") {
          await sock.groupSettingUpdate(m.chat, "announcement");
          await sock.sendMessage(m.chat, {
            text: 
              `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
              `🔒 *𝖦𝖱𝖴𝖯𝖮 𝖢𝖤𝖱𝖱𝖠𝖣𝖮 (𝖠𝖴𝖳𝖮)*\n\n` +
              `      🛡️   𓈒 ◌ㅤ──    _𝖤𝗅 𝗀𝗋𝗎𝗉𝗈 𝗌ᧉ 𝗁⍺ 𝖼ᧉ𝗋𝗋⍺𝖽𝗈 ⍺𝗎ƚ𝗈𝗆áƚı𝖼⍺𝗆ᧉ𝗇ƚᧉ._\n` +
              `      💬   𓈒 ◌ㅤ──    _𝖠𝗁𝗈𝗋⍺ 𝗌𝗈𝗅𝗈 𝗅𝗈𝗌 ⍺𝖽𝗆ı𝗇ı𝗌ƚ𝗋⍺𝖽𝗈𝗋ᧉ𝗌 𝗉𝗎ᧉ𝖽ᧉ𝗇 ᧉ𝗇𝗏ı⍺𝗋 𝗆ᧉ𝗇𝗌⍺𝗃ᧉ𝗌._\n\n` +
              `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
          });
        } else if (command === "autoopen") {
          await sock.groupSettingUpdate(m.chat, "not_announcement");
          await sock.sendMessage(m.chat, {
            text: 
              `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
              `🔓 *𝖦𝖱𝖴𝖯𝖮 𝖮𝖡𝖨𝖤𝖱𝖳𝖮 / 𝖠𝖡𝖨𝖤𝖱𝖳𝖮 (𝖠𝖴𝖳𝖮)*\n\n` +
              `      ✨   𓈒 ◌ㅤ──    _𝖤𝗅 𝗀𝗋𝗎𝗉𝗈 𝗌ᧉ 𝗁⍺ ⍺𝖻ıᧉ𝗋ƚ𝗈 ⍺𝗎ƚ𝗈𝗆áƚı𝖼⍺𝗆ᧉ𝗇ƚᧉ._\n` +
              `      💬   𓈒 ◌ㅤ──    _𝖠𝗁𝗈𝗋⍺ ƚ𝗈𝖽𝗈𝗌 𝗅𝗈𝗌 𝗆ıᧉ𝗆𝖻𝗋𝗈𝗌 𝗉𝗎ᧉ𝖽ᧉ𝗇 ᧉ𝗇𝗏ı⍺𝗋 𝗆ᧉ𝗇𝗌⍺𝗃ᧉ𝗌._\n\n` +
              `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
          });
        }
      } catch (err) {
        console.error("Error al actualizar el grupo automáticamente:", err);
      }
    }, delay);

    // Integración opcional con la base de datos de tu framework para otorgar experiencia
    try {
      const db = getDatabase();
      if (db && db.data && db.data.users && db.data.users[m.sender]) {
        db.data.users[m.sender].exp += randomNomor(20);
      }
    } catch (e) {}

  } catch (err) {
    console.error("Handler error:", err);
    m.reply(
      `« ¿ 𝗊𝗎é 𝖽ᧉ𝗌ᧉ⍺𝗌 ᥎ᧉ𝗋 𝗑 ? »\n\n` +
      `❌ *𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖫 𝖧𝖠𝖭𝖣𝖫𝖤𝖱*\n\n` +
      `      ⚠️   𓈒 ◌ㅤ──    _${err.message}_\n\n` +
      `( ᴗ͈ˬᴗ͈ ) 𝑊⍺ց𝗎𝗋ı 𝖠𝗌𝗌ı𝗌ƚ⍺𝗇ƚ`
    );
  }
};

const pluginConfig = {
  name: "autoclose",
  alias: ["autoopen", "autoclose", "autoopen"],
  category: "group",
  description: "𝖯𝗋𝗈𝗀𝗋⍺𝗆⍺ 𝧉𝗅 𝖼ıᧉ𝗋𝗋ᧉ 𝗈 ⍺𝗉ᧉ𝗋ƚ𝗎𝗋⍺ ⍺𝗎ƚ𝗈𝗆áƚı𝖼⍺ 𝖽ᧉ𝗅 𝗀𝗋𝗎𝗉𝗈 𝗉𝗈𝗋 𝗁𝗈𝗋⍺𝗋ı𝗈",
  usage: ".autoclose <hh:mm> / .autoopen <hh:mm>",
  example: ".autoclose 18:00",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true
};

function randomNomor(nomor) {
  return Math.floor(Math.random() * nomor);
}

export { pluginConfig as config, handler };
