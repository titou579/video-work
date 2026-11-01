/* ------------------------------------------------------------------
   CONFIG — the only part you need to edit
------------------------------------------------------------------- */
const CONFIG = {
  video: "work.mp4",          // exact file name, placed next to index.html
  title: "My video",          // big title above the player
  author: "",                 // e.g. "Your name · Class 3B · November 2026"
  subtitles: ""               // optional: "work.vtt" if you add a subtitle file
};

/* ------------------------------------------------------------------ */

const $ = (id) => document.getElementById(id);
const video = $("video"), stage = $("stage"), seek = $("seek");

const ICONS = {
  play:  '<path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" stroke="none"/>',
  replay:'<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/>',
  back:  '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">10</text>',
  fwd:   '<path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">10</text>',
  vol:   '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  mute:  '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/>',
  cc:    '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 10.2a2.4 2.4 0 1 0 0 3.6M17 10.2a2.4 2.4 0 1 0 0 3.6"/>',
  pip:   '<rect x="3" y="5" width="18" height="14" rx="2.5"/><rect x="12" y="11" width="7" height="5" rx="1" fill="currentColor"/>',
  full:  '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  exit:  '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  sliders:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  present:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>'
};
function icon(name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>";
}
function setIcon(el, name) { el.innerHTML = icon(name); }
document.querySelectorAll("[data-icon]").forEach((el) => setIcon(el, el.dataset.icon));

/* ---------- Settings (saved in the browser) ---------- */
const DEFAULTS = {
  theme: "indigo", fit: "contain", glow: true, loop: false, autohide: true,
  speed: 1, subSize: "100%", volume: 1, muted: false, title: "", author: ""
};
let S = { ...DEFAULTS };
try { S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem("player-settings") || "{}") }; } catch (e) {}
function save() { try { localStorage.setItem("player-settings", JSON.stringify(S)); } catch (e) {} }

/* ---------- Helpers ---------- */
const fmt = (t) => {
  if (!isFinite(t)) return "0:00";
  t = Math.max(0, Math.floor(t));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
};
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1100);
}
function setRangeFill(input, ratio) { input.style.setProperty("--p", (ratio * 100) + "%"); }

/* ---------- Load video ---------- */
video.src = CONFIG.video;
$("errName").textContent = CONFIG.video;
video.addEventListener("error", () => { $("error").hidden = false; });

function applyTitles() {
  const title = S.title || CONFIG.title;
  const author = S.author || CONFIG.author;
  $("title").textContent = title;
  $("author").textContent = author;
  document.title = title;
}

/* ---------- Play / pause ---------- */
function togglePlay() {
  if (video.ended) video.currentTime = 0;
  if (video.paused) video.play().catch(() => {}); else video.pause();
}
video.addEventListener("play", () => { stage.classList.add("playing"); stage.classList.remove("ended"); setIcon($("playBtn"), "pause"); setIcon($("bigplay"), "play"); $("playBtn").setAttribute("aria-label", "Pause"); });
video.addEventListener("pause", () => { stage.classList.remove("playing"); setIcon($("playBtn"), "play"); $("playBtn").setAttribute("aria-label", "Play"); stage.classList.remove("idle"); });
video.addEventListener("ended", () => { stage.classList.remove("playing"); stage.classList.add("ended"); setIcon($("bigplay"), "replay"); setIcon($("playBtn"), "replay"); });
$("playBtn").addEventListener("click", togglePlay);
$("bigplay").addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);
video.addEventListener("dblclick", toggleFullscreen);

/* ---------- Progress ---------- */
video.addEventListener("loadedmetadata", () => { $("dur").textContent = fmt(video.duration); video.playbackRate = S.speed; });
video.addEventListener("durationchange", () => { $("dur").textContent = fmt(video.duration); });
video.addEventListener("timeupdate", () => {
  $("cur").textContent = fmt(video.currentTime);
  if (video.duration) {
    const r = video.currentTime / video.duration;
    seek.value = Math.round(r * 1000);
    setRangeFill(seek, r);
  }
});
seek.addEventListener("input", () => {
  if (!video.duration) return;
  const r = seek.value / 1000;
  video.currentTime = r * video.duration;
  setRangeFill(seek, r);
});
function skip(sec) {
  if (!video.duration) return;
  video.currentTime = Math.min(Math.max(0, video.currentTime + sec), video.duration);
  toast((sec > 0 ? "+" : "") + sec + " s");
}
$("backBtn").addEventListener("click", () => skip(-10));
$("fwdBtn").addEventListener("click", () => skip(10));

