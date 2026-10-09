import os
import sys
import re
import time
import subprocess
import webbrowser
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PYTHON_EXE = BASE_DIR / "venv" / "Scripts" / "python.exe"
UVICORN_EXE = BASE_DIR / "venv" / "Scripts" / "uvicorn.exe"
CLOUDFLARED_EXE = BASE_DIR / "cloudflared.exe"

def kill_port(port=8000):
    try:
        cmd = f'powershell -Command "Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"'
        out = subprocess.check_output(cmd, shell=True, text=True, errors="ignore").strip()
        if out:
            for pid in out.splitlines():
                pid = pid.strip()
                if pid and pid != str(os.getpid()):
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
    except Exception:
        pass

def copy_to_clipboard(text):
    try:
        subprocess.run(["powershell", "-Command", f"Set-Clipboard -Value '{text}'"], capture_output=True)
    except Exception:
        pass

def main():
    os.chdir(str(BASE_DIR))
    print("=" * 60)
    print("   MEMULAI GURU AI JSKM - SERVER ONLINE LANGSUNG (NO PAUSE)")
    print("=" * 60)
    print()

    # 1. Pastikan port 8000 bersih
    print("[1/3] Menyiapkan backend server...")
    kill_port(8000)

    # 2. Jalankan Uvicorn
    uvicorn_cmd = [
        str(UVICORN_EXE if UVICORN_EXE.exists() else "uvicorn"),
        "backend.app:app",
        "--host", "0.0.0.0",
        "--port", "8000"
    ]
    backend_proc = subprocess.Popen(
        uvicorn_cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(3)

    # 3. Jalankan Cloudflare Tunnel
    print("[2/3] Menghubungkan jalur online publik (Cloudflare Tunnel)...")
    if not CLOUDFLARED_EXE.exists():
        print("ERROR: cloudflared.exe tidak ditemukan di folder proyek!")
        input("Tekan Enter untuk keluar...")
        return

    tunnel_cmd = [str(CLOUDFLARED_EXE), "tunnel", "--url", "http://127.0.0.1:8000"]
    tunnel_proc = subprocess.Popen(
        tunnel_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="ignore"
    )

    print("[3/3] Mengambil link online publik Anda...")
    public_url = None
    start_time = time.time()

    while time.time() - start_time < 30:
        line = tunnel_proc.stdout.readline()
        if not line:
            if tunnel_proc.poll() is not None:
                break
            continue
        
        match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
        if match:
            public_url = match.group(0)
            break

    if not public_url:
        print("\n[!] Gagal mendeteksi link otomatis dalam 30 detik.")
        print("    Pastikan laptop Anda terhubung ke internet.")
        input("Tekan Enter untuk keluar...")
        backend_proc.terminate()
        tunnel_proc.terminate()
        return

    # Simpan link ke file LINK_ONLINE.txt
    link_file = BASE_DIR / "LINK_ONLINE.txt"
    with open(link_file, "w", encoding="utf-8") as f:
        f.write(public_url + "\n")

    # Salin otomatis ke clipboard
    copy_to_clipboard(public_url)

    # Buka browser
    try:
        webbrowser.open(public_url)
    except Exception:
        pass

    # Tampilkan di konsol
    print()
    print("=" * 64)
    print("  🎉 GURU AI JSKM BERHASIL ONLINE JARAK JAUH! (ALWAYS ON)")
    print("=" * 64)
    print()
    print(f"  👉 LINK PUBLIK ANDA: {public_url}")
    print()
    print("  Catatan:")
    print("  - Link sudah OTOMATIS DISALIN (bisa langsung Ctrl + V / Paste)")
    print("  - Disimpan juga di file: LINK_ONLINE.txt")
    print("  - Server ini TIDAK AKAN PERNAH PAUSE selama jendela ini terbuka.")
    print("  - Siapapun bisa membuka link ini dari HP/Laptop di mana saja.")
    print()
    print("=" * 64)
    print("  (Tekan Ctrl + C di jendela ini jika ingin mematikan server)")
    print("=" * 64)

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None or tunnel_proc.poll() is not None:
                break
    except KeyboardInterrupt:
        print("\nMematikan server...")
    finally:
        try:
            backend_proc.terminate()
            tunnel_proc.terminate()
        except Exception:
            pass
        kill_port(8000)
        print("Server telah dimatikan.")

if __name__ == "__main__":
    main()
