/**
 * browser-compat.ts
 * Central browser capability detection for MindMeld Proctor.
 * Used by VoiceScreener to decide voice vs text fallback mode.
 */

export type BrowserInfo = {
  name: string;
  isSafari: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isChrome: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isMac: boolean;
  isWindows: boolean;
  supportsSTT: boolean;   // SpeechRecognition
  supportsTTS: boolean;   // SpeechSynthesis
  supportsMic: boolean;   // getUserMedia
};

export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;

  const isIOS     = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari  = /^((?!chrome|android).)*safari/i.test(ua) || isIOS;
  const isFirefox = /Firefox\//.test(ua);
  const isEdge    = /Edg\//.test(ua);
  const isChrome  = /Chrome\//.test(ua) && !isEdge;
  const isMobile  = /Mobi|Android/i.test(ua) || isIOS;
  const isMac     = /Mac/.test(navigator.platform ?? "") || /Macintosh/.test(ua);
  const isWindows = /Win/.test(navigator.platform ?? "");

  const hasSR = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  const hasTTS = "speechSynthesis" in window;
  const hasMic = !!(navigator.mediaDevices?.getUserMedia);

  // Safari 14.1+ on desktop supports webkitSpeechRecognition
  // Safari on iOS 14.5+ supports it too but it's flaky
  // Firefox: NO SpeechRecognition support as of 2026

  let name = "Unknown";
  if (isFirefox) name = "Firefox";
  else if (isSafari) name = isIOS ? "Safari (iOS)" : "Safari (macOS)";
  else if (isEdge)   name = "Edge";
  else if (isChrome) name = "Chrome";

  return {
    name, isSafari, isFirefox, isEdge, isChrome,
    isMobile, isIOS, isMac, isWindows,
    supportsSTT: hasSR,
    supportsTTS: hasTTS,
    supportsMic: hasMic,
  };
}

/** Safari TTS keep-alive: Safari cuts speech after ~15s of silence.
 *  Call this wrapper instead of speechSynthesis.speak() directly.
 *  It re-queues a silent utterance every 10s to keep the engine warm.
 */
let _safariKeepalive: ReturnType<typeof setInterval> | null = null;

export function startSafariTTSKeepalive() {
  if (_safariKeepalive) return;
  _safariKeepalive = setInterval(() => {
    if (!window.speechSynthesis.speaking) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  }, 10_000);
}

export function stopSafariTTSKeepalive() {
  if (_safariKeepalive) { clearInterval(_safariKeepalive); _safariKeepalive = null; }
}
