import yts from "yt-search";
import axios from "axios";
import config from "../../config.js";
import { generateWAMessageFromContent } from "ourin";

const pluginConfig = {
  name: "mix",
  alias: ["playlist", "mixplay", "recom", "recomendaciones"],
  category: "download",
  description: "Arma un mix/playlist con recomendaciones reales (Spotify + Reccobeats) y descarga con la API de play (nexray)",
  usage: ".mix <artista/canción/género o link YouTube/Spotify> [cantidad 3-10]",
  example: ".mix bad bunny 5\n.mix https://open.spotify.com/track/xxx 6\n.mix https://youtu.be/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 4,
  isEnabled: true,
};

const YT_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
const SPOTIFY_REGEX = /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;

function extractSpotifyId(url) {
  const m = String(url).match(SPOTIFY_REGEX);
  return m ? m[1] : null;
}

async function searchSpotifyNexray(query) {
  const { data } = await axios.get(`https://api.nexray.eu.cc/search/spotify?q=${encodeURIComponent(query)}`, { timeout: 15000 });
  if (!data?.status || !Array.isArray(data.result) || !data.result.length) throw new Error("Sin resultados en Spotify");
  return data.result;
}

async function getReccobeatsRecommendations(spotifyId, size = 6) {
  try {
    const { data } = await axios.get(`https://api.reccobeats.com/v1/track/recommendation`, {
      params: { seeds: spotifyId, size },
      timeout: 8000,
    });
    if (Array.isArray(data?.content) && data.content.length) {
      return data.content.map(c => ({
        title: c.trackTitle || "Unknown",
        artist: c.artists?.[0]?.name || "Unknown",
        url: c.href,
        thumbnail: null,
        popularity: c.popularity || 0,
        duration: c.durationMs ? `${Math.floor(c.durationMs/60000)}:${String(Math.floor((c.durationMs%60000)/1000)).padStart(2,"0")}` : "-",
        id: c.id,
      })).filter(t => t.url && t.url.includes("open.spotify.com"));
    }
  } catch (e) { console.log("[Reccobeats fail]", e.message); }
  return null;
}

async function getDeezerVibe(artist, title, limit = 6) {
  try {
    // 1. Buscar track en Deezer para sacar artist ID real
    const searchUrl = `https://api.deezer.com/search?q=artist:"${encodeURIComponent(artist)}" track:"${encodeURIComponent(title)}"`;
    let { data } = await axios.get(searchUrl, { timeout: 8000 });
    let deezerTrack = data?.data?.[0];
    if (!deezerTrack) {
      const fallback = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(artist + " " + title)}`, { timeout: 8000 });
      deezerTrack = fallback.data?.data?.[0];
    }
    if (!deezerTrack?.artist?.id) return null;
    const artistId = deezerTrack.artist.id;

    // 2. Top del mismo artista (otras canciones con misma vibra del artista)
    const topRes = await axios.get(`https://api.deezer.com/artist/${artistId}/top?limit=12`, { timeout: 8000 });
    const topTracks = (topRes.data?.data || []).filter(t => t.title !== title).slice(0, Math.ceil(limit * 0.6));

    // 3. Artistas relacionados (misma vibra, género similar)
    const relRes = await axios.get(`https://api.deezer.com/artist/${artistId}/related`, { timeout: 8000 });
    const relatedArtists = (relRes.data?.data || []).slice(0, 4);
    const relatedOneTracks = [];
    for (const rel of relatedArtists) {
      try {
        const relTop = await axios.get(`https://api.deezer.com/artist/${rel.id}/top?limit=1`, { timeout: 5000 });
        if (relTop.data?.data?.[0]) relatedOneTracks.push(relTop.data.data[0]);
      } catch {}
    }

    // 4. Combinar: 60% mismo artista + 40% artistas similares
    const combined = [...topTracks, ...relatedOneTracks];
    // Mapear a formato Spotify (luego convertimos a Spotify URLs via nexray search)
    const mapped = [];
    for (const t of combined.slice(0, limit)) {
      // Buscar en Spotify para tener thumbnail y url spotify real para descarga
      try {
        const q = `${t.artist.name} ${t.title}`;
        const sp = await searchSpotifyNexray(q);
        if (sp[0]) mapped.push(sp[0]);
        else mapped.push({ title: t.title, artist: t.artist.name, url: t.link, thumbnail: t.album?.cover_medium || null, duration: `${Math.floor(t.duration/60)}:${String(t.duration%60).padStart(2,"0")}` });
      } catch {
        mapped.push({ title: t.title, artist: t.artist.name, url: t.link, thumbnail: null, duration: "-" });
      }
      if (mapped.length >= limit) break;
    }
    if (mapped.length >= 3) return mapped.slice(0, limit);
  } catch (e) { console.log("[Deezer vibe fail]", e.message); }
  return null;
}

