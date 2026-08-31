"""Emit solid-color PWA icons."""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "app" / "icons"
FILL = (30, 27, 75)  # #1e1b4b
BORDER = (165, 180, 252)  # #a5b4fc


def crc(data: bytes) -> int:
    return zlib.crc32(data) & 0xFFFFFFFF


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc(tag + data))


def png(size: int) -> bytes:
    border = max(2, round(size * 0.08))
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            edge = x < border or y < border or x >= size - border or y >= size - border
            r, g, b = BORDER if edge else FILL
            raw.extend((r, g, b, 255))
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", ihdr),
            chunk(b"IDAT", zlib.compress(bytes(raw), 9)),
            chunk(b"IEND", b""),
        ]
    )


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    (ROOT / "icon-192.png").write_bytes(png(192))
    (ROOT / "icon-512.png").write_bytes(png(512))
    (ROOT / "maskable-512.png").write_bytes(png(512))
    print(f"wrote icons in {ROOT}")


if __name__ == "__main__":
    main()
