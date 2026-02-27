// Bu script send_folder.exe ni patchlab, CMD oynasisiz ishlashini ta'minlaydi
const fs = require("fs");

const exePath = "send_folder.exe";
const buf = fs.readFileSync(exePath);

// PE header offsetini topish (0x3C da yozilgan)
const peOffset = buf.readUInt32LE(0x3C);

// Subsystem 0x5C offsetda: 3 = Console, 2 = Windows GUI (oynasiz)
const subsystemOffset = peOffset + 0x5C;
const current = buf.readUInt16LE(subsystemOffset);

if (current === 2) {
  console.log("Allaqachon patchlangan.");
} else {
  buf.writeUInt16LE(2, subsystemOffset);
  fs.writeFileSync(exePath, buf);
  console.log("Patch qo'llandi! Endi CMD oynasi chiqmaydi.");
}