async function getRecommendations(query, limit = 6) {
  let baseTrack = null;
  let tracks = [];

  const spotifyId = extractSpotifyId(query);
  const isYt = YT_REGEX.test(query);

  // 1. Resolver base track
  if (spotifyId) {
    // Link directo Spotify -> buscar ese ID via Reccobeats o via search por ID
    try {
      const res = await searchSpotifyNexray(query); // nexray acepta url? si no, fallback
      baseTrack = res[0];
    } catch {
      // Fallback: usar yts para obtener nombre y luego buscar en spotify
      baseTrack = { title: "Track", artist: "Unknown", url: query, thumbnail: null };
    }
    // Intentar Deezer vibe primero (misma vibra real)
    const deezerVibe = await getDeezerVibe(baseTrack.artist, baseTrack.title, limit);
    if (deezerVibe && deezerVibe.length >= 3) {
      const filteredDeezer = deezerVibe.filter(t => !t.url.includes(spotifyId));
      if (filteredDeezer.length >= 3) return { baseTrack, tracks: filteredDeezer.slice(0, limit) };
    }
    // Si no, intentar Reccobeats con validación
    const rec = await getReccobeatsRecommendations(spotifyId, limit);
    if (rec && rec.length >= 3) {
      const same = rec.filter(r => r.artist.toLowerCase().includes(baseTrack.artist.toLowerCase().split(" ")[0])).length;
      if (same >= 2) return { baseTrack, tracks: rec.slice(0, limit) };
      console.log(`[Reccobeats descartado spotifyId]`);
    }
    // Fallback artista
    const artistQuery = baseTrack.artist !== "Unknown" ? baseTrack.artist : query;
    const byArtist = await searchSpotifyNexray(artistQuery);
    const filtered = byArtist.filter(t => !t.url.includes(spotifyId)).slice(0, limit);
    return { baseTrack, tracks: filtered };
  }

  if (isYt) {
    const id = query.match(YT_REGEX)[1];
    try {
      const s = await yts(`https://youtu.be/${id}`);
      const v = s.videos?.[0];
      if (v) {
        const title = v.title;
        const author = v.author?.name || "";
        const spotifyRes = await searchSpotifyNexray(`${author} ${title.split(" ").slice(0, 3).join(" ")}`);
        baseTrack = spotifyRes[0];
        // Intentar Deezer vibe
        const deezerVibeYT = await getDeezerVibe(baseTrack.artist, baseTrack.title, limit);
        if (deezerVibeYT && deezerVibeYT.length >= 3) {
          const f = deezerVibeYT.filter(t=>t.url!==baseTrack.url);
          if (f.length >=3) return { baseTrack, tracks: f.slice(0, limit) };
        }
        const sid = extractSpotifyId(baseTrack.url);
        if (sid) {
          const rec = await getReccobeatsRecommendations(sid, limit);
          if (rec && rec.length >= 3) {
            const same = rec.filter(r=>r.artist.toLowerCase().includes(baseTrack.artist.toLowerCase().split(" ")[0])).length;
            if (same >=2) return { baseTrack, tracks: rec.slice(0, limit) };
          }
        }
        // Fallback artista
        const byArtist = await searchSpotifyNexray(author || title);
        return { baseTrack, tracks: byArtist.filter(t=>t.url!==baseTrack.url).slice(0, limit) };
      }
    } catch {}
  }

  // Texto plano -> buscar en Spotify via Nexray
  const spotifyResults = await searchSpotifyNexray(query);
  baseTrack = spotifyResults[0];

  // Intentar recomendación con vibra real vía Deezer (mismo artista + artistas similares) - mucho más fiel que Reccobeats
  const deezerVibe = await getDeezerVibe(baseTrack.artist, baseTrack.title, limit);
  if (deezerVibe && deezerVibe.length >= 3) {
    // Validar que no sean duplicados del base
    const filtered = deezerVibe.filter(t => t.url !== baseTrack.url && t.title.toLowerCase() !== baseTrack.title.toLowerCase());
    if (filtered.length >= 3) return { baseTrack, tracks: filtered.slice(0, limit) };
  }

  // Fallback Reccobeats con validación de vibra (descartar si <40% es del mismo artista/género)
  const baseId = extractSpotifyId(baseTrack.url);
  if (baseId) {
    const rec = await getReccobeatsRecommendations(baseId, limit);
    if (rec && rec.length >= 3) {
      const sameArtistOrGenre = rec.filter(r => r.artist.toLowerCase().includes(baseTrack.artist.toLowerCase().split(" ")[0]) || baseTrack.artist.toLowerCase().includes(r.artist.toLowerCase().split(" ")[0])).length;
      // Si al menos 2 son del mismo artista/género, lo consideramos válido, si no lo descartamos (como te pasó con Joji -> Imagine Dragons)
      if (sameArtistOrGenre >= 2 || (rec[0].popularity > 40 && rec.length === limit)) {
        const seen = new Set([baseTrack.title.toLowerCase()]);
        const uniqRec = rec.filter(r => {
          const low = r.title.toLowerCase();
          if (seen.has(low)) return false;
          seen.add(low); return true;
        });
        if (uniqRec.length >= 3) return { baseTrack, tracks: uniqRec.slice(0, limit) };
      } else {
        console.log(`[Reccobeats descartado por irrelevante: ${rec.map(r=>r.artist).join(", ")}]`);
      }
    }
  }
  // Fallback final: siguientes resultados de la misma búsqueda (diversen, no duplicados)
  const rest = spotifyResults.slice(1, limit + 1);
  if (rest.length < limit) {
    try {
      const byArtist = await searchSpotifyNexray(baseTrack.artist);
      for (const t of byArtist) {
        if (rest.length >= limit) break;
        if (!rest.find(r=>r.url===t.url) && t.url!==baseTrack.url) rest.push(t);
      }
    } catch {}
  }
  return { baseTrack, tracks: rest.slice(0, limit) };
}

