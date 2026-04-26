import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import WebSocket from "ws";

const ROOT = process.cwd();
const VIDEO_DIR = process.env.TOUR_VIDEO_DIR || path.join(ROOT, "apps/frontend/public/videos");
const OUTPUT_WEBM = path.join(VIDEO_DIR, "buddhi-app-quickstart.webm");
const OUTPUT_MP4 = path.join(VIDEO_DIR, "buddhi-app-quickstart.mp4");
const OUTPUT_POSTER = path.join(VIDEO_DIR, "buddhi-app-quickstart-poster.png");
const NARRATION_TEXT_PATH = path.join(VIDEO_DIR, "buddhi-spiritual-narration.txt");
const CHROME_PATH = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = process.env.TOUR_BASE_URL || "http://127.0.0.1:3112";
const WIDTH = Number(process.env.TOUR_WIDTH || 1280);
const HEIGHT = Number(process.env.TOUR_HEIGHT || 720);
const FPS = Number(process.env.TOUR_FPS || 24);
const TOTAL_SECONDS = Number(process.env.TOUR_TOTAL_SECONDS || 51);
const NARRATION_RATE = Number(process.env.TOUR_NARRATION_RATE || 170);
const NARRATION_VOICE = process.env.TOUR_NARRATION_VOICE || "Moira";
const NARRATION_VOICE_FALLBACKS = ["Moira", "Tara", "Samantha"];

const scenes = [
  {
    url: "/",
    start: 0,
    end: 4,
    eyebrow: "Guided tour",
    title: "Begin With Clarity",
    body: "A current view of the app, designed to help each session start with purpose.",
  },
  {
    url: "/",
    start: 4,
    end: 9,
    scrollY: 260,
    eyebrow: "Step 1",
    title: "Review Progress",
    body: "See your rhythm, choose what needs attention, and move without friction.",
  },
  {
    url: "/dharma-planner",
    start: 9,
    end: 14,
    eyebrow: "Step 2",
    title: "Set Direction",
    body: "Turn intention into a clear next action before the day gets noisy.",
  },
  {
    url: "/karma-yoga",
    start: 14,
    end: 21,
    eyebrow: "Step 3",
    title: "Add Practice",
    body: "Capture the action, reflection, insight, or habit that matters today.",
  },
  {
    url: "/jnana-reflection",
    start: 21,
    end: 27,
    eyebrow: "Reflect",
    title: "Carry Insight Forward",
    body: "Use the module surfaces to record what happened and what it means.",
  },
  {
    url: "/motivation-analytics",
    start: 27,
    end: 33,
    scrollY: 120,
    eyebrow: "Step 4",
    title: "See Momentum",
    body: "Insights, trends, and recommendations make progress visible.",
  },
  {
    url: "/autograph-exchange",
    start: 33,
    end: 41,
    eyebrow: "Step 5",
    title: "Autograph Exchange",
    body: "Create a profile, request or give an autograph, and preserve meaningful keepsakes.",
  },
  {
    url: "/community",
    start: 41,
    end: 46,
    eyebrow: "Community",
    title: "Stay Connected",
    body: "Community spaces, sharing, settings, and data controls keep the experience complete.",
  },
  {
    url: "/settings",
    start: 46,
    end: 51,
    eyebrow: "Begin",
    title: "One Small Entry",
    body: "Return anytime and let steady use become visible momentum.",
  },
];

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (!address || typeof address === "string") {
          reject(new Error("Unable to allocate a local debugging port."));
          return;
        }
        resolve(address.port);
      });
    });
  });
}

async function waitForChrome(port, deadlineMs = 30_000) {
  const url = `http://127.0.0.1:${port}/json/list`;
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < deadlineMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw lastError ?? new Error("Chrome debugging endpoint did not become ready.");
}

class CdpClient {
  constructor(wsUrl) {
    this.id = 0;
    this.pending = new Map();
    this.ws = new WebSocket(wsUrl);
    this.ready = new Promise((resolve, reject) => {
      this.ws.once("open", resolve);
      this.ws.once("error", reject);
    });
    this.ws.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      if (!message.id) {
        return;
      }
      const request = this.pending.get(message.id);
      if (!request) {
        return;
      }
      this.pending.delete(message.id);
      if (message.error) {
        request.reject(new Error(`${request.method}: ${message.error.message}`));
        return;
      }
      request.resolve(message.result);
    });
    this.ws.on("close", () => {
      for (const request of this.pending.values()) {
        request.reject(new Error("CDP connection closed."));
      }
      this.pending.clear();
    });
  }

  async send(method, params = {}, timeoutMs = 30_000) {
    await this.ready;
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method}: timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      timer.unref();
      this.pending.set(id, {
        method,
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
    });
  }

  close() {
    this.ws.terminate();
  }
}

