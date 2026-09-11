import axios from "axios";
import * as cheerio from "cheerio";
import te from "../../src/lib/rimuru-error.js";
import config from "../../config.js";
import { generateWAMessageFromContent } from "ourin";
import sharp from "sharp";

const pluginConfig = {
  name: "scrape",
  alias: ["web", "scrap", "fetchweb", "webscrape"],
  category: "search",
  description: "Scrapea cualquier web y extrae título, descripción, texto, links e imágenes. Soporta selector CSS personalizado.",
  usage: ".scrape <url> [selector] [--json] [--text] [--links] [--images]",
  example: ".scrape https://example.com\n.scrape https://example.com h1\n.scrape https://example.com .precio --json",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 2,
  isEnabled: true,
};

async function fetchHtml(url) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  };
  // Intento 1: axios directo
  try {
    const res = await axios.get(url, { headers, timeout: 15000, responseType: "text" });
    return res.data;
  } catch (e) {
    // Intento 2: con undici fetch (fallback)
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.text();
  }
}

function cleanText(str, max = 4000) {
  if (!str) return "-";
  let t = str.replace(/\s+/g, " ").trim();
  if (t.length > max) t = t.slice(0, max) + " ... (truncado)";
  return t;
}

async function handler(m, { sock, text, args }) {
  let raw = (text || m.args?.join(" ") || "").trim();

  if (!raw) {
    const helpText =
      `ꕥ 𝖶𝖤𝖡 𝖲𝖢𝖱𝖠𝖯𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • Comando :: \`${m.prefix}scrape <url> [selector] [opciones]\`\n\n` +
      `      𓈒 ◌ㅤ──    *𝖮𝖯𝖢𝖨𝖮𝖭𝖤𝖲*\n` +
      `      • \`--json\` :: responde JSON crudo\n` +
      `      • \`--text\` :: solo texto plano\n` +
      `      • \`--links\` :: lista de enlaces\n` +
      `      • \`--images\` :: lista de imágenes\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${m.prefix}scrape https://example.com\`\n` +
      `      • \`${m.prefix}scrape https://example.com h1\`\n` +
      `      • \`${m.prefix}scrape https://example.com .price --json\`\n` +
      `      • \`${m.prefix}scrape https://example.com --links\``;

    const buttons = [
      { buttonId: `${m.prefix}scrape https://example.com`, buttonText: { displayText: "🌐 Probar example.com" }, type: 1 },
      { buttonId: `${m.prefix}scrape https://example.com h1`, buttonText: { displayText: "🔍 Probar con h1" }, type: 1 },
      { buttonId: `${m.prefix}scrape https://example.com --links`, buttonText: { displayText: "📎 Ver Links" }, type: 1 },
    ];
    try {
      const content = { buttonsMessage: { buttons, contentText: helpText, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
      const msg = generateWAMessageFromContent(m.chat, content, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      return;
    } catch { return m.reply(helpText); }
  }

  // Parsear flags
  const flags = {
    json: raw.includes("--json"),
    textOnly: raw.includes("--text"),
    linksOnly: raw.includes("--links"),
    imagesOnly: raw.includes("--images"),
  };
  // Limpiar flags del raw
  raw = raw.replace(/--json|--text|--links|--images/g, "").trim();

  // Primer token es URL, resto es selector CSS opcional
  const parts = raw.split(/\s+/);
  let url = parts[0];
  let selector = parts.slice(1).join(" ").trim() || null;

  // Validar URL
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    new URL(url);
  } catch {
    return m.reply(`*( 𝜰 ﹏ 𝜰 )* URL inválida: \`${url}\`\nEjemplo: \`${m.prefix}scrape https://example.com\``);
  }

  await m.react("🕕");
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // Remover scripts/styles
    $("script, style, noscript, iframe").remove();

    // Si hay selector personalizado
    if (selector) {
      const els = $(selector);
      if (els.length === 0) {
        await m.react("❌");
        return m.reply(
          `ꕥ 𝖲𝖢𝖱𝖠𝖯𝖤 - 𝖲𝖨𝖭 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲\n\n` +
          `• URL :: ${url}\n` +
          `• Selector :: \`${selector}\`\n` +
          `• Coincidencias :: 0\n\n` +
          `> Verifica que el selector CSS sea correcto. Ej: \`h1\`, \`.precio\`, \`#content p\``
        );
      }

      const results = [];
      els.each((i, el) => {
        if (results.length >= 20) return; // límite 20
        const tag = el.tagName?.toLowerCase() || "elem";
        const txt = cleanText($(el).text(), 300);
        const href = $(el).attr("href") || $(el).attr("src") || "";
        results.push({ index: i + 1, tag, text: txt, href: href ? href.slice(0, 200) : undefined });
      });

      if (flags.json) {
        return m.reply(`\`\`\`json\n${JSON.stringify({ url, selector, count: els.length, results }, null, 2).slice(0, 3800)}\n\`\`\``);
      }

      let msg =
        `ꕥ 𝖶𝖤𝖡 𝖲𝖢𝖱𝖠𝖯𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
        `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮*\n` +
        `      • URL :: ${url}\n` +
        `      • Selector :: \`${selector}\`\n` +
        `      • Coincidencias :: ${els.length} (mostrando ${results.length})\n\n` +
        `      𓈒 ◌ㅤ──    *𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮𝖲*\n`;
      results.forEach(r => {
        msg += `      • [${r.index}] <${r.tag}> ${r.text}\n`;
        if (r.href) msg += `        ↳ ${r.href}\n`;
      });
      msg += `\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
      await m.react("✅");
      const selButtons = [
        { buttonId: `${m.prefix}scrape ${url}`, buttonText: { displayText: "🏠 Ver Resumen" }, type: 1 },
        { buttonId: `${m.prefix}scrape ${url} ${selector} --json`, buttonText: { displayText: "🧾 Ver JSON" }, type: 1 },
        { buttonId: `${m.prefix}scrape ${url} --links`, buttonText: { displayText: "📎 Ver Links" }, type: 1 },
      ];
      try {
        const content = { buttonsMessage: { buttons: selButtons, contentText: msg, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
        const btnMsg = generateWAMessageFromContent(m.chat, content, { quoted: m });
        await sock.relayMessage(m.chat, btnMsg.message, { messageId: btnMsg.key.id });
        return;
      } catch { return m.reply(msg); }
    }

    // Sin selector -> modo general
    const title = cleanText($("title").first().text(), 200);
    const description = cleanText($('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "", 300);
    const ogImage = $('meta[property="og:image"]').attr("content") || "";
    const h1 = $("h1").map((_, el) => cleanText($(el).text(), 120)).get().slice(0, 5);
    const h2 = $("h2").map((_, el) => cleanText($(el).text(), 120)).get().slice(0, 5);
    const paragraphs = $("p").map((_, el) => cleanText($(el).text(), 200)).get().filter(t => t.length > 20).slice(0, 3);
    const links = $("a[href]").map((_, el) => {
      const href = $(el).attr("href");
      const txt = cleanText($(el).text(), 60);
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return null;
      // Resolver relativo
      try { return { text: txt || "(sin texto)", href: new URL(href, url).href }; } catch { return null; }
    }).get().filter(Boolean).slice(0, 10);
    const images = $("img[src]").map((_, el) => {
      const src = $(el).attr("src");
      try { return new URL(src, url).href; } catch { return null; }
    }).get().filter(Boolean).slice(0, 10);
    const bodyText = cleanText($("body").text(), flags.textOnly ? 3500 : 1200);

    if (flags.json) {
      const json = { url, title, description, ogImage, h1, h2, paragraphs, links, images, textPreview: bodyText.slice(0, 800) };
      return m.reply(`\`\`\`json\n${JSON.stringify(json, null, 2).slice(0, 3800)}\n\`\`\``);
    }
    if (flags.linksOnly) {
      if (links.length === 0) return m.reply(`*( 𝜰 ﹏ 𝜰 )* No se encontraron enlaces en ${url}`);
      let msg = `ꕥ 𝖫𝖨𝖭𝖪𝖲 𝖤𝖷𝖳𝖱𝖠𝖨𝖣𝖮𝖲\n\n• URL :: ${url}\n• Total :: ${links.length}\n\n`;
      links.forEach((l, i) => msg += `• [${i + 1}] ${l.text}\n  ↳ ${l.href}\n`);
      await m.react("✅");
      const linkButtons = [
        { buttonId: `${m.prefix}scrape ${url}`, buttonText: { displayText: "🏠 Resumen" }, type: 1 },
        { buttonId: `${m.prefix}scrape ${url} --images`, buttonText: { displayText: "🖼️ Imágenes" }, type: 1 },
        { buttonId: `${m.prefix}scrape ${url} --text`, buttonText: { displayText: "📄 Texto" }, type: 1 },
      ];
      try {
        const content = { buttonsMessage: { buttons: linkButtons, contentText: msg, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
        const btnMsg = generateWAMessageFromContent(m.chat, content, { quoted: m });
        await sock.relayMessage(m.chat, btnMsg.message, { messageId: btnMsg.key.id });
        return;
      } catch { return m.reply(msg); }
    }
    if (flags.imagesOnly) {
      if (images.length === 0) return m.reply(`*( 𝜰 ﹏ 𝜰 )* No se encontraron imágenes en ${url}`);
      let msg = `ꕥ 𝖨𝖬𝖠𝖦𝖤𝖭𝖤𝖲 𝖤𝖷𝖳𝖱𝖠𝖨𝖣𝖠𝖲\n\n• URL :: ${url}\n• Total :: ${images.length}\n\n`;
      images.forEach((src, i) => msg += `• [${i + 1}] ${src}\n`);
      await m.react("✅");
      const imgButtons = [
        { buttonId: `${m.prefix}scrape ${url}`, buttonText: { displayText: "🏠 Resumen" }, type: 1 },
        { buttonId: `${m.prefix}scrape ${url} --links`, buttonText: { displayText: "📎 Links" }, type: 1 },
        { buttonId: `${m.prefix}scrape ${url} --text`, buttonText: { displayText: "📄 Texto" }, type: 1 },
      ];
      try {
        const content = { buttonsMessage: { buttons: imgButtons, contentText: msg, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
        const btnMsg = generateWAMessageFromContent(m.chat, content, { quoted: m });
        await sock.relayMessage(m.chat, btnMsg.message, { messageId: btnMsg.key.id });
        return;
      } catch { return m.reply(msg); }
    }
    if (flags.textOnly) {
      await m.react("✅");
      let txtMsg = `ꕥ 𝖳𝖤𝖷𝖳𝖮 𝖯𝖫𝖠𝖭𝖮\n\n• URL :: ${url}\n• Título :: ${title}\n\n${bodyText}\n\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
      const txtButtons = [
        { buttonId: `${m.prefix}scrape ${url}`, buttonText: { displayText: "🏠 Resumen" }, type: 1 },
        { buttonId: `${m.prefix}scrape ${url} --links`, buttonText: { displayText: "📎 Links" }, type: 1 },
        { buttonId: `${m.prefix}scrape ${url} --json`, buttonText: { displayText: "🧾 JSON" }, type: 1 },
      ];
      try {
        const content = { buttonsMessage: { buttons: txtButtons, contentText: txtMsg, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
        const btnMsg = generateWAMessageFromContent(m.chat, content, { quoted: m });
        await sock.relayMessage(m.chat, btnMsg.message, { messageId: btnMsg.key.id });
        return;
      } catch { return m.reply(txtMsg); }
    }

    // Respuesta bonita por defecto
    let contentText =
      `ꕥ 𝖶𝖤𝖡 𝖲𝖢𝖱𝖠𝖯𝖤 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖨𝖭𝖥𝖮*\n` +
      `      • URL :: ${url}\n` +
      `      • Título :: ${title || "-"}\n` +
      `      • Descripción :: ${description || "-"}\n`;

    if (h1.length) contentText += `      • H1 :: ${h1.join(" | ")}\n`;
    if (h2.length) contentText += `      • H2 :: ${h2.slice(0, 3).join(" | ")}\n`;
    if (ogImage) contentText += `      • Imagen OG :: ${ogImage.slice(0, 100)}\n`;

    contentText += `\n      𓈒 ◌ㅤ──    *𝖯𝖱𝖤𝖵𝖨𝖤𝖶 𝖳𝖤𝖷𝖳𝖮*\n      ${bodyText.slice(0, 600)}\n`;

    if (paragraphs.length) {
      contentText += `\n      𓈒 ◌ㅤ──    *𝖯𝖠𝖱𝖱𝖠𝖥𝖮𝖲*\n`;
      paragraphs.forEach((p, i) => contentText += `      • [${i + 1}] ${p}\n`);
    }

    if (links.length) {
      contentText += `\n      𓈒 ◌ㅤ──    *𝖫𝖨𝖭𝖪𝖲 (${links.length})*\n`;
      links.slice(0, 5).forEach((l, i) => contentText += `      • ${l.text} → ${l.href.slice(0, 80)}\n`);
      if (links.length > 5) contentText += `      • ... y ${links.length - 5} más (usa --links)\n`;
    }

    if (images.length) {
      contentText += `\n      𓈒 ◌ㅤ──    *𝖨𝖬𝖠𝖦𝖤𝖭𝖤𝖲 (${images.length})*\n`;
      images.slice(0, 3).forEach((src, i) => contentText += `      • [${i + 1}] ${src.slice(0, 90)}\n`);
      if (images.length > 3) contentText += `      • ... y ${images.length - 3} más (usa --images)\n`;
    }

    contentText += `\nଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Usa \`${m.prefix}scrape ${url} selector\` para extraer algo específico »\n\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    await m.react("✅");

    // Botones dinámicos para el resumen
    const mainButtons = [
      { buttonId: `${m.prefix}scrape ${url} --links`, buttonText: { displayText: "📎 Ver Links" }, type: 1 },
      { buttonId: `${m.prefix}scrape ${url} --images`, buttonText: { displayText: "🖼️ Ver Imágenes" }, type: 1 },
      { buttonId: `${m.prefix}scrape ${url} --text`, buttonText: { displayText: "📄 Ver Texto" }, type: 1 },
      { buttonId: `${m.prefix}scrape ${url} --json`, buttonText: { displayText: "🧾 Ver JSON" }, type: 1 },
    ];

    // Intentar con thumbnail si hay ogImage
    let thumbnailBuffer = null;
    if (ogImage && ogImage.startsWith("http")) {
      try {
        const imgRes = await axios.get(ogImage, { responseType: "arraybuffer", timeout: 8000 });
        thumbnailBuffer = await sharp(imgRes.data).resize(300, 170).jpeg().toBuffer();
      } catch (_) { thumbnailBuffer = null; }
    }

    try {
      const buttonsContent = {
        buttonsMessage: {
          buttons: mainButtons.slice(0, 3), // WhatsApp limite 3 botones en algunos clientes, usamos 3 principales
          ...(thumbnailBuffer ? {
            locationMessage: { jpegThumbnail: thumbnailBuffer, name: title?.slice(0, 30) || "Preview", address: url.slice(0, 50) }
          } : {}),
          contentText: contentText,
          footerText: config?.bot?.name || "waguri assistant",
          headerType: thumbnailBuffer ? 6 : 1,
        },
      };
      // Agregar 4to botón si no hay thumbnail limit: usamos 3, pero si queremos 4 lo dividimos
      // Si hay thumbnail, agregamos el JSON como segundo mensaje o dentro de los 3
      // Reemplazamos el último botón por JSON si es necesario
      if (mainButtons.length > 3 && !thumbnailBuffer) {
        buttonsContent.buttonsMessage.buttons = mainButtons;
      }
      const msg = generateWAMessageFromContent(m.chat, buttonsContent, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      // Si teníamos 4 botones y solo mostramos 3, ofrecer el 4to como texto extra con botón secundario
      if (mainButtons.length === 4 && thumbnailBuffer) {
        // Enviar botón extra de JSON como follow-up rápido
        try {
          const extraContent = {
            buttonsMessage: {
              buttons: [{ buttonId: `${m.prefix}scrape ${url} --json`, buttonText: { displayText: "🧾 Ver JSON Completo" }, type: 1 }],
              contentText: `¿Quieres ver el JSON crudo de ${url}?`,
              footerText: config?.bot?.name || "waguri assistant",
              headerType: 1,
            },
          };
          const extraMsg = generateWAMessageFromContent(m.chat, extraContent, { quoted: m });
          // Pequeño delay para no spamear
          setTimeout(async () => {
            try { await sock.relayMessage(m.chat, extraMsg.message, { messageId: extraMsg.key.id }); } catch {}
          }, 800);
        } catch {}
      }
      return;
    } catch (e) {
      // Fallback clásico
      if (ogImage && ogImage.startsWith("http")) {
        try {
          await sock.sendMessage(m.chat, { image: { url: ogImage }, caption: contentText }, { quoted: m });
          return;
        } catch (_) {}
      }
      return m.reply(contentText);
    }

  } catch (error) {
    console.error("[Scrape Error]:", error?.message || error);
    await m.react("☢");
    let msg = te(m.prefix, m.command, m.pushName);
    if (error?.message?.includes("403") || error?.message?.includes("401")) {
      msg += `\n\n> La web bloqueó el scrapeo (403/401). Prueba con otro sitio o con un selector más simple.`;
    } else if (error?.message?.includes("timeout")) {
      msg += `\n\n> La web tardó demasiado en responder.`;
    }
    return m.reply(msg);
  }
}

export { pluginConfig as config, handler };
