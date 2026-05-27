import "./style.css";
/**
 * thumbnail-gen.js
 *
 * Runs each project in a hidden iframe for 25 seconds.
 * At t=15s  → captures a single PNG thumbnail.
 * At t=15s  → begins recording frames at 5 FPS for 10s.
 * At t=25s  → stops recording, encodes all frames to an animated WebP.
 *
 * Results are shown in the UI and made available for download.
 *
 * Each project must export execute() from its index.js.
 * The iframe runs the project page (/projN/index.html) but we
 * inject a postMessage-based bridge to trigger capture at the
 * right moments, since we cannot import the project's module
 * directly across origins.
 *
 * Architecture:
 *   Parent (this page) ──postMessage──► iframe (project page)
 *   iframe ──postMessage──► parent (PNG data URLs / done signal)
 */

// ── Config ────────────────────────────────────────────────
const TOTAL_MS       = 25_000;
const THUMB_AT_MS    = 15_000;
const RECORD_AT_MS   = 15_000;
const RECORD_FOR_MS  = 10_000;
const CAPTURE_FPS    = 5;
const CAPTURE_INT_MS = 1000 / CAPTURE_FPS;

// ── Project list — loaded from projects.json ──────────────
let PROJECTS = [];

async function loadProjects() {
  PROJECTS = await fetch('/projects.json').then(r => r.json());

  // Populate the selector dropdown
  PROJECTS.forEach(p => {
    const opt   = document.createElement('option');
    opt.value   = p.id;
    opt.textContent = p.name;
    projectSelect.appendChild(opt);
  });
}

// ── DOM refs ──────────────────────────────────────────────
const runBtn       = document.getElementById('run-btn');
const projectSelect= document.getElementById('project-select');
const statusEl     = document.getElementById('status');
const logEl       = document.getElementById('log');
const iframe      = document.getElementById('project-frame');
const resultsEl   = document.getElementById('results');
const progressBar = document.getElementById('progress-bar');

