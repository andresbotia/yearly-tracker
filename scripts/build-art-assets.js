#!/usr/bin/env node
// Development-only artwork pipeline.
// Museum source → mobile JPEG (max 2000px) → ASCII plate → generated JS modules.
// Never run this against a live user install; it does not touch AsyncStorage.

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const CATALOG_PATH = path.join(ROOT, "assets", "art", "catalog.json");
const CACHE_DIR = path.join(ROOT, "scripts", ".art-cache");
const IMAGE_DIR = path.join(ROOT, "assets", "art", "images");
const ASCII_DIR = path.join(ROOT, "assets", "art", "ascii");
const MAX_DIM = 1280;
const ASCII_COLS = 52;
const ASCII_RAMP = " .:-=+*#%@";
const CHAR_ASPECT = 0.48;
const USER_AGENT =
  "AtelierTrackerArtPipeline/1.0 (local asset prep; public-domain works)";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadJpeg() {
  try {
    return require("jpeg-js");
  } catch (err) {
    console.error(
      "Missing jpeg-js. Install it as a devDependency: npm install --save-dev jpeg-js"
    );
    throw err;
  }
}

function requestBuffer(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 6) {
      reject(new Error(`Too many redirects: ${url}`));
      return;
    }
    const client = url.startsWith("https:") ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "image/jpeg,image/png,image/*,*/*",
        },
      },
      (res) => {
        const loc = res.headers.location;
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          loc
        ) {
          const next = new URL(loc, url).toString();
          res.resume();
          requestBuffer(next, redirects + 1).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.setTimeout(60000, () => {
      req.destroy(new Error(`Timeout fetching ${url}`));
    });
  });
}

async function wikimediaUrl(filename) {
  if (!filename) return null;
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&titles=" +
    encodeURIComponent(`File:${filename}`) +
    "&prop=imageinfo&iiprop=url&iiurlwidth=2000&format=json";
  const buf = await requestBuffer(api);
  const json = JSON.parse(buf.toString("utf8"));
  const pages = json?.query?.pages || {};
  const first = Object.values(pages)[0];
  const info = first?.imageinfo?.[0];
  return info?.thumburl || info?.url || null;
}

function decodeJpeg(buf) {
  const jpeg = loadJpeg();
  return jpeg.decode(buf, { maxMemoryUsageInMB: 1024, formatAsRGBA: true });
}

function encodeJpeg(imageData, quality = 82) {
  const jpeg = loadJpeg();
  return jpeg.encode(imageData, quality).data;
}

