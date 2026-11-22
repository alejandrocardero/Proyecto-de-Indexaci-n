"""Descarga robusta del modelo ONNX cuantizado de sentence-transformers.

Descarga por rangos (HTTP Range) y reanuda automaticamente si la conexion se
corta. Esto es necesario en entornos con conexion inestable donde una descarga
normal se reinicia desde cero.
"""

from __future__ import annotations

import time
import urllib.request
from pathlib import Path

BASE = "https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main"
FILES = {
    "model_quantized.onnx": "onnx/model_quantized.onnx",
    "tokenizer.json": "tokenizer.json",
    "config.json": "config.json",
}
DEST = Path(__file__).resolve().parents[1] / "backend" / "models" / "all-MiniLM-L6-v2"
CHUNK = 512 * 1024  # 512 KB por peticion


def download_with_resume(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)

    # Resolver URL final (CDN)
    req = urllib.request.Request(url, method="HEAD")
    with urllib.request.urlopen(req, timeout=30) as resp:
        final_url = resp.geturl()
        total = int(resp.headers.get("Content-Length", 0))
    print(f"  Total: {total / 1048576:.2f} MB")

    while True:
        current = dest.stat().st_size if dest.exists() else 0
        if current >= total:
            print(f"  Completo: {current} bytes")
            return

        end = min(current + CHUNK - 1, total - 1)
        req = urllib.request.Request(
            final_url,
            headers={"Range": f"bytes={current}-{end}"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            if not data:
                raise RuntimeError("respuesta vacia")
            with dest.open("ab") as f:
                f.write(data)
            print(f"  {dest.stat().st_size}/{total} bytes", flush=True)
        except Exception as exc:
            print(f"  Reintentando tras: {exc}")
            time.sleep(2)


def main() -> None:
    for local_name, remote_path in FILES.items():
        print(f"Descargando {local_name}...")
        download_with_resume(f"{BASE}/{remote_path}", DEST / local_name)
    print("Modelo listo en", DEST)


if __name__ == "__main__":
    main()