/* ---------- Volume ---------- */
const vol = $("volume");
function applyVolume() {
  video.volume = S.volume;
  video.muted = S.muted || S.volume === 0;
  vol.value = video.muted ? 0 : S.volume;
  setRangeFill(vol, Number(vol.value));
  setIcon($("muteBtn"), video.muted ? "mute" : "vol");
}
vol.addEventListener("input", () => {
  S.volume = Number(vol.value);
  S.muted = S.volume === 0;
  applyVolume(); save();
});
$("muteBtn").addEventListener("click", () => {
  S.muted = !video.muted;
  if (!S.muted && S.volume === 0) S.volume = 0.6;
  applyVolume(); save();
  toast(S.muted ? "Muted" : "Volume " + Math.round(S.volume * 100) + "%");
});
function changeVolume(delta) {
  S.volume = Math.min(1, Math.max(0, +(S.volume + delta).toFixed(2)));
  S.muted = S.volume === 0;
  applyVolume(); save();
  toast("Volume " + Math.round(S.volume * 100) + "%");
}

/* ---------- Fullscreen / PiP / clean view ---------- */
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
}
document.addEventListener("fullscreenchange", () => {
  setIcon($("fsBtn"), document.fullscreenElement ? "exit" : "full");
});
$("fsBtn").addEventListener("click", toggleFullscreen);

if (!document.pictureInPictureEnabled) $("pipBtn").hidden = true;
$("pipBtn").addEventListener("click", async () => {
  try {
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await video.requestPictureInPicture();
  } catch (e) {}
});

function togglePresent() {
  document.body.classList.toggle("present");
  closePanel();
  toast(document.body.classList.contains("present") ? "Clean view — press P to exit" : "Clean view off");
}
$("presentBtn").addEventListener("click", togglePresent);

/* ---------- Auto-hide controls ---------- */
let idleTimer;
function wake() {
  stage.classList.remove("idle");
  clearTimeout(idleTimer);
  if (S.autohide) idleTimer = setTimeout(() => stage.classList.add("idle"), 2500);
}
["mousemove", "touchstart", "keydown"].forEach((ev) => stage.addEventListener(ev, wake, { passive: true }));
stage.addEventListener("mouseleave", () => { if (S.autohide && !video.paused) stage.classList.add("idle"); });

/* ---------- Subtitles ---------- */
const ccBtn = $("ccBtn");
function currentTrack() { return video.textTracks && video.textTracks.length ? video.textTracks[0] : null; }
function refreshCC() {
  const t = currentTrack();
  ccBtn.disabled = !t;
  ccBtn.classList.toggle("on", !!t && t.mode === "showing");
}
function addTrack(url, label) {
  video.querySelectorAll("track").forEach((n) => n.remove());
  const tr = document.createElement("track");
  tr.kind = "subtitles"; tr.label = label || "Subtitles"; tr.srclang = "en"; tr.src = url; tr.default = true;
  video.appendChild(tr);
  tr.addEventListener("load", () => { if (tr.track) tr.track.mode = "showing"; refreshCC(); });
  setTimeout(() => { if (tr.track) tr.track.mode = "showing"; refreshCC(); }, 150);
}
function srtToVtt(text) {
  return "WEBVTT\n\n" + text.replace(/\r+/g, "").replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
}
$("subFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  let text = await file.text();
  if (!/^\uFEFF?WEBVTT/.test(text)) text = srtToVtt(text);
  addTrack(URL.createObjectURL(new Blob([text], { type: "text/vtt" })), file.name);
  toast("Subtitles loaded");
});
ccBtn.addEventListener("click", toggleCC);
function toggleCC() {
  const t = currentTrack();
  if (!t) return;
  t.mode = t.mode === "showing" ? "hidden" : "showing";
  refreshCC();
  toast(t.mode === "showing" ? "Subtitles on" : "Subtitles off");
}
if (CONFIG.subtitles) addTrack(CONFIG.subtitles, "Subtitles");