// ── Logging ───────────────────────────────────────────────
function log(msg, type = '') {
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.textContent = msg;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// ── Animated WebP encoding ────────────────────────────────
//
// Animated WebP is a RIFF container:
//   RIFF....WEBP
//     VP8X  (10 bytes: flags + canvas size)
//     ANIM  (6 bytes:  background color + loop count)
//     ANMF  (per frame: position + size + duration + flags + VP8/VP8L data)
//
// Each frame PNG is re-encoded as a single-frame WebP via canvas.toBlob(),
// then we strip its RIFF/WEBP header and embed the raw VP8/VP8L chunk(s)
// inside the ANMF payload.

function buildAnimatedWebP(webpFrameArrays, width, height, frameDurationMs) {
  // ── Binary helpers ──────────────────────────────────────
  const te = new TextEncoder();
  const fcc  = (s)  => te.encode(s);
  const u32  = (n)  => { const b=new Uint8Array(4); b[0]=n&0xff;b[1]=(n>>8)&0xff;b[2]=(n>>16)&0xff;b[3]=(n>>24)&0xff; return b; };
  const u16  = (n)  => { const b=new Uint8Array(2); b[0]=n&0xff;b[1]=(n>>8)&0xff; return b; };
  const u24  = (n)  => { const b=new Uint8Array(3); b[0]=n&0xff;b[1]=(n>>8)&0xff;b[2]=(n>>16)&0xff; return b; };

  function cat(...arrays) {
    const total = arrays.reduce((s,a)=>s+a.byteLength, 0);
    const out = new Uint8Array(total); let off = 0;
    for (const a of arrays) { out.set(a, off); off += a.byteLength; }
    return out;
  }

  // Build a RIFF chunk: fourCC + u32(size) + data [+ 0x00 pad if odd]
  function riffChunk(id, data) {
    const pad = (data.byteLength & 1) ? new Uint8Array(1) : new Uint8Array(0);
    return cat(fcc(id), u32(data.byteLength), data, pad);
  }

  // ── Extract VP8/VP8L (+ optional ALPH) chunks from a single-frame WebP ──
  // Reads sizes via direct byte indexing to avoid DataView byteOffset bugs.
  function extractBitstream(bytes) {
    let off = 12; // skip RIFF(4) + size(4) + WEBP(4)
    const chunks = [];
    while (off + 8 <= bytes.byteLength) {
      const cc = String.fromCharCode(bytes[off], bytes[off+1], bytes[off+2], bytes[off+3]);
      const sz = bytes[off+4] | (bytes[off+5]<<8) | (bytes[off+6]<<16) | (bytes[off+7]<<24);
      const psz = sz + (sz & 1); // padded size
      if (cc === 'VP8X') {
        // Extended WebP — descend into sub-chunks
        off += 8 + psz;
      } else if (cc === 'VP8 ' || cc === 'VP8L' || cc === 'ALPH') {
        chunks.push(bytes.slice(off, off + 8 + psz));
        off += 8 + psz;
      } else {
        off += 8 + psz;
      }
    }
    return chunks;
  }

  // ── VP8X — 10-byte payload ──────────────────────────────
  const vp8x = riffChunk('VP8X', cat(
    new Uint8Array([0x02, 0x00, 0x00, 0x00]),  // flags: animation bit set
    u24(width  - 1),
    u24(height - 1),
  ));

  // ── ANIM — 6-byte payload ───────────────────────────────
  const anim = riffChunk('ANIM', cat(
    new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]),  // background: white
    u16(0),                                    // loop count: 0 = infinite
  ));

  // ── ANMF per frame ──────────────────────────────────────
  const anmfChunks = webpFrameArrays.map(bytes => {
    const bitstream = cat(...extractBitstream(bytes));
    return riffChunk('ANMF', cat(
      u24(0),                          // frame X / 2
      u24(0),                          // frame Y / 2
      u24(width  - 1),                 // frame width  - 1
      u24(height - 1),                 // frame height - 1
      u24(frameDurationMs),            // duration in ms
      new Uint8Array([0x00]),          // flags: no blend, no dispose
      bitstream,
    ));
  });

  // ── RIFF container ──────────────────────────────────────
  const webpBody = cat(fcc('WEBP'), vp8x, anim, ...anmfChunks);
  return cat(fcc('RIFF'), u32(webpBody.byteLength), webpBody);
}

async function encodeAnimatedWebP(frames, fps) {
  if (!frames.length) return null;

  const frameDurationMs = Math.round(1000 / fps);

  // Re-encode each PNG frame as a single-frame lossy WebP
  const webpArrays = await Promise.all(frames.map(async (dataURL) => {
    const img    = await loadImage(dataURL);
    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/webp', 0.85));
    return new Uint8Array(await blob.arrayBuffer());
  }));

  const img0   = await loadImage(frames[0]);
  const width  = img0.naturalWidth;
  const height = img0.naturalHeight;

  const bytes = buildAnimatedWebP(webpArrays, width, height, frameDurationMs);
  return new Blob([bytes], { type: 'image/webp' });
}

function loadImage(dataURL) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src     = dataURL;
  });
}

function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime  = header.match(/:(.*?);/)[1];
  const bytes = atob(data);
  const arr   = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function blobToDataURL(blob) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(blob);
  });
}

// ── Capture bridge ────────────────────────────────────────
/**
 * The iframe runs the project page. We inject a <script> via
 * srcdoc that:
 *   1. Imports the project's index.js and calls execute()
 *   2. Listens for { type: 'capture' } messages from the parent
 *   3. Replies with { type: 'frame', dataURL } messages
 *
 * This avoids cross-origin issues by using same-origin iframes
 * (same host, different path).
 */