async function handler(m, { sock, text, prefix }) {
  const pf = prefix || m.prefix || config.command?.prefix || ".";
  let raw = (text || m.args?.join(" ") || "").trim();

  if (!raw) {
    const help =
      `ꕥ 𝖬𝖨𝖷 / 𝖯𝖫𝖠𝖸𝖫𝖨𝖲𝖳 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖬𝖮𝖣𝖮 𝖣𝖤 𝖴𝖲𝖮*\n` +
      `      • \`${pf}mix <búsqueda> [cantidad]\` → recomendaciones reales vía Spotify/Reccobeats\n` +
      `      • \`${pf}mix <link Spotify>\` → recomendaciones basadas en esa canción\n` +
      `      • \`${pf}mix <link YouTube>\` → convierte a Spotify y recomienda\n\n` +
      `      𓈒 ◌ㅤ──    *𝖤𝖩𝖤𝖬𝖯𝖫𝖮𝖲*\n` +
      `      • \`${pf}mix bad bunny 5\`\n` +
      `      • \`${pf}mix https://open.spotify.com/track/xxx 6\`\n` +
      `      • \`${pf}mix https://youtu.be/dQw4w9WgXcQ\`\n\n` +
      `Descarga con la API de play (nexray): \n` +
      `• \`https://api.nexray.eu.cc/search/spotify?q=\`\n` +
      `• \`https://api.nexray.eu.cc/downloader/spotify?url=\`\n` +
      `> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;
    const buttons = [
      { buttonId: `${pf}mix bad bunny 5`, buttonText: { displayText: "🎵 Mix Bad Bunny" }, type: 1 },
      { buttonId: `${pf}mix feid 5`, buttonText: { displayText: "💿 Mix Feid" }, type: 1 },
      { buttonId: `${pf}mix https://open.spotify.com/track/3sK8wGT43QFpWrvNQsrQya 5`, buttonText: { displayText: "🔗 Mix con link Spotify" }, type: 1 },
    ];
    try {
      const c = { buttonsMessage: { buttons, contentText: help, footerText: config?.bot?.name || "waguri assistant", headerType: 1 } };
      const msg = generateWAMessageFromContent(m.chat, c, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      return;
    } catch { return m.reply(help); }
  }

  let limit = 6;
  const parts = raw.split(/\s+/);
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last)) {
    const n = parseInt(last);
    if (n >= 3 && n <= 10) { limit = n; parts.pop(); raw = parts.join(" "); }
  }

  await m.react("🎶");
  try {
    const { baseTrack, tracks } = await getRecommendations(raw, limit);

    const botName = config?.bot?.name || "Waguri Assistant";
    // Usar thumbnail de Spotify si hay, sino placeholder
    const thumb = baseTrack.thumbnail || "https://i.scdn.co/image/ab67616d0000b273bbd45c8d36e0e045ef640411";
    const coverParam = encodeURIComponent(thumb);
    const titleParam = encodeURIComponent(baseTrack.title || "Mix");
    const artistParam = encodeURIComponent(baseTrack.artist || "Mix");
    const canvasUrl = `https://api.nexray.eu.cc/canvas/musiccard?judul=${titleParam}&nama=${artistParam}&image_url=${coverParam}`;

    let caption =
      `ꕥ 𝖬𝖨𝖷 𝖠𝖱𝖬𝖠𝖣𝖮 - 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 ｡ﾟ+.ღ(ゝ◡ ⚈᷀᷁ღ)\n\n` +
      `      𓈒 ◌ㅤ──    *𝖡𝖠𝖲𝖤*\n` +
      `      • ${baseTrack.title} - ${baseTrack.artist}\n` +
      `      • ${baseTrack.url}\n\n` +
      `      𓈒 ◌ㅤ──    *𝖱𝖤𝖢𝖮𝖬𝖤𝖭𝖣𝖠𝖢𝖨𝖮𝖭𝖤𝖲 (${tracks.length} canciones distintas)*\n`;

    tracks.forEach((t, i) => {
      caption += `      ${i + 1}. ${String(t.title).slice(0, 40)} - ${t.artist} (${t.duration || "-"})\n`;
    });

    caption += `\n      Fuente: api.nexray.eu.cc/search/spotify + Reccobeats (best API)\n`;
    caption += `      Descarga vía: api.nexray.eu.cc/downloader/spotify?url=\n`;
    caption += `ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ « Toca para descargar cada tema o todo el ZIP »\n\n> 𝗐⍺𝗀𝗎ɾɩ ⍺𝗌𝗌ı𝗌ƚ⍺𝗇ƚ ツ`;

    const rows = [];
    tracks.forEach((t, i) => {
      const short = String(t.title).slice(0, 26);
      const desc = `${t.artist.slice(0, 18)} • ${t.duration || "-"}`;
      // Usar API de play de Nexray: spotify <url> (downloader directo)
      rows.push({
        title: `${i + 1}. 🎵 ${short}`,
        description: `${desc} • Spotify`,
        id: `${pf}spotify ${t.url}`,
      });
      // Segunda opción: también via YouTube playget por si prefieren
      // Convertimos título a búsqueda youtube fallback
      const ytQuery = `${t.artist} ${t.title}`.slice(0, 40);
      rows.push({
        title: `${i + 1}. ▶️ ${short} (YT)`,
        description: `${desc} • YouTube`,
        id: `${pf}playss ${ytQuery}`,
      });
    });

    const limitedRows = rows.slice(0, 24); // WhatsApp permite hasta 24? limitamos a 20 para seguridad
    const displayRows = limitedRows.slice(0, 20);

    const spotifyUrls = tracks.map(t=>t.url).join(" ");
    const zipId = `${pf}mixzip ${spotifyUrls}`; // mixzip ahora soporta Spotify URLs también (usa nexray downloader)

    const selectBtn = {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌸 Elegir tema (Spotify API)",
        sections: [{ title: `Recomendados para ${String(baseTrack.artist).slice(0,20)}`, rows: displayRows }],
      }),
    };
    const zipBtn = {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({ display_text: "📦 Descargar todo (ZIP)", id: zipId }),
    };
    const urlBtn = {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({ display_text: "⭐ Ver base en Spotify", url: baseTrack.url, merchant_url: baseTrack.url }),
    };

    await sock.sendMessage(m.chat, {
      image: { url: canvasUrl },
      caption,
      footer: `${botName} • nexray + Reccobeats • ${tracks.length} temas`,
      interactiveButtons: [selectBtn, zipBtn, urlBtn],
    }, { quoted: m });

    await m.react("✅");
  } catch (e) {
    console.error("[MIX ERROR]", e);
    await m.react("❌");
    return m.reply(`*( 𝜰 ﹏ 𝜰 )* Error armando el mix:\n${e?.message || e}\n\n> Prueba: \`${(prefix||m.prefix||".")}mix bad bunny 5\``);
  }
}

export { pluginConfig as config, handler };