/* ---------- Ambient glow ---------- */
const glow = $("glow"), gctx = glow.getContext("2d");
setInterval(() => {
  if (!S.glow || video.paused || video.readyState < 2) return;
  try { gctx.drawImage(video, 0, 0, glow.width, glow.height); } catch (e) {}
}, 120);
video.addEventListener("loadeddata", () => { try { gctx.drawImage(video, 0, 0, glow.width, glow.height); } catch (e) {} });

/* ---------- Settings panel ---------- */
const panel = $("panel"), settingsBtn = $("settingsBtn");
function openPanel() { panel.hidden = false; settingsBtn.setAttribute("aria-expanded", "true"); $("closePanel").focus(); }
function closePanel() { panel.hidden = true; settingsBtn.setAttribute("aria-expanded", "false"); }
settingsBtn.addEventListener("click", () => (panel.hidden ? openPanel() : closePanel()));
$("closePanel").addEventListener("click", closePanel);

function applySettings() {
  document.body.dataset.theme = S.theme;
  document.body.classList.toggle("no-glow", !S.glow);
  video.style.objectFit = S.fit;
  video.loop = S.loop;
  video.playbackRate = S.speed;
  document.documentElement.style.setProperty("--cue-size", S.subSize);
  document.querySelectorAll("#swatches button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.theme === S.theme)));
  $("speed").value = String(S.speed);
  $("fit").value = S.fit;
  $("loop").checked = S.loop;
  $("autohide").checked = S.autohide;
  $("glowToggle").checked = S.glow;
  $("subSize").value = S.subSize;
  $("titleInput").value = S.title || CONFIG.title;
  $("authorInput").value = S.author || CONFIG.author;
  applyTitles();
  applyVolume();
}

$("speed").addEventListener("change", (e) => { S.speed = Number(e.target.value); video.playbackRate = S.speed; save(); toast("Speed " + S.speed + "×"); });
$("fit").addEventListener("change", (e) => { S.fit = e.target.value; video.style.objectFit = S.fit; save(); });
$("loop").addEventListener("change", (e) => { S.loop = e.target.checked; video.loop = S.loop; save(); });
$("autohide").addEventListener("change", (e) => { S.autohide = e.target.checked; save(); wake(); });
$("glowToggle").addEventListener("change", (e) => { S.glow = e.target.checked; document.body.classList.toggle("no-glow", !S.glow); save(); });
$("subSize").addEventListener("change", (e) => { S.subSize = e.target.value; document.documentElement.style.setProperty("--cue-size", S.subSize); save(); });
$("titleInput").addEventListener("input", (e) => { S.title = e.target.value.trim() === CONFIG.title ? "" : e.target.value; applyTitles(); save(); });
$("authorInput").addEventListener("input", (e) => { S.author = e.target.value; applyTitles(); save(); });
$("swatches").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-theme]");
  if (!b) return;
  S.theme = b.dataset.theme; applySettings(); save();
});
$("reset").addEventListener("click", () => {
  S = { ...DEFAULTS };
  save(); applySettings(); toast("Settings reset");
});

/* ---------- Keyboard ---------- */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" && e.target.type === "text") return;
  if (tag === "select") return;
  const k = e.key.toLowerCase();

  if (k === " " || k === "k") { if (tag === "button") return; e.preventDefault(); togglePlay(); }
  else if (k === "arrowleft")  { e.preventDefault(); skip(-5); }
  else if (k === "arrowright") { e.preventDefault(); skip(5); }
  else if (k === "j") skip(-10);
  else if (k === "l") skip(10);
  else if (k === "arrowup")    { e.preventDefault(); changeVolume(0.1); }
  else if (k === "arrowdown")  { e.preventDefault(); changeVolume(-0.1); }
  else if (k === "m") $("muteBtn").click();
  else if (k === "f") toggleFullscreen();
  else if (k === "c") toggleCC();
  else if (k === "p") togglePresent();
  else if (k === "s") (panel.hidden ? openPanel() : closePanel());
  else if (k === "r") { video.currentTime = 0; video.play().catch(() => {}); toast("Restart"); }
  else if (k === "escape" && !panel.hidden) closePanel();
  else if (/^(Digit|Numpad)[0-9]$/.test(e.code) && video.duration) { video.currentTime = video.duration * (Number(e.code.slice(-1)) / 10); }
});

/* ---------- Start ---------- */
applySettings();
wake();