const INJECT_SCRIPT = `
<script type="module">
  // Find the canvas — gulls creates it, or projFinal uses .project-canvas
  function getCanvas() {
    return document.querySelector('canvas.project-canvas') || document.querySelector('canvas');
  }

  async function captureCanvas() {
    const canvas = getCanvas();
    if (!canvas) return null;

    // Flush GPU queue if possible
    if (navigator.gpu) {
      try {
        // We don't have the device reference here easily, so just rAF once more
        await new Promise(r => requestAnimationFrame(r));
      } catch {}
    }

    const off = document.createElement('canvas');
    off.width  = canvas.width;
    off.height = canvas.height;
    off.getContext('2d').drawImage(canvas, 0, 0);
    return off.toDataURL('image/png');
  }

  window.addEventListener('message', async (e) => {
    if (e.data?.type === 'capture') {
      const dataURL = await captureCanvas();
      parent.postMessage({ type: 'frame', dataURL, requestId: e.data.requestId }, '*');
    }
  });
<\/script>
`;

/**
 * Load a project URL into the iframe and wait for it to settle.
 * We use a query param so the project page knows it's in capture mode
 * (currently unused but useful for future opt-ins).
 */
function loadProject(url) {
  return new Promise((resolve) => {
    iframe.onload = () => {
      // Give scripts a moment to execute after load
      setTimeout(resolve, 500);
    };
    iframe.src = url + '?captureMode=1';
  });
}

/**
 * Send a capture request to the iframe and wait for the frame reply.
 */
let _reqId = 0;
function requestFrame() {
  return new Promise((resolve) => {
    const id = ++_reqId;
    const handler = (e) => {
      if (e.data?.type === 'frame' && e.data.requestId === id) {
        window.removeEventListener('message', handler);
        resolve(e.data.dataURL);
      }
    };
    window.addEventListener('message', handler);
    iframe.contentWindow.postMessage({ type: 'capture', requestId: id }, '*');
  });
}

// ── Inject the capture bridge into the iframe after load ──
// We do this by appending a script element into the iframe's document.
function injectBridge() {
  try {
    const doc    = iframe.contentDocument;
    const script = doc.createElement('script');
    script.type  = 'module';
    script.textContent = `
      function getCanvas() {
        return document.querySelector('canvas.project-canvas') || document.querySelector('canvas');
      }
      async function captureCanvas() {
        const canvas = getCanvas();
        if (!canvas) return null;
        await new Promise(r => requestAnimationFrame(r));
        const off = document.createElement('canvas');
        off.width  = canvas.width;
        off.height = canvas.height;
        off.getContext('2d').drawImage(canvas, 0, 0);
        return off.toDataURL('image/png');
      }
      window.addEventListener('message', async (e) => {
        if (e.data?.type === 'capture') {
          const dataURL = await captureCanvas();
          parent.postMessage({ type: 'frame', dataURL, requestId: e.data.requestId }, '*');
        }
      });
    `;
    doc.body.appendChild(script);
  } catch (e) {
    log(`  Bridge inject failed: ${e.message}`, 'err');
  }
}

