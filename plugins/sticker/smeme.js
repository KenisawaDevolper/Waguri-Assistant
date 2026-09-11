import FormData from 'form-data'
import _sharp from 'sharp'
import axios from "axios";

function getSharp() {
  return _sharp;
}
import fs from "fs";
import path from "path";
import { config } from "../../config.js";
import te from "../../src/lib/rimuru-error.js";

const pluginConfig = {
  name: "smeme",
  alias: ["memesticker", "memes"],
  category: "sticker",
  description: "𝖢𝗋ᧉ⍺ 𝗎𝗇 𝗌ƚı𝖼𝗄ᧉ𝗋 𝖽ᧉ 𝗆ᧉ𝗆ᧉ ⍺ 𝗉⍺𝗋ƚı𝗋 𝖽ᧉ 𝗎𝗇⍺ ı𝗆⍺𝗀ᧉ𝗇",
  usage: ".smeme <⍺𝗋𝗋ı𝖻⍺>|<⍺𝖻⍺𝗃𝗈>",
  example: ".smeme 𝖢𝗎⍺𝗇𝖽𝗈|𝖪⍺𝗆𝗎 𝖫𝗎𝗉⍺",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.isImage);
  const isSticker =
    m.isSticker ||
    (m.quoted && (m.quoted.isSticker || m.quoted.type === "stickerMessage"));

  if (!isImage && !isSticker) {
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n> _¿Buscas un bot para tu comunidad? ≽^• ˕ • ྀི≼_\n\n## ꕥ *ꜱᴛᴇʟʟᴀʀ ᴡᴀ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n😂 *ᴍᴇᴍᴇ sᴛɪᴄᴋᴇʀ*\n\n> 𝖱ᧉ𝗌𝗉𝗈𝗇𝖽ᧉ 𝗈 ᧉ𝗇𝗏í⍺ 𝗎𝗇⍺ ı𝗆⍺𝗀ᧉ𝗇/𝗌ƚı𝖼𝗄ᧉ𝗋 𝖼𝗈𝗇 𝗎𝗇 𝗍ᧉ𝗑ƚ𝗈\n\n\`𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: ${m.prefix}smeme 𝖳𝗈𝗉|𝖡𝗈ƚƚ𝗈𝗆\`\n\n> ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ツ`
    );
  }

  const input = m.args.join(" ");
  if (!input || !input.includes("|")) {
    return m.reply(
      `*¡Hola, buenas tardes!* ฅ^·ﻌ·^ฅ\n> _¿Buscas un bot para tu comunidad? ≽^• ˕ • ྀི≼_\n\n## ꕥ *ꜱᴛᴇʟʟᴀʀ ᴡᴀ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n😂 *ᴍᴇᴍᴇ sᴛɪᴄᴋᴇʀ*\n\n> 𝖥𝗈𝗋𝗆⍺ƚ𝗈: ⍺𝗋𝗋ı𝖻⍺|⍺𝖻⍺𝗃𝗈\n\n\`𝖤𝗃ᧉ𝗆𝗉𝗅𝗈: ${m.prefix}smeme 𝖢𝗎⍺𝗇𝖽𝗈|𝖪⍺𝗆𝗎 𝖫𝗎𝗉⍺\`\n\n> ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ツ`
    );
  }

  const [top, bottom] = input.split("|").map((s) => s.trim());
  m.react("🕕");

  try {
    let mediaBuffer;
    if (m.quoted) {
      mediaBuffer = await m.quoted.download();
    } else if (m.download) {
      mediaBuffer = await m.download();
    }

    if (!mediaBuffer) {
      m.react("❌");
      return m.reply(`❌ *ᧉ𝗋𝗋𝗈𝗋*\n\n> 𝖭𝗈 𝗌ᧉ 𝗉𝗎𝖽𝗈 𝖽ᧉ𝗌𝖼⍺𝗋𝗀⍺𝗋 ᧉ𝗅 𝗆ᧉ𝖽ı⍺`);
    }

    let imageBuffer;
    try {
      imageBuffer = await (
        await getSharp()
      )(mediaBuffer)
        .resize(512, 512, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
    } catch (e) {
      console.log("[SMEME] Sharp resize failed:", e.message);
      imageBuffer = mediaBuffer;
    }

    const form = new FormData();
    form.append('file', imageBuffer, {
      filename: "meme.png",
      contentType: "image/png",
    });

    let imageUrl;
    try {
      const uploadRes = await axios.post(
        "https://c.termai.cc/api/upload?key=YOUR_GOOGLE_API_KEY",
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000,
        },
      );
      if (uploadRes.data?.status && uploadRes.data?.path) {
        imageUrl = uploadRes.data.path;
      }
    } catch (e) {
      console.log("[SMEME] Termai failed:", e.response?.data || e.message, "Trying telegraph...");
    }

    if (!imageUrl) {
      try {
        const form2 = new FormData();
        form2.append('file', imageBuffer, {
          filename: "meme.png",
          contentType: "image/png",
        });
        const telegraphRes = await axios.post(
          "https://telegra.ph/upload",
          form2,
          {
            headers: form2.getHeaders(),
            timeout: 30000,
          },
        );
        if (telegraphRes.data?.[0]?.src) {
          imageUrl = "https://telegra.ph" + telegraphRes.data[0].src;
        }
      } catch (e) {
        console.log("[SMEME] Telegraph failed:", e.message);
      }
    }

    if (!imageUrl) {
      m.react("❌");
      return m.reply(`❌ *ᧉ𝗋𝗋𝗈𝗋*\n\n> 𝖭𝗈 𝗌ᧉ 𝗉𝗎𝖽𝗈 𝗌𝗎𝖻ı𝗋 𝗅⍺ ı𝗆⍺𝗀ᧉ𝗇, ı𝗇ƚé𝗇ƚ⍺𝗅𝗈 𝗆á𝗌 𝗍⍺𝗋𝖽ᧉ`);
    }

    console.log("[SMEME] Image uploaded:", imageUrl);

    const encodeText = (text) => {
      if (!text) return "_";
      return encodeURIComponent(text)
        .replace(/-/g, "--")
        .replace(/_/g, "__")
        .replace(/%20/g, "_");
    };

    const topEncoded = encodeText(top);
    const bottomEncoded = encodeText(bottom);
    const memeUrl = `https://api.memegen.link/images/custom/${topEncoded}/${bottomEncoded}.png?background=${encodeURIComponent(imageUrl)}`;

    const response = await axios.get(memeUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const buffer = Buffer.from(response.data);
    await sock.sendImageAsSticker(m.chat, buffer, m, {
      packname: config.sticker?.packname || "rimuru-AI",
      author: config.sticker?.author || "Bot",
    });

    m.react("✅");
  } catch (error) {
    console.log("[SMEME] Error:", error.message);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
