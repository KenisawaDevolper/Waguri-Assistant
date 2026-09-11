import { getDatabase } from "../../src/lib/rimuru-database.js";
import { generateWAMessageFromContent } from "ourin";
import config from "../../config.js";
import { saluranCtx } from "../../src/lib/rimuru-context.js";

const pluginConfig = {
  name: "tam",
  alias: ["topactive", "topmember"],
  category: "group",
  description: "Muestra un ranking interactivo en formato de encuesta con los miembros más activos del grupo.",
  usage: ".tam <cantidad>",
  example: ".tam 10",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const limit = Math.min(Math.max(parseInt(m.text) || 10, 1), 20);
  const group = db.getGroup(m.chat) || {};
  const chatName = group.name || "Grupoo";
  const chatStats = group.chatStats || {};

  const sorted = Object.entries(chatStats)
    .map(([jid, d]) => ({ jid, count: d.count || 0, name: d.name || null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  if (!sorted.length) {
    return m.reply(
      `ꕥ 𝖤𝖲𝖳𝖠𝖣𝖨𝖲𝖳𝖨𝖢𝖠𝖲 𝖵𝖠𝖢𝖨𝖠𝖲 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Aún no hay datos de actividad registrados en este grupo. »\n\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`
    );
  }

  const pollVotes = sorted.map((u, i) => {
    const rank = i + 1;
    const user = db.getUsuario(u.jid);
    const name = u.name || user?.name || u.jid.split("@")[0];
    return {
      optionName: `${rank}. ${name}${i === 0 ? " 🏆" : ""}`,
      optionVoteCount: u.count,
    };
  });

  const content = {
    pollResultSnapshotMessage: {
      name: `Top ${limit} miembros más activos de todos los tiempos en:\n${chatName}`,
      pollVotes,
      pollType: 0,
      contextInfo: {
        ...saluranCtx(),
      },
    },
  };

  const msg = generateWAMessageFromContent(m.chat, content, {});
  await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}

export { pluginConfig as config, handler };
