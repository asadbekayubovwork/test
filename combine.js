const fs = require("fs");
const path = require("path");

// ===== SOZLAMALAR =====
const PARTS_FOLDER = "C:\\Users\\User\\Downloads\\Telegram Desktop\\test2";
const OUTPUT_FILE = "C:\\Users\\User\\Downloads\\Telegram Desktop\\test2\\combined.zip";
// =======================

const files = fs.readdirSync(PARTS_FOLDER)
  .filter(f => f !== "combined.zip")
  .sort((a, b) => {
    // "8)" -> 1, "8) (2)" -> 2, "8) (3)" -> 3 ...
    const numA = parseInt(a.match(/\((\d+)\)/)?.[1] || "1");
    const numB = parseInt(b.match(/\((\d+)\)/)?.[1] || "1");
    return numA - numB;
  });

if (files.length === 0) {
  console.log("Bo'laklar topilmadi!");
  process.exit(1);
}

console.log(`${files.length} ta bo'lak topildi, birlashtirilmoqda...`);

const output = fs.createWriteStream(OUTPUT_FILE);

let index = 0;
function writeNext() {
  if (index >= files.length) {
    output.end(() => {
      console.log(`Tayyor: ${OUTPUT_FILE}`);
    });
    return;
  }
  const filePath = path.join(PARTS_FOLDER, files[index]);
  console.log(`  ${files[index]}`);
  const input = fs.createReadStream(filePath);
  input.pipe(output, { end: false });
  input.on("end", () => {
    index++;
    writeNext();
  });
}
writeNext();