function stopProcess(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(forceTimer);
      resolve();
    };
    const forceTimer = setTimeout(() => {
      signalProcessGroup(child, "SIGKILL");
      finish();
    }, 3_000);
    forceTimer.unref();
    child.once("exit", finish);
    if (!signalProcessGroup(child, "SIGTERM")) {
      finish();
    }
  });
}

function signalProcessGroup(child, signal) {
  let signalled = false;
  if (child.pid) {
    try {
      process.kill(-child.pid, signal);
      signalled = true;
    } catch {
      // The browser process may already have exited even if helper processes linger.
    }
  }
  try {
    child.kill(signal);
    signalled = true;
  } catch {
    // Ignore shutdown races.
  }
  return signalled;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeDataUrl(dataUrl, outputPath) {
  const [, base64] = dataUrl.split(",");
  if (!base64) {
    throw new Error(`Unable to write image data to ${outputPath}`);
  }
  fs.writeFileSync(outputPath, Buffer.from(base64, "base64"));
}

function getAvailableNarrationVoices() {
  try {
    return execFileSync("say", ["-v", "?"], { encoding: "utf8" })
      .split("\n")
      .map((line) => {
        const match = line.match(/^(.+?)\s{2,}([a-z]{2}_[A-Z0-9]+)/);
        return match ? { name: match[1].trim(), locale: match[2] } : null;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function resolveNarrationVoice() {
  const voices = getAvailableNarrationVoices();
  if (voices.length === 0) {
    return NARRATION_VOICE;
  }

  const voiceNames = new Set(voices.map((voice) => voice.name));
  for (const voice of [NARRATION_VOICE, ...NARRATION_VOICE_FALLBACKS]) {
    if (voice && voiceNames.has(voice)) {
      return voice;
    }
  }

  return voices.find((voice) => voice.locale.startsWith("en_"))?.name ?? voices[0]?.name ?? NARRATION_VOICE;
}

function synthesizeNarrationAudio() {
  ensureFile(NARRATION_TEXT_PATH, "Narration script");

  const tempBase = path.join(os.tmpdir(), `buddhi-tour-narration-${Date.now()}`);
  const aiffPath = `${tempBase}.aiff`;
  const wavPath = `${tempBase}.wav`;
  const selectedVoice = resolveNarrationVoice();
  const sayArgs = [];
  if (selectedVoice) {
    sayArgs.push("-v", selectedVoice);
  }
  sayArgs.push("-f", NARRATION_TEXT_PATH, "-o", aiffPath, "-r", String(NARRATION_RATE));

  try {
    execFileSync("say", sayArgs, { stdio: "inherit" });
    const aiffSize = fs.statSync(aiffPath).size;
    if (aiffSize < 8_192) {
      throw new Error(
        "Narration audio was empty. Re-run the tour renderer with macOS speech synthesis access.",
      );
    }

    execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16@44100", aiffPath, wavPath], {
      stdio: "inherit",
    });
    const wav = fs.readFileSync(wavPath);
    if (wav.byteLength < 8_192) {
      throw new Error("Narration WAV was empty after conversion.");
    }
    console.log(
      `[tour-video] Generated narration audio (${Math.round(wav.byteLength / 1024)} KB, ${selectedVoice} @ ${NARRATION_RATE} wpm)`,
    );
    return `data:audio/wav;base64,${wav.toString("base64")}`;
  } finally {
    fs.rmSync(aiffPath, { force: true });
    fs.rmSync(wavPath, { force: true });
  }
}

function getLocalCookieUrls(baseUrl) {
  const url = new URL(baseUrl);
  const urls = new Set([url.origin]);
  if (url.hostname === "127.0.0.1") {
    urls.add(`http://localhost:${url.port || "80"}`);
  } else if (url.hostname === "localhost") {
    urls.add(`http://127.0.0.1:${url.port || "80"}`);
  }
  return [...urls];
}

async function captureScene(cdp, scene) {
  const targetUrl = new URL(scene.url, BASE_URL).toString();
  await cdp.send("Page.navigate", { url: targetUrl }, 45_000);
  await new Promise((resolve) => setTimeout(resolve, 3_800));

  if (scene.scrollY) {
    await cdp.send("Runtime.evaluate", {
      expression: `window.scrollTo({ top: ${JSON.stringify(scene.scrollY)}, behavior: "instant" });`,
      awaitPromise: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });

  return `data:image/png;base64,${result.data}`;
}

function renderExpression(frames, mimeCandidates, narrationAudioSrc) {
  return `
    (async () => {
      const width = ${WIDTH};
      const height = ${HEIGHT};
      const fps = ${FPS};
      const totalSeconds = ${TOTAL_SECONDS};
      const scenes = ${JSON.stringify(scenes)};
      const frames = ${JSON.stringify(frames)};
      const mimeCandidates = ${JSON.stringify(mimeCandidates)};
      const narrationAudioSrc = ${JSON.stringify(narrationAudioSrc)};
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      document.body.style.margin = "0";
      document.body.style.background = "#071812";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      const images = await Promise.all(frames.map((src) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      })));

      function roundedRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      function wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        for (const word of words) {
          const testLine = line ? line + " " + word : word;
          if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            line = word;
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        if (line) ctx.fillText(line, x, y);
      }

      function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      }

      function drawScene(time) {
        const matchedSceneIndex = scenes.findIndex((scene) => time >= scene.start && time < scene.end);
        const sceneIndex = matchedSceneIndex >= 0 ? matchedSceneIndex : scenes.length - 1;
        const scene = scenes[sceneIndex] ?? scenes[scenes.length - 1];
        const image = images[sceneIndex] ?? images[0];
        const local = Math.min(1, Math.max(0, (time - scene.start) / (scene.end - scene.start)));
        const zoom = 1.02 + easeInOut(local) * 0.035;
        const imageW = width * zoom;
        const imageH = height * zoom;
        const imageX = (width - imageW) / 2;
        const imageY = (height - imageH) / 2;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, imageX, imageY, imageW, imageH);

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "rgba(5, 22, 17, 0.62)");
        gradient.addColorStop(0.46, "rgba(5, 22, 17, 0.12)");
        gradient.addColorStop(1, "rgba(5, 22, 17, 0.58)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const panelX = 56;
        const panelY = height - 226;
        const panelW = 620;
        const panelH = 160;
        roundedRect(panelX, panelY, panelW, panelH, 20);
        ctx.fillStyle = "rgba(255, 253, 247, 0.92)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "700 18px Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
        ctx.fillStyle = "#93651d";
        ctx.fillText(scene.eyebrow.toUpperCase(), panelX + 28, panelY + 42);

        ctx.font = "800 40px Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
        ctx.fillStyle = "#143f35";
        ctx.fillText(scene.title, panelX + 28, panelY + 86);

        ctx.font = "500 21px Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
        ctx.fillStyle = "#285748";
        wrapText(scene.body, panelX + 28, panelY + 122, panelW - 58, 28);

        ctx.font = "800 18px Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
        ctx.fillStyle = "rgba(255, 253, 247, 0.94)";
        ctx.fillText("Buddhi Align", width - 178, 48);

        const progressX = 56;
        const progressY = height - 38;
        const progressW = width - 112;
        roundedRect(progressX, progressY, progressW, 8, 4);
        ctx.fillStyle = "rgba(255, 253, 247, 0.34)";
        ctx.fill();
        roundedRect(progressX, progressY, progressW * Math.min(1, time / totalSeconds), 8, 4);
        ctx.fillStyle = "#f0d39f";
        ctx.fill();
      }

      const stream = canvas.captureStream(fps);

      async function createNarration() {
        if (!narrationAudioSrc) {
          return null;
        }

        const audioContext = new AudioContext({ sampleRate: 44100 });
        const response = await fetch(narrationAudioSrc);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        const destination = audioContext.createMediaStreamDestination();
        source.buffer = audioBuffer;
        gain.gain.value = 1;
        source.connect(gain);
        gain.connect(destination);

        for (const track of destination.stream.getAudioTracks()) {
          stream.addTrack(track);
        }

        return { audioContext, source };
      }

      const mimeType = mimeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
      if (!mimeType) {
        throw new Error("This Chrome build cannot record any requested video format: " + mimeCandidates.join(", "));
      }
      const narration = await createNarration();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_200_000,
        audioBitsPerSecond: 128_000,
      });
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      drawScene(0);
      recorder.start(1000);
      if (narration) {
        await narration.audioContext.resume();
        narration.source.start(0);
      }
      const startedAt = performance.now();
      await new Promise((resolve) => {
        const tick = () => {
          const elapsed = (performance.now() - startedAt) / 1000;
          drawScene(Math.min(totalSeconds, elapsed));
          if (elapsed >= totalSeconds) {
            resolve();
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
      if (narration) {
        try {
          narration.source.stop();
        } catch {
          // The narration may have naturally ended before the visual timeline.
        }
      }
      recorder.stop();
      await new Promise((resolve) => {
        recorder.onstop = resolve;
      });
      if (narration) {
        await narration.audioContext.close();
      }
      const blob = new Blob(chunks, { type: mimeType });
      const buffer = await blob.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buffer);
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      return { base64: btoa(binary), bytes: bytes.length, mimeType };
    })()
  `;
}

async function renderVideo(cdp, frames, outputPath, label, mimeCandidates, narrationAudioSrc) {
  console.log(`[tour-video] Rendering ${label} tour...`);
  await cdp.send("Page.navigate", { url: "about:blank" });
  await new Promise((resolve) => setTimeout(resolve, 500));
  const timeoutMs = (TOTAL_SECONDS + 45) * 1000;
  const renderResult = await cdp.send("Runtime.evaluate", {
    expression: renderExpression(frames, mimeCandidates, narrationAudioSrc),
    awaitPromise: true,
    returnByValue: true,
    timeout: timeoutMs,
  }, timeoutMs + 5_000);
  const payload = renderResult.result?.value;
  if (!payload?.base64) {
    throw new Error(`Chrome did not return a rendered ${label} payload.`);
  }
  fs.writeFileSync(outputPath, Buffer.from(payload.base64, "base64"));
  console.log(`[tour-video] Wrote ${path.relative(ROOT, outputPath)} (${payload.bytes} bytes, ${payload.mimeType})`);
}

async function main() {
  ensureFile(CHROME_PATH, "Chrome");
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  const narrationAudioSrc = synthesizeNarrationAudio();

  const port = await getFreePort();
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "buddhi-tour-chrome-"));
  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--hide-scrollbars",
    "--no-default-browser-check",
    "--no-first-run",
    "--autoplay-policy=no-user-gesture-required",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    "about:blank",
  ], { detached: true, stdio: ["ignore", "ignore", "pipe"] });

  chrome.stderr.on("data", (chunk) => {
    const line = chunk.toString().trim();
    if (line && process.env.TOUR_VERBOSE) {
      console.warn(line);
    }
  });

  let cdp;
  try {
    const targets = await waitForChrome(port);
    const target = targets.find((item) => item.type === "page") ?? targets[0];
    if (!target?.webSocketDebuggerUrl) {
      throw new Error("Unable to find a Chrome page debugging target.");
    }

    cdp = new CdpClient(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const url of getLocalCookieUrls(BASE_URL)) {
      await cdp.send("Network.setCookie", {
        name: "buddhi-align-anonymous",
        value: "1",
        url,
        path: "/",
      });
    }

    const frames = [];
    for (const [index, scene] of scenes.entries()) {
      console.log(`[tour-video] Capturing ${index + 1}/${scenes.length}: ${scene.url}`);
      const frame = await captureScene(cdp, scene);
      if (index === 0) {
        writeDataUrl(frame, OUTPUT_POSTER);
        console.log(`[tour-video] Wrote ${path.relative(ROOT, OUTPUT_POSTER)}`);
      }
      frames.push(frame);
    }

    await renderVideo(cdp, frames, OUTPUT_WEBM, "WebM", [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ], narrationAudioSrc);
    await renderVideo(cdp, frames, OUTPUT_MP4, "MP4", [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4;codecs=h264,mp4a.40.2",
      "video/mp4;codecs=h264",
      "video/mp4",
    ], narrationAudioSrc);
  } finally {
    if (cdp) {
      const browserClose = cdp.send("Browser.close").catch(() => undefined);
      try {
        await Promise.race([browserClose, delay(1_500)]);
      } catch {
        // Closing the browser commonly ends the CDP socket before a response arrives.
      }
      cdp.close();
      await browserClose;
    }
    await stopProcess(chrome);
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(`[tour-video] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
