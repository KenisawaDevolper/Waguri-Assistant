import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { parse } from 'acorn';
import { hotReloadPlugin, loadPlugin, getPlugin } from '../../src/lib/rimuru-plugins.js';
import te from '../../src/lib/rimuru-error.js';

const pluginConfig = {
  name: 'addplugins',
  alias: ['addplugin', 'installplugin'],
  category: 'owner',
  description: 'Añade un plugin JS directamente a la categoría plugins con la estética Waguri Assistant ✨',
  usage: '.addplugins <categoría>',
  example: '.addplugins tools',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const PLUGINS_DIR = path.resolve(process.cwd(), 'plugins');
const MAX_PLUGIN_SIZE = 1024 * 1024; // 1 MB
const SAFE_CATEGORY = /^[a-z0-9_-]{1,32}$/i;
const SAFE_FILENAME = /^[a-z0-9][a-z0-9._-]*\.js$/i;

function cleanCategory(value) {
  const category = String(value || '').trim().replace(/\\/g, '/').split('/')[0];
  if (!SAFE_CATEGORY.test(category)) return null;
  if (category === '.' || category === '..') return null;
  return category;
}

function cleanFilename(value) {
  const filename = path.basename(String(value || '').trim());
  if (!SAFE_FILENAME.test(filename)) return null;
  if (filename.startsWith('_')) return null;
  return filename;
}

function getDocumentFromMessage(message) {
  if (!message) return null;
  if (message.isDocument || message.type === 'documentMessage') return message;
  if (message.message?.documentMessage) return message;
  return null;
}

function getSourceDocument(m) {
  const direct = getDocumentFromMessage(m);
  if (direct) return direct;
  return getDocumentFromMessage(m.quoted);
}

function getFileName(doc) {
  return doc?.fileName || doc?.filename || doc?.message?.documentMessage?.fileName || '';
}

async function validatePluginSource(source, filename) {
  try {
    parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
  } catch (error) {
    return {
      ok: false,
      reason: `SyntaxError baris ${error.loc?.line || '?'}:${error.loc?.column || '?'} — ${error.message}`,
    };
  }

  // Basic structural validation without executing the uploaded file.
  // This catches the common Rimuru formats before hotReloadPlugin() imports it.
  const hasConfig = /(?:export\s+(?:const|let|var)\s+config|export\s*\{[^}]*\bconfig\b|export\s+default)/m.test(source);
  const hasHandler = /(?:export\s+(?:async\s+)?function\s+handler|export\s*\{[^}]*\bhandler\b|handler\s*[:=])/m.test(source);
  const hasLegacy = /(?:command|help|tags)\s*[:=]/m.test(source);

  if (!hasConfig && !hasLegacy) {
    return { ok: false, reason: `Struktur plugin ${filename} no dikenali (config/legacy metadata no encontrado).` };
  }

  if (!hasHandler && !hasLegacy) {
    return { ok: false, reason: `Handler plugin ${filename} no encontrado.` };
  }

  return { ok: true };
}


async function handler(m, { sock }) {
  try {
    if (!m.isOwner && !m.fromMe) {
      return await m.reply('🚫 *ACCESO DENEGADO*\n\nEste comando solo puede usarlo el owner del bot. ✨');
    }

    const category = cleanCategory(m.text || m.args?.[0]);
    if (!category) {
      return await m.reply(
        `❌ *Format salah*\n\n` +
        `Envía/responde con el archivo plugin *.js y luego usa:\n` +
        `> ${m.prefix}addplugins tools\n\n` +
        `Ejemplo kategori: tools, anime, image, owner, fun`
      );
    }

    const document = getSourceDocument(m);
    if (!document) {
      return await m.reply(
        `📦 *ADD PLUGIN*\n\n` +
        `Kirim file *.js bersama perintah ini atau reply file *.js, lalu:\n` +
        `> ${m.prefix}addplugins ${category}`
      );
    }

    const filename = cleanFilename(getFileName(document));
    if (!filename) {
      return await m.reply('❌ El archivo debe ser JavaScript con un nombre seguro, ejemplo: `hd.js`');
    }

    const mime = String(document.mimetype || '').toLowerCase();
    if (mime && mime !== 'application/javascript' && mime !== 'text/javascript' && mime !== 'application/x-javascript' && !filename.endsWith('.js')) {
      return await m.reply('❌ Ese archivo no es un plugin JavaScript.');
    }

    if (filename === 'addplugins.js') {
      return await m.reply('❌ El plugin del sistema `.addplugins` no puede ser sobrescrito con este comando. ✨');
    }

    const buffer = await document.download();
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      return await m.reply('❌ Error al descargar el archivo plugin del mensaje.');
    }

    if (buffer.length > MAX_PLUGIN_SIZE) {
      return await m.reply('❌ El tamaño del plugin es demasiado grande. Máximo 1 MB.');
    }

    const source = buffer.toString('utf8');
    const validation = await validatePluginSource(source, filename);
    if (!validation.ok) {
      return await m.reply(`❌ *PLUGIN RECHAZADO*\n\n> ${validation.reason}`);
    }

    const categoryDir = path.resolve(PLUGINS_DIR, category);
    const targetPath = path.resolve(categoryDir, filename);
    if (!targetPath.startsWith(categoryDir + path.sep)) {
      return await m.reply('❌ Ubicación del plugin no válida.');
    }

    fs.mkdirSync(categoryDir, { recursive: true });

    if (fs.existsSync(targetPath)) {
      return await m.reply(
        `⚠️ Plugin *${filename}* sudah ada di kategori *${category}*.\n\n` +
        `No ditimpa otomatis untuk mencegah plugin lama hilang.`
      );
    }

    // Write only after static validation. Import once before registration so
    // we can detect an existing command and avoid removing it accidentally.
    fs.writeFileSync(targetPath, source, 'utf8');

    const preflight = await loadPlugin(targetPath, true);
    if (!preflight) {
      fs.rmSync(targetPath, { force: true });
      return await m.reply('❌ *PLUGIN RECHAZADO*\n\n> El plugin no pudo ser cargado por Rimuru. Asegúrate de que el formato `config` + `handler` (o legacy) sea correcto.');
    }

    const primaryName = Array.isArray(preflight.config?.name)
      ? preflight.config.name[0]
      : String(preflight.config?.name || filename.replace(/\.js$/i, '')).split(',')[0].trim();
    const existing = primaryName ? getPlugin(primaryName) : null;
    if (existing && path.resolve(existing.filePath || '') !== path.resolve(targetPath)) {
      fs.rmSync(targetPath, { force: true });
      return await m.reply(`⚠️ *COMANDO YA REGISTRADO*\n\n> \`${primaryName}\` ya está en uso por otro plugin.\n> El nuevo plugin no se instaló para mantener seguro el anterior.`);
    }

    const result = await hotReloadPlugin(targetPath, category);
    if (!result.success) {
      fs.rmSync(targetPath, { force: true });
      // If this was an attempted new plugin, no old plugin should be removed.
      await hotReloadPlugin(targetPath).catch(() => {});
      return await m.reply(`❌ *PLUGIN NO SE PUDO ACTIVAR*\n\n> ${result.error || 'Unknown error'}\n\nEl archivo no se conservó porque no se pudo cargar.`);
    }

    return await m.reply(
      `✅ *PLUGIN ÉXITO DITAMBAHKAN*\n\n` +
      `╭─「 PLUGIN 」\n` +
      `│ 📄 File: *${filename}*\n` +
      `│ 📁 Folder: *plugins/${category}/*\n` +
      `│ ⚡ Command: *${result.name || filename.replace(/\.js$/i, '')}*\n` +
      `│ 🔄 Hot Reload: *Aktif*\n` +
      `╰──────────────\n\n` +
      `Plugin langsung dimuat tanpa restart bot.`
    );
  } catch (error) {
    console.error('[AddPlugins Error]', error);
    return await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