// ── Run one project ───────────────────────────────────────
async function runProject(project) {
  log(`▶ ${project.name}`, 'info');
  statusEl.textContent = project.name;

  const frames       = [];
  let   thumbnail    = null;
  let   recordActive = false;
  let   recordTimer  = null;

  // Load the project into the iframe
  await loadProject(project.url);
  injectBridge();
  log(`  Loaded. Running for ${TOTAL_MS / 1000}s…`);

  const start = performance.now();

  return new Promise((resolve) => {
    // Progress bar update
    const progressInterval = setInterval(() => {
      const elapsed = performance.now() - start;
      const pct     = Math.min(100, (elapsed / TOTAL_MS) * 100);
      progressBar.style.width = pct + '%';
    }, 100);

    // t = 15s: capture thumbnail + start recording
    const thumbTimer = setTimeout(async () => {
      log('  t=15s — capturing thumbnail…');
      thumbnail = await requestFrame();
      if (thumbnail) log('  Thumbnail captured.', 'ok');
      else           log('  Thumbnail failed (no canvas yet?).', 'err');

      // Start frame recording
      log('  Starting recording at 5 FPS…');
      recordActive = true;
      recordTimer  = setInterval(async () => {
        if (!recordActive) return;
        const f = await requestFrame();
        if (f) frames.push(f);
      }, CAPTURE_INT_MS);

    }, THUMB_AT_MS);

    // t = 25s: stop everything, encode, resolve
    setTimeout(async () => {
      clearTimeout(thumbTimer);
      recordActive = false;
      clearInterval(recordTimer);
      clearInterval(progressInterval);

      log(`  Recording stopped. ${frames.length} frames captured.`);
      progressBar.style.width = '100%';

      // Encode animated WebP
      let gifBlob  = null;
      let gifURL   = null;
      if (frames.length > 0) {
        log('  Encoding animated WebP…');
        try {
          gifBlob = await encodeAnimatedWebP(frames, CAPTURE_FPS);
          gifURL  = gifBlob ? URL.createObjectURL(gifBlob) : null;
          log(`  Encoded. Size: ${gifBlob ? (gifBlob.size / 1024).toFixed(1) + ' KB' : '—'}`, 'ok');
        } catch (e) {
          log(`  Encode error: ${e.message}`, 'err');
        }
      }

      // Unload iframe
      iframe.src = 'about:blank';

      resolve({ thumbnail, frames, gifBlob, gifURL });
    }, TOTAL_MS);
  });
}

// ── Show result in UI ─────────────────────────────────────
function showResult(project, { thumbnail, gifURL }) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const title = document.createElement('span');
  title.textContent = project.name.toUpperCase();

  card.appendChild(title);

  if (thumbnail) {
    const img = document.createElement('img');
    img.src = thumbnail;
    img.title = 'Thumbnail (PNG)';

    const dlThumb = document.createElement('a');
    dlThumb.textContent = '↓ thumbnail.png';
    dlThumb.href        = thumbnail;
    dlThumb.download    = `${project.id}-thumbnail.png`;

    card.appendChild(img);
    card.appendChild(dlThumb);
  } else {
    const none = document.createElement('span');
    none.textContent = 'No thumbnail';
    card.appendChild(none);
  }

  if (gifURL) {
    const gifImg = document.createElement('img');
    gifImg.src   = gifURL;
    gifImg.title = 'Animated (WebM/WebP)';

    const dlGif = document.createElement('a');
    dlGif.textContent = '↓ animation.webp';
    dlGif.href        = gifURL;
    dlGif.download    = `${project.id}-animation.webp`;

    card.appendChild(gifImg);
    card.appendChild(dlGif);
  }

  resultsEl.appendChild(card);
}

// ── Main ──────────────────────────────────────────────────
async function runAll() {
  const selected = projectSelect.value;
  const queue    = selected === 'all'
    ? PROJECTS
    : PROJECTS.filter(p => p.id === selected);

  runBtn.disabled = true;
  resultsEl.innerHTML = '';
  logEl.innerHTML     = '';
  log(selected === 'all' ? 'Starting full run…' : `Running ${queue[0]?.name}…`, 'info');

  for (let i = 0; i < queue.length; i++) {
    const project = queue[i];
    progressBar.style.width = '0%';

    try {
      const result = await runProject(project);
      showResult(project, result);
      log(`✓ ${project.name} done.`, 'ok');
    } catch (e) {
      log(`✗ ${project.name} failed: ${e.message}`, 'err');
    }

    await new Promise(r => setTimeout(r, 500));
  }

  log('Done.', 'ok');
  statusEl.textContent = 'Done';
  runBtn.disabled = false;
  progressBar.style.width = '0%';
}

runBtn.addEventListener('click', runAll);
loadProjects();
