import { sendCodeBlock, SUPPORTED_LANGUAGES } from "../../src/lib/rimuru-code.js";
import config from "../../config.js";
import { generateWAMessageFromContent } from "ourin";

const pluginConfig = {
  name: "codeblock",
  alias: ["bloquecode", "snippet", "codigo"],
  category: "main",
  description: "Envía un bloque de código nativo tipo Meta AI con lenguaje y botón copiar (método 3)",
  usage: ".codeblock <lenguaje> <código> | responde a un mensaje con .codeblock <lenguaje>",
  example: ".codeblock js console.log('hola')\n.codeblock python print('hola')\nResponde a un código con .codeblock js",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, text, prefix }) {
  const pf = prefix || m.prefix || config.command?.prefix || ".";
  let args = (text || m.args?.join(" ") || "").trim();

  // Si es reply, tomar el texto citado como código
  let quotedCode = null;
  if (m.quoted?.text) quotedCode = m.quoted.text.trim();
  else if (m.quoted?.message?.extendedTextMessage?.text) quotedCode = m.quoted.message.extendedTextMessage.text.trim();

  let language = "javascript";
  let code = "";

  if (quotedCode && !args) {
    // .code (reply) -> usa el quoted como código, lenguaje por defecto js
    code = quotedCode;
  } else if (quotedCode && args) {
    // .code js (reply) -> args es lenguaje, quoted es código
    const maybeLang = args.split(/\s+/)[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(maybeLang) || /^[a-z#+\s]+$/.test(maybeLang)) {
      language = maybeLang;
      code = quotedCode;
    } else {
      code = quotedCode;
    }
  } else if (args) {
    // .code js console.log...
    const split = args.split(/\s+/);
    const first = split[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(first) || ["js","py","ts","c++","c#"].includes(first)) {
      // Mapear alias cortos
      const aliasMap = { js: "javascript", py: "python", ts: "typescript", "c++": "cpp", "c#": "csharp" };
      language = aliasMap[first] || first;
      code = args.slice(first.length).trim();
    } else {
      code = args;
    }
  }

  if (!code) {
    const help =
      `ꕥ 𝖢𝖮𝖣𝖤 𝖡𝖫𝖮𝖢𝖪 - 𝖬𝖤𝖳𝖠 𝖠𝖨 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • \`${pf}codeblock <lenguaje> <código>\`\n` +
      `      • \`${pf}codeblock <lenguaje>\` (respondiendo a un mensaje)\n` +
      `      • \`${pf}codeblock <código>\` (usa javascript por defecto)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖫𝖤𝖭𝖦𝖴𝖠𝖩𝖤𝖲* (${SUPPORTED_LANGUAGES.join(", ")})\n` +
      `      • Ej: js, python, html, css, bash, c, cpp, go, rust\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${pf}codeblock js console.log("hola")\`\n` +
      `      • \`${pf}codeblock python print("hola")\`\n` +
      `      • Responde a un código con \`${pf}codeblock js\`\n\n` +
      `Método 3 nativo: muestra bloque con etiqueta de lenguaje + botón copiar como Meta AI.\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    const buttons = [
      { buttonId: `${pf}codeblock javascript console.log('Hola Waguri')`, buttonText: { displayText: "📋 Ejemplo JS" }, type: 1 },
      { buttonId: `${pf}codeblock python print('Hola Waguri')`, buttonText: { displayText: "🐍 Ejemplo Python" }, type: 1 },
    ];
    try {
      const content = { buttonsMessage: { buttons, contentText: help, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
      const msg = generateWAMessageFromContent(m.chat, content, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      return;
    } catch { return m.reply(help); }
  }

  await m.react("💻");
  try {
    if (code.length > 3500) code = code.slice(0, 3500) + "\n// ... truncado";

    // FIX BLANK: envío directo markdown (100% compatible con ourin) antes de intentar nativo
    const markdown = "```" + language + "\n" + code + "\n```";
    // Usar m.reply que es el más estable (sock.sendMessage a veces manda en blanco si el payload tiene fields nativos)
    await m.reply(markdown);
    await m.react("✅");

    // Intentar además el botón copiar como mensaje separado (no bloqueante)
    try {
      await sock.sendMessage(m.chat, {
        text: `Código ${language} listo:`,
        footer: config?.bot?.name || "waguri assistant",
        interactiveButtons: [{
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📋 Copiar código",
            copy_code: code.slice(0, 1000),
          }),
        }],
      }, { quoted: m });
    } catch {}

    // Intentar nativo en segundo plano solo si el fork lo soporta (no bloquea el envío ya hecho)
    try { await sendCodeBlock(sock, m.chat, code, language, m, { headerText: `## ${language}`, footerText: config?.bot?.name || "waguri assistant", disclaimerText: "Code Block" }); } catch {}
  } catch (e) {
    console.error("[CODE ERROR]", e);
    await m.react("❌");
    return m.reply(`*( 𝜰 ﹏ 𝜰 )* Error enviando código:\n${e?.message || e}`);
  }
}

export { pluginConfig as config, handler };
