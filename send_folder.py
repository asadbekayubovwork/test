import os
import sys
import zipfile
import tempfile
import requests


# ===== SOZLAMALAR =====
BOT_TOKEN = "7719159763:AAEUCdON9VomeMz4985axgbRYySVYlOdumQ"      # @BotFather dan olingan token
CHAT_ID = "2051091708"          # Sizning chat ID (@userinfobot dan olishingiz mumkin)
FOLDER_PATH = "C:\Users\User\Desktop\out"  # Zip qilinadigan papka yo'li
# =======================


def zip_folder(folder_path, zip_path):
    """Papkani zip qiladi."""
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                try:
                    zf.write(file_path, arcname)
                except PermissionError:
                    print(f"[!] Ruxsat yo'q, o'tkazib yuborildi: {file_path}")


def send_to_telegram(zip_path, caption=""):
    """Zip faylni Telegram bot orqali yuboradi."""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"

    file_size = os.path.getsize(zip_path)
    max_size = 50 * 1024 * 1024  # Telegram limiti: 50 MB

    if file_size > max_size:
        print(f"[!] Fayl hajmi juda katta: {file_size / (1024*1024):.1f} MB (limit: 50 MB)")
        sys.exit(1)

    with open(zip_path, "rb") as f:
        resp = requests.post(url, data={"chat_id": CHAT_ID, "caption": caption}, files={"document": f})

    if resp.status_code == 200 and resp.json().get("ok"):
        print("[+] Fayl muvaffaqiyatli yuborildi!")
    else:
        print(f"[-] Xatolik: {resp.text}")


def main():
    if len(sys.argv) < 2:
        print("Foydalanish: python send_folder.py <papka_yo'li>")
        print("Misol:       python send_folder.py C:\\Users\\User\\Documents\\loyiha")
        sys.exit(1)

    folder_path = sys.argv[1]

    if not os.path.isdir(folder_path):
        print(f"[-] Papka topilmadi: {folder_path}")
        sys.exit(1)

    folder_name = os.path.basename(os.path.normpath(folder_path))
    print(f"[*] Papka ziplanmoqda: {folder_path}")

    # Vaqtinchalik zip fayl yaratish
    zip_path = os.path.join(tempfile.gettempdir(), f"{folder_name}.zip")
    zip_folder(folder_path, zip_path)
    print(f"[*] Zip yaratildi: {zip_path} ({os.path.getsize(zip_path) / (1024*1024):.1f} MB)")

    # Telegramga yuborish
    print("[*] Telegramga yuborilmoqda...")
    send_to_telegram(zip_path, caption=f"Papka: {folder_name}")

    # Vaqtinchalik faylni o'chirish
    os.remove(zip_path)
    print("[*] Vaqtinchalik zip fayl o'chirildi.")


if __name__ == "__main__":
    main()
