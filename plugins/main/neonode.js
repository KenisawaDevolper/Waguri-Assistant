import axios from "axios";
import te from "../../src/lib/rimuru-error.js";
import config from "../../config.js";
import { generateWAMessageFromContent } from "ourin";

const pluginConfig = {
  name: "neonode",
  alias: ["am", "magiclink", "neonodeverify", "amverify"],
  category: "main",
  description: "Envía y verifica Magic Link de am.neonode.my.id por correo",
  usage: ".neonode <email> | .neonode <email> <link> | .neonode verify <email> <link>",
  example: ".neonode correo@gmail.com\n.neonode correo@gmail.com https://am.neonode.my.id/verify?token=xxx\n.neonode verify correo@gmail.com https://...",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

// Memoria temporal para recordar email por chat (hasta reinicio)
const pendingEmail = new Map();

async function sendLink(email) {
  const res = await axios.post(
    "https://am.neonode.my.id/api/send-link",
    { email },
    { timeout: 15000, headers: { "Content-Type": "application/json", "Usuario-Agent": "WaguriAssistant/1.0" } }
  );
  return res.data;
}

async function verifyLink(email, magicLink) {
  const res = await axios.post(
    "https://am.neonode.my.id/api/verify-link",
    { email, magicLink },
    { timeout: 15000, headers: { "Content-Type": "application/json", "Usuario-Agent": "WaguriAssistant/1.0" } }
  );
  return res.data;
}

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isLink(str) {
  return /^https?:\/\/.+/i.test(str);
}

async function handler(m, { sock, text, args }) {
  const raw = (text || m.args?.join(" ") || "").trim();

  if (!raw) {
    const helpText =
      `ꕥ 𝖭𝖤𝖮𝖭𝖮𝖣𝖤 - 𝖬𝖠𝖦𝖨𝖢 𝖫𝖨𝖭𝖪 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • \`${m.prefix}neonode <email>\` → Envía el link mágico al correo\n` +
      `      • \`${m.prefix}neonode <email> <link>\` → Envía y verifica en un solo paso\n` +
      `      • \`${m.prefix}neonode verify <email> <link>\` → Verifica un link recibido\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${m.prefix}neonode correo@gmail.com\`\n` +
      `      • \`${m.prefix}neonode correo@gmail.com https://am.neonode.my.id/verify?token=xxx\`\n` +
      `      • \`${m.prefix}neonode verify correo@gmail.com https://am.neonode.my.id/verify?token=xxx\``;
    const helpButtons = [
      { buttonId: `${m.prefix}neonode ejemplo@gmail.com`, buttonText: { displayText: "📧 Probar con ejemplo@gmail.com" }, type: 1 },
      { buttonId: `${m.prefix}neonode verify ejemplo@gmail.com https://am.neonode.my.id/verify?token=xxx`, buttonText: { displayText: "🔐 Ejemplo verificar" }, type: 1 },
    ];
    try {
      const content = { buttonsMessage: { buttons: helpButtons, contentText: helpText, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
      const msg = generateWAMessageFromContent(m.chat, content, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      return;
    } catch { return m.reply(helpText); }
  }

  // Normalizar args quitando palabra "verify" si está
  let cleanArgs = [...args];
  let isVerifyModo = false;
  if (cleanArgs[0]?.toLowerCase() === "verify") {
    isVerifyModo = true;
    cleanArgs.shift();
  }

  const email = cleanArgs[0]?.trim();
  const magicLink = cleanArgs.slice(1).join(" ").trim() || null;

  // Validar email
  if (!email || !isEmail(email)) {
    return m.reply(
      `*( 𝜰 ﹏ 𝜰 )* Correo inválido.\n\n` +
      `Asegúrate de escribirlo bien, ejemplo:\n` +
      `\`${m.prefix}neonode correo@gmail.com\``
    );
  }

  // Caso 1: Solo email -> enviar link
  if (!magicLink && !isVerifyModo) {
    // Si el usuario puso link junto al email sin separar bien, ya lo cubre el caso 2
    await m.react("📧");
    try {
      const data = await sendLink(email);
      const msg = data?.message || data?.msg || "Link enviado correctamente";
      
      // Guardar email pendiente para este chat (por si luego manda solo el link)
      pendingEmail.set(m.chat, email);

      await m.react("✅");
      const successText =
        `ꕥ 𝖤𝖭𝖵𝖨𝖮 𝖤𝖷𝖨𝖳𝖮𝖲𝖮 ｡ﾟ+.ღ\n\n` +
        `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
        `      • Correo :: ${email}\n` +
        `      • Estado :: ${msg}\n\n` +
        `      𓈒 ◌ㅤ──    *𝖲𝖨𝖦𝖴𝖨𝖤𝖭𝖳𝖤 𝖯𝖠𝖲𝖮*\n` +
        `      Revisa tu bandeja de entrada y reenvía el link aquí con:\n` +
        `      \`${m.prefix}neonode verify ${email} <link>\`\n` +
        `      o simplemente:\n` +
        `      \`${m.prefix}neonode ${email} <link>\`\n\n` +
        `> Si no llega, revisa spam/correo no deseado.`;
      const successButtons = [
        { buttonId: `${m.prefix}neonode ${email}`, buttonText: { displayText: "🔄 Reenviar Link" }, type: 1 },
        { buttonId: `${m.prefix}neonode verify ${email} `, buttonText: { displayText: "🔐 Verificar Ahora" }, type: 1 },
      ];
      try {
        const content = { buttonsMessage: { buttons: successButtons, contentText: successText, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
        const btnMsg = generateWAMessageFromContent(m.chat, content, { quoted: m });
        await sock.relayMessage(m.chat, btnMsg.message, { messageId: btnMsg.key.id });
        return;
      } catch { return m.reply(successText); }
    } catch (err) {
      await m.react("❌");
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err.message;
      return m.reply(
        `*( 𝜰 ﹏ 𝜰 )* No se pudo enviar el link.\n\n` +
        `• Correo :: ${email}\n` +
        `• Error :: ${apiMsg}\n\n` +
        `Inténtalo de nuevo en unos segundos.`
      );
    }
  }

  // Caso 2: Email + Link -> verificar directamente (envía y verifica si hace falta)
  // Si es verify mode o hay link, hacemos verify
  if (magicLink) {
    if (!isLink(magicLink)) {
      return m.reply(
        `*( 𝜰 ﹏ 𝜰 )* El link no parece válido.\n\n` +
        `Debe empezar con \`https://\`\n` +
        `Ejemplo: \`${m.prefix}neonode verify ${email} https://am.neonode.my.id/verify?token=xxx\``
      );
    }

    await m.react("🔐");
    try {
      // Si no es modo verify explícito, primero intentamos asegurar que el link fue enviado
      // Pero la API de verify ya lo maneja, así que vamos directo a verificar
      const data = await verifyLink(email, magicLink);
      
      await m.react("✅");
      const pretty = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      const verifyText =
        `ꕥ 𝖵𝖤𝖱𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖮𝖭 𝖤𝖷𝖨𝖳𝖮𝖲𝖠 ｡ﾟ+.ღ\n\n` +
        `      𓈒 ◌ㅤ──    *𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲*\n` +
        `      • Correo :: ${email}\n` +
        `      • Link :: ${magicLink.slice(0, 80)}${magicLink.length > 80 ? "..." : ""}\n\n` +
        `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖯𝖴𝖤𝖲𝖳𝖠 𝖣𝖤𝖫 𝖲𝖤𝖱𝖵𝖨𝖣𝖮𝖱*\n` +
        `\`\`\`json\n${pretty.slice(0, 3500)}\n\`\`\``;
      const verifyButtons = [
        { buttonId: `${m.prefix}neonode ${email}`, buttonText: { displayText: "📧 Nuevo Envío" }, type: 1 },
        { buttonId: `${m.prefix}neonode verify ${email} ${magicLink}`, buttonText: { displayText: "🔁 Verificar de Nuevo" }, type: 1 },
      ];
      try {
        const content = { buttonsMessage: { buttons: verifyButtons, contentText: verifyText, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
        const btnMsg = generateWAMessageFromContent(m.chat, content, { quoted: m });
        await sock.relayMessage(m.chat, btnMsg.message, { messageId: btnMsg.key.id });
        return;
      } catch { return m.reply(verifyText + `\n\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`); }
    } catch (err) {
      await m.react("❌");
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error || JSON.stringify(err?.response?.data || {}).slice(0,500) || err.message;
      return m.reply(
        `*( 𝜰 ﹏ 𝜰 )* Falló la verificación.\n\n` +
        `• Correo :: ${email}\n` +
        `• Link :: ${magicLink.slice(0, 80)}...\n` +
        `• Error :: ${apiMsg}\n\n` +
        `Verifica que el link no haya expirado y que el correo sea el mismo con el que lo pediste.`
      );
    }
  }

  // Caso 3: fallback - si solo mandó link sin email pero hay pendiente
  // Esto se activa si hace #neonode https://...
  if (isLink(email) && pendingEmail.has(m.chat)) {
    const savedEmail = pendingEmail.get(m.chat);
    const linkOnly = email;
    await m.react("🔐");
    try {
      const data = await verifyLink(savedEmail, linkOnly);
      await m.react("✅");
      const pretty = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      return m.reply(
        `ꕥ 𝖵𝖤𝖱𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖮𝖭 𝖤𝖷𝖨𝖳𝖮𝖲𝖠\n\n` +
        `• Correo (guardado) :: ${savedEmail}\n` +
        `• Link :: ${linkOnly.slice(0, 80)}...\n\n` +
        `\`\`\`json\n${pretty.slice(0, 3500)}\n\`\`\``
      );
    } catch (err) {
      await m.react("❌");
      const apiMsg = err?.response?.data?.message || err.message;
      return m.reply(`*( 𝜰 ﹏ 𝜰 )* Error al verificar con correo guardado ${savedEmail}: ${apiMsg}`);
    }
  }

  // Si no encaja nada, mostrar ayuda
  return m.reply(
    `*( 𝜰 ﹏ 𝜰 )* Formato no reconocido.\n` +
    `Usa: \`${m.prefix}neonode ${email} <link>\` o \`${m.prefix}neonode verify ${email} <link>\``
  );
}

export { pluginConfig as config, handler };
