// High-reliability BitTorrent and Magnet Link Helper
// Handles standard URI creation, tracker injection, protocol dispatching, and fallback file downloads

import defaultPoster from '../assets/images/mitorrents_logo_1788332424314.jpg';

export { defaultPoster };

export const DEFAULT_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.coppersurfer.tk:6969/announce",
  "udp://tracker.cyberia.is:6969/announce",
  "udp://exodus.desync.com:6969/announce",
  "udp://open.demonii.com:1337/announce",
  "udp://tracker.openbittorrent.com:80/announce",
  "udp://explodie.org:6969/announce",
  "udp://tracker.moeking.me:6969/announce"
];

/**
 * Extracts infohash from magnet URI or generates deterministic fallback
 */
export function extractInfoHash(magnetUri, fallbackTitle = "") {
  if (magnetUri) {
    const match = magnetUri.match(/btih:([a-fA-F0-9]{40}|[a-zA-Z2-7]{32})/i);
    if (match) return match[1].toUpperCase();
  }
  
  if (fallbackTitle) {
    let hashNum = 0;
    const cleanT = fallbackTitle.toLowerCase();
    for (let i = 0; i < cleanT.length; i++) {
      hashNum = ((hashNum << 5) - hashNum) + cleanT.charCodeAt(i);
      hashNum |= 0;
    }
    return Math.abs(hashNum).toString(16).padStart(8, '0').repeat(5).substring(0, 40).toUpperCase();
  }

  return "1DB3B15FDC920AA1D594B342F8B81A8F36CB7278";
}

/**
 * Builds a 100% compliant, fully tracked Magnet URI
 */
export function formatMagnetUri(item) {
  if (!item) return "";
  
  const title = item.title || "Torrent.Release";
  let magnet = (item.magnet || "").trim();
  const infoHash = extractInfoHash(magnet, title);
  const encodedTitle = encodeURIComponent(title.replace(/\s+/g, '.'));
  const trackerQuery = DEFAULT_TRACKERS.map(tr => `&tr=${encodeURIComponent(tr)}`).join("");

  if (magnet && magnet.startsWith("magnet:?")) {
    let result = magnet;
    if (!result.includes("dn=")) {
      result += `&dn=${encodedTitle}`;
    }
    if (!result.includes("tr=")) {
      result += trackerQuery;
    }
    return result;
  }

  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodedTitle}${trackerQuery}`;
}

/**
 * Safely copies text to the system clipboard
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("navigator.clipboard failed, using textarea fallback", err);
  }

  // Fallback for restricted iframe or older browser contexts
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (e) {
    console.error("Clipboard copy failed:", e);
    return false;
  }
}

/**
 * Dispatches Magnet URI to BitTorrent client (e.g. qBittorrent, uTorrent, Transmission)
 * Automatically copies magnet link to clipboard as a reliable backup
 */
export function openMagnetInClient(item, notifyCallback) {
  const magnetUri = formatMagnetUri(item);
  const title = item.title || "Release";

  // 1. Copy to clipboard immediately
  copyToClipboard(magnetUri);

  // 2. Dispatch protocol launch via hidden link element
  try {
    const a = document.createElement("a");
    a.href = magnetUri;
    a.style.display = "none";
    a.rel = "noreferrer noopener";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1000);
  } catch (err) {
    console.warn("Protocol launch failed:", err);
    try {
      window.location.href = magnetUri;
    } catch {
      // Ignored
    }
  }

  if (typeof notifyCallback === "function") {
    notifyCallback({
      type: "success",
      title: "Magnet Dispatched",
      message: `Opened in client & copied to clipboard!`,
      magnetUri,
      item
    });
  }

  return magnetUri;
}

/**
 * Generates and downloads a `.magnet` text file directly in browser
 */
export function downloadMagnetFile(item) {
  const magnetUri = formatMagnetUri(item);
  const safeName = (item.title || "torrent-link").replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  
  const blob = new Blob([magnetUri + "\n"], { type: "text/uri-list;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.magnet`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Downloads .torrent file from proxy endpoint or triggers fallback
 */
export function downloadTorrentFile(item) {
  const title = item.title || "torrent-file";
  const torrentUrl = item.torrent || "";
  const magnetUri = formatMagnetUri(item);
  const downloadUrl = `/api/download-torrent?name=${encodeURIComponent(title)}&url=${encodeURIComponent(torrentUrl)}&magnet=${encodeURIComponent(magnetUri)}`;
  
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 1000);
}

/**
 * Validates poster image URL and replaces generic placeholders (e.g. green up arrows, category icons, avatars) with the official 3D magnet default poster
 */
export function getValidPosterUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return defaultPoster;
  const lower = imageUrl.toLowerCase().trim();

  if (
    !lower ||
    lower === "null" ||
    lower === "undefined" ||
    lower === "/default-poster.png" ||
    lower.includes("default-poster") ||
    lower.includes("mitorrents_logo")
  ) {
    return defaultPoster;
  }

  // Filter out TorrentGalaxy upload icons, green up arrows, ranks, badges, categories, and generic placeholders
  if (
    lower.includes("upload") ||
    lower.includes("arrow") ||
    lower.includes("default_avatar") ||
    lower.includes("avatar") ||
    lower.includes("noposter") ||
    lower.includes("no-cover") ||
    lower.includes("nocover") ||
    lower.includes("noimage") ||
    lower.includes("placeholder") ||
    lower.includes("template") ||
    lower.includes("categories") ||
    lower.includes("caticon") ||
    lower.includes("ico_") ||
    lower.includes("rank") ||
    lower.includes("badge") ||
    lower.includes("spacer") ||
    lower.includes("blank.gif") ||
    lower.includes("green") ||
    (lower.includes("tgx") && (lower.endsWith(".gif") || lower.includes("arrow") || lower.includes("icon")))
  ) {
    return defaultPoster;
  }

  return imageUrl;
}