function resizeRgba(src, maxDim) {
  const scale = Math.min(1, maxDim / Math.max(src.width, src.height));
  if (scale >= 0.999) return src;
  const width = Math.max(1, Math.round(src.width * scale));
  const height = Math.max(1, Math.round(src.height * scale));
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const sy = Math.min(src.height - 1, Math.floor((y + 0.5) * (src.height / height)));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x + 0.5) * (src.width / width)));
      const si = (sy * src.width + sx) * 4;
      const di = (y * width + x) * 4;
      data[di] = src.data[si];
      data[di + 1] = src.data[si + 1];
      data[di + 2] = src.data[si + 2];
      data[di + 3] = src.data[si + 3];
    }
  }
  return { data, width, height };
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toAscii(image, cols = ASCII_COLS) {
  const rows = Math.max(
    8,
    Math.round((image.height / image.width) * cols * CHAR_ASPECT)
  );
  const lines = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    const sy = Math.min(
      image.height - 1,
      Math.floor((y + 0.5) * (image.height / rows))
    );
    for (let x = 0; x < cols; x++) {
      const sx = Math.min(
        image.width - 1,
        Math.floor((x + 0.5) * (image.width / cols))
      );
      const i = (sy * image.width + sx) * 4;
      const lum = luminance(image.data[i], image.data[i + 1], image.data[i + 2]);
      const idx = Math.min(
        ASCII_RAMP.length - 1,
        Math.floor((lum / 255) * ASCII_RAMP.length)
      );
      line += ASCII_RAMP[idx];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

function jsString(value) {
  return JSON.stringify(value);
}

function writeGeneratedModules(results) {
  const imageEntries = results
    .filter((r) => r.imageRel)
    .map((r) => `  ${jsString(r.id)}: require(${jsString("./" + r.imageRel.replace(/\\/g, "/"))}),`)
    .join("\n");

  const asciiEntries = results
    .filter((r) => r.ascii)
    .map((r) => `  ${jsString(r.id)}: ${jsString(r.ascii)},`)
    .join("\n");

  const imagesJs = `// Generated by scripts/build-art-assets.js — do not edit by hand.
export const ART_IMAGES = {
${imageEntries}
};
`;

  const asciiJs = `// Generated by scripts/build-art-assets.js — do not edit by hand.
export const ART_ASCII = {
${asciiEntries}
};
`;

  fs.writeFileSync(path.join(ROOT, "assets", "art", "images.js"), imagesJs);
  fs.writeFileSync(path.join(ROOT, "assets", "art", "ascii.js"), asciiJs);
}

async function fetchArtworkBuffer(item) {
  const urls = [...(item.urls || [])];
  if (item.wikimediaFile) {
    try {
      const wiki = await wikimediaUrl(item.wikimediaFile);
      if (wiki) urls.unshift(wiki);
    } catch (err) {
      console.warn(`  wikimedia lookup failed for ${item.id}: ${err.message}`);
    }
  }

  let lastErr = null;
  for (const url of urls) {
    try {
      console.log(`  GET ${url}`);
      const buf = await requestBuffer(url);
      if (buf.length < 2000) {
        throw new Error(`payload too small (${buf.length} bytes)`);
      }
      if (buf[0] === 0x89 && buf[1] === 0x50) {
        throw new Error("PNG received; this pipeline decodes JPEG only");
      }
      return buf;
    } catch (err) {
      lastErr = err;
      console.warn(`  failed: ${err.message}`);
    }
  }
  throw lastErr || new Error(`No source URL for ${item.id}`);
}

async function processItem(item) {
  console.log(`\n${item.id} — ${item.title}`);
  if (!item.isPublicDomain) {
    throw new Error(`${item.id} is not marked public domain; refusing to bundle`);
  }

  const imageName = `${item.id}.jpg`;
  const imgPath = path.join(IMAGE_DIR, imageName);
  const asciiPath = path.join(ASCII_DIR, `${item.id}.txt`);
  if (
    !process.env.FORCE_ART &&
    fs.existsSync(imgPath) &&
    fs.existsSync(asciiPath)
  ) {
    console.log("  skip existing");
    return {
      id: item.id,
      imageRel: `images/${imageName}`,
      ascii: fs.readFileSync(asciiPath, "utf8"),
      bytes: fs.statSync(imgPath).size,
      width: 0,
      height: 0,
    };
  }

  const cacheFile = path.join(CACHE_DIR, `${item.id}.jpg`);
  let raw;
  if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 2000) {
    console.log("  using cache");
    raw = fs.readFileSync(cacheFile);
  } else {
    raw = await fetchArtworkBuffer(item);
    if (raw[0] === 0xff && raw[1] === 0xd8) {
      fs.writeFileSync(cacheFile, raw);
    }
  }

  const decoded = decodeJpeg(raw);
  const resized = resizeRgba(decoded, MAX_DIM);
  const jpegOut = encodeJpeg(resized, 64);
  fs.writeFileSync(imgPath, jpegOut);

  const ascii = toAscii(resized, ASCII_COLS);
  fs.writeFileSync(asciiPath, ascii, "utf8");

  return {
    id: item.id,
    imageRel: `images/${imageName}`,
    ascii,
    bytes: jpegOut.length,
    width: resized.width,
    height: resized.height,
  };
}

async function main() {
  ensureDir(CACHE_DIR);
  ensureDir(IMAGE_DIR);
  ensureDir(ASCII_DIR);

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const results = [];
  const failures = [];

  for (const item of catalog) {
    try {
      results.push(await processItem(item));
    } catch (err) {
      failures.push({ id: item.id, error: err.message });
      console.error(`  ERROR ${item.id}: ${err.message}`);
    }
  }

  writeGeneratedModules(results);

  console.log("\nDone.");
  for (const r of results) {
    console.log(
      `  ${r.id}: ${r.width}x${r.height}, ${(r.bytes / 1024).toFixed(0)}KB`
    );
  }
  if (failures.length) {
    console.error("\nFailures:");
    for (const f of failures) console.error(`  ${f.id}: ${f.error}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
