import { getDatabase } from "../../src/lib/rimuru-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "unreg",
  alias: ["unregister", "hapusdaftar"],
  category: "user",
  description: "Elimina tus datos de registro del bot",
  usage: ".unreg",
  example: ".unreg",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUsuario(m.sender);

  if (!user?.isRegistered) {
    return m.reply(
      `ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n` +
      `> 𝖭o ᧉsƚάs rᧉgısƚr⍺do⟡a ⟡ c̶u̶r̶r̶e̶n̶ƚ̶l̶y̶ ~\n\n` +
      `> 𝖱ᧉgısƚrάƚᧉ ᧉsɔrıbıᧉndo: \`${m.prefix}daftar\``,
    );
  }

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Waguri AI";
  const unregisteredAt = new Date().toISOString();

  db.setUsuario(m.sender, {
    isRegistered: false,
    regName: null,
    regAge: null,
    regGender: null,
    unregisteredAt,
  });

  await db.save();

  await sock.sendMessage(
    m.chat,
    {
      text:
        `ꕥ *unrᧉgıʂƚᧉr ⟡ ᧉxıƚo* (*ᴗ͈ˬᴗ͈)ꕤ\n\n` +
        `> 𝖳u𝗌 d⍺ƚo𝗌 dᧉ rᧉgısƚro h⍺n sıdo ᧉlımı⍺do𝗌 ⟡ c𝗈mpleƚ⍺mᧉnƚᧉ.\n\n` +
        `> 𝖯⍺r⍺ rᧉgısƚr⍺rƚᧉ nuᧉv⍺mᧉnƚᧉ: \`${m.prefix}daftar\``,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    },
    { quoted: m },
  );

  m.react("🍙");
}

export { pluginConfig as config, handler };
