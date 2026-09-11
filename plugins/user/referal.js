import crypto from "crypto";
import { getDatabase } from "../../src/lib/rimuru-database.js";

const pluginConfig = {
  name: "referal",
  alias: ["referral", "refer", "ref"],
  category: "user",
  description: "Sistema de códigos de referidos para obtener EXP",
  usage: ".referal [código]",
  example: ".referal o .referal ABC123XYZ",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const XP_FIRST = 2500;
const XP_OWNER = 15000;
const BONUS = {
  5: 40000,
  10: 100000,
  20: 250000,
  50: 1000000,
  100: 10000000,
};

function makeCode() {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

function getBotNumber(sock) {
  return String(sock?.user?.id || "")
    .split(":")[0]
    .replace(/[^0-9]/g, "");
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUsuario(m.sender) || db.setUsuario(m.sender);
  if (!user) return m.reply("ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n> No se pudieron crear los datos del usuario.");

  user.refCode ??= makeCode();
  user.refCount ??= 0;
  user.refUsed ??= false;
  db.setUsuario(m.sender, user);

  const code = String(m.args?.[0] || "").trim();

  if (code) {
    if (user.refUsed) {
      return m.reply("ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n> Ya has utilizado un código de referido anteriormente.");
    }

    const cleanCode = code.toUpperCase();
    const entries = Object.entries(db.data.users || {});
    const ownerEntry = entries.find(
      ([, u]) => String(u?.refCode || "").toUpperCase() === cleanCode,
    );

    if (!ownerEntry) {
      return m.reply("ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n> El código de referido ingresado no es válido.");
    }

    const [ownerJid, owner] = ownerEntry;
    const senderJid = String(m.sender).replace(/@.+/g, "");
    if (ownerJid === senderJid) {
      return m.reply("ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n> No puedes utilizar tu propio código de referido.");
    }

    const ownerUsuario = db.getUsuario(ownerJid) || db.setUsuario(ownerJid);
    if (!ownerUsuario) return m.reply("ꕥ *𝖶⍺𝗀uɾı 𝖭oƚıɔᧉ* (*ᴗ͈ˬᴗ͈)ꕤ\n\n> No se encontraron los datos del propietario del referido.");

    ownerUsuario.refCount = Number(ownerUsuario.refCount || 0) + 1;
    const bonus = BONUS[ownerUsuario.refCount] || 0;

    db.updateExp(ownerJid, XP_OWNER + bonus);
    db.updateExp(m.sender, XP_FIRST);

    user.refUsed = true;
    db.setUsuario(m.sender, user);
    db.save();

    return m.reply(
      `ꕥ *rᧉfᧉrr⍺l ᧉxıƚoʂo* (*ᴗ͈ˬᴗ͈)ꕤ\n\n` +
      `> Tú: +${XP_FIRST.toLocaleString("es-ES")} EXP\n` +
      `> Propietario del código: +${(XP_OWNER + bonus).toLocaleString("es-ES")} EXP\n\n` +
      `> Total de referidos del propietario: *${ownerUsuario.refCount}*`,
    );
  }

  const botNumber = getBotNumber(sock);
  const link = botNumber
    ? `https://wa.me/${botNumber}?text=${encodeURIComponent(
        `${m.prefix}referal ${user.refCode}`,
      )}`
    : null;

  return m.reply(
    `ꕥ *rᧉfᧉrr⍺ls w⍺gurı* (*ᴗ͈ˬᴗ͈)ꕤ\n\n` +
      `> Tu código: *${user.refCode}*\n` +
      `> Utilizado por: *${user.refCount} personas*\n\n` +
      `> Premio nuevo usuario: *+${XP_FIRST.toLocaleString("es-ES")} EXP*\n` +
      `> Premio propietario: *+${XP_OWNER.toLocaleString("es-ES")} EXP*` +
      (link ? `\n\n> Enlace de referido:\n${link}` : ""),
  );
}

export { pluginConfig as config, handler };
