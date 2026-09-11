import config from "../../config.js";

/**
 * Envía un bloque de código nativo tipo Meta AI (método 3) con lenguaje + botón copiar.
 * Intenta usar @olivea777/baileys (code/language) o @kyyinfinite/baileys (sendCodeBlockV2).
 * Si el fork no está instalado, hace fallback a markdown ``` + cta_copy.
 *
 * @param {object} sock - Socket Baileys
 * @param {string} jid - m.chat
 * @param {string} code - Código a enviar
 * @param {string} language - Lenguaje: javascript, python, html, css, bash, c, cpp, csharp, go, rust, typescript, powershell, bat
 * @param {object} quoted - Mensaje citado (m)
 * @param {object} opts - { headerText, footerText, disclaimerText }
 */
export async function sendCodeBlock(sock, jid, code, language = "javascript", quoted = null, opts = {}) {
  const lang = String(language || "javascript").toLowerCase().trim();
  const cleanCode = String(code || "").trim();
  if (!cleanCode) throw new Error("Código vacío");

  const headerText = opts.headerText || `## ${lang}`;
  const footerText = opts.footerText || config?.bot?.name || "waguri assistant";
  const disclaimerText = opts.disclaimerText || "Code Block";

  // 1. Intentar método nativo @kyyinfinite/baileys
  try {
    if (typeof sock.sendCodeBlockV2 === "function") {
      await sock.sendCodeBlockV2(jid, { language: lang, code: cleanCode }, quoted, {});
      return "native-v2";
    }
    if (typeof sock.sendCodeBlock === "function") {
      await sock.sendCodeBlock(jid, cleanCode, lang, quoted, {});
      return "native-v1";
    }
  } catch (e) { console.log("[CodeBlock] kyyinfinite fail, probando olivea:", e.message); }

  // 2. Intentar método @olivea777/baileys (solo si el fork lo soporta)
  try {
    let tokenizeCode = null;
    try {
      const mod = await import("@olivea777/baileys");
      tokenizeCode = mod.tokenizeCode;
    } catch {}
    if (!tokenizeCode) {
      try {
        const mod2 = await import("ourin");
        tokenizeCode = mod2.tokenizeCode;
      } catch {}
    }
    if (!tokenizeCode) throw new Error("no native codeblock support, fallback a markdown");

    const codePayload = tokenizeCode(cleanCode, lang);

    await sock.sendMessage(jid, {
      disclaimerText,
      headerText,
      contentText: "---",
      code: codePayload,
      language: lang,
      footerText,
    }, { quoted });

    return "olivea-native";
  } catch (e) { console.log("[CodeBlock] olivea no disponible, fallback markdown:", e.message); }

  // 3. Fallback: markdown + botón cta_copy (funciona con ourin actual)
  try {
    const { generateWAMessageFromContent, jidNormalizedUser } = await import("ourin");
    const markdown = "```" + lang + "\n" + cleanCode + "\n```";
    // Si es corto, mandar como texto con markdown (WhatsApp lo renderiza con copiar)
    if (cleanCode.length < 1500) {
      await sock.sendMessage(jid, { text: markdown }, { quoted });
      // Además botón copiar para 1 toque
      try {
        await sock.sendMessage(jid, {
          text: `Código ${lang} listo:`,
          footer: footerText,
          interactiveButtons: [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copiar código",
              copy_code: cleanCode.slice(0, 1000),
            }),
          }],
        }, { quoted });
      } catch {}
      return "markdown+cta_copy";
    } else {
      // Código muy largo: mandar markdown + botón
      await sock.sendMessage(jid, { text: markdown }, { quoted });
      return "markdown";
    }
  } catch (e) {
    // Último fallback
    await sock.sendMessage(jid, { text: "```" + lang + "\n" + cleanCode + "\n```" }, { quoted });
    return "markdown-fallback";
  }
}

export const SUPPORTED_LANGUAGES = ["javascript","typescript","python","html","css","bash","c","cpp","csharp","go","rust","powershell","bat","java","php","json"];
